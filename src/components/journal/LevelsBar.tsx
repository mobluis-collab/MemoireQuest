'use client'

import { getLevelProgress } from '@/lib/xp/levels'
import { Trophy, GraduationCap } from 'lucide-react'

interface LevelsBarProps {
  totalPoints: number
}

export default function LevelsBar({ totalPoints }: LevelsBarProps) {
  const levelData = getLevelProgress(totalPoints)

  return (
    <div className="w-full space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span
            className={[
              'font-semibold transition-all duration-300',
              levelData.isMaxLevel
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 animate-pulse'
                : 'text-zinc-100',
            ].join(' ')}
          >
            Niveau {levelData.currentLevel}
          </span>
          {levelData.isMaxLevel && (
            <Trophy
              className="w-5 h-5 text-amber-400 animate-bounce"
              aria-hidden="true"
            />
          )}
        </div>
        <span className="text-zinc-400 flex items-center gap-1.5">
          {levelData.isMaxLevel ? (
            <>
              Objectif atteint
              <GraduationCap className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            </>
          ) : (
            `${levelData.xpInCurrentLevel}/${levelData.xpRequiredForNext} XP`
          )}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className={[
            'h-full rounded-full transition-all duration-700 ease-out',
            levelData.isMaxLevel
              ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
              : 'bg-indigo-500',
          ].join(' ')}
          style={{ width: `${levelData.progressPercent}%` }}
          role="progressbar"
          aria-valuenow={levelData.xpInCurrentLevel}
          aria-valuemin={0}
          aria-valuemax={levelData.xpRequiredForNext}
          aria-label={
            levelData.isMaxLevel
              ? `Niveau maximum atteint`
              : `Niveau ${levelData.currentLevel}, ${levelData.xpInCurrentLevel} XP sur ${levelData.xpRequiredForNext} vers le niveau ${levelData.currentLevel + 1}`
          }
        />
      </div>
      {levelData.isMaxLevel && (
        <p className="text-xs text-center text-zinc-500 mt-2 flex items-center justify-center gap-1.5">
          Niveau max atteint !
          <Trophy className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
        </p>
      )}
    </div>
  )
}
