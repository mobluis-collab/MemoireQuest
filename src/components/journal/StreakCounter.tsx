'use client'

import { Flame } from 'lucide-react'

interface StreakCounterProps {
  streak: number
}

export default function StreakCounter({ streak }: StreakCounterProps) {
  const displayText = streak === 0
    ? 'Commence aujourd\'hui !'
    : `${streak} jour${streak !== 1 ? 's' : ''} de suite`

  return (
    <div className="flex items-center gap-1.5">
      <Flame
        className={`w-5 h-5 ${streak > 0 ? 'text-orange-500' : 'text-zinc-500'}`}
        aria-hidden="true"
      />
      <span className="text-sm font-semibold text-zinc-100">
        {displayText}
      </span>
    </div>
  )
}
