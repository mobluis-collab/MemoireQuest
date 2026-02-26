'use client'

import { useState } from 'react'
import type { Section } from '@/types/memoir'
import { getXPForDifficulty } from '@/lib/xp/levels'
import { Star, Sparkles, Zap } from 'lucide-react'

const MOTIVATION_PHRASES = [
  'Bien joué !',
  'En route !',
  'Continue comme ça !',
  'Tu avances !',
  'Super boulot !',
  'Un de plus !',
]

const DIFFICULTY_STYLES = {
  easy: {
    badge: 'bg-green-500/20 text-green-400 ring-green-500/30',
    Icon: Star,
  },
  medium: {
    badge: 'bg-blue-500/20 text-blue-400 ring-blue-500/30',
    Icon: Zap,
  },
  hard: {
    badge: 'bg-purple-500/20 text-purple-400 ring-purple-500/30',
    Icon: Sparkles,
  },
} as const

interface QuestItemProps {
  section: Section
  isDone: boolean
  onComplete: () => void
  isLoading?: boolean
}

export default function QuestItem({
  section,
  isDone,
  onComplete,
  isLoading = false,
}: QuestItemProps) {
  const [justDone, setJustDone] = useState(false)
  const [phrase] = useState(
    () => MOTIVATION_PHRASES[Math.floor(Math.random() * MOTIVATION_PHRASES.length)]
  )

  const xp = getXPForDifficulty(section.difficulty)
  const difficultyStyle = DIFFICULTY_STYLES[section.difficulty]
  const disabled = isLoading

  const handleComplete = () => {
    onComplete()
    if (!isDone) {
      setJustDone(true)
      setTimeout(() => setJustDone(false), 2000)
    }
  }

  return (
    <li className="relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition hover:bg-zinc-800/60">
      {/* Badge difficulté en haut à droite */}
      {!isDone && (
        <span
          className={[
            'absolute top-2 right-2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ring-1 flex items-center gap-1',
            difficultyStyle.badge,
          ].join(' ')}
        >
          <difficultyStyle.Icon className="w-3 h-3" aria-hidden="true" />
          +{xp} XP
        </span>
      )}

      <button
        type="button"
        role="checkbox"
        aria-checked={isDone}
        aria-label={`Marquer "${section.text}" comme complété`}
        disabled={disabled}
        onClick={handleComplete}
        onKeyDown={(e) => {
          if (e.key === ' ') {
            e.preventDefault()
            if (!disabled) handleComplete()
          }
        }}
        className={[
          'flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all duration-200',
          isDone
            ? 'border-indigo-500 bg-indigo-500'
            : 'border-zinc-600 bg-transparent hover:border-indigo-400',
          disabled && !isDone ? 'cursor-wait opacity-50' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {isDone && (
          <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6l3 3 5-5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      <span
        className={[
          'flex-1 text-sm leading-snug transition-all duration-200 pr-16',
          isDone ? 'text-zinc-500 line-through' : 'text-zinc-200',
        ].join(' ')}
      >
        {section.text}
      </span>

      {justDone && (
        <span className="animate-fade-in text-xs text-indigo-300 font-medium">
          {phrase}
        </span>
      )}

      {!justDone && isLoading && (
        <div className="flex gap-1" aria-label="Enregistrement en cours">
          <div className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-pulse" />
          <div className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-pulse" style={{ animationDelay: '150ms' }} />
          <div className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
      )}

      {isDone && !justDone && !isLoading && (
        <span className={[
          'rounded-full px-2 py-0.5 text-xs font-semibold ring-1',
          difficultyStyle.badge,
        ].join(' ')}>
          +{xp} XP
        </span>
      )}
    </li>
  )
}
