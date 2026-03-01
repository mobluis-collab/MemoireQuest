'use client'

import { motion } from 'framer-motion'
import { Trophy, Zap } from 'lucide-react'
import { getLevelProgress, MAX_LEVEL } from '@/lib/xp/levels'
import { getAvatarStage } from '@/lib/xp/avatarConfig'
import UserAvatar from '@/components/ui/UserAvatar'

interface AvatarCardProps {
  totalPoints: number
}

export default function AvatarCard({ totalPoints }: AvatarCardProps) {
  const levelData = getLevelProgress(totalPoints)
  const stage = getAvatarStage(levelData.currentLevel)
  const isMaxLevel = levelData.isMaxLevel

  // Show "next evolution" hint only when the next level is a new stage
  const nextStage =
    !isMaxLevel && levelData.currentLevel < MAX_LEVEL
      ? getAvatarStage(levelData.currentLevel + 1)
      : null
  const willEvolve = nextStage && nextStage.title !== stage.title

  return (
    <div className="flex items-center gap-3 w-full">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <UserAvatar level={levelData.currentLevel} size="lg" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Title + level */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm font-semibold text-white truncate">
              {stage.title}
            </span>
            <span className="text-xs font-medium text-zinc-500 flex-shrink-0">
              Nv.{levelData.currentLevel}
            </span>
          </div>
          {isMaxLevel && (
            <Trophy className="w-4 h-4 text-amber-400 flex-shrink-0 animate-bounce" />
          )}
        </div>

        {/* XP bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: `${levelData.progressPercent}%` }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className={[
              'h-full rounded-full',
              isMaxLevel
                ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]'
                : 'bg-indigo-500',
            ].join(' ')}
          />
        </div>

        {/* XP info + next evolution hint */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400">
            {isMaxLevel ? (
              <span className="text-amber-400">Objectif atteint !</span>
            ) : (
              `${levelData.xpInCurrentLevel} / ${levelData.xpRequiredForNext} XP`
            )}
          </span>
          {willEvolve && stage.nextEvolutionLevel && (
            <span className="flex items-center gap-0.5 text-zinc-600">
              <Zap className="w-3 h-3 text-indigo-500" />
              Évolution nv.{stage.nextEvolutionLevel}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
