import { createClient } from '@/lib/supabase/server'
import { checkAndIncrement } from '@/lib/rate-limit'
import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const CHAT_LIMIT = 20

const RequestSchema = z.object({
  chapterNumber: z.string(),
  chapterTitle: z.string(),
  chapterObjective: z.string(),
  sections: z.array(z.string()),
  question: z.string().min(1).max(2000),
})

const SYSTEM_PROMPT = `Tu es un tuteur bienveillant spécialisé en méthodologie de mémoire universitaire.
Ton rôle est de GUIDER l'étudiant dans sa réflexion, pas d'écrire à sa place.

Règles absolues :
- Ne rédige jamais de paragraphes prêts à copier-coller
- Pose des questions pour stimuler la réflexion
- Suggère des pistes, des angles d'approche, des méthodes
- Encourage et valorise les idées de l'étudiant
- Réponds en français, de manière concise (max 250 mots)
- Si l'étudiant demande que tu écrives à sa place, rappelle-lui gentiment ton rôle de guide`

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rateLimit = await checkAndIncrement(supabase, user.id, '/api/chat', CHAT_LIMIT)
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Limite atteinte pour aujourd\'hui.', remaining: 0 }, { status: 429 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body', remaining: rateLimit.remaining }, { status: 400 })
  }
  const parsed = RequestSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten(), remaining: rateLimit.remaining }, { status: 400 })
  }

  const { chapterNumber, chapterTitle, chapterObjective, sections, question } = parsed.data

  const userMessage = `Contexte de mon mémoire :
- Chapitre ${chapterNumber} : ${chapterTitle}
- Objectif : ${chapterObjective}
- Sections prévues : ${sections.join(', ')}

Ma question : ${question}`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response from Claude' }, { status: 500 })
    }

    return NextResponse.json({ answer: content.text, remaining: rateLimit.remaining })
  } catch (error) {
    console.error('[chat] Claude API error:', error)
    return NextResponse.json({ error: 'Erreur lors de la génération. Réessaie.' }, { status: 500 })
  }
}
