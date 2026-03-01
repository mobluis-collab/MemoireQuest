'use client'

import { useState } from 'react'

const C = {
  indigo: '#6366f1', sky: '#38bdf8', violet: '#a78bfa',
  emerald: '#34d399', amber: '#fbbf24', rose: '#fb7185',
}
const FONT = "-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif"

interface Section {
  text: string
  difficulty: 'easy' | 'medium' | 'hard'
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

function diffColor(d: 'easy' | 'medium' | 'hard') {
  return d === 'hard' ? C.rose : d === 'medium' ? C.amber : C.emerald
}
function diffLabel(d: 'easy' | 'medium' | 'hard') {
  return d === 'hard' ? '🔥 Difficile' : d === 'medium' ? '⚡ Moyen' : '✦ Facile'
}

export default function MemoireView({ chapters, questProgress, loadingKey, onQuestComplete }: MemoireViewProps) {
  const [openChapter, setOpenChapter] = useState<string | null>(chapters[0]?.num ?? null)

  const totalSec = chapters.reduce((a, c) => a + c.sections, 0)
  const doneSec  = chapters.reduce((a, c) => a + c.done, 0)
  const globalPct = totalSec > 0 ? Math.round((doneSec / totalSec) * 100) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h1 style={{
            fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', margin: 0,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.95), rgba(255,255,255,0.6))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Mon mémoire</h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>
            {doneSec} / {totalSec} sections terminées · {globalPct}% complété
          </p>
        </div>
        {/* Global progress bar */}
        <div style={{ width: 200 }}>
          <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${globalPct}%`, borderRadius: 99,
              background: `linear-gradient(90deg, ${C.indigo}, ${C.sky})`,
              boxShadow: `0 0 12px ${C.indigo}88`,
              transition: 'width 0.8s cubic-bezier(.4,0,.2,1)',
            }} />
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4, textAlign: 'right' }}>
            {globalPct}% global
          </div>
        </div>
      </div>

      {/* Chapters list */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4 }}>
        {chapters.map(ch => {
          const isOpen = openChapter === ch.num
          const pct = ch.sections > 0 ? Math.round((ch.done / ch.sections) * 100) : 0
          const done = pct === 100, wip = pct > 0 && !done
          const statusColor = done ? C.emerald : wip ? C.sky : 'rgba(255,255,255,0.25)'
          const chProgress = questProgress[ch.num] ?? {}

          return (
            <div key={ch.num} style={{
              borderRadius: 14,
              border: `1px solid ${done ? 'rgba(52,211,153,0.35)' : wip ? 'rgba(56,189,248,0.28)' : 'rgba(255,255,255,0.1)'}`,
              background: done ? 'rgba(52,211,153,0.04)' : wip ? 'rgba(56,189,248,0.04)' : 'rgba(255,255,255,0.025)',
              backdropFilter: 'blur(16px)',
              overflow: 'hidden',
              transition: 'border-color 0.2s',
            }}>
              {/* Chapter header — clickable */}
              <div
                onClick={() => setOpenChapter(isOpen ? null : ch.num)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 20px', cursor: 'pointer',
                  transition: 'background 0.15s',
                }}>
                {/* Num badge */}
                <div style={{
                  width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done
                    ? 'rgba(52,211,153,0.15)'
                    : wip ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.07)',
                  border: `1px solid ${statusColor}44`,
                  fontSize: 11, fontWeight: 800, color: statusColor, fontFamily: FONT,
                }}>{ch.num}</div>

                {/* Title + objective */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 600, color: done ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.9)',
                    textDecoration: done ? 'line-through' : 'none',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{ch.title}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {ch.done}/{ch.sections} sections
                  </div>
                </div>

                {/* Progress bar + status */}
                <div style={{ width: 120, flexShrink: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>
                      {done ? '✓ Terminé' : wip ? 'En cours' : 'À faire'}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: statusColor }}>{pct}%</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`, borderRadius: 99,
                      background: done
                        ? `linear-gradient(90deg, ${C.emerald}, rgba(52,211,153,0.7))`
                        : `linear-gradient(90deg, ${C.indigo}, ${C.sky})`,
                      boxShadow: `0 0 8px ${statusColor}66`,
                      transition: 'width 0.8s cubic-bezier(.4,0,.2,1)',
                    }} />
                  </div>
                </div>

                {/* Chevron */}
                <div style={{
                  fontSize: 12, color: 'rgba(255,255,255,0.35)',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  flexShrink: 0,
                }}>▾</div>
              </div>

              {/* Sections list — collapsible */}
              {isOpen && (
                <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 8 }} />
                  {ch.sectionList.map((sec, i) => {
                    const isDone = chProgress[String(i)] === 'done'
                    const isNext = !isDone && Array.from({ length: i }, (_, j) => chProgress[String(j)] === 'done').every(Boolean)
                    const isLoading = loadingKey === `${ch.num}:${i}`

                    return (
                      <div
                        key={i}
                        onClick={() => { if (isNext && !isLoading) onQuestComplete(ch.num, i) }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '11px 16px', borderRadius: 11,
                          background: isDone
                            ? 'rgba(52,211,153,0.06)'
                            : isNext ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${isDone ? 'rgba(52,211,153,0.22)' : isNext ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.07)'}`,
                          cursor: isNext && !isLoading ? 'pointer' : 'default',
                          transition: 'all 0.15s',
                          boxShadow: isNext ? '0 0 18px rgba(99,102,241,0.15)' : 'none',
                          opacity: isLoading ? 0.6 : 1,
                        }}>
                        {/* Status circle */}
                        <div style={{
                          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: isDone ? 'rgba(52,211,153,0.2)' : isNext ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.06)',
                          border: `1px solid ${isDone ? 'rgba(52,211,153,0.5)' : isNext ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.12)'}`,
                          fontSize: 10,
                        }}>
                          {isLoading ? <span style={{ color: C.indigo, fontSize: 9 }}>…</span>
                            : isDone ? <span style={{ color: C.emerald, fontSize: 11 }}>✓</span>
                            : isNext ? <span style={{ color: C.indigo, fontWeight: 800, fontSize: 9 }}>▶</span>
                            : <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9 }}>{i + 1}</span>}
                        </div>

                        {/* Text */}
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: 13, fontWeight: isNext ? 600 : 400,
                            color: isDone ? 'rgba(255,255,255,0.38)' : isNext ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)',
                            textDecoration: isDone ? 'line-through' : 'none',
                          }}>{sec.text}</div>
                          {isNext && !isLoading && (
                            <div style={{ fontSize: 10, color: 'rgba(99,102,241,0.9)', marginTop: 2, fontWeight: 600 }}>
                              Cliquer pour valider cette section ↗
                            </div>
                          )}
                        </div>

                        {/* Difficulty */}
                        <span style={{
                          fontSize: 10, fontWeight: 600, flexShrink: 0,
                          padding: '3px 8px', borderRadius: 99,
                          background: `${diffColor(sec.difficulty)}15`,
                          color: diffColor(sec.difficulty),
                          border: `1px solid ${diffColor(sec.difficulty)}30`,
                        }}>
                          {diffLabel(sec.difficulty)}
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
