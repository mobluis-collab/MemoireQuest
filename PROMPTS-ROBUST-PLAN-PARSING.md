# PROMPT — Rendre le parsing du plan ROBUSTE (fix "Structure du plan invalide")

## Problème

Quand un utilisateur uploade un cahier des charges, Claude API génère un plan en JSON. Ce JSON est validé par un schéma Zod STRICT dans `/api/plan/route.ts`. Si Claude fait la moindre variation (difficulté en français, 1 task au lieu de 2, champ en trop, etc.), tout le plan est rejeté avec l'erreur **"Structure du plan invalide. Réessaie."**

L'outil DOIT fonctionner avec TOUT type de cahier des charges, sans jamais planter au parsing.

## Solution

Ajouter une fonction `repairPlan()` qui normalise la réponse de Claude AVANT la validation Zod. Cette fonction corrige toutes les erreurs courantes silencieusement au lieu de planter.

## Fichier à modifier : `app/api/plan/route.ts`

### Étape 1 : Ajouter la fonction `repairPlan` AVANT les schémas Zod (après les imports)

```typescript
// ─── REPAIR FUNCTION ───────────────────────────────────────────────
// Normalise la réponse de Claude pour qu'elle passe la validation Zod.
// Corrige silencieusement les erreurs courantes au lieu de planter.
function repairPlan(raw: Record<string, unknown>): Record<string, unknown> {
  // Map des difficultés françaises → anglaises
  const DIFFICULTY_MAP: Record<string, string> = {
    'facile': 'easy', 'simple': 'easy', 'basique': 'easy',
    'moyen': 'medium', 'moyenne': 'medium', 'intermédiaire': 'medium', 'intermediaire': 'medium', 'moderate': 'medium',
    'difficile': 'hard', 'complexe': 'hard', 'avancé': 'hard', 'avance': 'hard', 'expert': 'hard',
    // Variantes de casse
    'Easy': 'easy', 'EASY': 'easy',
    'Medium': 'medium', 'MEDIUM': 'medium',
    'Hard': 'hard', 'HARD': 'hard',
    'Facile': 'easy', 'Moyen': 'medium', 'Moyenne': 'medium',
    'Difficile': 'hard', 'Complexe': 'hard',
  }

  const VALID_DIFFICULTIES = new Set(['easy', 'medium', 'hard'])

  function repairDifficulty(val: unknown): string {
    if (typeof val === 'string') {
      const trimmed = val.trim()
      if (VALID_DIFFICULTIES.has(trimmed)) return trimmed
      if (DIFFICULTY_MAP[trimmed]) return DIFFICULTY_MAP[trimmed]
      // Lowercase fallback
      const lower = trimmed.toLowerCase()
      if (VALID_DIFFICULTIES.has(lower)) return lower
      if (DIFFICULTY_MAP[lower]) return DIFFICULTY_MAP[lower]
    }
    return 'medium' // fallback par défaut
  }

  function repairTasks(tasks: unknown): string[] {
    if (!Array.isArray(tasks)) return ['Lire et analyser cette section', 'Rédiger le contenu']

    // Filtrer les entrées vides
    const cleaned = tasks
      .filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
      .map(t => t.trim())

    if (cleaned.length === 0) return ['Lire et analyser cette section', 'Rédiger le contenu']
    if (cleaned.length === 1) return [...cleaned, 'Relire et vérifier la cohérence']
    if (cleaned.length > 4) return cleaned.slice(0, 4)
    return cleaned
  }

  function repairSection(section: Record<string, unknown>): Record<string, unknown> {
    return {
      text: typeof section.text === 'string' && section.text.trim().length > 0
        ? section.text.trim()
        : (typeof section.title === 'string' ? section.title : 'Section sans titre'),
      difficulty: repairDifficulty(section.difficulty),
      tasks: repairTasks(section.tasks),
    }
  }

  function repairChapter(chapter: Record<string, unknown>): Record<string, unknown> {
    let sections = Array.isArray(chapter.sections)
      ? chapter.sections.map((s: Record<string, unknown>) => repairSection(s ?? {}))
      : []

    // Garantir min 2 sections
    if (sections.length === 0) {
      sections = [
        { text: 'Introduction du chapitre', difficulty: 'easy', tasks: ['Définir le contexte', 'Rédiger l\'introduction'] },
        { text: 'Développement principal', difficulty: 'medium', tasks: ['Analyser les éléments clés', 'Rédiger le développement'] },
      ]
    } else if (sections.length === 1) {
      sections.push({ text: 'Synthèse et conclusion du chapitre', difficulty: 'easy', tasks: ['Synthétiser les points clés', 'Rédiger la conclusion du chapitre'] })
    }

    // Max 10 sections
    if (sections.length > 10) sections = sections.slice(0, 10)

    return {
      number: typeof chapter.number === 'string' ? chapter.number
        : typeof chapter.number === 'number' ? String(chapter.number)
        : '?',
      title: typeof chapter.title === 'string' && chapter.title.trim().length > 0
        ? chapter.title.trim()
        : 'Chapitre sans titre',
      objective: typeof chapter.objective === 'string' && chapter.objective.trim().length > 0
        ? chapter.objective.trim()
        : 'Objectif non spécifié',
      sections,
      tips: typeof chapter.tips === 'string' && chapter.tips.trim().length > 0
        ? chapter.tips.trim()
        : typeof chapter.tip === 'string' ? (chapter.tip as string).trim()
        : 'Consulter les sources recommandées et structurer ses idées avant de rédiger.',
    }
  }

  // Réparer le plan global
  let chapters = Array.isArray(raw.chapters)
    ? raw.chapters.map((ch: Record<string, unknown>) => repairChapter(ch ?? {}))
    : []

  // Garantir min 2 chapitres
  if (chapters.length < 2) {
    console.warn('[plan] repairPlan: fewer than 2 chapters, padding')
    while (chapters.length < 2) {
      chapters.push({
        number: String(chapters.length + 1),
        title: 'Chapitre complémentaire',
        objective: 'Compléter l\'analyse',
        sections: [
          { text: 'Développement', difficulty: 'medium', tasks: ['Analyser', 'Rédiger'] },
          { text: 'Conclusion', difficulty: 'easy', tasks: ['Synthétiser', 'Relire'] },
        ],
        tips: 'Structurer ses idées avant de rédiger.',
      })
    }
  }

  // Max 15 chapitres
  if (chapters.length > 15) chapters = chapters.slice(0, 15)

  return {
    title: typeof raw.title === 'string' && raw.title.trim().length > 0
      ? raw.title.trim()
      : 'Plan de mémoire',
    chapters,
    deadline: typeof raw.deadline === 'string' ? raw.deadline : null,
  }
}
```

