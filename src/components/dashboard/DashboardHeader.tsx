'use client'

import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth/actions'
import { calculateLevel } from '@/lib/xp/levels'
import UserAvatar from '@/components/ui/UserAvatar'
import { useAvatarAnimation } from '@/hooks/useAvatarAnimation'

interface DashboardHeaderProps {
  user: {
    email: string
    user_metadata?: { full_name?: string }
  }
  totalXP?: number
}

export default function DashboardHeader({ user, totalXP = 0 }: DashboardHeaderProps) {
  const router = useRouter()
  const firstName = user.user_metadata?.full_name?.split(' ')[0] ?? user.email
  const currentLevel = calculateLevel(totalXP)
  const shouldAnimateAvatar = useAvatarAnimation(currentLevel)

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-14">
        {/* Logo */}
        <span className="text-sm font-semibold text-white tracking-tight">
          Memoire<span className="text-indigo-400">Quest</span>
        </span>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <UserAvatar
            level={currentLevel}
            size="sm"
            animate={shouldAnimateAvatar}
          />
          <span className="text-sm text-zinc-400 max-sm:hidden">
            Bonjour, <span className="text-white font-medium">{firstName}</span>
          </span>
          <button
            onClick={handleSignOut}
            className="h-8 px-3 rounded-lg text-xs font-medium text-zinc-400 border border-zinc-700 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  )
}
