'use client'

import { useEffect, useState } from 'react'

export type ToastVariant = 'error' | 'success' | 'warning'

interface ToastProps {
  message: string
  variant?: ToastVariant
  duration?: number
  onClose?: () => void
}

const VARIANT_STYLES: Record<ToastVariant, string> = {
  error: 'border-red-500/30 bg-red-950/20 text-red-300',
  success: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300',
  warning: 'border-amber-500/30 bg-amber-950/20 text-amber-300',
}

const VARIANT_ICONS: Record<ToastVariant, string> = {
  error: '❌',
  success: '✅',
  warning: '⚠️',
}

export default function Toast({
  message,
  variant = 'error',
  duration = 4000,
  onClose,
}: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger slide-in animation
    const showTimer = setTimeout(() => setVisible(true), 10)
    
    // Auto-dismiss after duration
    const hideTimer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onClose?.(), 300) // Wait for slide-out animation
    }, duration)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [duration, onClose])

  return (
    <div
      role="alert"
      className={[
        'fixed top-4 right-4 z-50 max-w-sm rounded-lg border px-4 py-3 shadow-lg',
        'transition-all duration-300 ease-out',
        visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0',
        VARIANT_STYLES[variant],
      ].join(' ')}
      style={{ transformOrigin: 'top right' }}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg shrink-0" aria-hidden="true">
          {VARIANT_ICONS[variant]}
        </span>
        <p className="flex-1 text-sm leading-snug">{message}</p>
        <button
          type="button"
          onClick={() => {
            setVisible(false)
            setTimeout(() => onClose?.(), 300)
          }}
          className="shrink-0 text-zinc-400 hover:text-zinc-200 transition-colors duration-200"
          aria-label="Fermer"
        >
          ×
        </button>
      </div>
    </div>
  )
}
