'use client'

import { useState } from 'react'

const FONT = "-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif"

interface Section {
  text: string
  difficulty: 'easy' | 'medium' | 'hard'
  hint?: string
}

interface ChapterData {
  num: string
  title: string
  objective: string
  sections: number
  done: number
  sectionList: Section[]
}

interface MemoireViewProps {
  chapters: ChapterData[]
  questProgress: Record<string, Record<string, 'done'>>
  loadingKey: string | null
  onQuestComplete: (chapterNumber: string, sectionIndex: number) => void
}

export default function MemoireView({ chapters, questProgress, loadingKey, onQuestComplete }: MemoireViewProps) {
  const [openChapter, setOpenChapter] = useState<string | null>(chapters[0]?.num ?? null)
  const [hoveredChapter, setHoveredChapter] = useState<string | null>(null)

  const totalSec = chapters.reduce((a, c) => a + c.sections, 0)
  const doneSec  = chapters.reduce((a, c) => a + c.done, 0)
  const globalPct = totalSec > 0 ? Math.round((doneSec / totalSec) * 100) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%', overflow: 'auto' }}>

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
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, paddingRight: 4 }}>
        {chapters.map(ch => {
          const isOpen = openChapter === ch.num
          const isHovered = hoveredChapter === ch.num
          const pct = ch.sections > 0 ? Math.round((ch.done / ch.sections) * 100) : 0
          const done = pct === 100, wip = pct > 0 && !done
          const chProgress = questProgress[ch.num] ?? {}

          return (
            <div key={ch.num} style={{
              borderRadius: 12,
              border: '1px solid var(--mq-border)',
              background: 'rgba(255,255,255,0.02)',
              overflow: 'hidden',
              transition: 'border-color 0.2s',
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
                {/* Num */}
                <span style={{
                  fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 600,
                  whiteSpace: 'nowrap', maxWidth: 52, overflow: 'hidden', textOverflow: 'ellipsis',
                  flexShrink: 0,
                }}>{ch.num}</span>

                {/* Title */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 500,
                    color: done ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.90)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{ch.title}{done && <span style={{ marginLeft: 6, fontSize: 11, color: 'rgba(255,255,255,0.50)' }}>✓</span>}</div>
                  <div style={{ fontSize: 11, color: 'var(--mq-text-muted)', marginTop: 2 }}>
                    {ch.done}/{ch.sections} sections
                  </div>
                </div>

                {/* Progress */}
                <div style={{ width: 100, flexShrink: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>
                      {done ? 'Terminé' : wip ? 'En cours' : 'À faire'}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>{pct}%</span>
                  </div>
                  <div style={{ height: 3, borderRadius: 99, background: 'var(--mq-border)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`, borderRadius: 99,
                      background: done ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.25)',
                      transition: 'width 0.8s cubic-bezier(.4,0,.2,1)',
                    }} />
                  </div>
                </div>

                {/* Chevron */}
                <div style={{
                  fontSize: 14, color: 'rgba(255,255,255,0.35)',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  flexShrink: 0,
                }}>▾</div>
              </div>

              {/* Sections */}
              {isOpen && (
                <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 480, overflowY: 'auto' }}>
                  <div style={{ height: 1, background: 'var(--mq-stroke-soft)', marginBottom: 4 }} />
                  {ch.sectionList.map((sec, i) => {
                    const isDone = chProgress[String(i)] === 'done'
                    const isNext = !isDone && Array.from({ length: i }, (_, j) => chProgress[String(j)] === 'done').every(Boolean)
                    const isLoading = loadingKey === `${ch.num}:${i}`
                    const isClickable = isDone || isNext

                    return (
                      <div
                        key={i}
                        onClick={() => { if (isClickable && !isLoading) onQuestComplete(ch.num, i) }}
                        style={{
                          display: 'flex', alignItems: sec.hint ? 'flex-start' : 'center', gap: 12,
                          padding: '11px 16px', borderRadius: 10,
                          background: isNext ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${isNext ? 'rgba(255,255,255,0.12)' : 'var(--mq-stroke-soft)'}`,
                          cursor: isClickable && !isLoading ? 'pointer' : 'default',
                          transition: 'all 0.15s',
                          opacity: isLoading ? 0.5 : 1,
                        }}>
                        {/* Status circle */}
                        <div style={{
                          width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: isDone ? 'rgba(255,255,255,0.10)' : isNext ? 'var(--mq-border)' : 'var(--mq-card-bg)',
                          border: `1.5px solid ${isDone ? 'rgba(255,255,255,0.25)' : isNext ? 'rgba(255,255,255,0.20)' : 'var(--mq-border)'}`,
                          fontSize: 10,
                        }}>
                          {isLoading ? <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9 }}>…</span>
                            : isDone ? <span style={{ color: 'rgba(255,255,255,0.55)' }}>✓</span>
                            : isNext ? <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 800, fontSize: 9 }}>→</span>
                            : <span style={{ color: 'rgba(255,255,255,0.20)', fontSize: 9 }}>{i + 1}</span>}
                        </div>

                        {/* Text */}
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: 13, fontWeight: isNext ? 600 : 400,
                            color: isDone ? 'rgba(255,255,255,0.50)' : isNext ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.65)',
                          }}>{sec.text}</div>
                          {sec.hint && (
                            <div style={{
                              fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4,
                              lineHeight: 1.45, fontStyle: 'italic',
                            }}>
                              {sec.hint}
                            </div>
                          )}
                          {isNext && !isLoading && (
                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                              Cliquer pour valider
                            </div>
                          )}
                          {isDone && (
                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.30)', marginTop: 2 }}>
                              Cliquer pour annuler
                            </div>
                          )}
                        </div>

                        {/* Difficulty */}
                        <span style={{
                          fontSize: 9, fontWeight: 600, flexShrink: 0,
                          padding: '2px 7px', borderRadius: 99,
                          background: 'var(--mq-stroke-soft)',
                          color: 'var(--mq-text-muted)',
                        }}>
                          {sec.difficulty === 'hard' ? 'difficile' : sec.difficulty === 'medium' ? 'moyen' : 'facile'}
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
}
