# PROMPT CLAUDE CODE — V6 : Système hybride 2-pass pour la génération de plan

> **INSTRUCTION** : Exécute les prompts ci-dessous EN SÉQUENTIEL (1 → 2 → 3 → 4 → 5).
> Après chaque prompt, lance `npx tsc --noEmit`.
> À la fin, lance `npm run build`.
> Ne modifie JAMAIS le design monochrome (`tw()`, `bg()`, inline styles uniquement).
> L'accent color ne sert QUE pour les barres XP et la DotGrid timeline.
> Toute l'interface est en français.

---

## CONTEXTE

Actuellement, quand l'utilisateur upload son PDF, l'API `/api/plan` envoie le document à Claude et génère directement le plan complet en un seul appel. Le problème : l'IA peut halluciner (inventer des contraintes, se tromper sur le type de mémoire, ignorer la structure imposée par le cahier des charges).

**Solution** : Séparer en 2 phases :

1. **Phase 1 — Extraction** : L'IA lit le PDF et extrait les métadonnées structurées (type, niveau, discipline, deadline, structure imposée, etc.). Ces métadonnées sont affichées à l'utilisateur pour confirmation/correction.

2. **Phase 2 — Génération** : Avec les métadonnées validées par l'utilisateur, l'IA génère le plan adapté. Elle a un cadre vérifié, donc beaucoup moins de risque d'hallucination.

---

## PROMPT 1 — Nouveau endpoint `/api/plan/extract`

### Fichier : `app/api/plan/extract/route.ts` (NOUVEAU FICHIER)

Cet endpoint reçoit le PDF et retourne UNIQUEMENT les métadonnées extraites, PAS le plan.

```typescript
import { createClient } from '@/lib/supabase/server'
import { checkAndIncrement } from '@/lib/rate-limit'
import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export const maxDuration = 120

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const PLAN_LIMIT = 10

const EXTRACT_PROMPT = `Tu es un expert en méthodologie de mémoire académique. Ton UNIQUE rôle est d'analyser le cahier des charges / document PDF fourni et d'en EXTRAIRE les métadonnées structurées.

RÈGLES STRICTES :
- NE PAS inventer d'informations. Si une information n'est pas dans le document, mets null.
- NE PAS générer de plan. Tu extrais UNIQUEMENT les métadonnées.
- Lis le document ENTIÈREMENT et ATTENTIVEMENT avant de répondre.

Extrais les informations suivantes :

1. **type_memoire** : Le type de mémoire (exemples : "Mémoire professionnel", "Mémoire de recherche", "Rapport de stage", "Mémoire de fin d'études", "Projet de fin d'études", "Thèse professionnelle"). Si pas clair, mets ta meilleure estimation basée sur le contenu.

2. **niveau** : Le niveau d'études (exemples : "BTS", "Licence 3", "Bachelor", "Master 1", "Master 2", "MBA", "Ingénieur 5A"). Si pas explicite, déduis du contexte (vocabulaire, exigences).

3. **discipline** : La discipline ou le domaine (exemples : "Marketing digital", "Informatique", "Droit des affaires", "Communication", "Ressources humaines", "Finance"). Identifie-la depuis le sujet ou le contexte du document.

4. **etablissement** : Le nom de l'établissement si mentionné. Sinon null.

5. **deadline** : La date de rendu/soutenance si mentionnée. Format "YYYY-MM-DD". Cherche : "date de rendu", "deadline", "date limite", "soutenance", "à remettre avant le", "échéance". Si rien trouvé → null.

6. **nombre_pages** : Le nombre de pages attendu si mentionné (ex: "entre 40 et 60 pages" → "40-60"). Si pas mentionné → null.

7. **structure_imposee** : Si le document impose une structure spécifique (nombre de parties, chapitres obligatoires, plan imposé), décris-la ici en texte libre. Exemples :
   - "3 parties imposées : Contexte, Analyse, Préconisations"
   - "Plan libre, mais introduction et conclusion obligatoires"
   - "5 chapitres : Intro, Revue de littérature, Méthodologie, Résultats, Conclusion"
   Si aucune structure imposée → null.

8. **competences_a_valider** : Liste des compétences, blocs de compétences, ou critères d'évaluation mentionnés dans le document. Tableau de strings. Si rien → tableau vide [].

