# PROMPTS CLAUDE CODE — V4 : Pomodoro + Deadline Fix

> **INSTRUCTION** : Exécute les 2 prompts ci-dessous EN PARALLÈLE avec des sous-agents.
> Après chaque prompt, lance `npx tsc --noEmit` puis `npm run build`.
> Ne modifie JAMAIS le design monochrome (`tw()`, `bg()`, inline styles).
> L'accent color ne sert QUE pour les barres XP et la DotGrid timeline.
> Toute l'interface est en français.

---

## PROMPT 1 — Pomodoro Timer (3 sous-agents)

### Sous-agent A : Composant PomodoroTimer

**Fichier à CRÉER** : `src/components/dashboard/new/PomodoroTimer.tsx`

Crée un composant React autonome pour un timer Pomodoro.

**Spécifications :**

```typescript
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { tw, bg } from '@/lib/color-utils'

interface PomodoroTimerProps {
  isOpen: boolean
  onClose: () => void
  textIntensity?: number
  isDark?: boolean
}
```

**Logique du timer :**
- État `mode` : `'work'` (25 min) | `'break'` (5 min)
- État `timeLeft` : nombre de secondes restantes (démarre à 25 * 60 = 1500)
- État `isRunning` : boolean (pause/play)
- État `completedCycles` : compteur de pomodoros terminés (persistent dans la session)
- `useEffect` avec `setInterval(1000ms)` quand `isRunning === true`
- Quand `timeLeft` atteint 0 :
  - Si `mode === 'work'` → incrémenter `completedCycles`, basculer en `'break'` (5 min = 300s), auto-start
  - Si `mode === 'break'` → basculer en `'work'` (25 min = 1500s), NE PAS auto-start (attendre click)
- Bouton Play/Pause toggle
- Bouton Reset : remet à 25:00, mode work, isRunning false
- Bouton Skip : passe directement au mode suivant

**UI — Overlay plein écran :**
- `position: 'fixed'`, `inset: 0`, `zIndex: 9998`
- Fond : `isDark ? 'rgba(4,3,14,0.92)' : 'rgba(255,255,255,0.95)'`
- `backdropFilter: 'blur(20px)'`
- Animation d'entrée : `animation: 'mq-overlay-in 0.25s ease both'` (existe déjà dans le CSS global)

**Layout de l'overlay :**
```
┌──────────────────────────────────┐
│                          [✕]     │  ← bouton close, top-right
│                                  │
│          mode label              │  ← "Concentration" ou "Pause"
│          (petit texte)           │
│                                  │
│         25 : 00                  │  ← timer géant, monospace
│                                  │
│     ┌─────────────────┐          │  ← barre de progression circulaire (SVG)
│     │   cercle SVG    │          │
│     └─────────────────┘          │
│                                  │
│    [▶ Play]  [↺ Reset]  [⏭ Skip]│  ← boutons d'action
│                                  │
│       🍅 x 3 pomodoros           │  ← compteur de cycles
│                                  │
└──────────────────────────────────┘
```

**Détails visuels CRITIQUES :**
- Timer : `fontSize: 72`, `fontWeight: 200`, `fontFamily: 'monospace'`, `letterSpacing: '-2px'`
- Couleur timer : `tw(0.90, textIntensity, isDark)` en mode work, `tw(0.60, textIntensity, isDark)` en mode break
- Label mode : `fontSize: 13`, `fontWeight: 600`, `textTransform: 'uppercase'`, `letterSpacing: '2px'`, `color: tw(0.35, textIntensity, isDark)`
- Cercle de progression SVG :
  - Taille : `width: 220, height: 220`
  - `viewBox="0 0 100 100"`, cercle `cx=50 cy=50 r=44`
  - Track : `stroke: bg(0.06, isDark)`, `strokeWidth: 2`
  - Progress : `stroke: tw(0.25, textIntensity, isDark)`, `strokeWidth: 2`
  - `strokeDasharray` et `strokeDashoffset` calculés avec `(timeLeft / totalTime)` où totalTime = 1500 ou 300
  - `strokeLinecap: 'round'`, `transform: 'rotate(-90 50 50)'`
  - Transition : `transition: 'stroke-dashoffset 1s linear'`
- Le timer est CENTRÉ dans le cercle SVG (position absolute au centre du SVG)
- Boutons : `borderRadius: 99`, `padding: '10px 20px'`, `border: 1px solid ${bg(0.12, isDark)}`, `background: bg(0.06, isDark)`, `color: tw(0.60, textIntensity, isDark)`, `fontSize: 12`, `fontWeight: 500`, `cursor: 'pointer'`
- Bouton Play actif : `background: bg(0.10, isDark)`, `color: tw(0.80, textIntensity, isDark)`
- Compteur pomodoros : petits cercles `●` (8px) sous les boutons, `tw(0.50)` pour les complétés, `tw(0.12)` pour les restants (afficher 4 cercles max, remplis selon completedCycles % 4)
- Bouton close `✕` en haut à droite : même style que dans l'overlay des raccourcis clavier (voir code existant)

