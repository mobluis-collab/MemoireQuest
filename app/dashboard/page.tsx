import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserPlan } from '@/lib/plans/queries'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import DashboardContent from '@/components/dashboard/DashboardContent'

const DEFAULT_STREAK = { current: 0, last_activity: null, jokers: 1 }
const DEFAULT_COMBO = { count: 0, lastQuestTime: null }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const planRow = await getUserPlan(user.id)

  const dashboardUser = {
    email: user.email ?? '',
    user_metadata: user.user_metadata as { full_name?: string } | undefined,
  }

  return (
    <main className="min-h-screen bg-zinc-950">
      <DashboardHeader
        user={dashboardUser}
        totalXP={planRow?.total_points ?? 0}
      />
      <DashboardContent
        initialPlan={planRow?.plan_data ?? null}
        initialQuestProgress={planRow?.quest_progress ?? {}}
        initialTotalPoints={planRow?.total_points ?? 0}
        initialStreak={planRow?.streak_data ?? DEFAULT_STREAK}
        initialComboState={planRow?.combo_state ?? DEFAULT_COMBO}
      />
    </main>
  )
}
