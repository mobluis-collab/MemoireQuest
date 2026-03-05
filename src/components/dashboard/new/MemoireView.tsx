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

type ViewMode = 'overview' | 'detail'

export default function MemoireView({ chapters, questProgress, loadingKey, onSubtaskToggle, accentColor = '#6366f1', textIntensity = 1.0, isDark = true }: MemoireViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [selectedChapterIdx, setSelectedChapterIdx] = useState(0)
  const [hoveredChapter, setHoveredChapter] = useState<number | null>(null)
  const [activeChapterIdx, setActiveChapterIdx] = useState(0)
  const snapRef = useRef<HTMLDivElement>(null)

  // Animation 4 — Checkbox bounce
  const [justChecked, setJustChecked] = useState<Set<string>>(() => new Set())

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

  // Global stats
  const totalSec = chapters.reduce((a, c) => a + c.sections, 0)
  const doneSec = chapters.reduce((a, c) => a + c.done, 0)
  const globalPct = totalSec > 0 ? Math.round((doneSec / totalSec) * 100) : 0

  const openChapter = (idx: number) => {
    setSelectedChapterIdx(idx)
    setViewMode('detail')
  }

  const goBack = () => {
    setViewMode('overview')
  }

  // Scroll to chapter in snap container
  const scrollToChapter = useCallback((idx: number) => {
    const container = snapRef.current
    if (!container) return
    const slide = container.querySelector(`[data-idx="${idx}"]`) as HTMLElement
    if (slide) slide.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // IntersectionObserver for active chapter tracking
  useEffect(() => {
    if (viewMode !== 'detail') return
    const container = snapRef.current
    if (!container) return

    const slides = container.querySelectorAll<HTMLElement>('[data-idx]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.getAttribute('data-idx') || '0')
            setActiveChapterIdx(idx)
          }
        })
      },
      { root: container, threshold: 0.6 }
    )

    slides.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [viewMode, chapters.length])

  // Scroll to selected chapter on open
  useEffect(() => {
    if (viewMode === 'detail') {
      setTimeout(() => scrollToChapter(selectedChapterIdx), 50)
    }
  }, [viewMode, selectedChapterIdx, scrollToChapter])

  // Keyboard nav in detail mode
  useEffect(() => {
    if (viewMode !== 'detail') return
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.key === 'Escape') {
        e.preventDefault()
        goBack()
      } else if ((e.key === 'ArrowUp' || e.key === 'ArrowLeft') && activeChapterIdx > 0) {
        e.preventDefault()
        scrollToChapter(activeChapterIdx - 1)
      } else if ((e.key === 'ArrowDown' || e.key === 'ArrowRight') && activeChapterIdx < chapters.length - 1) {
        e.preventDefault()
        scrollToChapter(activeChapterIdx + 1)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [viewMode, activeChapterIdx, chapters.length, scrollToChapter])

  /* ─── OVERVIEW MODE ─── */
  if (viewMode === 'overview') {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          flexShrink: 0,
          padding: '20px 24px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h1 style={{
              fontSize: 22, fontWeight: 700, letterSpacing: '-0.4px', margin: 0,
              color: tw(0.90, textIntensity, isDark),
            }}>Mon m{'\u00E9'}moire</h1>
            <p style={{ fontSize: 12, color: tw(0.40, textIntensity, isDark), marginTop: 4 }}>
              {doneSec}/{totalSec} sections {'\u00B7'} <span style={{ color: tw(0.60, textIntensity, isDark), fontWeight: 600 }}>{globalPct}%</span>
            </p>
          </div>
          {/* Global progress bar */}
          <div style={{ width: 180 }}>
            <div style={{ height: 4, borderRadius: 99, background: bg(0.06, isDark), overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${globalPct}%`, borderRadius: 99,
                background: accentColor,
                transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
              }} />
            </div>
          </div>
        </div>

        {/* Chapters list */}
        <div style={{
          flex: '1 1 0',
          minHeight: 0,
          overflowY: 'auto',
          padding: '0 24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}>
          {chapters.map((ch, idx) => {
            const pct = ch.sections > 0 ? Math.round((ch.done / ch.sections) * 100) : 0
            const done = pct === 100
            const wip = pct > 0 && !done
            const isHovered = hoveredChapter === idx

            return (
              <div
                key={ch.num}
                onClick={() => openChapter(idx)}
                onMouseEnter={() => setHoveredChapter(idx)}
                onMouseLeave={() => setHoveredChapter(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 18px',
                  borderRadius: 12,
                  border: `1px solid ${isHovered ? bg(0.12, isDark) : bg(0.06, isDark)}`,
                  background: done ? bg(0.03, isDark) : bg(0.02, isDark),
                  cursor: 'pointer',
                  transition: 'all 0.15s cubic-bezier(.4,0,.2,1)',
                  transform: isHovered ? 'translateY(-1px)' : 'none',
                  boxShadow: isHovered ? `0 4px 16px ${bg(0.04, isDark)}` : 'none',
                }}
              >
                {/* Chapter number */}
                <span style={{
                  fontSize: 11, color: tw(0.35, textIntensity, isDark), fontWeight: 600,
                  whiteSpace: 'nowrap', flexShrink: 0, minWidth: 48,
                }}>{ch.num}</span>

                {/* Title + status */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 500,
                    color: done ? tw(0.55, textIntensity, isDark) : tw(0.90, textIntensity, isDark),
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {ch.title}
                    {done && <span style={{ marginLeft: 6, fontSize: 11, color: tw(0.50, textIntensity, isDark) }}>{'\u2713'}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: tw(0.35, textIntensity, isDark), marginTop: 2 }}>
                    {ch.done}/{ch.sections} sections
                  </div>
                </div>

                {/* Progress bar + pct */}
                <div style={{ width: 100, flexShrink: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: tw(0.40, textIntensity, isDark) }}>
                      {done ? 'Termin\u00E9' : wip ? 'En cours' : 'A faire'}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: tw(0.60, textIntensity, isDark) }}>{pct}%</span>
                  </div>
                  <div style={{ height: 3, borderRadius: 99, background: bg(0.06, isDark), overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`, borderRadius: 99,
                      background: accentColor,
                      transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
                    }} />
                  </div>
                </div>

                {/* Arrow */}
                <span style={{
                  fontSize: 14, color: tw(0.25, textIntensity, isDark), flexShrink: 0,
                  transition: 'color 0.15s',
                  ...(isHovered ? { color: tw(0.50, textIntensity, isDark) } : {}),
                }}>{'\u203A'}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  /* ─── DETAIL MODE — Scroll Snap TikTok ─── */
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Top bar: back button only */}
      <div style={{
        flexShrink: 0,
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        borderBottom: `1px solid ${bg(0.06, isDark)}`,
      }}>
        <button
          onClick={goBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: tw(0.50, textIntensity, isDark), fontSize: 12, fontWeight: 500,
            padding: '4px 8px', borderRadius: 6,
            transition: 'color 0.15s',
          }}
        >
          <span style={{ fontSize: 14 }}>{'\u2039'}</span> Vue d{'\u0027'}ensemble
        </button>
      </div>

      {/* Scroll snap container */}
      <div
        ref={snapRef}
        style={{
          flex: '1 1 0',
          minHeight: 0,
          overflowY: 'auto',
          scrollSnapType: 'y mandatory',
          scrollBehavior: 'smooth',
        }}
      >
        {chapters.map((ch, idx) => {
          const chPct = ch.sections > 0 ? Math.round((ch.done / ch.sections) * 100) : 0
          const chDone = chPct === 100
          const chWip = chPct > 0 && !chDone
          const chProgress = questProgress[ch.num] ?? {}

          return (
            <div
              key={ch.num}
              data-idx={idx}
              style={{
                scrollSnapAlign: 'start',
                minHeight: '100%',
                padding: '24px 24px 24px 24px',
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto',
              }}
            >
              {/* Chapter header */}
              <div style={{ flexShrink: 0, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    color: tw(0.35, textIntensity, isDark),
                    letterSpacing: '0.5px', textTransform: 'uppercase',
                  }}>{ch.num}</span>
                  {chDone && (
                    <span style={{
                      fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                      background: bg(0.08, isDark), color: tw(0.60, textIntensity, isDark),
                    }}>Termin{'\u00E9'}</span>
                  )}
                  {chWip && (
                    <span style={{
                      fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                      background: bg(0.05, isDark), color: tw(0.45, textIntensity, isDark),
                    }}>En cours</span>
                  )}
                </div>

                <h2 style={{
                  fontSize: 20, fontWeight: 700, letterSpacing: '-0.4px', margin: 0,
                  color: tw(0.90, textIntensity, isDark), lineHeight: 1.3,
                }}>{ch.title}</h2>

                {/* Progress bar */}
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    flex: 1, height: 4, borderRadius: 99,
                    background: bg(0.06, isDark), overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', width: `${chPct}%`, borderRadius: 99,
                      background: accentColor,
                      transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
                    }} />
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 600,
                    color: tw(0.60, textIntensity, isDark), flexShrink: 0,
                  }}>{chPct}%</span>
                </div>
                <div style={{ fontSize: 11, color: tw(0.35, textIntensity, isDark), marginTop: 4 }}>
                  {ch.done}/{ch.sections} sections
                </div>
              </div>

              {/* Objective */}
              <div style={{
                flexShrink: 0, padding: '8px 12px', borderRadius: 8,
                background: bg(0.03, isDark), border: `1px solid ${bg(0.06, isDark)}`,
                marginBottom: 8,
              }}>
                <div style={{
                  fontSize: 10, fontWeight: 600, color: tw(0.25, textIntensity, isDark),
                  letterSpacing: '0.3px', textTransform: 'uppercase', marginBottom: 4,
                }}>Objectif</div>
                <div style={{ fontSize: 13, lineHeight: 1.5, color: tw(0.65, textIntensity, isDark) }}>
                  {ch.objective}
                </div>
              </div>

              {/* Tips */}
              {ch.tips && (
                <div style={{
                  flexShrink: 0, padding: '8px 12px', borderRadius: 8,
                  background: bg(0.03, isDark), borderLeft: `3px solid ${bg(0.10, isDark)}`,
                  marginBottom: 8,
                }}>
                  <div style={{
                    fontSize: 10, color: tw(0.25, textIntensity, isDark), fontWeight: 600,
                    letterSpacing: '0.3px', marginBottom: 4, textTransform: 'uppercase',
                  }}>Conseils du cahier des charges</div>
                  <div style={{
                    fontSize: 12, lineHeight: 1.55,
                    color: tw(0.40, textIntensity, isDark), fontStyle: 'italic',
                  }}>{ch.tips}</div>
                </div>
              )}

              {/* Sections list */}
              <div style={{
                display: 'flex', flexDirection: 'column', gap: 8,
                paddingBottom: 8,
              }}>
                {ch.sectionList.map((sec, i) => {
                  const secProgress = chProgress[String(i)]
                  const secDone = isSectionDone(secProgress)
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
                        background: secDone ? bg(0.02, isDark) : bg(0.04, isDark),
                        overflow: 'hidden',
                        opacity: isAnyTaskLoading ? 0.6 : 1,
                        transition: 'opacity 0.2s cubic-bezier(.4,0,.2,1)',
                      }}
                    >
                      {/* Section header */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '11px 16px',
                      }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: secDone ? bg(0.60, isDark) : 'var(--mq-border)',
                          border: `1.5px solid ${secDone ? bg(0.25, isDark) : bg(0.12, isDark)}`,
                          fontSize: 10,
                        }}>
                          {isAnyTaskLoading
                            ? <span style={{ color: tw(0.4, textIntensity, isDark), fontSize: 9 }}>...</span>
                            : secDone
                              ? <span style={{ color: tw(0.92, textIntensity, isDark) }}>&#10003;</span>
                              : <span style={{ color: tw(0.45, textIntensity, isDark), fontSize: 9 }}>{i + 1}</span>}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: 13, fontWeight: secDone ? 400 : 500,
                            color: secDone ? tw(0.50, textIntensity, isDark) : tw(0.85, textIntensity, isDark),
                          }}>{sec.text}</div>
                          {hasTasks && (
                            <div style={{ fontSize: 10, color: tw(0.35, textIntensity, isDark), marginTop: 2 }}>
                              {tasksDone}/{tasksTotal} sous-taches &middot; <span style={{ color: tw(0.60, textIntensity, isDark), fontWeight: 600 }}>{tasksPct}%</span>
                            </div>
                          )}
                        </div>

                        <span style={{
                          fontSize: 9, fontWeight: 600, flexShrink: 0,
                          padding: '2px 7px', borderRadius: 99,
                          background: sec.difficulty === 'hard' ? bg(0.10, isDark) : sec.difficulty === 'medium' ? bg(0.06, isDark) : bg(0.04, isDark),
                          border: `1px solid ${bg(0.08, isDark)}`,
                          color: sec.difficulty === 'hard' ? tw(0.70, textIntensity, isDark) : sec.difficulty === 'medium' ? tw(0.50, textIntensity, isDark) : tw(0.35, textIntensity, isDark),
                        }}>
                          {sec.difficulty === 'hard' ? 'difficile' : sec.difficulty === 'medium' ? 'moyen' : 'facile'}
                        </span>
                      </div>

                      {/* Mini progress bar */}
                      {!secDone && hasTasks && (
                        <div style={{
                          height: 2, borderRadius: 99,
                          background: bg(0.06, isDark),
                          margin: '0 16px 8px 52px', overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%', borderRadius: 99,
                            background: accentColor,
                            width: `${tasksPct}%`,
                            transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
                          }} />
                        </div>
                      )}

                      {/* Subtasks */}
                      {hasTasks && (
                        <div style={{
                          padding: '0 16px 12px 52px',
                          display: 'flex', flexDirection: 'column',
                        }}>
                          {sec.tasks!.map((taskText, ti) => {
                            const isChecked = taskStates[ti] ?? false
                            const isTaskLoading = loadingKey === `${ch.num}:${i}:${ti}`
                            const canToggle = !isTaskLoading
                            const checkKey = `${ch.num}:${i}:${ti}`
                            const isBouncing = justChecked.has(checkKey)

                            return (
                              <div
                                key={ti}
                                onClick={() => {
                                  if (canToggle) {
                                    if (!isChecked) triggerCheckBounce(checkKey)
                                    onSubtaskToggle(ch.num, i, ti)
                                  }
                                }}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 10,
                                  padding: '7px 0',
                                  borderTop: ti === 0 ? 'none' : `1px solid ${bg(0.04, isDark)}`,
                                  cursor: canToggle ? 'pointer' : 'default',
                                  opacity: isTaskLoading ? 0.5 : 1,
                                  transition: 'opacity 0.15s cubic-bezier(.4,0,.2,1)',
                                }}
                              >
                                <div style={{
                                  width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  border: `1.5px solid ${isChecked ? bg(0.25, isDark) : bg(0.15, isDark)}`,
                                  background: isChecked ? bg(0.70, isDark) : 'transparent',
                                  fontSize: 9,
                                  transform: isBouncing ? 'scale(1.3)' : 'scale(1)',
                                  transition: 'transform 0.3s cubic-bezier(.175,.885,.32,1.275), border-color 0.2s cubic-bezier(.4,0,.2,1), background 0.2s cubic-bezier(.4,0,.2,1)',
                                }}>
                                  {isChecked && <span style={{ color: tw(0.92, textIntensity, isDark), lineHeight: 1 }}>&#10003;</span>}
                                </div>
                                <span style={{
                                  fontSize: 12, lineHeight: 1.4,
                                  color: isChecked ? tw(0.30, textIntensity, isDark) : tw(0.45, textIntensity, isDark),
                                  textDecoration: isChecked ? 'line-through' : 'none',
                                  textDecorationColor: bg(0.15, isDark),
                                }}>{taskText}</span>
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

      {/* Dots — vertical column on the right */}
      <div style={{
        position: 'absolute',
        right: 12,
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        zIndex: 10,
      }}>
        {chapters.map((_, idx) => (
          <div
            key={idx}
            onClick={() => scrollToChapter(idx)}
            style={{
              width: activeChapterIdx === idx ? 6 : 5,
              height: activeChapterIdx === idx ? 18 : 5,
              borderRadius: 99,
              background: activeChapterIdx === idx
                ? tw(0.6, textIntensity, isDark)
                : tw(0.12, textIntensity, isDark),
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
            }}
          />
        ))}
      </div>

      {/* Scroll hint on first chapter */}
      {activeChapterIdx === 0 && (
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          opacity: 0.25,
          pointerEvents: 'none',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={tw(0.4, textIntensity, isDark)} strokeWidth="1.5" strokeLinecap="round">
            <path d="M4 6l4 4 4-4" />
          </svg>
          <span style={{ fontSize: 9, color: tw(0.3, textIntensity, isDark) }}>scroll</span>
        </div>
      )}
    </div>
  )
}
