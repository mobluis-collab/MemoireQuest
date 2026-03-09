import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * Simple persistence endpoint — saves quest state calculated client-side.
 * No XP/streak/combo logic here, just a DB write.
 */

const SyncSchema = z.object({
  questProgress: z.record(z.string(), z.record(z.string(), z.union([
    z.literal('done'),
    z.object({ tasks: z.array(z.boolean()) }),
  ]))),
  totalPoints: z.number().int().min(0),
  streakData: z.object({
    current: z.number().int().min(0),
    last_activity: z.string().nullable(),
    jokers: z.number().int().min(0),
    last_joker_used: z.string().nullable().optional(),
  }),
  comboState: z.object({
    count: z.number().int().min(0),
    lastQuestTime: z.number().nullable(),
  }),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = SyncSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
  }

  const { questProgress, totalPoints, streakData, comboState } = parsed.data

  // Get the user's latest plan
  const { data: plan, error: fetchError } = await supabase
    .from('memoir_plans')
    .select('id')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  if (fetchError || !plan) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  const { error: updateError } = await supabase
    .from('memoir_plans')
    .update({
      quest_progress: questProgress,
      total_points: totalPoints,
      streak_data: streakData,
      combo_state: comboState,
      updated_at: new Date().toISOString(),
    })
    .eq('id', plan.id)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to sync' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
