'use client'

import { useState } from 'react'
import { tw, bg } from '@/lib/color-utils'

interface ChapterData {
  num: string
  title: string
  sections: number
  done: number
  sectionList: Array<{ text: string; difficulty: 'easy' | 'medium' | 'hard' }>
}

interface ProgressionViewProps {
  chapters: ChapterData[]
  totalPoints: number
  streak: { current: number; jokers: number }
  startDate: Date
  deadlineDate?: Date
  accentColor?: string
  textIntensity?: number
  isDark?: boolean
}

const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 864e5)

export default function ProgressionView({ chapters, totalPoints, streak, startDate, deadlineDate, accentColor = '#6366f1', textIntensity = 1.0, isDark = true }: ProgressionViewProps) {
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null)

  const today = new Date()
  const hasDeadline = !!deadlineDate
  const total     = hasDeadline ? daysBetween(startDate, deadlineDate) : 0
  const elapsed   = hasDeadline ? Math.min(Math.max(daysBetween(startDate, today), 0), total) : 0
  const remaining = hasDeadline ? Math.max(total - elapsed, 0) : 0
  const timePct   = hasDeadline && total > 0 ? Math.round((elapsed / total) * 100) : 0

  const totalSec  = chapters.reduce((a, c) => a + c.sections, 0)
  const doneSec   = chapters.reduce((a, c) => a + c.done, 0)
  const globalPct = totalSec > 0 ? Math.round((doneSec / totalSec) * 100) : 0

  const easyTotal  = chapters.flatMap(c => c.sectionList).filter(s => s.difficulty === 'easy').length
  const medTotal   = chapters.flatMap(c => c.sectionList).filter(s => s.difficulty === 'medium').length
  const hardTotal  = chapters.flatMap(c => c.sectionList).filter(s => s.difficulty === 'hard').length

  const daysElapsed = Math.max(elapsed, 1)
  const ratePerDay  = doneSec / daysElapsed
  const remaining_sec = totalSec - doneSec
  const daysToFinish  = hasDeadline && ratePerDay > 0 ? Math.ceil(remaining_sec / ratePerDay) : null
  const estimatedDate = daysToFinish !== null
    ? new Date(today.getTime() + daysToFinish * 864e5).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null
  const willFinishBeforeDeadline = hasDeadline && daysToFinish !== null && daysToFinish < remaining

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const daysAgo = 6 - i
    return daysAgo < streak.current
  })

  const selectedCh = selectedChapter ? chapters.find(c => c.num === selectedChapter) : null

  return (
    <>
      {/* ─── Main 2x2 grid ─── */}
      <div style={{
        height: '100%',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 10,
        padding: 16,
      }}>

        {/* ═══ TOP-LEFT: Stats pills (2x2 sub-grid) ═══ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          padding: 14,
          borderRadius: 12,
          background: 'var(--mq-card-bg)',
          border: '1px solid var(--mq-border)',
          alignContent: 'center',
        }}>
          {/* Complété */}
          <div style={{ textAlign: 'center', padding: '8px 6px' }}>
            <div style={{ fontSize: 10, color: 'var(--mq-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 3 }}>Compl{'\u00E9'}t{'\u00E9'}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--mq-text-primary)', letterSpacing: '-1px' }}>{globalPct}%</div>
            <div style={{ fontSize: 9, color: tw(0.35, textIntensity, isDark), marginTop: 2 }}>{doneSec}/{totalSec} sections</div>
          </div>
          {/* Temps */}
          <div style={{ textAlign: 'center', padding: '8px 6px' }}>
            <div style={{ fontSize: 10, color: 'var(--mq-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 3 }}>Temps</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--mq-text-primary)', letterSpacing: '-1px' }}>{hasDeadline ? `${timePct}%` : '\u2014'}</div>
            <div style={{ fontSize: 9, color: tw(0.35, textIntensity, isDark), marginTop: 2 }}>{hasDeadline ? `${remaining} jours restants` : 'Aucune deadline'}</div>
          </div>
          {/* Points */}
          <div style={{ textAlign: 'center', padding: '8px 6px' }}>
            <div style={{ fontSize: 10, color: 'var(--mq-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 3 }}>Points</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--mq-text-primary)', letterSpacing: '-1px' }}>{totalPoints}</div>
          </div>
          {/* Régularité */}
          <div style={{ textAlign: 'center', padding: '8px 6px' }}>
            <div style={{ fontSize: 10, color: 'var(--mq-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 3 }}>R{'\u00E9'}gularit{'\u00E9'}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--mq-text-primary)', letterSpacing: '-1px' }}>{streak.current}j</div>
            <div style={{ fontSize: 9, color: tw(0.35, textIntensity, isDark), marginTop: 2 }}>de suite</div>
          </div>
        </div>

        {/* ═══ TOP-RIGHT: Prediction section ═══ */}
        <div style={{
          padding: 14,
          borderRadius: 12,
          background: 'var(--mq-card-bg)',
          border: '1px solid var(--mq-border)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 8,
          overflow: 'hidden',
        }}>
          <div style={{ fontSize: 10, color: 'var(--mq-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Pr{'\u00E9'}diction de rythme
          </div>
          {hasDeadline && estimatedDate ? (
            <>
              <div style={{ fontSize: 12, fontWeight: 500, color: tw(0.70, textIntensity, isDark), lineHeight: '1.4' }}>
                {willFinishBeforeDeadline
                  ? '\u00C0 ce rythme, tu finiras avant la deadline.'
                  : '\u00C0 ce rythme, tu ne finiras pas avant la deadline.'}
              </div>
              <div style={{ fontSize: 10, color: tw(0.35, textIntensity, isDark) }}>
                Fin estim{'\u00E9'}e : <strong style={{ color: tw(0.60, textIntensity, isDark) }}>{estimatedDate}</strong>
              </div>
              <div style={{ fontSize: 10, color: tw(0.30, textIntensity, isDark) }}>
                Rythme : {ratePerDay.toFixed(1)} section{ratePerDay > 1 ? 's' : ''}/jour
              </div>
              <div style={{ marginTop: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 9, color: tw(0.30, textIntensity, isDark) }}>Temps {'\u00E9'}coul{'\u00E9'}</span>
                  <span style={{ fontSize: 9, color: tw(0.40, textIntensity, isDark), fontWeight: 600 }}>{timePct}%</span>
                </div>
                <div style={{ height: 3, borderRadius: 99, background: bg(0.06, isDark), overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${timePct}%`, borderRadius: 99, background: accentColor, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 12, fontWeight: 500, color: tw(0.50, textIntensity, isDark), lineHeight: '1.4' }}>
                Aucune deadline d{'\u00E9'}tect{'\u00E9'}e dans ton cahier des charges
              </div>
              <div style={{ fontSize: 10, color: tw(0.30, textIntensity, isDark), lineHeight: '1.4' }}>
                Ajoute une deadline pour obtenir une estimation de rythme.
              </div>
            </>
          )}
        </div>

        {/* ═══ BOTTOM-LEFT: Chapters (compact bars) ═══ */}
        <div style={{
          padding: 14,
          borderRadius: 12,
          background: 'var(--mq-card-bg)',
          border: '1px solid var(--mq-border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{ fontSize: 10, color: 'var(--mq-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10, flexShrink: 0 }}>
            Par chapitre
          </div>
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: 2 }}>
            {chapters.map(ch => {
              const pct = ch.sections > 0 ? Math.round((ch.done / ch.sections) * 100) : 0
              return (
                <div
                  key={ch.num}
                  onClick={() => setSelectedChapter(ch.num)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
                    cursor: 'pointer', borderRadius: 4, padding: '3px 4px',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = bg(0.04, isDark) }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                >
                  <span style={{ fontSize: 10, color: tw(0.30, textIntensity, isDark), width: 24, flexShrink: 0, fontWeight: 600 }}>{ch.num}</span>
                  <div style={{ flex: 1, height: 4, borderRadius: 99, background: bg(0.06, isDark), overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: accentColor, transition: 'width 0.6s ease' }} />
                  </div>
                  <span style={{ fontSize: 10, color: tw(0.40, textIntensity, isDark), width: 28, textAlign: 'right', flexShrink: 0, fontWeight: 500 }}>{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ═══ BOTTOM-RIGHT: Streak + Difficulty (merged) ═══ */}
        <div style={{
          padding: 14,
          borderRadius: 12,
          background: 'var(--mq-card-bg)',
          border: '1px solid var(--mq-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          overflow: 'hidden',
        }}>
          {/* Streak section */}
          <div>
            <div style={{ fontSize: 10, color: 'var(--mq-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
              7 derniers jours
            </div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
              {last7.map((active, i) => {
                const isToday = i === 6
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <div style={{
                      width: '100%', aspectRatio: '1', borderRadius: 4,
                      background: active
                        ? isToday ? bg(0.15, isDark) : bg(0.08, isDark)
                        : bg(0.04, isDark),
                      border: `1px solid ${active ? bg(0.10, isDark) : 'var(--mq-stroke-soft)'}`,
                    }} />
                    <span style={{ fontSize: 8, color: tw(0.30, textIntensity, isDark), fontWeight: 500 }}>
                      {['L', 'M', 'M', 'J', 'V', 'S', 'D'][(new Date().getDay() + i - 6 + 7) % 7]}
                    </span>
                  </div>
                )
              })}
            </div>
            <div style={{ fontSize: 10, color: tw(0.50, textIntensity, isDark) }}>
              {streak.current === 0
                ? "Commence aujourd'hui."
                : `${streak.current} jour${streak.current > 1 ? 's' : ''} de suite.`}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: bg(0.06, isDark), flexShrink: 0 }} />

          {/* Difficulty section */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 10, color: 'var(--mq-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
              Par difficult{'\u00E9'}
            </div>
            {[
              { label: 'Facile', total: easyTotal },
              { label: 'Moyen', total: medTotal },
              { label: 'Difficile', total: hardTotal },
            ].map(d => (
              <div key={d.label} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 10, color: tw(0.50, textIntensity, isDark) }}>{d.label}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: tw(0.60, textIntensity, isDark) }}>{d.total}</span>
                </div>
                <div style={{ height: 3, borderRadius: 99, background: bg(0.06, isDark), overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: totalSec > 0 ? `${Math.round((d.total / totalSec) * 100)}%` : '0%',
                    borderRadius: 99,
                    background: accentColor,
                    transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ─── Chapter overlay ─── */}
      {selectedChapter && selectedCh && (
        <div
          onClick={() => setSelectedChapter(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.60)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'mqOverlayIn 0.2s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: 420, maxHeight: '80vh', overflowY: 'auto',
              background: 'var(--mq-card-bg)',
              border: '1px solid var(--mq-border)',
              borderRadius: 16, padding: 24,
              animation: 'mqCardIn 0.25s ease',
            }}
          >
            {/* Close button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 10, color: tw(0.30, textIntensity, isDark), fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>
                  Chapitre {selectedCh.num}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: tw(0.85, textIntensity, isDark), letterSpacing: '-0.3px' }}>
                  {selectedCh.title}
                </div>
              </div>
              <button
                onClick={() => setSelectedChapter(null)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 18, color: tw(0.40, textIntensity, isDark),
                  padding: '4px 8px', borderRadius: 6,
                  lineHeight: 1,
                }}
              >
                {'\u2715'}
              </button>
            </div>

            {/* Progress summary */}
            <div style={{
              display: 'flex', gap: 12, marginBottom: 18,
              padding: '12px 14px', borderRadius: 10,
              background: bg(0.03, isDark),
              border: `1px solid ${bg(0.06, isDark)}`,
            }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: tw(0.85, textIntensity, isDark) }}>
                  {selectedCh.sections > 0 ? Math.round((selectedCh.done / selectedCh.sections) * 100) : 0}%
                </div>
                <div style={{ fontSize: 9, color: tw(0.35, textIntensity, isDark), marginTop: 2 }}>Compl{'\u00E9'}t{'\u00E9'}</div>
              </div>
              <div style={{ width: 1, background: bg(0.06, isDark) }} />
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: tw(0.85, textIntensity, isDark) }}>
                  {selectedCh.done}/{selectedCh.sections}
                </div>
                <div style={{ fontSize: 9, color: tw(0.35, textIntensity, isDark), marginTop: 2 }}>Sections</div>
              </div>
            </div>

            {/* Full progress bar */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ height: 6, borderRadius: 99, background: bg(0.06, isDark), overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${selectedCh.sections > 0 ? Math.round((selectedCh.done / selectedCh.sections) * 100) : 0}%`,
                  borderRadius: 99,
                  background: accentColor,
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>

            {/* Section list */}
            <div style={{ fontSize: 10, color: tw(0.30, textIntensity, isDark), fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
              Sections
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {selectedCh.sectionList.map((sec, idx) => {
                const isDone = idx < selectedCh.done
                const diffColors: Record<string, string> = { easy: tw(0.35, textIntensity, isDark), medium: tw(0.45, textIntensity, isDark), hard: tw(0.55, textIntensity, isDark) }
                const diffLabels: Record<string, string> = { easy: 'Facile', medium: 'Moyen', hard: 'Difficile' }
                return (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 8,
                    background: isDone ? bg(0.03, isDark) : 'transparent',
                    border: `1px solid ${isDone ? bg(0.06, isDark) : bg(0.04, isDark)}`,
                    opacity: isDone ? 0.65 : 1,
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: 4,
                      border: `1.5px solid ${isDone ? tw(0.30, textIntensity, isDark) : bg(0.12, isDark)}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: tw(0.40, textIntensity, isDark),
                      flexShrink: 0,
                    }}>
                      {isDone ? '\u2713' : ''}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 11, fontWeight: 500,
                        color: isDone ? tw(0.40, textIntensity, isDark) : tw(0.75, textIntensity, isDark),
                        textDecoration: isDone ? 'line-through' : 'none',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {sec.text}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 9, fontWeight: 600,
                      color: diffColors[sec.difficulty],
                      flexShrink: 0,
                    }}>
                      {diffLabels[sec.difficulty]}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes mqOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes mqCardIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  )
}
