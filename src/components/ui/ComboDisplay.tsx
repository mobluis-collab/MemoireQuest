'use client'

import { motion } from 'framer-motion'
import { Flame, Zap } from 'lucide-react'

interface ComboDisplayProps {
  comboCount: number
  bonusXP: number
}

export default function ComboDisplay({ comboCount, bonusXP }: ComboDisplayProps) {
  // Ne rien afficher si combo = 0
  if (comboCount === 0) return null

  const isActive = comboCount >= 3
  const isIntense = comboCount >= 5

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="fixed top-20 right-4 z-40 max-sm:top-16 max-sm:right-2"
    >
      <motion.div
        animate={
          isActive
            ? {
                scale: [1, 1.05, 1],
              }
            : {}
        }
        transition={{
          duration: 0.6,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        className="relative"
      >
        {/* Badge principal */}
        <div
          className={[
            'relative flex items-center gap-2 rounded-full px-4 py-2',
            'shadow-lg ring-2',
            isIntense
              ? 'bg-gradient-to-r from-orange-500 to-red-500 ring-orange-400/50'
              : isActive
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 ring-indigo-400/50'
              : 'bg-gradient-to-r from-indigo-600 to-indigo-700 ring-indigo-500/30',
          ].join(' ')}
        >
          {/* Combo count */}
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            <span className="text-white font-bold text-sm">
              Combo x{comboCount}
            </span>
          </div>

          {/* Bonus XP + Flame icon (only if combo >= 3) */}
          {isActive && (
            <>
              <motion.div
                animate={{
                  rotate: [0, -5, 5, -5, 0],
                  scale: isIntense ? [1, 1.2, 1] : [1, 1.1, 1],
                }}
                transition={{
                  duration: isIntense ? 0.5 : 0.8,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              >
                <Flame
                  className={`w-4 h-4 ${
                    isIntense ? 'text-yellow-300' : 'text-yellow-400'
                  }`}
                  strokeWidth={2}
                />
              </motion.div>
              <span className="text-white font-semibold text-xs">
                +{bonusXP} XP
              </span>
            </>
          )}
        </div>

        {/* Glow effect (only if active) */}
        {isActive && (
          <motion.div
            animate={{
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            className={`absolute inset-0 rounded-full blur-xl -z-10 ${
              isIntense ? 'bg-orange-500/30' : 'bg-indigo-500/30'
            }`}
            aria-hidden="true"
          />
        )}
      </motion.div>
    </motion.div>
  )
}
