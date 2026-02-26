import type { SupabaseClient } from '@supabase/supabase-js'

export interface RateLimitResult {
  allowed: boolean
  remaining: number
}

export async function checkAndIncrement(
  supabase: SupabaseClient,
  userId: string,
  endpoint: string,
  limit: number
): Promise<RateLimitResult> {
  const today = new Date().toISOString().split('T')[0]

  // Lire le count actuel avant d'incrémenter
  const { data: existing } = await supabase
    .from('usage_tracking')
    .select('count')
    .eq('user_id', userId)
    .eq('endpoint', endpoint)
    .eq('date', today)
    .single()

  const currentCount = existing?.count ?? 0

  if (currentCount >= limit) {
    return { allowed: false, remaining: 0 }
  }

  // Incrémenter
  await supabase.from('usage_tracking').upsert(
    { user_id: userId, endpoint, date: today, count: currentCount + 1 },
    { onConflict: 'user_id,endpoint,date' }
  )

  const newCount = currentCount + 1
  return { allowed: true, remaining: limit - newCount }
}
