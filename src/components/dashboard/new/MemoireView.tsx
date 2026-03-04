'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { isSectionDone, SectionProgress } from '@/types/memoir'
import { tw, bg } from '@/lib/color-utils'


interface Section {
  text: string
  difficulty: 'easy' | 'medium' | 'hard'
  hint?: string
  tasks?: string[]
}

interface ChapterData {
  num: string
  title: string
  objective: string
  sections: number
  done: number
  tips?: string
  sectionList: Section[]
}

interface MemoireViewProps {
  chapters: ChapterData[]
  questProgress: Record<string, Record<string, SectionProgress>>
  loadingKey: string | null
  onSubtaskToggle: (chapterNumber: string, sectionIndex: number, taskIndex: number) => void
  accentColor?: string
  textIntensity?: number
  isDark?: boolean
}

export default function MemoireView({ chapters, questProgress, loadingKey, onSubtaskToggle, accentColor = '#6366f1', textIntensity = 1.0, isDark = true }: MemoireViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  // Animation 4 — Checkbox bounce: track recently checked tasks
  const [justChecked, setJustChecked] = useState<Set<string>>(() => new Set())

  // Animation 4 — Helper to add a bounce key and auto-remove after 300ms
  const triggerCheckBounce = useCallback((key: string) => {
    setJustChecked(prev => {
      const next = new Set(prev)
      next.add(key)
      return next
    })
    setTimeout(() => {
      setJustChecked(prev => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }, 300)
  }, [])

  // Track which chapter slide is in view via IntersectionObserver
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = chapterRefs.current.indexOf(entry.target as HTMLDivElement)
            if (idx !== -1) {
              setActiveIndex(idx)
            }
          }
        }
      },
      {
        root: container,
        threshold: 0.6,
      }
    )

    chapterRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [chapters.length])

  // Keyboard navigation: ArrowUp/ArrowDown, PageUp/PageDown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let newIndex = activeIndex
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault()
        newIndex = Math.min(activeIndex + 1, chapters.length - 1)
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        newIndex = Math.max(activeIndex - 1, 0)
      }
      if (newIndex !== activeIndex) {
        scrollToChapter(newIndex)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, chapters.length])

  const scrollToChapter = (index: number) => {
    const target = chapterRefs.current[index]
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Scroll snap container */}
      <div
        ref={scrollContainerRef}
        style={{
          width: '100%',
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollSnapType: 'y mandatory',
          scrollBehavior: 'smooth',
        }}
      >
        {chapters.map((ch, chIdx) => {
          const pct = ch.sections > 0 ? Math.round((ch.done / ch.sections) * 100) : 0
          const chapterDone = pct === 100
          const wip = pct > 0 && !chapterDone
          const chProgress = questProgress[ch.num] ?? {}

          return (
            <div
              key={ch.num}
              ref={(el) => { chapterRefs.current[chIdx] = el }}
              style={{
                scrollSnapAlign: 'start',
                height: '100%',
                minHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                padding: '28px 32px 20px',
                boxSizing: 'border-box',
              }}
            >
              {/* Chapter header: number + title */}
              <div style={{ flexShrink: 0, marginBottom: 16 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 10,
                }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: tw(0.35, textIntensity, isDark),
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                  }}>
                    {ch.num}
                  </span>
                  {chapterDone && (
                    <span style={{
                      fontSize: 9,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 99,
                      background: bg(0.08, isDark),
                      color: tw(0.60, textIntensity, isDark),
                    }}>
                      Termine
                    </span>
                  )}
                  {wip && (
                    <span style={{
                      fontSize: 9,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 99,
                      background: bg(0.05, isDark),
                      color: tw(0.45, textIntensity, isDark),
                    }}>
                      En cours
                    </span>
                  )}
                </div>

                <h2 style={{
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: '-0.4px',
                  margin: 0,
                  color: tw(0.90, textIntensity, isDark),
                  lineHeight: 1.3,
                }}>
                  {ch.title}
                </h2>

                {/* Chapter progress bar */}
                <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    flex: 1,
                    height: 4,
                    borderRadius: 99,
                    background: bg(0.06, isDark),
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      borderRadius: 99,
                      background: accentColor,
                      transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
                    }} />
                  </div>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: tw(0.60, textIntensity, isDark),
                    flexShrink: 0,
                    minWidth: 36,
                    textAlign: 'right',
                  }}>
                    {pct}%
                  </span>
                </div>

                <div style={{
                  fontSize: 11,
                  color: tw(0.35, textIntensity, isDark),
                  marginTop: 6,
                }}>
                  {ch.done}/{ch.sections} sections
                  {chapterDone ? ' — Termine' : wip ? ' — En cours' : ' — A faire'}
                </div>
              </div>

              {/* Chapter objective */}
              <div style={{
                flexShrink: 0,
                padding: '10px 14px',
                borderRadius: 8,
                background: bg(0.03, isDark),
                border: `1px solid ${bg(0.06, isDark)}`,
                marginBottom: 12,
              }}>
                <div style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: tw(0.25, textIntensity, isDark),
                  letterSpacing: '0.3px',
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}>
                  Objectif
                </div>
                <div style={{
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: tw(0.65, textIntensity, isDark),
                }}>
                  {ch.objective}
                </div>
              </div>

              {/* Tips from cahier des charges */}
              {ch.tips && (
                <div style={{
                  flexShrink: 0,
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: bg(0.03, isDark),
                  borderLeft: `3px solid ${bg(0.10, isDark)}`,
                  marginBottom: 12,
                }}>
                  <div style={{
                    fontSize: 10,
                    color: tw(0.25, textIntensity, isDark),
                    fontWeight: 600,
                    letterSpacing: '0.3px',
                    marginBottom: 4,
                    textTransform: 'uppercase',
                  }}>
                    Conseils du cahier des charges
                  </div>
                  <div style={{
                    fontSize: 12,
                    lineHeight: 1.55,
                    color: tw(0.40, textIntensity, isDark),
                    fontStyle: 'italic',
                  }}>
                    {ch.tips}
                  </div>
                </div>
              )}

              {/* Sections list — scrollable if overflow */}
              <div style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                paddingRight: 4,
                paddingBottom: 8,
              }}>
                {ch.sectionList.map((sec, i) => {
                  const secProgress = chProgress[String(i)]
                  const isDone = isSectionDone(secProgress)
                  const isAnyTaskLoading = loadingKey?.startsWith(`${ch.num}:${i}:`) ?? false

                  const hasTasks = Array.isArray(sec.tasks) && sec.tasks.length > 0
                  let taskStates: boolean[] = []
                  if (hasTasks) {
                    if (secProgress === 'done') {
                      taskStates = sec.tasks!.map(() => true)
                    } else if (secProgress && typeof secProgress === 'object' && 'tasks' in secProgress) {
                      taskStates = secProgress.tasks
                    } else {
                      taskStates = sec.tasks!.map(() => false)
                    }
                  }

                  const tasksDone = hasTasks ? taskStates.filter(Boolean).length : 0
                  const tasksTotal = sec.tasks?.length ?? 0
                  const tasksPct = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0

                  return (
                    <div
                      key={i}
                      style={{
                        borderRadius: 10,
                        border: `1px solid ${bg(0.06, isDark)}`,
                        background: isDone ? bg(0.02, isDark) : bg(0.04, isDark),
                        overflow: 'hidden',
                        opacity: isAnyTaskLoading ? 0.6 : 1,
                        transition: 'opacity 0.2s cubic-bezier(.4,0,.2,1), border-color 0.2s cubic-bezier(.4,0,.2,1)',
                      }}
                    >
                      {/* Section header row */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '11px 16px',
                      }}>
                        {/* Status circle */}
                        <div style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isDone ? bg(0.60, isDark) : 'var(--mq-border)',
                          border: `1.5px solid ${isDone ? bg(0.25, isDark) : bg(0.12, isDark)}`,
                          fontSize: 10,
                        }}>
                          {isAnyTaskLoading
                            ? <span style={{ color: tw(0.4, textIntensity, isDark), fontSize: 9 }}>...</span>
                            : isDone
                              ? <span style={{ color: tw(0.92, textIntensity, isDark) }}>&#10003;</span>
                              : <span style={{ color: tw(0.45, textIntensity, isDark), fontSize: 9 }}>{i + 1}</span>}
                        </div>

                        {/* Text + subtask count */}
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: 13,
                            fontWeight: isDone ? 400 : 500,
                            color: isDone ? tw(0.50, textIntensity, isDark) : tw(0.85, textIntensity, isDark),
                          }}>
                            {sec.text}
                          </div>
                          {hasTasks && (
                            <div style={{ fontSize: 10, color: tw(0.35, textIntensity, isDark), marginTop: 2 }}>
                              {tasksDone}/{tasksTotal} sous-taches &middot; <span style={{ color: tw(0.60, textIntensity, isDark), fontWeight: 600 }}>{tasksPct}%</span>
                            </div>
                          )}
                        </div>

                        {/* Difficulty badge */}
                        <span style={{
                          fontSize: 9,
                          fontWeight: 600,
                          flexShrink: 0,
                          padding: '2px 7px',
                          borderRadius: 99,
                          background: sec.difficulty === 'hard' ? bg(0.10, isDark) : sec.difficulty === 'medium' ? bg(0.06, isDark) : bg(0.04, isDark),
                          border: `1px solid ${bg(0.08, isDark)}`,
                          color: sec.difficulty === 'hard' ? tw(0.70, textIntensity, isDark) : sec.difficulty === 'medium' ? tw(0.50, textIntensity, isDark) : tw(0.35, textIntensity, isDark),
                        }}>
                          {sec.difficulty === 'hard' ? 'difficile' : sec.difficulty === 'medium' ? 'moyen' : 'facile'}
                        </span>
                      </div>

                      {/* Mini progress bar */}
                      {!isDone && hasTasks && (
                        <div style={{
                          height: 2,
                          borderRadius: 99,
                          background: bg(0.06, isDark),
                          margin: '0 16px 8px 52px',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%',
                            borderRadius: 99,
                            background: accentColor,
                            width: `${tasksPct}%`,
                            transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
                          }} />
                        </div>
                      )}

                      {/* Subtasks — checkboxes */}
                      {hasTasks && (
                        <div style={{
                          padding: '0 16px 12px 52px',
                          display: 'flex',
                          flexDirection: 'column',
                        }}>
                          {sec.tasks!.map((taskText, ti) => {
                            const isChecked = taskStates[ti] ?? false
                            const isTaskLoading = loadingKey === `${ch.num}:${i}:${ti}`
                            const canToggle = !isTaskLoading

                            // Animation 4 — Checkbox bounce key
                            const checkKey = `${ch.num}:${i}:${ti}`
                            const isBouncing = justChecked.has(checkKey)

                            return (
                              <div
                                key={ti}
                                onClick={() => {
                                  if (canToggle) {
                                    if (!isChecked) {
                                      triggerCheckBounce(checkKey)
                                    }
                                    onSubtaskToggle(ch.num, i, ti)
                                  }
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 10,
                                  padding: '7px 0',
                                  borderTop: ti === 0 ? 'none' : `1px solid ${bg(0.04, isDark)}`,
                                  cursor: canToggle ? 'pointer' : 'default',
                                  opacity: isTaskLoading ? 0.5 : 1,
                                  transition: 'opacity 0.15s cubic-bezier(.4,0,.2,1)',
                                }}
                              >
                                {/* Checkbox — Animation 4: bounce on check */}
                                <div style={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: 4,
                                  flexShrink: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: `1.5px solid ${isChecked ? bg(0.25, isDark) : bg(0.15, isDark)}`,
                                  background: isChecked ? bg(0.70, isDark) : 'transparent',
                                  fontSize: 9,
                                  transform: isBouncing ? 'scale(1.3)' : 'scale(1)',
                                  transition: 'transform 0.3s cubic-bezier(.175,.885,.32,1.275), border-color 0.2s cubic-bezier(.4,0,.2,1), background 0.2s cubic-bezier(.4,0,.2,1)',
                                }}>
                                  {isChecked && <span style={{ color: tw(0.92, textIntensity, isDark), lineHeight: 1 }}>&#10003;</span>}
                                </div>

                                {/* Task text */}
                                <span style={{
                                  fontSize: 12,
                                  lineHeight: 1.4,
                                  color: isChecked ? tw(0.30, textIntensity, isDark) : tw(0.45, textIntensity, isDark),
                                  textDecoration: isChecked ? 'line-through' : 'none',
                                  textDecorationColor: bg(0.15, isDark),
                                }}>
                                  {taskText}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Dot indicators — right side */}
      {chapters.length > 1 && (
        <div style={{
          position: 'absolute',
          right: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          zIndex: 10,
        }}>
          {chapters.map((_, dotIdx) => {
            const isActive = dotIdx === activeIndex
            return (
              <div
                key={dotIdx}
                onClick={() => scrollToChapter(dotIdx)}
                style={{
                  width: isActive ? 10 : 7,
                  height: isActive ? 10 : 7,
                  borderRadius: '50%',
                  background: isActive ? accentColor : bg(0.15, isDark),
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(.4,0,.2,1)',
                  boxShadow: isActive ? `0 0 8px ${accentColor}44` : 'none',
                }}
                title={`Chapitre ${chapters[dotIdx].num}`}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