**IMPORTANT :**
- AUCUNE couleur en dehors de `tw()` et `bg()`. Pas de rouge, pas de vert, pas d'accent color.
- Le composant gère son propre state, il reçoit juste `isOpen` et `onClose`
- Quand `isOpen === false`, le composant retourne `null` (ne rend rien)
- Cleanup du `setInterval` dans le `useEffect` return

---

### Sous-agent B : Intégration dans NewDashboard.tsx

**Fichier** : `src/components/dashboard/new/NewDashboard.tsx`

**1. Import du composant :**
Ajouter en haut, après les autres imports :
```typescript
import PomodoroTimer from './PomodoroTimer'
```

**2. Nouveau state :**
Ajouter juste après `const [focusMode, setFocusMode] = useState(false)` (ligne 615) :
```typescript
const [pomodoroOpen, setPomodoroOpen] = useState(false)
```

**3. Raccourci clavier :**
Dans le `switch (e.key)` du `useEffect` keyboard (lignes 644-679), ajouter un nouveau case AVANT le `default` :
```typescript
case 'p':
case 'P':
  setPomodoroOpen(prev => !prev)
  break
```

Et ajouter `pomodoroOpen` dans le tableau de dépendances du useEffect.

**4. Bouton Pomodoro — À CÔTÉ du bouton Focus :**
Juste AVANT le bouton Focus existant (avant la ligne `{!focusMode && plan && (`), ajouter :

```tsx
{!focusMode && plan && (
  <button
    onClick={() => setPomodoroOpen(true)}
    style={{
      position: 'absolute',
      top: 14,
      right: 100,  // Focus est à right:20, donc Pomodoro est à gauche
      zIndex: 20,
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      padding: '5px 12px',
      borderRadius: 99,
      border: `1px solid ${bg(0.10, isDark)}`,
      background: bg(0.05, isDark),
      color: tw(0.45, textIntensity, isDark),
      fontSize: 11,
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
      backdropFilter: 'blur(8px)',
    }}
    title="Pomodoro (P)"
  >
    <span style={{ fontSize: 12 }}>{'\u{1F345}'}</span>
    <span>Pomodoro</span>
  </button>
)}
```

**ATTENTION** : NE PAS utiliser d'emoji si ça casse le build. Utiliser `🍅` ou le caractère unicode `\u{1F345}`. Si le build échoue à cause de l'emoji, remplacer par `◔` (U+25D4) comme icône alternative.

**5. Rendu du composant PomodoroTimer :**
Juste AVANT `{/* Re-upload loading overlay */}` (vers ligne 1458), ajouter :
```tsx
<PomodoroTimer
  isOpen={pomodoroOpen}
  onClose={() => setPomodoroOpen(false)}
  textIntensity={textIntensity}
  isDark={isDark}
/>
```

**6. Raccourci clavier dans l'overlay :**
Dans la liste des raccourcis (tableau commençant vers ligne 1539), ajouter APRÈS `{ keys: 'F', desc: 'Mode focus' }` :
```typescript
{ keys: 'P', desc: 'Pomodoro' },
```

---

### Sous-agent C : Tests et vérification

1. Lancer `npx tsc --noEmit` — doit passer sans erreur
2. Lancer `npm run build` — doit compiler
3. Vérifier que :
   - Le fichier `PomodoroTimer.tsx` existe et exporte un composant par défaut
   - Le composant est importé dans NewDashboard.tsx
   - Le state `pomodoroOpen` existe
   - Le raccourci `P` est câblé
   - Le bouton est positionné à `right: 100` (à gauche du Focus à `right: 20`)
   - Le rendu `<PomodoroTimer>` est dans le JSX

---

## PROMPT 2 — Fix Deadline (2 sous-agents)

### Sous-agent A : Renforcer le prompt IA + logging

**Fichier** : `app/api/plan/route.ts`

Le message user a déjà été renforcé (voir le texte actuel avec "DEADLINE OBLIGATOIRE" et la double vérification).

**Ajouter un log de debug** : après le parsing Zod réussi (après `const plan = parsed.data`, vers ligne 235), ajouter :

```typescript
// Log deadline detection for debugging
console.log('[plan] Deadline detected:', plan.deadline ?? 'null (not found in PDF)')
console.log('[plan] Plan title:', plan.title)
```

Cela permettra de voir dans les logs Vercel si la deadline est bien extraite.

### Sous-agent B : Ajouter option de deadline manuelle dans le dashboard

**Fichier** : `src/components/dashboard/new/NewDashboard.tsx`

Actuellement, quand aucune deadline n'est détectée, le dashboard affiche juste "Aucune deadline détectée dans ton cahier des charges" (vers ligne 1295-1306).

**Transformer ce bloc en formulaire de saisie manuelle :**

