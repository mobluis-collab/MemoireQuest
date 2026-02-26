'use client'

import { useState, useMemo } from 'react'
import type { Chapter } from '@/types/memoir'
import QuestItem from './QuestItem'
import BossBadge from './BossBadge'

interface ChapterEntryProps {
  chapter: Chapter
  questProgress: Record<number, 'done'>
  onQuestComplete: (sectionIndex: number) => void
  loadingIndex?: number | null
  isOpen: boolean
  onToggle: () => void
}

export default function ChapterEntry({
  chapter,
  questProgress,
  onQuestComplete,
  loadingIndex = null,
  isOpen,
  onToggle,
}: ChapterEntryProps) {
  const [isShaking, setIsShaking] = useState(false)

  const total = chapter.sections.length
  const done = Object.values(questProgress).filter((v) => v === 'done').length
  const allDone = done === total

  // Detect boss chapter (≥60% hard sections)
  const isBossChapter = useMemo(() => {
    const hardCount = chapter.sections.filter(
      (section) => section.difficulty === 'hard'
    ).length
    return hardCount / total >= 0.6
  }, [chapter.sections, total])

  const handleToggle = () => {
    if (isBossChapter && !allDone) {
      // Trigger epic shake animation
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
    }
    onToggle()
  }

  return (
    <div
      className={[
        'rounded-xl border overflow-hidden transition-all duration-300',
        isBossChapter && !allDone
          ? 'border-red-500/50 bg-gradient-to-br from-zinc-900/80 to-red-950/20'
          : 'border-zinc-800 bg-zinc-900/60',
        isBossChapter && !allDone && isShaking ? 'animate-shake' : '',
      ].join(' ')}
      style={
        isBossChapter && !allDone
          ? { boxShadow: '0 0 20px rgba(239, 68, 68, 0.15)' }
          : undefined
      }
    >
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-800/40 transition-colors"
      >
        <span className="shrink-0 rounded-md bg-indigo-500/15 px-2 py-0.5 text-xs font-bold text-indigo-400 ring-1 ring-indigo-500/30">
          {chapter.number}
        </span>
        <div className="flex-1 flex flex-col gap-1.5">
          <h3 className="text-sm font-semibold text-zinc-100 leading-snug">
            {chapter.title}
          </h3>
          {isBossChapter && !allDone && (
            <BossBadge size="sm" />
          )}
        </div>
        <span className={`shrink-0 text-xs ${allDone ? 'text-emerald-400' : 'text-zinc-500'}`}>
          {done}/{total}
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="border-t border-zinc-800">
          <ul className="px-2 py-2 space-y-0.5">
            {chapter.sections.map((section, idx) => (
              <QuestItem
                key={idx}
                section={section}
                isDone={questProgress[idx] === 'done'}
                onComplete={() => onQuestComplete(idx)}
                isLoading={loadingIndex === idx}
              />
            ))}
          </ul>
          {chapter.tips && (
            <div className="px-4 pb-3">
              <p className="text-xs text-zinc-500 italic leading-relaxed border-l-2 border-zinc-700 pl-3">
                {chapter.tips}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
