import { createClient } from '@/lib/supabase/server'
import { savePlan } from '@/lib/plans/queries'
import { checkAndIncrement } from '@/lib/rate-limit'
import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const PLAN_LIMIT = 3

const SYSTEM_PROMPT = `Tu es un expert en méthodologie de mémoire académique et professionnel. Tu analyses le cahier des charges fourni par l'étudiant et tu génères un plan de rédaction personnalisé, structuré et actionnable, adapté au type de mémoire décrit dans le document.

RÈGLES STRICTES ANTI-HALLUCINATION :
- NE PAS inventer de contenu ou d'informations qui ne sont pas dans le document PDF
- Lire UNIQUEMENT le PDF fourni et baser ton plan uniquement sur son contenu
- Si le document manque d'information, proposer un plan générique cohérent avec les éléments présents
- Ne jamais inventer de contraintes, deadlines, ou exigences qui ne sont pas explicitement mentionnées

INSTRUCTIONS :
- Lis attentivement le document pour identifier : le type de mémoire (professionnel, académique, recherche, stage, projet, etc.), le niveau d'études (BTS, Licence, Bachelor, Master, Ingénieur, etc.), la discipline ou domaine (communication, droit, gestion, informatique, marketing, sciences, etc.), les objectifs pédagogiques ou compétences à valider, la structure et le nombre de pages attendus, les deadlines et contraintes formelles (police, interligne, bibliographie, etc.), et les critères d'évaluation si mentionnés.
- Génère un plan de rédaction couvrant l'ensemble du mémoire, du début à la fin, adapté au contexte spécifique identifié.
- Chaque chapitre doit avoir un objectif clair, des sous-sections concrètes et des conseils pratiques (tips) directement actionnables pour l'étudiant.
- Respecte la structure attendue par l'établissement si elle est précisée dans le document. Sinon, propose une structure académique standard adaptée au type de mémoire.
- Les tips doivent être concrets et utiles (ex: "Commence par une revue de littérature sur 3-4 sources clés avant de rédiger ta problématique").

ATTRIBUTION DE DIFFICULTÉ ET XP :
- Chaque section doit avoir une difficulté : "easy", "medium", ou "hard"
- Équilibre cible : ~40% easy, 40% medium, 20% hard
- XP associée : easy = 10 XP, medium = 20 XP, hard = 30 XP
- Critères de difficulté :
  * easy : sections descriptives, revues simples, synthèse de documents existants
  * medium : analyses comparatives, méthodologie, études de cas
  * hard : problématiques complexes, recherches originales, développements théoriques avancés

Réponds UNIQUEMENT en JSON valide selon ce schéma exact :
{
  "title": "string",
  "chapters": [
    {
      "number": "string",
      "title": "string",
      "objective": "string",
      "sections": [
        {
          "text": "string",
          "difficulty": "easy" | "medium" | "hard"
        }
      ],
      "tips": "string"
    }
  ]
}

Minimum 4 chapitres, maximum 8. Chaque chapitre : minimum 2 sections, maximum 10 sections. Pas de texte en dehors du JSON.`

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

const SectionSchema = z.object({
  text: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
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
  chapters: z.array(ChapterSchema).min(4).max(8),
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

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: base64,
            },
          },
          {
            type: 'text',
            text: 'Génère le plan de mémoire en JSON.',
          },
        ],
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    return NextResponse.json({ error: 'Unexpected response from Claude', remaining: rateLimit.remaining }, { status: 500 })
  }

  const jsonMatch = content.text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return NextResponse.json({ error: 'No JSON found in response', remaining: rateLimit.remaining }, { status: 500 })
  }

  const parsed = MemoirePlanSchema.safeParse(JSON.parse(jsonMatch[0]))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid plan structure', details: parsed.error.flatten(), remaining: rateLimit.remaining }, { status: 500 })
  }

  const plan = parsed.data
  await savePlan(user.id, plan.title, plan)

  return NextResponse.json({ plan, remaining: rateLimit.remaining })
}
