import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserPlan } from '@/lib/plans/queries'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import DashboardContent from '@/components/dashboard/DashboardContent'

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
      <DashboardHeader user={dashboardUser} />
      <DashboardContent
        initialPlan={planRow?.plan_data ?? null}
        userId={user.id}
      />
    </main>
  )
}
