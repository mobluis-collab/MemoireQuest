import { createClient } from '@/lib/supabase/server'
import { savePlan } from '@/lib/plans/queries'
import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT =
  'Tu es un expert en méthodologie de mémoire universitaire. Analyse ce cahier des charges et génère un plan de rédaction détaillé et structuré. Réponds UNIQUEMENT en JSON valide selon ce schéma : { title, chapters: [{ number, title, objective, sections[], tips }] }. Minimum 4 chapitres, maximum 8.'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

const ChapterSchema = z.object({
  number: z.string(),
  title: z.string(),
  objective: z.string(),
  sections: z.array(z.string()),
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

  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 })
  }

  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Invalid file type (PDF only)' }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
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
    return NextResponse.json({ error: 'Unexpected response from Claude' }, { status: 500 })
  }

  const jsonMatch = content.text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return NextResponse.json({ error: 'No JSON found in response' }, { status: 500 })
  }

  const parsed = MemoirePlanSchema.safeParse(JSON.parse(jsonMatch[0]))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid plan structure', details: parsed.error.flatten() }, { status: 500 })
  }

  const plan = parsed.data
  await savePlan(user.id, plan.title, plan)

  return NextResponse.json({ plan })
}
