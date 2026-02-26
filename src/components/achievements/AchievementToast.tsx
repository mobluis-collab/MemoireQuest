'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { Achievement } from '@/lib/achievements'

interface AchievementToastProps {
  achievement: Achievement | null
  onClose: () => void
}

export default function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  if (!achievement) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
        className="fixed top-20 right-4 z-50 w-80"
      >
        <div className="rounded-xl border border-indigo-500/30 bg-zinc-900/95 backdrop-blur-md p-4 shadow-2xl">
          <div className="flex items-start gap-3">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', bounce: 0.6 }}
              className="text-3xl"
            >
              {achievement.icon}
            </motion.div>

            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-400">
                Badge débloqué !
              </p>
              <h3 className="text-base font-bold text-white mt-0.5">
                {achievement.title}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                +{achievement.xp} XP bonus
              </p>
            </div>

            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
