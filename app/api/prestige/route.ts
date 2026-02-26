import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()

    // Check auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current plan
    const { data: plan, error: planError } = await supabase
      .from('memoir_plans')
      .select('id, prestige_count, title')
      .eq('user_id', user.id)
      .single()

    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    // Increment prestige count
    const newPrestigeCount = (plan.prestige_count || 0) + 1

    // Update plan with prestige count and reset title
    const { error: updateError } = await supabase
      .from('memoir_plans')
      .update({
        prestige_count: newPrestigeCount,
        title: `${plan.title} — Maître ès Mémoires ⭐`,
      })
      .eq('id', plan.id)

    if (updateError) {
      console.error('Error updating prestige:', updateError)
      return NextResponse.json(
        { error: 'Failed to update prestige' },
        { status: 500 }
      )
    }

    // Reset quest progress (keep streak and total_points)
    const { error: resetError } = await supabase
      .from('quest_progress')
      .delete()
      .eq('user_id', user.id)

    if (resetError) {
      console.error('Error resetting progress:', resetError)
      return NextResponse.json(
        { error: 'Failed to reset progress' },
        { status: 500 }
      )
    }

    // Note: We keep total_points and streak in user_progress
    // Only quests are reset, so the user keeps their level and streak

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
