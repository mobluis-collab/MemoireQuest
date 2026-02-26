'use client'

import { useState } from 'react'
import type { MemoirePlan, QuestProgress, StreakData } from '@/types/memoir'
import LevelsBar from './LevelsBar'
import MemoryTimeline from './MemoryTimeline'
import StreakCounter from './StreakCounter'
import ChapterEntry from './ChapterEntry'
import FloatingHelpButton from './FloatingHelpButton'
import HelpDrawer from './HelpDrawer'
import ComboDisplay from '@/components/ui/ComboDisplay'

interface QuestJournalProps {
  plan: MemoirePlan
  questProgress: QuestProgress
  totalPoints: number
  streak: StreakData
  onQuestComplete: (chapterNumber: string, sectionIndex: number) => void
  loadingKey?: string | null
  comboCount?: number
  comboBonusXP?: number
}

export default function QuestJournal({
  plan,
  questProgress,
  totalPoints,
  streak,
  onQuestComplete,
  loadingKey = null,
  comboCount = 0,
  comboBonusXP = 0,
}: QuestJournalProps) {
  const [openChapterNumbers, setOpenChapterNumbers] = useState<Set<string>>(
    new Set([plan.chapters[0]?.number].filter(Boolean) as string[])
  )
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  const parseLoadingKey = (key: string | null) => {
    if (!key) return { chapter: null, index: null }
    const [chapter, idx] = key.split(':')
    return { chapter, index: idx !== undefined ? Number(idx) : null }
  }

  const { chapter: loadingChapter, index: loadingIndex } = parseLoadingKey(loadingKey)

  // Pour le drawer, on prend le premier chapitre ouvert
  const activeChapter = plan.chapters.find((c) => openChapterNumbers.has(c.number)) ?? null

  const toggleChapter = (chapterNumber: string) => {
    setOpenChapterNumbers((prev) => {
      const next = new Set(prev)
      if (next.has(chapterNumber)) {
        next.delete(chapterNumber)
      } else {
        next.add(chapterNumber)
      }
      return next
    })
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Combo Display (fixed position) */}
      <ComboDisplay comboCount={comboCount} bonusXP={comboBonusXP} />

      {/* Barre de stats */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-5 py-4 space-y-4">
        <LevelsBar totalPoints={totalPoints} />
        <MemoryTimeline plan={plan} questProgress={questProgress} />
        <StreakCounter streak={streak.current} />
      </div>

      {/* Accordion chapitres */}
      <div className="space-y-3">
        {plan.chapters.map((chapter) => (
          <ChapterEntry
            key={chapter.number}
            chapter={chapter}
            questProgress={questProgress[chapter.number] ?? {}}
            onQuestComplete={(sectionIndex) =>
              onQuestComplete(chapter.number, sectionIndex)
            }
            loadingIndex={
              loadingChapter === chapter.number ? loadingIndex : null
            }
            isOpen={openChapterNumbers.has(chapter.number)}
            onToggle={() => toggleChapter(chapter.number)}
          />
        ))}
      </div>

      {/* Floating help button */}
      <FloatingHelpButton onClick={() => setIsHelpOpen(true)} />

      {/* Help drawer */}
      <HelpDrawer
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        chapter={activeChapter}
      />
    </div>
  )
}
