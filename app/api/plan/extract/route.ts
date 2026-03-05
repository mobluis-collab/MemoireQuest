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
