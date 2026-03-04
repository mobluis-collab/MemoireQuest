'use client'

import { hexToRgba } from '@/lib/color-utils'

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
  deadlineDate: Date
  accentColor?: string
}

const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 864e5)

function StatPill({ label, value, sub, highlightColor }: { label: string; value: string; sub?: string; highlightColor?: string }) {
  return (
    <div style={{
      flex: 1, padding: '14px 16px', borderRadius: 14,
      background: 'var(--mq-card-bg)',
      border: '1px solid var(--mq-border)',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 9, color: 'var(--mq-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: highlightColor ?? 'var(--mq-text-primary)', letterSpacing: '-1px' }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

export default function ProgressionView({ chapters, totalPoints, streak, startDate, deadlineDate, accentColor = '#7C3AED' }: ProgressionViewProps) {
  const today = new Date()
  const total     = daysBetween(startDate, deadlineDate)
  const elapsed   = Math.min(Math.max(daysBetween(startDate, today), 0), total)
  const remaining = Math.max(total - elapsed, 0)
  const timePct   = total > 0 ? Math.round((elapsed / total) * 100) : 0

  const totalSec  = chapters.reduce((a, c) => a + c.sections, 0)
  const doneSec   = chapters.reduce((a, c) => a + c.done, 0)
  const globalPct = totalSec > 0 ? Math.round((doneSec / totalSec) * 100) : 0

  const easyTotal  = chapters.flatMap(c => c.sectionList).filter(s => s.difficulty === 'easy').length
  const medTotal   = chapters.flatMap(c => c.sectionList).filter(s => s.difficulty === 'medium').length
  const hardTotal  = chapters.flatMap(c => c.sectionList).filter(s => s.difficulty === 'hard').length

  const daysElapsed = Math.max(elapsed, 1)
  const ratePerDay  = doneSec / daysElapsed
  const remaining_sec = totalSec - doneSec
  const daysToFinish  = ratePerDay > 0 ? Math.ceil(remaining_sec / ratePerDay) : null
  const estimatedDate = daysToFinish !== null
    ? new Date(today.getTime() + daysToFinish * 864e5).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null
  const willFinishBeforeDeadline = daysToFinish !== null && daysToFinish < remaining

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const daysAgo = 6 - i
    return daysAgo < streak.current
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ flexShrink: 0, marginBottom: 12 }}>
        <h1 style={{
          fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', margin: 0,
          color: 'rgba(255,255,255,0.90)',
        }}>Progression</h1>
        <p style={{ fontSize: 13, color: 'var(--mq-text-muted)', marginTop: 6 }}>
          Vue d&apos;ensemble de ton avancement
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 8 }}>
          <StatPill label="Complété" value={`${globalPct}%`} sub={`${doneSec}/${totalSec} sections`} highlightColor={accentColor} />
          <StatPill label="Temps" value={`${timePct}%`} sub={`${remaining} jours restants`} />
          <StatPill label="Points" value={String(totalPoints)} highlightColor={accentColor} />
          <StatPill label="Régularité" value={`${streak.current}j`} sub="de suite" />
        </div>

        {/* Pace prediction */}
        {estimatedDate && (
          <div style={{
            padding: '14px 20px', borderRadius: 12,
            background: 'var(--mq-card-bg)',
            border: '1px solid var(--mq-border)',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.70)' }}>
              {willFinishBeforeDeadline
                ? 'À ce rythme, tu finiras avant la deadline.'
                : 'À ce rythme, tu ne finiras pas avant la deadline.'}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>
              Fin estimée : <strong style={{ color: 'rgba(255,255,255,0.60)' }}>{estimatedDate}</strong>
            </div>
          </div>
        )}

        {/* Per-chapter progress */}
        <div style={{
          padding: '18px 20px', borderRadius: 12,
          background: 'var(--mq-card-bg)',
          border: '1px solid var(--mq-border)',
        }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 600, letterSpacing: '0.3px', marginBottom: 16 }}>
            Par chapitre
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {chapters.map(ch => {
              const pct = ch.sections > 0 ? Math.round((ch.done / ch.sections) * 100) : 0
              const done = pct === 100
              return (
                <div key={ch.num}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontSize: 10, color: 'rgba(255,255,255,0.30)', fontWeight: 600,
                        whiteSpace: 'nowrap', maxWidth: 52, overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>{ch.num}</span>
                      <span style={{
                        fontSize: 12, fontWeight: 500,
                        color: done ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.75)',
                      }}>{ch.title}</span>
                      {done && <span style={{ fontSize: 11, color: 'var(--mq-text-muted)' }}>✓</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{ch.done}/{ch.sections}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: accentColor, minWidth: 32, textAlign: 'right' }}>{pct}%</span>
                    </div>
                  </div>
                  <div style={{ height: 4, borderRadius: 99, background: 'var(--mq-stroke-soft)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`, borderRadius: 99,
                      background: accentColor,
                      transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Difficulty + Streak */}
        <div style={{ display: 'flex', gap: 10 }}>

          {/* Difficulty */}
          <div style={{
            flex: 1, padding: '18px 20px', borderRadius: 12,
            background: 'var(--mq-card-bg)',
            border: '1px solid var(--mq-border)',
          }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 600, letterSpacing: '0.3px', marginBottom: 14 }}>
              Par difficulté
            </div>
            {[
              { label: 'Facile', total: easyTotal },
              { label: 'Moyen', total: medTotal },
              { label: 'Difficile', total: hardTotal },
            ].map(d => (
              <div key={d.label} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.50)' }}>{d.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.60)' }}>{d.total}</span>
                </div>
                <div style={{ height: 4, borderRadius: 99, background: 'var(--mq-stroke-soft)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: totalSec > 0 ? `${Math.round((d.total / totalSec) * 100)}%` : '0%',
                    borderRadius: 99,
                    background: hexToRgba(accentColor, 0.6),
                    transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Streak */}
          <div style={{
            flex: 1, padding: '18px 20px', borderRadius: 12,
            background: 'var(--mq-card-bg)',
            border: '1px solid var(--mq-border)',
          }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 600, letterSpacing: '0.3px', marginBottom: 14 }}>
              7 derniers jours
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {last7.map((active, i) => {
                const isToday = i === 6
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <div style={{
                      width: '100%', aspectRatio: '1', borderRadius: 6,
                      background: active
                        ? isToday ? hexToRgba(accentColor, 0.5) : hexToRgba(accentColor, 0.25)
                        : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${active ? hexToRgba(accentColor, 0.3) : 'var(--mq-stroke-soft)'}`,
                    }} />
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.30)', fontWeight: 500 }}>
                      {['L', 'M', 'M', 'J', 'V', 'S', 'D'][(new Date().getDay() + i - 6 + 7) % 7]}
                    </span>
                  </div>
                )
              })}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)' }}>
              {streak.current === 0
                ? "Commence aujourd'hui."
                : `${streak.current} jour${streak.current > 1 ? 's' : ''} de suite.`}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
