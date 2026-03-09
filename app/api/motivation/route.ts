import { createClient } from '@/lib/supabase/server'
import { checkAndIncrement } from '@/lib/rate-limit'
import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MOTIVATION_LIMIT = 10 // 10 requêtes par minute

const RequestSchema = z.object({
  sectionText: z.string().min(1).max(200),
})

// Cache simple en mémoire (1h TTL)
const motivationCache = new Map<string, { message: string; expiresAt: number }>()
const CACHE_TTL = 60 * 60 * 1000 // 1 heure

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limit : 10/min par utilisateur
  const rateLimit = await checkAndIncrement(supabase, user.id, '/api/motivation', MOTIVATION_LIMIT)
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Trop de requêtes, réessaie dans 1 minute', remaining: 0 }, { status: 429 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten(), remaining: rateLimit.remaining }, { status: 400 })
  }

  const { sectionText } = parsed.data

  // Vérifier le cache
  const cached = motivationCache.get(sectionText)
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json({ message: cached.message, cached: true, remaining: rateLimit.remaining })
  }

  // Appel Claude Haiku (rapide + économique)
  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20250929',
      max_tokens: 50,
      messages: [
        {
          role: 'user',
          content: `Génère 1 phrase motivante (max 8 mots) pour féliciter un étudiant qui vient de terminer : "${sectionText}". Sois encourageant et spécifique.`,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response from Claude', remaining: rateLimit.remaining }, { status: 500 })
    }

    const motivationMessage = content.text.trim()

    // Mettre en cache (1h)
    motivationCache.set(sectionText, {
      message: motivationMessage,
      expiresAt: Date.now() + CACHE_TTL,
    })

    return NextResponse.json({ message: motivationMessage, cached: false, remaining: rateLimit.remaining })
  } catch (error) {
    console.error('[Motivation API] Error:', error)
    return NextResponse.json({ error: 'Failed to generate motivation', remaining: rateLimit.remaining }, { status: 500 })
  }
}
