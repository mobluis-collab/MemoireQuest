'use client'

import { useState, useEffect, useCallback } from 'react'
import { isSectionDone, SectionProgress } from '@/types/memoir'
import { hexToRgba } from '@/lib/color-utils'

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
}

export default function MemoireView({ chapters, questProgress, loadingKey, onSubtaskToggle, accentColor = '#7C3AED' }: MemoireViewProps) {
  const [openChapter, setOpenChapter] = useState<string | null>(chapters[0]?.num ?? null)
  const [hoveredChapter, setHoveredChapter] = useState<string | null>(null)

  // Animation 3 — Staggered fade-in: track which chapter's sections are visible
  const [visibleChapter, setVisibleChapter] = useState<string | null>(chapters[0]?.num ?? null)

  // Animation 4 — Checkbox bounce: track recently checked tasks
  const [justChecked, setJustChecked] = useState<Set<string>>(() => new Set())

  // Animation 5 — Hover lift on sections
  const [hoveredSection, setHoveredSection] = useState<string | null>(null)

  // Animation 3 — Trigger stagger when openChapter changes
  useEffect(() => {
    if (openChapter === null) {
      setVisibleChapter(null)
      return
    }
    // Reset visibility first, then trigger after a frame
    setVisibleChapter(null)
    const frameId = requestAnimationFrame(() => {
      setVisibleChapter(openChapter)
    })
    return () => cancelAnimationFrame(frameId)
  }, [openChapter])

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

  const totalSec = chapters.reduce((a, c) => a + c.sections, 0)
  const doneSec  = chapters.reduce((a, c) => a + c.done, 0)
  const globalPct = totalSec > 0 ? Math.round((doneSec / totalSec) * 100) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, marginBottom: 12 }}>
        <div>
          <h1 style={{
            fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', margin: 0,
            color: 'var(--mq-text-primary)',
          }}>Mon mémoire</h1>
          <p style={{ fontSize: 13, color: 'var(--mq-text-muted)', marginTop: 6 }}>
            {doneSec} / {totalSec} sections · <span style={{ color: accentColor, fontWeight: 600 }}>{globalPct}%</span>
          </p>
        </div>
        <div style={{ width: 200 }}>
          <div style={{ height: 4, borderRadius: 99, background: hexToRgba(accentColor, 0.08), overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${globalPct}%`, borderRadius: 99,
              background: accentColor,
              transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
            }} />
          </div>
        </div>
      </div>

      {/* Chapters list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {chapters.map(ch => {
          const isOpen = openChapter === ch.num
          const isHovered = hoveredChapter === ch.num
          const pct = ch.sections > 0 ? Math.round((ch.done / ch.sections) * 100) : 0
          const chapterDone = pct === 100, wip = pct > 0 && !chapterDone
          const chProgress = questProgress[ch.num] ?? {}

          return (
            <div key={ch.num} style={{
              borderRadius: 12,
              border: `1px solid ${isHovered ? hexToRgba(accentColor, 0.25) : hexToRgba(accentColor, 0.10)}`,
              background: chapterDone ? hexToRgba(accentColor, 0.05) : 'rgba(255,255,255,0.02)',
              overflow: 'hidden',
              transition: 'border-color 0.2s cubic-bezier(.4,0,.2,1), background 0.2s cubic-bezier(.4,0,.2,1)',
              flexShrink: 0,
            }}>
              {/* Chapter header */}
              <div
                onClick={() => setOpenChapter(isOpen ? null : ch.num)}
                onMouseEnter={() => setHoveredChapter(ch.num)}
                onMouseLeave={() => setHoveredChapter(null)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 20px', cursor: 'pointer',
                  background: isHovered ? 'rgba(255,255,255,0.03)' : 'transparent',
                  transition: 'background 0.15s cubic-bezier(.4,0,.2,1)',
                }}>
                <span style={{
                  fontSize: 11, color: hexToRgba(accentColor, 0.40), fontWeight: 600,
                  whiteSpace: 'nowrap', maxWidth: 52, overflow: 'hidden', textOverflow: 'ellipsis',
                  flexShrink: 0,
                }}>{ch.num}</span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 500,
                    color: chapterDone ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.90)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {ch.title}
                    {chapterDone && <span style={{ marginLeft: 6, fontSize: 11, color: accentColor }}>✓</span>}
                    {!chapterDone && !wip && <span style={{ marginLeft: 6, fontSize: 11, color: hexToRgba(accentColor, 0.20) }}>—</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--mq-text-muted)', marginTop: 2 }}>
                    {ch.done}/{ch.sections} sections
                  </div>
                </div>

                <div style={{ width: 100, flexShrink: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>
                      {chapterDone ? 'Terminé' : wip ? 'En cours' : 'A faire'}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: accentColor }}>{pct}%</span>
                  </div>
                  <div style={{ height: 3, borderRadius: 99, background: hexToRgba(accentColor, 0.08), overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`, borderRadius: 99,
                      background: accentColor,
                      transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
                    }} />
                  </div>
                </div>

                <div style={{
                  fontSize: 14, color: 'rgba(255,255,255,0.35)',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s cubic-bezier(.4,0,.2,1)',
                  flexShrink: 0,
                }}>▾</div>
              </div>

              {/* Animation 2 — Accordion: content always in DOM, hidden via maxHeight/opacity */}
              <div style={{
                overflow: 'hidden',
                maxHeight: isOpen ? '2000px' : '0px',
                opacity: isOpen ? 1 : 0,
                transition: 'max-height 0.4s cubic-bezier(.4,0,.2,1), opacity 0.3s cubic-bezier(.4,0,.2,1)',
              }}>
                <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ height: 1, background: 'var(--mq-stroke-soft)', marginBottom: 4 }} />

                  {/* Tips chapitre */}
                  {ch.tips && (
                    <div style={{
                      padding: '10px 14px', borderRadius: 8,
                      background: hexToRgba(accentColor, 0.05),
                      borderLeft: `3px solid ${hexToRgba(accentColor, 0.30)}`,
                      marginBottom: 4,
                    }}>
                      <div style={{
                        fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 600,
                        letterSpacing: '0.3px', marginBottom: 4, textTransform: 'uppercase',
                      }}>Conseils du cahier des charges</div>
                      <div style={{ fontSize: 12, lineHeight: 1.55, color: 'rgba(255,255,255,0.40)', fontStyle: 'italic' }}>
                        {ch.tips}
                      </div>
                    </div>
                  )}

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

                    // Animation 3 — Staggered fade-in
                    const isSectionVisible = visibleChapter === ch.num

                    // Animation 5 — Hover lift
                    const sectionKey = `${ch.num}:${i}`
                    const isSectionHovered = hoveredSection === sectionKey

                    return (
                      <div
                        key={i}
                        onMouseEnter={() => setHoveredSection(sectionKey)}
                        onMouseLeave={() => setHoveredSection(null)}
                        style={{
                          borderRadius: 10,
                          border: `1px solid ${isDone ? hexToRgba(accentColor, 0.08) : isSectionHovered ? hexToRgba(accentColor, 0.20) : hexToRgba(accentColor, 0.10)}`,
                          background: isDone ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
                          overflow: 'hidden',
                          // Animation 3 — Stagger
                          opacity: isAnyTaskLoading ? 0.6 : isSectionVisible ? 1 : 0,
                          transform: isSectionVisible
                            ? (isSectionHovered && !isDone ? 'translateY(-2px)' : 'translateY(0)')
                            : 'translateY(12px)',
                          // Animation 5 — Hover lift shadow
                          boxShadow: isSectionHovered && !isDone ? `0 4px 20px ${hexToRgba(accentColor, 0.06)}` : 'none',
                          transition: `opacity 0.3s cubic-bezier(.4,0,.2,1) ${i * 60}ms, transform 0.3s cubic-bezier(.4,0,.2,1) ${i * 60}ms, box-shadow 0.2s cubic-bezier(.4,0,.2,1), border-color 0.2s cubic-bezier(.4,0,.2,1)`,
                        }}>
                        {/* Section header row */}
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '11px 16px',
                        }}>
                          {/* Status circle */}
                          <div style={{
                            width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: isDone ? accentColor : 'var(--mq-border)',
                            border: `1.5px solid ${isDone ? accentColor : hexToRgba(accentColor, 0.20)}`,
                            fontSize: 10,
                          }}>
                            {isAnyTaskLoading
                              ? <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9 }}>...</span>
                              : isDone
                                ? <span style={{ color: '#fff' }}>✓</span>
                                : <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 9 }}>{i + 1}</span>}
                          </div>

                          {/* Text + sous-taches count */}
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontSize: 13, fontWeight: isDone ? 400 : 500,
                              color: isDone ? 'rgba(255,255,255,0.50)' : 'rgba(255,255,255,0.85)',
                            }}>{sec.text}</div>
                            {hasTasks && (
                              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                                {tasksDone}/{tasksTotal} sous-taches · <span style={{ color: accentColor, fontWeight: 600 }}>{tasksPct}%</span>
                              </div>
                            )}
                          </div>

                          {/* Difficulty badge */}
                          <span style={{
                            fontSize: 9, fontWeight: 600, flexShrink: 0,
                            padding: '2px 7px', borderRadius: 99,
                            background: hexToRgba(accentColor, sec.difficulty === 'hard' ? 0.15 : sec.difficulty === 'medium' ? 0.10 : 0.06),
                            border: `1px solid ${hexToRgba(accentColor, 0.15)}`,
                            color: hexToRgba(accentColor, sec.difficulty === 'hard' ? 0.90 : sec.difficulty === 'medium' ? 0.70 : 0.50),
                          }}>
                            {sec.difficulty === 'hard' ? 'difficile' : sec.difficulty === 'medium' ? 'moyen' : 'facile'}
                          </span>
                        </div>

                        {/* Mini progress bar — for any incomplete section with tasks */}
                        {!isDone && hasTasks && (
                          <div style={{
                            height: 2, borderRadius: 99,
                            background: hexToRgba(accentColor, 0.08),
                            margin: '0 16px 8px 52px',
                            overflow: 'hidden',
                          }}>
                            <div style={{
                              height: '100%', borderRadius: 99,
                              background: accentColor,
                              width: `${tasksPct}%`,
                              transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
                            }} />
                          </div>
                        )}

                        {/* Subtasks — always visible */}
                        {hasTasks && (
                          <div style={{
                            padding: '0 16px 12px 52px',
                            display: 'flex', flexDirection: 'column',
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
                                      // Animation 4 — Trigger bounce on check (not uncheck)
                                      if (!isChecked) {
                                        triggerCheckBounce(checkKey)
                                      }
                                      onSubtaskToggle(ch.num, i, ti)
                                    }
                                  }}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '7px 0',
                                    borderTop: ti === 0 ? 'none' : '1px solid rgba(255,255,255,0.04)',
                                    cursor: canToggle ? 'pointer' : 'default',
                                    opacity: isTaskLoading ? 0.5 : 1,
                                    transition: 'opacity 0.15s cubic-bezier(.4,0,.2,1)',
                                  }}>
                                  {/* Checkbox carre — Animation 4: bounce on check */}
                                  <div style={{
                                    width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: `1.5px solid ${isChecked ? hexToRgba(accentColor, 0.3) : hexToRgba(accentColor, 0.25)}`,
                                    background: isChecked ? accentColor : 'transparent',
                                    fontSize: 9,
                                    transform: isBouncing ? 'scale(1.3)' : 'scale(1)',
                                    transition: 'transform 0.3s cubic-bezier(.175,.885,.32,1.275), border-color 0.2s cubic-bezier(.4,0,.2,1), background 0.2s cubic-bezier(.4,0,.2,1)',
                                  }}>
                                    {isChecked && <span style={{ color: '#fff', lineHeight: 1 }}>✓</span>}
                                  </div>

                                  {/* Task text */}
                                  <span style={{
                                    fontSize: 12, lineHeight: 1.4,
                                    color: isChecked ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.45)',
                                    textDecoration: isChecked ? 'line-through' : 'none',
                                    textDecorationColor: 'rgba(255,255,255,0.15)',
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
            </div>
          )
        })}
      </div>
    </div>
  )
}
