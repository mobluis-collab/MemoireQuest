'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Sparkles, RotateCcw } from 'lucide-react'

interface PrestigeModalProps {
  isOpen: boolean
  onClose: () => void
  onPrestige: () => void
  currentPrestigeCount: number
}

export default function PrestigeModal({
  isOpen,
  onClose,
  onPrestige,
  currentPrestigeCount,
}: PrestigeModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
          className="relative w-full max-w-md"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 blur-2xl" />

          {/* Card */}
          <div className="relative rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 p-1 shadow-2xl">
            <div className="rounded-xl bg-zinc-950 px-6 py-8">
              {/* Header with animated trophy */}
              <div className="flex flex-col items-center gap-4">
                <motion.div
                  animate={{
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                >
                  <Trophy className="w-16 h-16 text-amber-400" strokeWidth={1.5} />
                </motion.div>

                <div className="text-center">
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400">
                    Félicitations !
                  </h2>
                  <p className="mt-2 text-zinc-300 text-sm">
                    Ton mémoire est structuré à 100%
                  </p>
                </div>
              </div>

              {/* Prestige explanation */}
              <div className="mt-6 space-y-4">
                <div className="rounded-lg bg-zinc-900/60 border border-amber-500/30 p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-zinc-100 text-sm">
                        Mode Prestige
                      </h3>
                      <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                        Recommence avec le titre de{' '}
                        <span className="text-amber-400 font-semibold">
                          &quot;Maître ès Mémoires&quot;
                        </span>
                        . Tu conserves ton historique et débloques une interface dorée exclusive.
                      </p>
                    </div>
                  </div>
                </div>

                {currentPrestigeCount > 0 && (
                  <div className="text-center">
                    <p className="text-xs text-zinc-500">
                      Prestiges actuels :{' '}
                      <span className="text-amber-400 font-semibold">
                        {currentPrestigeCount}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={onPrestige}
                  className="flex items-center justify-center gap-2 w-full rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition-all hover:from-amber-400 hover:to-yellow-400 hover:shadow-lg hover:shadow-amber-500/50"
                >
                  <RotateCcw className="w-4 h-4" />
                  Recommencer en Prestige
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900/60 px-4 py-3 text-sm font-medium text-zinc-300 transition-all hover:bg-zinc-800 hover:text-zinc-100"
                >
                  Plus tard
                </button>
              </div>

              {/* Subtle decoration */}
              <div className="mt-6 flex items-center justify-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      opacity: [0.3, 1, 0.3],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                    className="w-1.5 h-1.5 rounded-full bg-amber-400"
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