9. **contraintes_formelles** : Contraintes de mise en forme (police, interligne, bibliographie, format de citation, etc.). Texte libre résumant les contraintes. Si rien → null.

10. **sujet_ou_theme** : Le sujet ou thème principal du mémoire si identifiable. Si c'est un cahier des charges générique sans sujet précis → null.

11. **resume_contenu** : Un résumé en 2-3 phrases de ce que le document contient (pour que l'utilisateur puisse vérifier que l'IA a bien compris le document).

Réponds UNIQUEMENT en JSON valide selon ce schéma :
{
  "type_memoire": "string",
  "niveau": "string | null",
  "discipline": "string | null",
  "etablissement": "string | null",
  "deadline": "YYYY-MM-DD | null",
  "nombre_pages": "string | null",
  "structure_imposee": "string | null",
  "competences_a_valider": ["string"],
  "contraintes_formelles": "string | null",
  "sujet_ou_theme": "string | null",
  "resume_contenu": "string"
}`

const MAX_FILE_SIZE = 10 * 1024 * 1024

// Zod schema for extraction result
const ExtractionSchema = z.object({
  type_memoire: z.string(),
  niveau: z.string().nullable(),
  discipline: z.string().nullable(),
  etablissement: z.string().nullable(),
  deadline: z.string().nullable(),
  nombre_pages: z.string().nullable(),
  structure_imposee: z.string().nullable(),
  competences_a_valider: z.array(z.string()),
  contraintes_formelles: z.string().nullable(),
  sujet_ou_theme: z.string().nullable(),
  resume_contenu: z.string(),
})

export type ExtractionResult = z.infer<typeof ExtractionSchema>

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rateLimit = await checkAndIncrement(supabase, user.id, '/api/plan', PLAN_LIMIT)
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Limite atteinte pour aujourd\'hui.', remaining: 0 }, { status: 429 })
  }

  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file', remaining: rateLimit.remaining }, { status: 400 })
  }
  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Invalid file type (PDF only)', remaining: rateLimit.remaining }, { status: 400 })
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File too large (max 10MB)', remaining: rateLimit.remaining }, { status: 400 })
  }

  const buffer = await file.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      system: EXTRACT_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: base64 },
            },
            {
              type: 'text',
              text: 'Analyse ce document et extrais les métadonnées structurées en JSON. Ne génère PAS de plan, uniquement les métadonnées.',
            },
          ],
        },
      ],
    })

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('')

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('[extract] No JSON found. Start:', text.slice(0, 200))
      return NextResponse.json({ error: 'Impossible d\'extraire les métadonnées.' }, { status: 500 })
    }

    const parsed = ExtractionSchema.safeParse(JSON.parse(jsonMatch[0]))
    if (!parsed.success) {
      console.error('[extract] Zod error:', JSON.stringify(parsed.error.flatten()))
      return NextResponse.json({ error: 'Structure des métadonnées invalide.' }, { status: 500 })
    }

    // Return extraction + remaining count + base64 for Phase 2
    // IMPORTANT : on renvoie le base64 du PDF pour que la Phase 2 puisse le réutiliser
    // sans que l'utilisateur ait besoin de re-uploader
    return NextResponse.json({
      extraction: parsed.data,
      pdfBase64: base64,
      remaining: rateLimit.remaining,
    })
  } catch (err) {
    console.error('[extract] Error:', err)
    return NextResponse.json({ error: 'Erreur lors de l\'analyse du document.' }, { status: 500 })
  }
}
```

**IMPORTANT** : Exporter aussi le type `ExtractionResult` pour l'utiliser côté client. Créer un fichier `src/types/extraction.ts` :

```typescript
// src/types/extraction.ts
export interface ExtractionResult {
  type_memoire: string
  niveau: string | null
  discipline: string | null
  etablissement: string | null
  deadline: string | null
  nombre_pages: string | null
  structure_imposee: string | null
  competences_a_valider: string[]
  contraintes_formelles: string | null
  sujet_ou_theme: string | null
  resume_contenu: string
}
```

---

## PROMPT 2 — Refactorer `/api/plan/route.ts` pour Phase 2

### Fichier : `app/api/plan/route.ts`

Modifier l'endpoint existant pour qu'il accepte les métadonnées validées EN PLUS du PDF (base64).

