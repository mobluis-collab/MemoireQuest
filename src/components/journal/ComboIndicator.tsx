'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Flame } from 'lucide-react'

interface ComboIndicatorProps {
  combo: number
  bonusXP: number
}

export default function ComboIndicator({ combo, bonusXP }: ComboIndicatorProps) {
  if (combo < 3) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="fixed top-20 right-4 z-50"
      >
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="relative"
        >
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full px-4 py-2 shadow-lg ring-2 ring-orange-400/50">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm">
                Combo x{combo}
              </span>
              <Flame className="w-5 h-5 text-white" aria-hidden="true" />
              <span className="text-white font-semibold text-xs">
                +{bonusXP} XP bonus
              </span>
            </div>
          </div>

          {/* Glow effect */}
          <motion.div
            animate={{
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            className="absolute inset-0 bg-orange-500/30 rounded-full blur-xl -z-10"
            aria-hidden="true"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
