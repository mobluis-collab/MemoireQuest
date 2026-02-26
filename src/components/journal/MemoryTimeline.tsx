'use client'

import { useEffect, useRef } from 'react'
import { Lock, CheckCircle2, Circle } from 'lucide-react'
import type { MemoirePlan, QuestProgress } from '@/types/memoir'

interface MemoryTimelineProps {
  plan: MemoirePlan
  questProgress: QuestProgress
}

type ChapterStatus = 'completed' | 'current' | 'locked'

export default function MemoryTimeline({ plan, questProgress }: MemoryTimelineProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const currentChapterRef = useRef<HTMLDivElement>(null)

  // Calculer le statut de chaque chapitre
  const getChapterStatus = (chapterNumber: string): ChapterStatus => {
    const chapter = plan.chapters.find(c => c.number === chapterNumber)
    if (!chapter) return 'locked'

    const progress = questProgress[chapterNumber] ?? {}
    const total = chapter.sections.length
    const done = Object.values(progress).filter(v => v === 'done').length

    if (done === total && total > 0) return 'completed'
    if (done > 0) return 'current'

    // Vérifier si le chapitre précédent est complété
    const chapterIndex = plan.chapters.findIndex(c => c.number === chapterNumber)
    if (chapterIndex === 0) return 'current' // Premier chapitre toujours actif

    const prevChapter = plan.chapters[chapterIndex - 1]
    const prevProgress = questProgress[prevChapter.number] ?? {}
    const prevDone = Object.values(prevProgress).filter(v => v === 'done').length

    return prevDone === prevChapter.sections.length ? 'current' : 'locked'
  }

  const chaptersWithStatus = plan.chapters.map(chapter => ({
    ...chapter,
    status: getChapterStatus(chapter.number)
  }))

  const currentChapterIndex = chaptersWithStatus.findIndex(c => c.status === 'current')
  const completedCount = chaptersWithStatus.filter(c => c.status === 'completed').length

  // Auto-scroll vers le chapitre actuel
  useEffect(() => {
    if (currentChapterRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const element = currentChapterRef.current
      const scrollLeft = element.offsetLeft - container.offsetWidth / 2 + element.offsetWidth / 2

      // Respecter prefers-reduced-motion
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      container.scrollTo({
        left: scrollLeft,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      })
    }
  }, [currentChapterIndex])

  return (
    <div className="w-full overflow-hidden">
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"
      >
        <div className="relative flex items-center gap-0 min-w-max px-4">
          {chaptersWithStatus.map((chapter, index) => {
            const isLast = index === chaptersWithStatus.length - 1
            const isCurrent = chapter.status === 'current'

            return (
              <div
                key={chapter.number}
                ref={isCurrent ? currentChapterRef : null}
                className="flex items-center"
              >
                {/* Icône du chapitre */}
                <div className="relative flex flex-col items-center gap-2">
                  <div
                    className={[
                      'relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300',
                      chapter.status === 'completed'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : chapter.status === 'current'
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 motion-safe:animate-pulse'
                        : 'bg-zinc-800/50 border-zinc-700 text-zinc-600'
                    ].join(' ')}
                  >
                    {chapter.status === 'completed' ? (
                      <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
                    ) : chapter.status === 'current' ? (
                      <Circle className="w-6 h-6 fill-current" aria-hidden="true" />
                    ) : (
                      <Lock className="w-5 h-5" aria-hidden="true" />
                    )}
                  </div>

                  {/* Numéro et titre */}
                  <div className="flex flex-col items-center gap-0.5 w-24">
                    <span
                      className={[
                        'text-xs font-bold',
                        chapter.status === 'completed'
                          ? 'text-emerald-400'
                          : chapter.status === 'current'
                          ? 'text-indigo-400'
                          : 'text-zinc-600'
                      ].join(' ')}
                    >
                      Ch. {chapter.number}
                    </span>
                    <span
                      className={[
                        'text-[10px] text-center leading-tight line-clamp-2',
                        chapter.status === 'locked' ? 'text-zinc-600' : 'text-zinc-400'
                      ].join(' ')}
                    >
                      {chapter.title}
                    </span>
                  </div>
                </div>

                {/* Ligne de connexion */}
                {!isLast && (
                  <svg
                    className="flex-shrink-0"
                    width="80"
                    height="4"
                    viewBox="0 0 80 4"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <line
                      x1="0"
                      y1="2"
                      x2="80"
                      y2="2"
                      stroke={index < completedCount ? '#10b981' : '#3f3f46'}
                      strokeWidth="2"
                      strokeDasharray={index < completedCount ? '0' : '4 4'}
                      className="transition-all duration-700"
                      style={{
                        strokeDashoffset: index < completedCount ? 0 : 8,
                      }}
                    />
                    {/* Ligne animée pour la progression actuelle */}
                    {index === completedCount && completedCount < chaptersWithStatus.length && (
                      <line
                        x1="0"
                        y1="2"
                        x2="80"
                        y2="2"
                        stroke="#6366f1"
                        strokeWidth="2"
                        strokeDasharray="80"
                        strokeDashoffset="80"
                        className="motion-safe:animate-[drawLine_1.5s_ease-out_forwards]"
                      />
                    )}
                  </svg>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Légende */}
      <div className="flex items-center justify-center gap-4 mt-2 text-xs text-zinc-500">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
          <span>Complété</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Circle className="w-3.5 h-3.5 text-indigo-400 fill-current" aria-hidden="true" />
          <span>En cours</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Lock className="w-3 h-3 text-zinc-600" aria-hidden="true" />
          <span>Verrouillé</span>
        </div>
      </div>

      <style jsx>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes drawLine {
            to {
              stroke-dashoffset: 0;
            }
          }
        }
      `}</style>
    </div>
  )
}
