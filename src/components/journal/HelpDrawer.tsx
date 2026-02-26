'use client'

import { useState, useEffect } from 'react'
import type { Chapter } from '@/types/memoir'

interface HelpDrawerProps {
  chapter: Chapter | null
  isOpen: boolean
  onClose: () => void
}

export default function HelpDrawer({ chapter, isOpen, onClose }: HelpDrawerProps) {
  const [answer, setAnswer] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setAnswer(null)
    }
  }, [isOpen])

  const handleAsk = async () => {
    if (!chapter) return
    setIsLoading(true)
    setAnswer(null)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterNumber: chapter.number,
          chapterTitle: chapter.title,
          chapterObjective: chapter.objective,
          sections: chapter.sections,
          question: 'Donne-moi des conseils pratiques et actionnables pour bien rédiger ce chapitre.',
        }),
      })
      if (!res.ok) return
      const data = await res.json() as { answer: string }
      setAnswer(data.answer)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer/Modal */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-zinc-800 bg-zinc-950 p-6 shadow-2xl md:inset-auto md:right-6 md:bottom-6 md:top-auto md:w-full md:max-w-md md:rounded-2xl md:border"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-drawer-title"
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden="true">💡</span>
            <h2 id="help-drawer-title" className="text-base font-semibold text-zinc-100">
              Besoin d&apos;aide ?
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            aria-label="Fermer"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {chapter ? (
            <>
              <div>
                <p className="text-xs font-medium text-indigo-400 leading-snug">
                  {chapter.number} — {chapter.title}
                </p>
                <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
                  {chapter.objective}
                </p>
              </div>

              {!answer && !isLoading && (
                <button
                  type="button"
                  onClick={handleAsk}
                  className="w-full rounded-lg bg-indigo-500/15 border border-indigo-500/30 px-4 py-2.5 text-sm font-medium text-indigo-400 hover:bg-indigo-500/25 transition-colors"
                >
                  Obtenir un conseil
                </button>
              )}

              {isLoading && (
                <div className="space-y-2 py-1">
                  <div className="h-2.5 w-full rounded bg-zinc-700 animate-pulse" />
                  <div className="h-2.5 w-4/5 rounded bg-zinc-700 animate-pulse" />
                  <div className="h-2.5 w-3/4 rounded bg-zinc-700 animate-pulse" />
                  <div className="h-2.5 w-2/3 rounded bg-zinc-700 animate-pulse" />
                </div>
              )}

              {answer && (
                <div className="space-y-3">
                  <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {answer}
                  </p>
                  <button
                    type="button"
                    onClick={() => setAnswer(null)}
                    className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    ↩ Nouvelle question
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-zinc-500 leading-relaxed">
              Ouvre un chapitre pour obtenir des conseils personnalisés.
            </p>
          )}
        </div>
      </div>
    </>
  )
}