**Ce qui change :**
- Le body n'est plus un `FormData` avec fichier, mais un JSON avec `pdfBase64` + `extraction` (les métadonnées validées/corrigées par l'utilisateur)
- Le `SYSTEM_PROMPT` est enrichi avec les métadonnées validées
- Le user message injecte les métadonnées comme contexte vérifié

**Nouveau code pour `route.ts` :**

```typescript
// Le POST accepte maintenant un JSON body au lieu d'un FormData
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Pas de rate-limit ici — déjà consommé dans /api/plan/extract

  let body: { pdfBase64: string; extraction: Record<string, unknown> }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { pdfBase64, extraction } = body
  if (!pdfBase64 || !extraction) {
    return NextResponse.json({ error: 'Missing pdfBase64 or extraction' }, { status: 400 })
  }

  // ... reste du code SSE streaming identique, MAIS :
  // 1. Le user message inclut les métadonnées validées
  // 2. Le system prompt référence les métadonnées comme "données vérifiées par l'utilisateur"
}
```

**Nouveau SYSTEM_PROMPT :**

Garder l'ancien `SYSTEM_PROMPT` mais ajouter au début :

```
CONTEXTE VÉRIFIÉ PAR L'UTILISATEUR :
Les métadonnées ci-dessous ont été extraites du document puis VALIDÉES/CORRIGÉES par l'utilisateur. Tu DOIS les respecter comme source de vérité absolue. Ne les contredis JAMAIS.
```

**Nouveau user message :**

```typescript
{
  type: 'text',
  text: `MÉTADONNÉES VÉRIFIÉES PAR L'UTILISATEUR :
${JSON.stringify(extraction, null, 2)}

En te basant sur ces métadonnées vérifiées ET le document PDF ci-dessus, génère le plan de mémoire en JSON.

INSTRUCTIONS CRITIQUES :
1. Chaque section DOIT inclure un champ "tasks" avec 2 à 4 sous-tâches concrètes.
2. Respecte OBLIGATOIREMENT la structure imposée si elle est renseignée dans les métadonnées.
3. Le nombre de chapitres doit être cohérent avec le nombre de pages indiqué.
4. La deadline dans le JSON DOIT correspondre à celle des métadonnées.
5. Les compétences à valider doivent être intégrées dans les objectifs des chapitres.
6. NE PAS inventer de contraintes ou exigences qui ne sont ni dans le PDF ni dans les métadonnées.`,
}
```

**Le reste du streaming, Zod validation, savePlan reste IDENTIQUE.**

---

## PROMPT 3 — Composant `ExtractionConfirm.tsx`

### Fichier : `src/components/dashboard/new/ExtractionConfirm.tsx` (NOUVEAU)

C'est l'écran intermédiaire entre l'upload et la génération du plan. Il affiche les métadonnées extraites et permet à l'utilisateur de les corriger.

**Structure du composant :**

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│        Analyse de ton cahier des charges              │
│   Vérifie que l'IA a bien compris ton document.      │
│                                                      │
│   ┌──────────────────────────────────────────────┐   │
│   │  📄 Résumé                                   │   │
│   │  "Ce document est un cahier des charges..."   │   │
│   └──────────────────────────────────────────────┘   │
│                                                      │
│   Type de mémoire     [ Mémoire professionnel  ▼ ]   │  ← dropdown éditable
│   Niveau              [ Master 2               ▼ ]   │  ← dropdown éditable
│   Discipline          [ Marketing digital        ]   │  ← input text
│   Établissement       [ ESCG Paris               ]   │  ← input text
│   Deadline            [ 2026-06-15             📅 ]   │  ← input date
│   Nombre de pages     [ 40-60                    ]   │  ← input text
│                                                      │
│   Structure imposée                                  │
│   ┌──────────────────────────────────────────────┐   │
│   │ 3 parties imposées : Contexte, Analyse,      │   │  ← textarea
│   │ Préconisations                               │   │
│   └──────────────────────────────────────────────┘   │
│                                                      │
│   Compétences à valider                              │
│   ┌──────────────────────────────────────────────┐   │
│   │ • Analyser un marché concurrentiel           │   │  ← liste éditable
│   │ • Élaborer une stratégie marketing           │   │
│   │ • Mesurer la performance des actions          │   │
│   │ [ + Ajouter une compétence ]                 │   │
│   └──────────────────────────────────────────────┘   │
│                                                      │
│   Contraintes formelles                              │
│   ┌──────────────────────────────────────────────┐   │
│   │ Times New Roman 12pt, interligne 1.5,        │   │  ← textarea
│   │ bibliographie APA                            │   │
│   └──────────────────────────────────────────────┘   │
│                                                      │
│          [ ← Ré-analyser ]    [ Générer le plan → ]  │
│                                                      │
│   L'IA va utiliser ces informations vérifiées        │
│   pour générer un plan sur mesure.                   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Props :**

