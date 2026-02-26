'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'

interface LevelUpCelebrationProps {
  level: number
  onClose: () => void
  showSound?: boolean
}

export default function LevelUpCelebration({
  level,
  onClose,
  showSound = false,
}: LevelUpCelebrationProps) {
  useEffect(() => {
    // Confetti explosion from center
    const duration = 2000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'],
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'],
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()

    // Vibration mobile
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200])
    }

    // Sound (optionnel)
    if (showSound) {
      // Son success simple via Web Audio API
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.value = 523.25 // C5
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)
      } catch (e) {
        // Ignore audio errors
      }
    }

    // Auto-close après 3 secondes
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [level, onClose, showSound])

  return (
    <>
      {/* Flash lumineux overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[100] bg-white pointer-events-none"
      />

      {/* Badge animé */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none">
        <motion.div
          initial={{ scale: 0, y: -100 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{
            type: 'spring',
            bounce: 0.5,
            duration: 0.6,
          }}
          className="rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-1 shadow-2xl"
        >
          <div className="rounded-xl bg-zinc-950 px-8 py-6 text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.5 }}
            >
              <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                Niveau {level}
              </p>
            </motion.div>
            <p className="mt-2 text-lg text-zinc-300">atteint ! 🎉</p>
          </div>
        </motion.div>
      </div>
    </>
  )
}
