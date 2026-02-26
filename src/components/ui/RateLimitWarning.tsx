'use client'

import { useEffect, useState } from 'react'

const THRESHOLDS: Record<'plan' | 'chat', number> = {
  plan: 1,
  chat: 10,
}

const LABELS: Record<'plan' | 'chat', string> = {
  plan: 'génération de plan',
  chat: "messages d'assistant",
}

interface RateLimitWarningProps {
  remaining: number
  endpoint: 'plan' | 'chat'
}

export default function RateLimitWarning({ remaining, endpoint }: RateLimitWarningProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(true)
    const timer = setTimeout(() => setVisible(false), 6000)
    return () => clearTimeout(timer)
  }, [remaining, endpoint])

  if (!visible || remaining > THRESHOLDS[endpoint]) return null

  return (
    <div
      role="alert"
      className="mx-auto mt-4 max-w-xl rounded-lg border border-amber-500/30 bg-amber-950/20 px-4 py-2.5 text-sm text-amber-300 flex items-center gap-2"
    >
      <span aria-hidden="true">⚠️</span>
      <span>
        Il vous reste <strong>{remaining}</strong> {LABELS[endpoint]}{remaining <= 1 ? '' : 's'} disponible{remaining <= 1 ? '' : 's'}.
      </span>
    </div>
  )
}
