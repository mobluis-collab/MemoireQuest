import { z } from 'zod'

/**
 * Reproduction exacte des schemas Zod de /api/plan/route.ts
 * pour tester la validation du plan généré par l'IA
 */
const SectionSchema = z.object({
  text: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tasks: z.array(z.string().min(1)).min(2).max(4),
  hint: z.string().min(1).optional(),
})

const ChapterSchema = z.object({
  number: z.string(),
  title: z.string(),
  objective: z.string(),
  sections: z.array(SectionSchema).min(2).max(10),
  tips: z.string(),
})

const MemoirePlanSchema = z.object({
  title: z.string(),
  chapters: z.array(ChapterSchema).min(2).max(15),
  deadline: z.string().nullable().optional(),
})

/* ─── Fixtures ─── */

const validPlan = {
  title: 'Mon mémoire de test',
  chapters: [
    {
      number: '1',
      title: 'Introduction',
      objective: 'Présenter le sujet',
      sections: [
        {
          text: 'Contexte général',
          difficulty: 'easy' as const,
          tasks: ['Rechercher le contexte', 'Rédiger le paragraphe'],
          hint: 'Commence par le plus large puis affine',
        },
        {
          text: 'Problématique',
          difficulty: 'medium' as const,
          tasks: ['Formuler la question', 'Justifier la pertinence'],
        },
      ],
      tips: 'Sois concis dans ton intro.',
    },
    {
      number: '2',
      title: 'État de l\'art',
      objective: 'Synthétiser les sources',
      sections: [
        {
          text: 'Revue de littérature',
          difficulty: 'hard' as const,
          tasks: ['Lire les sources', 'Synthétiser', 'Identifier les manques'],
        },
        {
          text: 'Cadre théorique',
          difficulty: 'medium' as const,
          tasks: ['Choisir un modèle', 'Appliquer au sujet'],
        },
      ],
      tips: 'Cite tes sources.',
    },
  ],
  deadline: '2026-06-30',
}

describe('MemoirePlanSchema — Plan valide', () => {
  it('accepte un plan bien formé', () => {
    const result = MemoirePlanSchema.safeParse(validPlan)
    expect(result.success).toBe(true)
  })

  it('accepte un plan sans deadline', () => {
    const result = MemoirePlanSchema.safeParse({ ...validPlan, deadline: null })
    expect(result.success).toBe(true)
  })

  it('accepte un plan sans le champ deadline', () => {
    const { deadline, ...planSansDeadline } = validPlan
    const result = MemoirePlanSchema.safeParse(planSansDeadline)
    expect(result.success).toBe(true)
  })

  it('accepte une section avec hint optionnel absent', () => {
    const result = MemoirePlanSchema.safeParse(validPlan)
    expect(result.success).toBe(true)
    // La deuxième section du premier chapitre n'a pas de hint
  })
})

describe('MemoirePlanSchema — Rejets', () => {
  it('rejette un plan avec 1 seul chapitre', () => {
    const plan = { ...validPlan, chapters: [validPlan.chapters[0]] }
    const result = MemoirePlanSchema.safeParse(plan)
    expect(result.success).toBe(false)
  })

  it('rejette un chapitre avec 1 seule section', () => {
    const plan = {
      ...validPlan,
      chapters: [
        { ...validPlan.chapters[0], sections: [validPlan.chapters[0].sections[0]] },
        validPlan.chapters[1],
      ],
    }
    const result = MemoirePlanSchema.safeParse(plan)
    expect(result.success).toBe(false)
  })

  it('rejette une section avec 1 seule tâche', () => {
    const plan = {
      ...validPlan,
      chapters: [
        {
          ...validPlan.chapters[0],
          sections: [
            { ...validPlan.chapters[0].sections[0], tasks: ['Seule tâche'] },
            validPlan.chapters[0].sections[1],
          ],
        },
        validPlan.chapters[1],
      ],
    }
    const result = MemoirePlanSchema.safeParse(plan)
    expect(result.success).toBe(false)
  })

  it('rejette une section avec 5 tâches (max 4)', () => {
    const plan = {
      ...validPlan,
      chapters: [
        {
          ...validPlan.chapters[0],
          sections: [
            { ...validPlan.chapters[0].sections[0], tasks: ['a', 'b', 'c', 'd', 'e'] },
            validPlan.chapters[0].sections[1],
          ],
        },
        validPlan.chapters[1],
      ],
    }
    const result = MemoirePlanSchema.safeParse(plan)
    expect(result.success).toBe(false)
  })

  it('rejette une difficulté invalide', () => {
    const plan = {
      ...validPlan,
      chapters: [
        {
          ...validPlan.chapters[0],
          sections: [
            { ...validPlan.chapters[0].sections[0], difficulty: 'impossible' },
            validPlan.chapters[0].sections[1],
          ],
        },
        validPlan.chapters[1],
      ],
    }
    const result = MemoirePlanSchema.safeParse(plan)
    expect(result.success).toBe(false)
  })

  it('rejette un hint vide (string vide)', () => {
    const plan = {
      ...validPlan,
      chapters: [
        {
          ...validPlan.chapters[0],
          sections: [
            { ...validPlan.chapters[0].sections[0], hint: '' },
            validPlan.chapters[0].sections[1],
          ],
        },
        validPlan.chapters[1],
      ],
    }
    const result = MemoirePlanSchema.safeParse(plan)
    expect(result.success).toBe(false)
  })

  it('rejette une tâche vide dans le tableau', () => {
    const plan = {
      ...validPlan,
      chapters: [
        {
          ...validPlan.chapters[0],
          sections: [
            { ...validPlan.chapters[0].sections[0], tasks: ['', 'Valide'] },
            validPlan.chapters[0].sections[1],
          ],
        },
        validPlan.chapters[1],
      ],
    }
    const result = MemoirePlanSchema.safeParse(plan)
    expect(result.success).toBe(false)
  })

  it('rejette un plan sans titre', () => {
    const { title, ...planSansTitre } = validPlan
    const result = MemoirePlanSchema.safeParse(planSansTitre)
    expect(result.success).toBe(false)
  })
})