```typescript
interface ExtractionConfirmProps {
  extraction: ExtractionResult
  onConfirm: (correctedExtraction: ExtractionResult) => void
  onReanalyze: () => void
  isDark: boolean
  textIntensity: number
  accentColor: string
}
```

**Design :**
- Utiliser UNIQUEMENT `tw()` et `bg()` pour les couleurs. AUCUNE couleur en dur.
- Les inputs/dropdowns : `background: bg(0.04, isDark)`, `border: 1px solid ${bg(0.10, isDark)}`, `color: tw(0.80, textIntensity, isDark)`, `borderRadius: 8`, `padding: '8px 12px'`, `fontSize: 13`
- Les labels : `fontSize: 11`, `fontWeight: 600`, `color: tw(0.40, textIntensity, isDark)`, `textTransform: 'uppercase'`, `letterSpacing: '0.5px'`
- Le résumé en haut : `background: bg(0.03, isDark)`, `borderRadius: 12`, `padding: 16`, `border: 1px solid ${bg(0.06, isDark)}`
- Bouton "Générer le plan" : `background: bg(0.08, isDark)`, `color: tw(0.70, textIntensity, isDark)`, `border: 1px solid ${bg(0.12, isDark)}`, `borderRadius: 99`, `padding: '10px 24px'`, `fontSize: 13`, `fontWeight: 600`
- Bouton "Ré-analyser" : `background: 'transparent'`, `color: tw(0.35, textIntensity, isDark)`, `border: 1px solid ${bg(0.08, isDark)}`, `borderRadius: 99`, `padding: '10px 24px'`
- Layout : `max-width: 560px`, centré, `padding: '40px 24px'`
- Chaque champ = un `<div>` avec `marginBottom: 16`, label au-dessus de l'input
- Le composant utilise un `useState<ExtractionResult>` initialisé depuis la prop `extraction` pour gérer les modifications locales

**Dropdowns pour Type et Niveau :**

```typescript
const TYPES_MEMOIRE = [
  'Mémoire professionnel',
  'Mémoire de recherche',
  'Rapport de stage',
  'Mémoire de fin d\'études',
  'Projet de fin d\'études',
  'Thèse professionnelle',
  'Autre',
]

const NIVEAUX = [
  'BTS', 'Licence 3', 'Bachelor', 'Master 1', 'Master 2',
  'MBA', 'Ingénieur', 'Doctorat', 'Autre',
]
```

Si la valeur extraite ne correspond à aucune option du dropdown, ajouter la valeur comme première option.

**Compétences à valider :**
- Liste avec bouton `✕` pour supprimer chaque compétence
- Bouton `+ Ajouter` qui ajoute un input vide à la fin
- Chaque compétence = un input texte inline

**Animation :**
- Le composant entre avec `animation: 'mq-fadein 0.3s ease both'`
- Ajouter le keyframe si pas déjà défini :
```css
@keyframes mq-fadein { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
```

---

## PROMPT 4 — Intégration dans `DashboardContent.tsx`

### Fichier : `src/components/dashboard/DashboardContent.tsx`

**Nouveau flow :**

```
Upload PDF → Phase 1 (extract) → ExtractionConfirm → Phase 2 (generate) → Plan
```

**Changements :**

### 1. Nouveaux states

```typescript
const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null)
const [pdfBase64, setPdfBase64] = useState<string | null>(null)
const [extractionLoading, setExtractionLoading] = useState(false)
```

Importer `ExtractionResult` depuis `@/types/extraction`.

### 2. Refactorer `handleUpload`

L'ancienne fonction `handleUpload` faisait tout en un. Maintenant elle fait UNIQUEMENT la Phase 1 :

