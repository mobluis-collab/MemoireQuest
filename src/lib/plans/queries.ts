import { createClient } from '@/lib/supabase/server'
import type { ChapterProgress, MemoirePlan, QuestProgress, StreakData } from '@/types/memoir'
import type { ComboState } from '@/lib/combo'

export interface PlanRow {
  id: string
  user_id: string
  title: string
  plan_data: MemoirePlan
  chapter_progress: ChapterProgress
  quest_progress: QuestProgress
  total_points: number
  streak_data: StreakData
  combo_state: ComboState
  created_at: string
  updated_at: string
}

export async function getUserPlan(userId: string): Promise<PlanRow | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('memoir_plans')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()
  return data ?? null
}

export async function savePlan(userId: string, title: string, planData: MemoirePlan) {
  const supabase = await createClient()
  // Upsert : supprime l'ancien plan et insère le nouveau
  await supabase.from('memoir_plans').delete().eq('user_id', userId)
  const { data, error } = await supabase
    .from('memoir_plans')
    .insert({
      user_id: userId,
      title,
      plan_data: planData,
      chapter_progress: {},
      quest_progress: {},
      total_points: 0,
      streak_data: { current: 0, last_activity: null, jokers: 1 },
      combo_state: { count: 0, lastQuestTime: null },
    })
    .select()
    .single()
  if (error) throw error
  return data
}
