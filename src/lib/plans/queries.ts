import { createClient } from '@/lib/supabase/server'
import type { MemoirePlan } from '@/types/memoir'

export async function getUserPlan(userId: string) {
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
    .insert({ user_id: userId, title, plan_data: planData })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePlan(userId: string) {
  const supabase = await createClient()
  await supabase.from('memoir_plans').delete().eq('user_id', userId)
}