```typescript
const handleUpload = async (file: File) => {
  setExtractionLoading(true)
  setError(null)
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/plan/extract', { method: 'POST', body: formData })
    const data = await res.json()

    if (!res.ok) throw new Error(data.error ?? 'Erreur lors de l\'analyse du document.')

    setExtractionResult(data.extraction)
    setPdfBase64(data.pdfBase64)
    if (data.remaining !== undefined) setPlanRemaining(data.remaining)
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
  } finally {
    setExtractionLoading(false)
  }
}
```

### 3. Nouvelle fonction `handleGeneratePlan`

C'est la Phase 2 — appelée quand l'utilisateur confirme les métadonnées :

```typescript
const handleGeneratePlan = async (confirmedExtraction: ExtractionResult) => {
  if (!pdfBase64) return
  setIsLoading(true)
  setError(null)
  setExtractionResult(null) // Fermer l'écran de confirmation

  try {
    const res = await fetch('/api/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pdfBase64, extraction: confirmedExtraction }),
    })

    // Non-streaming error
    const ct = res.headers.get('content-type') ?? ''
    if (ct.includes('application/json') && !ct.includes('text/event-stream')) {
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur lors de la génération du plan.')
      setPlan(data.plan)
      if (data.remaining !== undefined) setPlanRemaining(data.remaining)
      return
    }

    // SSE streaming — COPIER LE CODE EXISTANT (lines 133-166 de l'actuel handleUpload)
    if (!res.body) throw new Error('Pas de réponse du serveur.')
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let planReceived = false

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const match = line.match(/^data:\s*(.+)$/m)
        if (!match) continue
        try {
          const msg = JSON.parse(match[1])
          if (msg.type === 'done') {
            setPlan(msg.plan)
            if (msg.remaining !== undefined) setPlanRemaining(msg.remaining)
            planReceived = true
          } else if (msg.type === 'error') {
            throw new Error(msg.error)
          }
        } catch (parseErr) {
          if (parseErr instanceof Error && parseErr.message !== match[1]) throw parseErr
        }
      }
    }
    if (!planReceived) throw new Error('Le plan n\'a pas pu être généré. Réessaie.')
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
  } finally {
    setIsLoading(false)
    setPdfBase64(null)
  }
}
```

### 4. Nouvelle fonction `handleReanalyze`

Remet à zéro l'extraction pour permettre un re-upload :

```typescript
const handleReanalyze = () => {
  setExtractionResult(null)
  setPdfBase64(null)
}
```

### 5. Passer les nouveaux props à `NewDashboard`

```typescript
<NewDashboard
  // ... tous les props existants ...
  extractionResult={extractionResult}
  extractionLoading={extractionLoading}
  onConfirmExtraction={handleGeneratePlan}
  onReanalyze={handleReanalyze}
/>
```

---

## PROMPT 5 — Intégration dans `NewDashboard.tsx`

### Fichier : `src/components/dashboard/new/NewDashboard.tsx`

**Changements :**

### 1. Nouvelles props

Ajouter à l'interface `NewDashboardProps` :

```typescript
extractionResult?: ExtractionResult | null
extractionLoading?: boolean
onConfirmExtraction?: (extraction: ExtractionResult) => void
onReanalyze?: () => void
```

### 2. Modifier le rendu principal

Actuellement (dans le `<main>`), la logique est :

```tsx
{plan ? (
  // Afficher le dashboard (views, sidebar, etc.)
) : (
  <OnboardingScreen />
)}
```

Remplacer par un rendu à 3 états :

```tsx
{plan ? (
  // Dashboard existant — NE PAS TOUCHER
) : extractionResult && onConfirmExtraction && onReanalyze ? (
  // Phase intermédiaire : confirmation des métadonnées
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: isDark ? '#04030e' : '#ffffff',
  }}>
    <ExtractionConfirm
      extraction={extractionResult}
      onConfirm={onConfirmExtraction}
      onReanalyze={onReanalyze}
      isDark={isDark}
      textIntensity={textIntensity}
      accentColor={accentColor}
    />
  </div>
) : (
  <OnboardingScreen />
)}
```

Importer `ExtractionConfirm` en haut du fichier.

### 3. Loading states

