'use client'

const C = {
  indigo: '#6366f1', sky: '#38bdf8', violet: '#a78bfa',
  emerald: '#34d399', amber: '#fbbf24', rose: '#fb7185',
}
const FONT = "-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif"

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
}

const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 864e5)

function StatPill({ label, value, color, sub }: { label: string; value: string; color: string; sub?: string }) {
  return (
    <div style={{
      flex: 1, padding: '14px 16px', borderRadius: 14,
      background: `${color}0d`,
      border: `1px solid ${color}30`,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-1px', textShadow: `0 0 20px ${color}66` }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

export default function ProgressionView({ chapters, totalPoints, streak, startDate, deadlineDate }: ProgressionViewProps) {
  const today = new Date()
  const total     = daysBetween(startDate, deadlineDate)
  const elapsed   = Math.min(Math.max(daysBetween(startDate, today), 0), total)
  const remaining = Math.max(total - elapsed, 0)
  const timePct   = total > 0 ? Math.round((elapsed / total) * 100) : 0

  const totalSec  = chapters.reduce((a, c) => a + c.sections, 0)
  const doneSec   = chapters.reduce((a, c) => a + c.done, 0)
  const globalPct = totalSec > 0 ? Math.round((doneSec / totalSec) * 100) : 0

  // Difficulty breakdown
  const allSections = chapters.flatMap(ch => ch.sectionList.map((s, i) => ({
    ...s,
    done: (ch as unknown as { questProgress?: Record<string, 'done'> }).questProgress?.[String(i)] === 'done',
  })))

  const easyTotal  = chapters.flatMap(c => c.sectionList).filter(s => s.difficulty === 'easy').length
  const medTotal   = chapters.flatMap(c => c.sectionList).filter(s => s.difficulty === 'medium').length
  const hardTotal  = chapters.flatMap(c => c.sectionList).filter(s => s.difficulty === 'hard').length

  // Pace estimation
  const daysElapsed = Math.max(elapsed, 1)
  const ratePerDay  = doneSec / daysElapsed
  const remaining_sec = totalSec - doneSec
  const daysToFinish  = ratePerDay > 0 ? Math.ceil(remaining_sec / ratePerDay) : null
  const estimatedDate = daysToFinish !== null
    ? new Date(today.getTime() + daysToFinish * 864e5).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null
  const willFinishBeforeDeadline = daysToFinish !== null && daysToFinish < remaining

  // Last 7 day streak simulation (streak.current tells how many consecutive days)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const daysAgo = 6 - i
    return daysAgo < streak.current
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ flexShrink: 0 }}>
        <h1 style={{
          fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', margin: 0,
          background: 'linear-gradient(90deg, rgba(255,255,255,0.95), rgba(255,255,255,0.6))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>Progression</h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>
          Vue d'ensemble de ton avancement sur le mémoire
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Top stats row */}
        <div style={{ display: 'flex', gap: 10 }}>
          <StatPill label="Complété" value={`${globalPct}%`} color={C.indigo} sub={`${doneSec}/${totalSec} sections`} />
          <StatPill label="Temps écoulé" value={`${timePct}%`} color={C.sky} sub={`${remaining} jours restants`} />
          <StatPill label="XP Total" value={String(totalPoints)} color={C.violet} sub="points gagnés" />
          <StatPill label="Série" value={`${streak.current}j`} color={C.amber} sub={`${streak.jokers} jokers`} />
        </div>

        {/* Pace prediction */}
        {estimatedDate && (
          <div style={{
            padding: '14px 20px', borderRadius: 14,
            background: willFinishBeforeDeadline ? 'rgba(52,211,153,0.07)' : 'rgba(251,113,133,0.07)',
            border: `1px solid ${willFinishBeforeDeadline ? 'rgba(52,211,153,0.3)' : 'rgba(251,113,133,0.3)'}`,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ fontSize: 28 }}>{willFinishBeforeDeadline ? '🟢' : '🔴'}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: willFinishBeforeDeadline ? C.emerald : C.rose }}>
                {willFinishBeforeDeadline
                  ? `À ce rythme tu finiras avant la deadline 🎉`
                  : `À ce rythme tu ne finiras pas avant la deadline ⚠️`}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>
                Fin estimée : <strong style={{ color: 'rgba(255,255,255,0.8)' }}>{estimatedDate}</strong>
                {' · '}Rythme actuel : <strong style={{ color: 'rgba(255,255,255,0.8)' }}>{ratePerDay.toFixed(2)} section/jour</strong>
              </div>
            </div>
          </div>
        )}

        {/* Per-chapter progress bars */}
        <div style={{
          padding: '18px 20px', borderRadius: 14,
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 16 }}>
            Par chapitre
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {chapters.map(ch => {
              const pct = ch.sections > 0 ? Math.round((ch.done / ch.sections) * 100) : 0
              const done = pct === 100, wip = pct > 0 && !done
              const barColor = done ? C.emerald : wip ? C.indigo : 'rgba(255,255,255,0.15)'
              return (
                <div key={ch.num}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 700, width: 20 }}>{ch.num}</span>
                      <span style={{
                        fontSize: 12, fontWeight: done ? 400 : 500,
                        color: done ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.85)',
                        textDecoration: done ? 'line-through' : 'none',
                      }}>{ch.title}</span>
                      {done && <span style={{ fontSize: 10, color: C.emerald }}>✓</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{ch.done}/{ch.sections}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: barColor, minWidth: 32, textAlign: 'right' }}>{pct}%</span>
                    </div>
                  </div>
                  <div style={{ height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      borderRadius: 99,
                      background: done
                        ? `linear-gradient(90deg, ${C.emerald}, rgba(52,211,153,0.7))`
                        : wip
                          ? `linear-gradient(90deg, ${C.indigo}, ${C.sky})`
                          : 'rgba(255,255,255,0.15)',
                      boxShadow: (done || wip) ? `0 0 8px ${barColor}66` : 'none',
                      transition: 'width 0.8s cubic-bezier(.4,0,.2,1)',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Difficulty breakdown + Streak heatmap side by side */}
        <div style={{ display: 'flex', gap: 12 }}>

          {/* Difficulty breakdown */}
          <div style={{
            flex: 1, padding: '18px 20px', borderRadius: 14,
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>
              Répartition par difficulté
            </div>
            {[
              { label: '✦ Facile', total: easyTotal, color: C.emerald },
              { label: '⚡ Moyen', total: medTotal,  color: C.amber },
              { label: '🔥 Difficile', total: hardTotal, color: C.rose },
            ].map(d => (
              <div key={d.label} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>{d.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: d.color }}>{d.total} sections</span>
                </div>
                <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: totalSec > 0 ? `${Math.round((d.total / totalSec) * 100)}%` : '0%',
                    borderRadius: 99,
                    background: d.color,
                    boxShadow: `0 0 8px ${d.color}66`,
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Streak last 7 days */}
          <div style={{
            flex: 1, padding: '18px 20px', borderRadius: 14,
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>
              Série — 7 derniers jours
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {last7.map((active, i) => {
                const isToday = i === 6
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <div style={{
                      width: '100%', aspectRatio: '1', borderRadius: 8,
                      background: isToday && active
                        ? C.amber
                        : active
                          ? `rgba(251,191,36,0.4)`
                          : 'rgba(255,255,255,0.07)',
                      border: `1px solid ${isToday && active ? C.amber : active ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.1)'}`,
                      boxShadow: isToday && active ? `0 0 12px ${C.amber}66` : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12,
                    }}>
                      {active ? '🔥' : ''}
                    </div>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>
                      {['L', 'M', 'M', 'J', 'V', 'S', 'D'][(new Date().getDay() + i - 6 + 7) % 7]}
                    </span>
                  </div>
                )
              })}
            </div>
            <div style={{
              padding: '10px 12px', borderRadius: 10,
              background: streak.current >= 3 ? 'rgba(251,191,36,0.08)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${streak.current >= 3 ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.08)'}`,
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: streak.current >= 3 ? C.amber : 'rgba(255,255,255,0.5)' }}>
                {streak.current === 0
                  ? 'Lance ta série aujourd\'hui !'
                  : streak.current === 1
                    ? '1 jour de suite — continue demain !'
                    : `${streak.current} jours de suite 🔥`}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>
                {streak.jokers} joker{streak.jokers > 1 ? 's' : ''} disponible{streak.jokers > 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
