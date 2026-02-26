'use client'

import { motion } from 'framer-motion'
import { BookOpen, GraduationCap, Trophy, Sparkles } from 'lucide-react'

interface UserAvatarProps {
  level: number
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
}

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

// Colors progression for avatar background
const levelColors = [
  { bg: 'from-indigo-500 to-indigo-600', ring: 'ring-indigo-400/50' }, // Level 1
  { bg: 'from-violet-500 to-violet-600', ring: 'ring-violet-400/50' }, // Level 2
  { bg: 'from-pink-500 to-pink-600', ring: 'ring-pink-400/50' }, // Level 3
  { bg: 'from-amber-500 to-amber-600', ring: 'ring-amber-400/50' }, // Level 4
  { bg: 'from-emerald-500 to-emerald-600', ring: 'ring-emerald-400/50' }, // Level 5
  { bg: 'from-cyan-500 to-cyan-600', ring: 'ring-cyan-400/50' }, // Level 6
  { bg: 'from-blue-500 to-blue-600', ring: 'ring-blue-400/50' }, // Level 7
  { bg: 'from-purple-500 to-purple-600', ring: 'ring-purple-400/50' }, // Level 8
  { bg: 'from-yellow-500 to-yellow-600', ring: 'ring-yellow-400/50' }, // Level 9
  { bg: 'from-amber-400 via-yellow-400 to-amber-400', ring: 'ring-amber-300/70 shadow-lg shadow-amber-500/50' }, // Level 10 (special)
]

function getAvatarIcon(level: number, iconSize: string) {
  const iconClass = `${iconSize} text-white`

  // Level 1-3: Simple student (book)
  if (level <= 3) {
    return <BookOpen className={iconClass} strokeWidth={2} />
  }

  // Level 4-6: Student with books (multiple books icon simulated with sparkles)
  if (level <= 6) {
    return (
      <div className="relative">
        <BookOpen className={iconClass} strokeWidth={2} />
        <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-amber-300" />
      </div>
    )
  }

  // Level 7-9: Student with diploma (graduation cap)
  if (level <= 9) {
    return <GraduationCap className={iconClass} strokeWidth={2} />
  }

  // Level 10: Professor (trophy + graduation cap composite)
  return (
    <div className="relative">
      <Trophy className={iconClass} strokeWidth={2} />
      <motion.div
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5"
      >
        <Sparkles className="w-full h-full text-yellow-300" />
      </motion.div>
    </div>
  )
}

export default function UserAvatar({
  level,
  size = 'md',
  animate = false,
}: UserAvatarProps) {
  const clampedLevel = Math.max(1, Math.min(10, level))
  const colorScheme = levelColors[clampedLevel - 1]

  const avatarContent = (
    <div
      className={[
        sizeClasses[size],
        'relative flex items-center justify-center rounded-full',
        `bg-gradient-to-br ${colorScheme.bg}`,
        `ring-2 ${colorScheme.ring}`,
        'transition-all duration-300',
      ].join(' ')}
    >
      {getAvatarIcon(clampedLevel, iconSizes[size])}

      {/* Level badge */}
      <div
        className={[
          'absolute -bottom-0.5 -right-0.5',
          'flex items-center justify-center',
          'rounded-full bg-zinc-950 ring-2 ring-zinc-800',
          size === 'sm' ? 'w-4 h-4 text-[9px]' : 'w-5 h-5 text-[10px]',
          'font-bold text-white',
        ].join(' ')}
      >
        {clampedLevel}
      </div>
    </div>
  )

  if (animate) {
    return (
      <motion.div
        initial={{ scale: 1, rotate: 0 }}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 360, 360],
        }}
        transition={{
          duration: 0.8,
          times: [0, 0.5, 1],
          ease: 'easeInOut',
        }}
      >
        {avatarContent}
      </motion.div>
    )
  }

  return avatarContent
}
