'use client'

import { useState } from 'react'
import { isSectionDone, SectionProgress } from '@/types/memoir'

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
}

export default function MemoireView({ chapters, questProgress, loadingKey, onSubtaskToggle }: MemoireViewProps) {
  const [openChapter, setOpenChapter] = useState<string | null>(chapters[0]?.num ?? null)
  const [hoveredChapter, setHoveredChapter] = useState<string | null>(null)

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
            {doneSec} / {totalSec} sections · {globalPct}%
          </p>
        </div>
        <div style={{ width: 200 }}>
          <div style={{ height: 4, borderRadius: 99, background: 'var(--mq-border)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${globalPct}%`, borderRadius: 99,
              background: 'rgba(255,255,255,0.35)',
              transition: 'width 0.8s cubic-bezier(.4,0,.2,1)',
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
              border: '1px solid var(--mq-border)',
              background: 'rgba(255,255,255,0.02)',
              overflow: 'hidden',
              transition: 'border-color 0.2s',
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
                  transition: 'background 0.15s',
                }}>
                <span style={{
                  fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 600,
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
                    {chapterDone && <span style={{ marginLeft: 6, fontSize: 11, color: 'rgba(255,255,255,0.50)' }}>✓</span>}
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
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>{pct}%</span>
                  </div>
                  <div style={{ height: 3, borderRadius: 99, background: 'var(--mq-border)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`, borderRadius: 99,
                      background: chapterDone ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.25)',
                      transition: 'width 0.8s cubic-bezier(.4,0,.2,1)',
                    }} />
                  </div>
                </div>

                <div style={{
                  fontSize: 14, color: 'rgba(255,255,255,0.35)',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  flexShrink: 0,
                }}>▾</div>
              </div>

              {/* Sections */}
              {isOpen && (
                <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ height: 1, background: 'var(--mq-stroke-soft)', marginBottom: 4 }} />

                  {/* Tips chapitre */}
                  {ch.tips && (
                    <div style={{
                      padding: '10px 14px', borderRadius: 8,
                      background: 'rgba(255,255,255,0.03)',
                      borderLeft: '2px solid rgba(255,255,255,0.12)',
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
                    const isNext = !isDone && Array.from({ length: i }, (_, j) => isSectionDone(chProgress[String(j)])).every(Boolean)
                    const isLocked = !isDone && !isNext
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
                      <div key={i} style={{
                        borderRadius: 10,
                        border: `1px solid ${isNext ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}`,
                        background: isNext ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                        overflow: 'hidden',
                        opacity: isAnyTaskLoading ? 0.6 : 1,
                        transition: 'all 0.15s',
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
                            background: isDone ? 'rgba(255,255,255,0.10)' : isNext ? 'var(--mq-border)' : 'var(--mq-card-bg)',
                            border: `1.5px solid ${isDone ? 'rgba(255,255,255,0.25)' : isNext ? 'rgba(255,255,255,0.20)' : 'var(--mq-border)'}`,
                            fontSize: 10,
                          }}>
                            {isAnyTaskLoading
                              ? <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9 }}>…</span>
                              : isDone
                                ? <span style={{ color: 'rgba(255,255,255,0.55)' }}>✓</span>
                                : isNext
                                  ? <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 800, fontSize: 9 }}>→</span>
                                  : <span style={{ color: 'rgba(255,255,255,0.20)', fontSize: 9 }}>{i + 1}</span>}
                          </div>

                          {/* Text + sous-taches count */}
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontSize: 13, fontWeight: isNext ? 600 : 400,
                              color: isDone ? 'rgba(255,255,255,0.50)' : isNext ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.65)',
                            }}>{sec.text}</div>
                            {hasTasks && (
                              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                                {tasksDone}/{tasksTotal} sous-taches
                              </div>
                            )}
                          </div>

                          {/* Difficulty badge */}
                          <span style={{
                            fontSize: 9, fontWeight: 600, flexShrink: 0,
                            padding: '2px 7px', borderRadius: 99,
                            background: 'var(--mq-stroke-soft)',
                            color: 'var(--mq-text-muted)',
                          }}>
                            {sec.difficulty === 'hard' ? 'difficile' : sec.difficulty === 'medium' ? 'moyen' : 'facile'}
                          </span>
                        </div>

                        {/* Mini progress bar — only for active section with tasks */}
                        {isNext && hasTasks && (
                          <div style={{
                            height: 2, borderRadius: 99,
                            background: 'rgba(255,255,255,0.06)',
                            margin: '0 16px 8px 52px',
                            overflow: 'hidden',
                          }}>
                            <div style={{
                              height: '100%', borderRadius: 99,
                              background: 'rgba(255,255,255,0.25)',
                              width: `${tasksPct}%`,
                              transition: 'width 0.5s cubic-bezier(.4,0,.2,1)',
                            }} />
                          </div>
                        )}

                        {/* Subtasks — visible for done and active sections */}
                        {hasTasks && !isLocked && (
                          <div style={{
                            padding: '0 16px 12px 52px',
                            display: 'flex', flexDirection: 'column',
                          }}>
                            {sec.tasks!.map((taskText, ti) => {
                              const isChecked = taskStates[ti] ?? false
                              const isTaskLoading = loadingKey === `${ch.num}:${i}:${ti}`
                              const canToggle = !isTaskLoading

                              return (
                                <div
                                  key={ti}
                                  onClick={() => { if (canToggle) onSubtaskToggle(ch.num, i, ti) }}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '7px 0',
                                    borderTop: ti === 0 ? 'none' : '1px solid rgba(255,255,255,0.04)',
                                    cursor: canToggle ? 'pointer' : 'default',
                                    opacity: isTaskLoading ? 0.5 : 1,
                                    transition: 'opacity 0.15s',
                                  }}>
                                  {/* Checkbox carre */}
                                  <div style={{
                                    width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: `1.5px solid ${isChecked ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.15)'}`,
                                    background: isChecked ? 'rgba(255,255,255,0.08)' : 'transparent',
                                    fontSize: 9,
                                    transition: 'all 0.2s',
                                  }}>
                                    {isChecked && <span style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1 }}>✓</span>}
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
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
