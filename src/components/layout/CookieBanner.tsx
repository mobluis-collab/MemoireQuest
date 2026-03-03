'use client'

import { useState, useEffect } from 'react'

interface CookieBannerProps {
  onAccept?: () => void
  onRefuse?: () => void
}

export function CookieBanner({ onAccept, onRefuse }: CookieBannerProps = {}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) setIsVisible(true)
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setIsVisible(false)
    onAccept?.()
  }

  const handleRefuse = () => {
    localStorage.setItem('cookie-consent', 'refused')
    setIsVisible(false)
    onRefuse?.()
  }

  if (!isVisible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-zinc-950 dark:bg-zinc-950 border border-zinc-700 dark:border-zinc-700 rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-black/80">
        <div
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-500/30 to-transparent rounded-t-2xl"
          aria-hidden="true"
        />

        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z" fill="currentColor" />
            </svg>
          </div>
          <h2 id="cookie-title" className="text-white font-semibold text-base">
            Politique des cookies
          </h2>
        </div>

        <p className="text-zinc-400 text-sm leading-relaxed mb-5">
          Ce site utilise des cookies de session uniquement pour l&apos;authentification Google.
          Aucun cookie publicitaire ou de traçage n&apos;est utilisé.{' '}
          <a href="/privacy" className="text-indigo-400 underline hover:text-indigo-300 transition-colors">
            En savoir plus
          </a>
        </p>

        <div className="flex gap-2 justify-end">
          <button
            onClick={handleRefuse}
            className="h-10 px-5 rounded-xl text-sm font-medium text-zinc-300 border border-zinc-700 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
          >
            Refuser
          </button>
          <button
            onClick={handleAccept}
            className="h-10 px-5 rounded-xl text-sm font-medium bg-white text-zinc-900 hover:bg-zinc-100 shadow-lg shadow-white/10 transition-all cursor-pointer"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  )
}

export default CookieBanner
