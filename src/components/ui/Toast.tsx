'use client'

import { useEffect, useState } from 'react'

export type ToastVariant = 'error' | 'success' | 'warning'

interface ToastProps {
  message: string
  variant?: ToastVariant
  duration?: number
  onClose?: () => void
}

const VARIANT_ICONS: Record<ToastVariant, string> = {
  error: '\u274C',
  success: '\u2705',
  warning: '\u26A0\uFE0F',
}

export default function Toast({
  message,
  variant = 'error',
  duration = 2500,
  onClose,
}: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 10)

    const hideTimer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onClose?.(), 300)
    }, duration)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [duration, onClose])

  return (
    <>
      <style>{`
        @keyframes toastSlideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes toastFadeOut {
          from { opacity: 1; transform: translateX(-50%) translateY(0); }
          to { opacity: 0; transform: translateX(-50%) translateY(8px); }
        }
      `}</style>
      <div
        role="alert"
        style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 10,
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          maxWidth: 380,
          animation: visible
            ? 'toastSlideUp 0.3s ease-out forwards'
            : 'toastFadeOut 0.3s ease-out forwards',
          pointerEvents: visible ? 'auto' : 'none',
        }}
      >
        <span style={{ fontSize: 14, flexShrink: 0 }} aria-hidden="true">
          {VARIANT_ICONS[variant]}
        </span>
        <span style={{
          fontSize: 13,
          color: 'rgba(255,255,255,0.7)',
          lineHeight: 1.4,
        }}>
          {message}
        </span>
        <button
          type="button"
          onClick={() => {
            setVisible(false)
            setTimeout(() => onClose?.(), 300)
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.35)',
            cursor: 'pointer',
            fontSize: 16,
            padding: '0 2px',
            marginLeft: 4,
            flexShrink: 0,
            lineHeight: 1,
          }}
          aria-label="Fermer"
        >
          \u00D7
        </button>
      </div>
    </>
  )
}