L'`OnboardingScreen` reçoit déjà `isLoading` pour la zone d'upload. Il faut s'assurer que :
- `extractionLoading` est utilisé pendant la Phase 1 (analyse du PDF)
- `isLoading` est utilisé pendant la Phase 2 (génération du plan)

Dans `OnboardingScreen`, passer `isLoading={isLoading || extractionLoading}` à `UploadZone`.

**AUSSI** : Quand `isLoading` est true (Phase 2 en cours), afficher un overlay de chargement au-dessus de l'`ExtractionConfirm` ou à sa place, avec le message "Génération du plan en cours...". Réutiliser le style de loading existant (le spinner monochrome).

### 4. Chargement Phase 2 — overlay

Quand `isLoading === true && !plan` (Phase 2 en cours), afficher un écran de chargement centré :

```tsx
{isLoading && !plan && (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: 20,
    background: isDark ? '#04030e' : '#ffffff',
  }}>
    {/* Spinner */}
    <div style={{
      width: 36,
      height: 36,
      borderRadius: '50%',
      border: `2px solid ${bg(0.08, isDark)}`,
      borderTopColor: tw(0.40, textIntensity, isDark),
      animation: 'mq-spin 0.8s linear infinite',
    }} />
    <div style={{ fontSize: 14, color: tw(0.50, textIntensity, isDark), fontWeight: 500 }}>
      Génération du plan en cours...
    </div>
    <div style={{ fontSize: 12, color: tw(0.25, textIntensity, isDark) }}>
      L'IA utilise tes métadonnées vérifiées pour créer un plan sur mesure.
    </div>
  </div>
)}
```

Ajouter le keyframe CSS pour le spin si pas déjà présent.

---

## VÉRIFICATION FINALE

Après les 5 prompts, vérifier :

1. `npx tsc --noEmit` — 0 erreurs TypeScript
2. `npm run build` — compilation OK
3. Vérifier que :
   - Le fichier `app/api/plan/extract/route.ts` existe et exporte un POST
   - Le fichier `src/types/extraction.ts` existe avec `ExtractionResult`
   - Le fichier `src/components/dashboard/new/ExtractionConfirm.tsx` existe
   - `/api/plan/route.ts` accepte maintenant un JSON body `{ pdfBase64, extraction }`
   - `DashboardContent.tsx` a les 3 handlers : `handleUpload` (Phase 1), `handleGeneratePlan` (Phase 2), `handleReanalyze`
   - `NewDashboard.tsx` affiche 3 états : dashboard / ExtractionConfirm / OnboardingScreen
   - L'écran ExtractionConfirm est entièrement monochrome (pas de couleurs vives)
   - Les dropdowns pour Type et Niveau fonctionnent
   - La liste de compétences est éditable (ajout/suppression)
   - Le bouton "Ré-analyser" remet à zéro et montre l'UploadZone

---

## ORDRE D'EXÉCUTION

```
Phase 1 : PROMPT 1 — Créer /api/plan/extract + types/extraction.ts
Phase 2 : PROMPT 2 — Refactorer /api/plan/route.ts
Phase 3 : PROMPT 3 — Créer ExtractionConfirm.tsx
Phase 4 : PROMPT 4 — Modifier DashboardContent.tsx
Phase 5 : PROMPT 5 — Modifier NewDashboard.tsx

Vérification : npx tsc --noEmit && npm run build
```

---

## RÉSUMÉ DU FLOW UTILISATEUR

```
1. L'utilisateur arrive sur le dashboard (pas de plan)
   → Voit l'écran d'upload (UploadZone)

2. Il dépose son PDF
   → Phase 1 : POST /api/plan/extract
   → Spinner "Analyse du PDF..."
   → Retour : métadonnées extraites

3. L'écran ExtractionConfirm s'affiche
   → L'utilisateur voit : type, niveau, discipline, deadline, structure, etc.
   → Il peut CORRIGER chaque champ
   → Il clique "Générer le plan"

4. Phase 2 : POST /api/plan (avec métadonnées vérifiées + PDF base64)
   → Spinner "Génération du plan en cours..."
   → SSE streaming
   → Plan reçu → dashboard affiché

Alternative :
3b. L'utilisateur clique "Ré-analyser"
    → Retour à l'écran d'upload
    → Il peut re-déposer un autre PDF
```
