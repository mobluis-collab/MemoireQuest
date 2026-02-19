'use client'

import type { MemoirePlan } from '@/types/memoir'
import PlanChapter from './PlanChapter'

interface PlanDisplayProps {
  plan: MemoirePlan
  onRegenerate: () => void
}

export default function PlanDisplay({ plan, onRegenerate }: PlanDisplayProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Title row */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-medium text-indigo-400 uppercase tracking-widest mb-1">
            Ton plan de mémoire
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-white leading-snug">
            {plan.title}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {plan.chapters.length} chapitre{plan.chapters.length > 1 ? 's' : ''}
          </p>
        </div>

        <button
          onClick={onRegenerate}
          className="shrink-0 h-9 px-4 rounded-xl text-xs font-medium text-zinc-300 border border-zinc-700 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer whitespace-nowrap"
        >
          Regénérer le plan
        </button>
      </div>

      {/* Chapters */}
      <div className="space-y-4">
        {plan.chapters.map((chapter) => (
          <PlanChapter key={chapter.number} chapter={chapter} />
        ))}
      </div>
    </div>
  )
}