### Étape 2 : Utiliser `repairPlan()` dans le flow de parsing

Trouver ce bloc (vers les lignes 204-227) :

```typescript
const jsonMatch = fullText.match(/\{[\s\S]*\}/)
if (!jsonMatch) {
  console.error('[plan] No JSON in response. Start:', fullText.slice(0, 200))
  sendEvent(JSON.stringify({ type: 'error', error: 'Impossible d\'extraire le plan. Réessaie.' }))
  controller.close()
  return
}

let parsed
try {
  parsed = MemoirePlanSchema.safeParse(JSON.parse(jsonMatch[0]))
} catch {
  console.error('[plan] JSON parse error')
  sendEvent(JSON.stringify({ type: 'error', error: 'Le plan généré contenait du JSON invalide. Réessaie.' }))
  controller.close()
  return
}

if (!parsed.success) {
  console.error('[plan] Zod error:', JSON.stringify(parsed.error.flatten()))
  sendEvent(JSON.stringify({ type: 'error', error: 'Structure du plan invalide. Réessaie.' }))
  controller.close()
  return
}
```

**Remplacer par :**

```typescript
const jsonMatch = fullText.match(/\{[\s\S]*\}/)
if (!jsonMatch) {
  console.error('[plan] No JSON in response. Start:', fullText.slice(0, 200))
  sendEvent(JSON.stringify({ type: 'error', error: 'Impossible d\'extraire le plan. Réessaie.' }))
  controller.close()
  return
}

let rawJson: Record<string, unknown>
try {
  rawJson = JSON.parse(jsonMatch[0])
} catch {
  console.error('[plan] JSON parse error. Start:', jsonMatch[0].slice(0, 300))
  sendEvent(JSON.stringify({ type: 'error', error: 'Le plan généré contenait du JSON invalide. Réessaie.' }))
  controller.close()
  return
}

// Réparer la réponse de Claude avant la validation Zod
const repaired = repairPlan(rawJson)

const parsed = MemoirePlanSchema.safeParse(repaired)

if (!parsed.success) {
  // Même après réparation, ça ne passe pas → log détaillé + erreur
  console.error('[plan] Zod error AFTER repair:', JSON.stringify(parsed.error.flatten()))
  console.error('[plan] Repaired plan was:', JSON.stringify(repaired).slice(0, 500))
  sendEvent(JSON.stringify({ type: 'error', error: 'Structure du plan invalide. Réessaie.' }))
  controller.close()
  return
}
```

### Étape 3 : Assouplir légèrement le schéma Zod (filet de sécurité)

Modifier `SectionSchema` pour accepter `tasks` de 1 à 5 au lieu de 2 à 4 (la réparation s'en charge, mais au cas où) :

```typescript
const SectionSchema = z.object({
  text: z.string().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tasks: z.array(z.string().min(1)).min(1).max(5),
})
```

Et `ChapterSchema` pour accepter 1 à 12 sections :

```typescript
const ChapterSchema = z.object({
  number: z.string(),
  title: z.string().min(1),
  objective: z.string().min(1),
  sections: z.array(SectionSchema).min(1).max(12),
  tips: z.string().min(1),
})
```

## Ce que ça corrige

| Problème | Avant | Après |
|----------|-------|-------|
| Difficulté en français ("facile") | ❌ CRASH | ✅ Converti en "easy" |
| Difficulté en majuscules ("HARD") | ❌ CRASH | ✅ Converti en "hard" |
| 0 ou 1 task par section | ❌ CRASH | ✅ Paddé à 2 tasks |
| 5+ tasks par section | ❌ CRASH | ✅ Tronqué à 4 |
| Section sans texte | ❌ CRASH | ✅ Fallback "Section sans titre" |
| Chapitre sans objective | ❌ CRASH | ✅ Fallback |
| `number` est un int au lieu de string | ❌ CRASH | ✅ Converti en string |
| `tip` au lieu de `tips` | ❌ CRASH | ✅ Détecté et mappé |
| 1 seul chapitre | ❌ CRASH | ✅ Paddé à 2 |
| 20 chapitres | ❌ CRASH | ✅ Tronqué à 15 |
| Champ `hint` ou extra fields | ❌ Possible crash | ✅ Ignoré (seuls les champs attendus sont extraits) |
| Pas de deadline | ❌ Possible crash | ✅ Mis à null |

## Résultat attendu

L'outil accepte TOUT cahier des charges sans jamais planter au parsing. La réparation est invisible pour l'utilisateur — il voit toujours un plan propre et structuré.
