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

  // Navigate between chapters in detail mode
  const goPrev = () => {
    if (selectedChapterIdx > 0) setSelectedChapterIdx(selectedChapterIdx - 1)
  }
  const goNext = () => {
    if (selectedChapterIdx < chapters.length - 1) setSelectedChapterIdx(selectedChapterIdx + 1)
  }

  // Keyboard nav in detail mode
  useEffect(() => {
    if (viewMode !== 'detail') return
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.key === 'Escape') {
        e.preventDefault()
        goBack()
      } else if (e.key === 'ArrowLeft' && selectedChapterIdx > 0) {
        e.preventDefault()
        setSelectedChapterIdx(selectedChapterIdx - 1)
      } else if (e.key === 'ArrowRight' && selectedChapterIdx < chapters.length - 1) {
        e.preventDefault()
        setSelectedChapterIdx(selectedChapterIdx + 1)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, selectedChapterIdx, chapters.length])

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

  /* ─── DETAIL MODE ─── */
  const ch = chapters[selectedChapterIdx]
  if (!ch) return null
  const chPct = ch.sections > 0 ? Math.round((ch.done / ch.sections) * 100) : 0
  const chDone = chPct === 100
  const chWip = chPct > 0 && !chDone
  const chProgress = questProgress[ch.num] ?? {}

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Top bar: back + chapter nav */}
      <div style={{
        flexShrink: 0,
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
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

        {/* Chapter navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={goPrev}
            disabled={selectedChapterIdx === 0}
            style={{
              width: 28, height: 28, borderRadius: '50%',
              border: `1px solid ${bg(0.10, isDark)}`,
              background: bg(0.04, isDark),
              color: selectedChapterIdx === 0 ? tw(0.15, textIntensity, isDark) : tw(0.50, textIntensity, isDark),
              fontSize: 12, cursor: selectedChapterIdx === 0 ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >{'\u2039'}</button>
          <span style={{ fontSize: 11, color: tw(0.40, textIntensity, isDark), minWidth: 60, textAlign: 'center' }}>
            {selectedChapterIdx + 1} / {chapters.length}
          </span>
          <button
            onClick={goNext}
            disabled={selectedChapterIdx === chapters.length - 1}
            style={{
              width: 28, height: 28, borderRadius: '50%',
              border: `1px solid ${bg(0.10, isDark)}`,
              background: bg(0.04, isDark),
              color: selectedChapterIdx === chapters.length - 1 ? tw(0.15, textIntensity, isDark) : tw(0.50, textIntensity, isDark),
              fontSize: 12, cursor: selectedChapterIdx === chapters.length - 1 ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >{'\u203A'}</button>
        </div>
      </div>

      {/* Chapter content — scrollable */}
      <div style={{
        flex: '1 1 0',
        minHeight: 0,
        overflowY: 'auto',
        padding: '20px 24px 16px',
        display: 'flex',
        flexDirection: 'column',
      }}>
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
    </div>
  )
}
