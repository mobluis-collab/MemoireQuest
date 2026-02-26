'use client'

import { motion } from 'framer-motion'
import { Flame, Swords } from 'lucide-react'

interface BossBadgeProps {
  size?: 'sm' | 'md'
}

export default function BossBadge({ size = 'md' }: BossBadgeProps) {
  const isSmall = size === 'sm'

  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse',
      }}
      className={[
        'relative flex items-center gap-1.5',
        'rounded-full',
        'bg-gradient-to-r from-red-600 via-orange-600 to-red-600',
        'bg-[length:200%_100%]',
        'px-2.5 py-1',
        'ring-2 ring-red-500/50',
        'shadow-lg shadow-red-500/30',
      ].join(' ')}
    >
      {/* Animated background gradient */}
      <motion.div
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute inset-0 rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-red-600 bg-[length:200%_100%] opacity-75"
      />

      {/* Content */}
      <div className="relative flex items-center gap-1.5">
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1,
          }}
        >
          <Swords
            className={`${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-white`}
            strokeWidth={2.5}
          />
        </motion.div>

        <span
          className={`${
            isSmall ? 'text-[10px]' : 'text-xs'
          } font-bold text-white uppercase tracking-wide`}
        >
          Boss Chapter
        </span>

        <Flame
          className={`${isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-yellow-300`}
          strokeWidth={2}
        />
      </div>

      {/* Glow pulse effect */}
      <motion.div
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 rounded-full bg-red-500/40 blur-sm -z-10"
      />
    </motion.div>
  )
}
