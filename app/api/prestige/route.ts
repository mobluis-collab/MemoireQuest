import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateLevel, MAX_LEVEL } from '@/lib/xp/levels'
import { isSectionDone } from '@/types/memoir'
import type { MemoirePlan, QuestProgress, SectionProgress } from '@/types/memoir'

export async function POST() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current plan with all data needed for validation
    const { data: plan, error: planError } = await supabase
      .from('memoir_plans')
      .select('id, prestige_count, title, plan_data, quest_progress, total_points')
      .eq('user_id', user.id)
      .single()

    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    // --- Server-side validation ---
    // 1. Check level is MAX_LEVEL (10)
    const currentLevel = calculateLevel(plan.total_points ?? 0)
    if (currentLevel < MAX_LEVEL) {
      return NextResponse.json(
        { error: `Niveau ${MAX_LEVEL} requis pour le prestige (actuellement niveau ${currentLevel})` },
        { status: 403 }
      )
    }

    // 2. Check 100% completion
    const planData: MemoirePlan = plan.plan_data
    const questProgress: QuestProgress = plan.quest_progress ?? {}
    let allComplete = true

    for (const chapter of planData.chapters) {
      const chProgress = questProgress[chapter.number] ?? {}
      for (let i = 0; i < chapter.sections.length; i++) {
        if (!isSectionDone(chProgress[i] as SectionProgress | undefined)) {
          allComplete = false
          break
        }
      }
      if (!allComplete) break
    }

    if (!allComplete) {
      return NextResponse.json(
        { error: 'Toutes les sections doivent être complétées pour le prestige' },
        { status: 403 }
      )
    }

    // --- Atomic prestige update (single DB operation) ---
    const newPrestigeCount = (plan.prestige_count || 0) + 1

    const { error: updateError } = await supabase
      .from('memoir_plans')
      .update({
        prestige_count: newPrestigeCount,
        title: `${plan.title} — Maître ès Mémoires`,
        quest_progress: {},
        total_points: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', plan.id)

    if (updateError) {
      console.error('Error updating prestige:', updateError)
      return NextResponse.json(
        { error: 'Failed to update prestige' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      prestigeCount: newPrestigeCount,
    })
  } catch (error) {
    console.error('Prestige error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
