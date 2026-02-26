import { createClient } from '@/lib/supabase/server'
import { checkAndIncrement } from '@/lib/rate-limit'
import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const JOURNAL_LIMIT = 50

const RequestSchema = z.object({
  chapterTitle: z.string(),
  sectionTitle: z.string(),
  totalPoints: z.number().int().min(0),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rateLimit = await checkAndIncrement(supabase, user.id, '/api/journal/entry', JOURNAL_LIMIT)
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Limite atteinte pour aujourd\'hui.', remaining: 0 }, { status: 429 })
  }

  const body = await request.json()
  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
  }

  const { chapterTitle, sectionTitle, totalPoints } = parsed.data

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 200,
    messages: [
      {
        role: 'user',
        content: `Génère une phrase de journal de bord à la 2ème personne du singulier, ton encourageant et motivant, maximum 80 mots. L'étudiant vient de compléter la section "${sectionTitle}" du chapitre "${chapterTitle}". Son score total est de ${totalPoints} points. Mentionne ce qu'il a accompli et encourage-le pour la suite.`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    return NextResponse.json({ error: 'Unexpected response from Claude' }, { status: 500 })
  }

  return NextResponse.json({ entry: content.text, remaining: rateLimit.remaining })
}