Trouver le bloc qui affiche "Aucune deadline détectée" (c'est dans le `else` du `{deadlineDate ? (...) : (...)}` dans la carte timeline, vers ligne 1295). Remplacer ce bloc par :

```tsx
<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '16px 0' }}>
  <div style={{ fontSize: 28, color: tw(0.15, textIntensity, isDark) }}>
    {'\u2014'}
  </div>
  <div style={{ fontSize: 12, color: tw(0.45, textIntensity, isDark), lineHeight: 1.5, maxWidth: 260, textAlign: 'center' }}>
    Aucune deadline d{'\u00E9'}tect{'\u00E9'}e dans ton cahier des charges
  </div>
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
    <input
      type="date"
      value={manualDeadline}
      onChange={(e: ChangeEvent<HTMLInputElement>) => setManualDeadline(e.target.value)}
      style={{
        padding: '6px 10px',
        borderRadius: 8,
        border: `1px solid ${bg(0.12, isDark)}`,
        background: bg(0.04, isDark),
        color: tw(0.70, textIntensity, isDark),
        fontSize: 12,
        fontFamily: 'inherit',
        outline: 'none',
        cursor: 'pointer',
      }}
    />
    {manualDeadline && (
      <button
        onClick={handleSaveDeadline}
        style={{
          padding: '6px 14px',
          borderRadius: 8,
          border: `1px solid ${bg(0.15, isDark)}`,
          background: bg(0.08, isDark),
          color: tw(0.65, textIntensity, isDark),
          fontSize: 11,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        Valider
      </button>
    )}
  </div>
</div>
```

**Ajouter le state et le handler :**

1. Nouveau state (après `const [focusMode, setFocusMode] = useState(false)`) :
```typescript
const [manualDeadline, setManualDeadline] = useState('')
```

2. Handler pour sauvegarder la deadline (après les handlers existants) :
```typescript
const handleSaveDeadline = useCallback(async () => {
  if (!manualDeadline || !plan) return
  try {
    const res = await fetch('/api/user/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        field: 'deadline',
        value: manualDeadline,
      }),
    })
    if (res.ok) {
      // Force refresh to pick up new deadline
      window.location.reload()
    }
  } catch (err) {
    console.error('Failed to save deadline:', err)
  }
}, [manualDeadline, plan])
```

3. **IMPORTANT** : Vérifier que `ChangeEvent` est importé en haut du fichier (dans le destructuring de `'react'`). S'il n'y est pas, l'ajouter.

### Sous-agent C : Endpoint API pour sauvegarder la deadline

**Fichier** : `app/api/user/save/route.ts`

Vérifier si ce fichier existe déjà. S'il existe, ajouter la gestion du champ `deadline`. S'il n'existe pas, le créer :

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  if (body.field === 'deadline') {
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(body.value)) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

    // Update plan_data.deadline in the memoir_plans table
    const { data: existingPlan } = await supabase
      .from('memoir_plans')
      .select('id, plan_data')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (!existingPlan) {
      return NextResponse.json({ error: 'No plan found' }, { status: 404 })
    }

    const updatedPlanData = {
      ...existingPlan.plan_data,
      deadline: body.value,
    }

    const { error } = await supabase
      .from('memoir_plans')
      .update({ plan_data: updatedPlanData, updated_at: new Date().toISOString() })
      .eq('id', existingPlan.id)

    if (error) {
      console.error('[save] Deadline update error:', error)
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown field' }, { status: 400 })
}
```

**IMPORTANT** : Si le fichier `app/api/user/save/route.ts` existe DÉJÀ avec d'autres fonctionnalités, NE PAS le remplacer entièrement. Ajouter le case `deadline` dans la logique existante.

### Sous-agent D : Vérification

1. `npx tsc --noEmit` — 0 erreurs
2. `npm run build` — compilation OK
3. Vérifier :
   - Le log `[plan] Deadline detected:` est ajouté dans `/api/plan/route.ts`
   - Le state `manualDeadline` existe dans NewDashboard
   - L'input `type="date"` s'affiche quand `deadlineDate` est null
   - L'endpoint `/api/user/save` gère `field === 'deadline'`
   - Le `deadlineDate` dans NewDashboard prend en compte la deadline du plan (déjà le cas via `plan.deadline`)

---

## ORDRE D'EXÉCUTION

```
Phase 1 (parallèle) :
  ├── PROMPT 1 sous-agent A : Créer PomodoroTimer.tsx
  ├── PROMPT 2 sous-agent A : Log deadline dans /api/plan
  └── PROMPT 2 sous-agent C : Créer/modifier /api/user/save

Phase 2 (après Phase 1) :
  ├── PROMPT 1 sous-agent B : Intégrer Pomodoro dans NewDashboard
  └── PROMPT 2 sous-agent B : Ajouter deadline manuelle dans NewDashboard

Phase 3 (après Phase 2) :
  ├── PROMPT 1 sous-agent C : Tests Pomodoro
  └── PROMPT 2 sous-agent D : Tests Deadline

Phase 4 : npx tsc --noEmit && npm run build
```
