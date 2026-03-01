'use client'

import { useState, useMemo, CSSProperties } from 'react'
import type { MemoirePlan, QuestProgress, StreakData } from '@/types/memoir'
import { getLevelProgress } from '@/lib/xp/levels'
import UploadZone from '@/components/dashboard/UploadZone'
import RateLimitWarning from '@/components/ui/RateLimitWarning'

/* ─── Types ───────────────────────────────────────────────────── */
interface User {
  email: string
  user_metadata?: { full_name?: string }
}

interface ChapterData {
  num: string
  title: string
  sections: number
  done: number
  sectionList: Array<{ text: string; difficulty: 'easy' | 'medium' | 'hard' }>
}

export interface NewDashboardProps {
  user: User
  plan: MemoirePlan | null
  questProgress: QuestProgress
  totalPoints: number
  streak: StreakData
  isLoading: boolean
  error: string | null
  planRemaining: number | null
  planCreatedAt?: string
  onUpload: (file: File) => Promise<void>
  onQuestComplete: (chapterNumber: string, sectionIndex: number) => Promise<void>
  loadingKey: string | null
}

/* ─── Palette ─────────────────────────────────────────────────── */
const C = {
  indigo:   '#6366f1',
  indigoDk: '#4338ca',
  sky:      '#38bdf8',
  violet:   '#a78bfa',
  emerald:  '#34d399',
  amber:    '#fbbf24',
  rose:     '#fb7185',
}
const FONT = "-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif"

/* ─── Helpers ─────────────────────────────────────────────────── */
const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 864e5)
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
const fmt = (d: Date, m: 'short' | 'long' = 'short') =>
  d.toLocaleDateString('fr-FR', { day: 'numeric', month: m })

/* ─── Gradient border ─────────────────────────────────────────── */
function GBorder({
  gradient,
  radius = 18,
  children,
  style = {},
}: {
  gradient: string
  radius?: number
  children: React.ReactNode
  style?: CSSProperties
}) {
  return (
    <div style={{ background: gradient, padding: '1px', borderRadius: radius, ...style }}>
      <div style={{ borderRadius: radius - 1, height: '100%', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  )
}

/* ─── Arc SVG ─────────────────────────────────────────────────── */
function Arc({ pct }: { pct: number }) {
  const R = 68, SW = 8, C2 = 86, circ = 2 * Math.PI * R
  const dash = (pct / 100) * circ
  return (
    <svg width={C2 * 2} height={C2 * 2} viewBox={`0 0 ${C2 * 2} ${C2 * 2}`}
      style={{ overflow: 'visible', flexShrink: 0 }}>
      <defs>
        <linearGradient id="ag" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={C.sky} />
          <stop offset="100%" stopColor={C.indigo} />
        </linearGradient>
        <filter id="arcglow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Track — plus visible */}
      <circle cx={C2} cy={C2} r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={SW} />
      <circle cx={C2} cy={C2} r={R} fill="none"
        stroke="url(#ag)" strokeWidth={SW} strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ * 0.25}
        filter="url(#arcglow)"
        style={{ animation: 'mq-arc-in 1.2s cubic-bezier(.4,0,.2,1) both' }} />
      <text x={C2} y={C2 - 10} textAnchor="middle" fill="white"
        fontSize="34" fontWeight="800" fontFamily={FONT} letterSpacing="-1.5">{pct}</text>
      <text x={C2} y={C2 + 14} textAnchor="middle" fill="rgba(255,255,255,0.55)"
        fontSize="12" fontFamily={FONT} fontWeight="500">% terminé</text>
    </svg>
  )
}

/* ─── Dot grid ────────────────────────────────────────────────── */
function DotGrid({ start, deadline }: { start: Date; deadline: Date }) {
  const today = new Date()
  const total   = daysBetween(start, deadline)
  const elapsed = Math.min(daysBetween(start, today), total)
  const COLS = 55
  const rows = Math.ceil(total / COLS)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} style={{ display: 'flex', gap: 2.5 }}>
          {Array.from({ length: COLS }, (_, c) => {
            const i = r * COLS + c
            if (i >= total) return null
            const isElapsed = i < elapsed, isToday = i === elapsed - 1
            return (
              <div key={c} title={fmt(addDays(start, i), 'long')} style={{
                width: 5, height: 5, borderRadius: 1.5, flexShrink: 0,
                background: isToday ? C.amber
                  : isElapsed
                    ? `rgba(99,102,241,${0.45 + (i / elapsed) * 0.45})`
                    /* FIX: future dots much more visible — was 0.09 */
                    : 'rgba(255,255,255,0.2)',
                animation: isToday ? 'mq-pulse-today 2s ease-in-out infinite' : 'none',
                transition: 'background 0.3s',
              }} />
            )
          })}
        </div>
      ))}
    </div>
  )
}

/* ─── Chapter card ────────────────────────────────────────────── */
function ChapterCard({ ch, onClick }: { ch: ChapterData; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const pct  = ch.sections > 0 ? Math.round((ch.done / ch.sections) * 100) : 0
  const done = pct === 100, wip = pct > 0 && !done
  const col  = done ? C.emerald : wip ? C.sky : 'rgba(255,255,255,0.3)'

  /* FIX: fill much more subtle so it doesn't darken text */
  const grd  = done
    ? 'linear-gradient(90deg,rgba(52,211,153,0.0),rgba(52,211,153,0.05))'
    : wip
      ? 'linear-gradient(90deg,rgba(56,189,248,0.0),rgba(99,102,241,0.05))'
      : 'transparent'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        position: 'relative', overflow: 'hidden',
        borderRadius: 13,
        background: hovered
          ? done ? 'rgba(52,211,153,0.09)' : wip ? 'rgba(56,189,248,0.08)' : 'rgba(255,255,255,0.06)'
          : done ? 'rgba(52,211,153,0.05)' : wip ? 'rgba(56,189,248,0.04)' : 'rgba(255,255,255,0.03)',
        /* FIX: borders more visible */
        border: `1px solid ${done ? 'rgba(52,211,153,0.4)' : wip ? 'rgba(56,189,248,0.35)' : 'rgba(255,255,255,0.14)'}`,
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        padding: '10px 16px',
        display: 'flex', alignItems: 'center',
        transition: 'all 0.18s',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered
          ? `0 8px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.07), 0 0 0 1px ${done ? 'rgba(52,211,153,0.2)' : wip ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.05)'}`
          : 'none',
        cursor: 'pointer',
        minHeight: 0,
      }}>
      {/* Liquid fill — very subtle, won't darken text */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`,
        background: grd, pointerEvents: 'none',
        transition: 'width 1s cubic-bezier(.4,0,.2,1)',
      }} />
      {/* Left accent line — thicker and brighter */}
      {(done || wip) && (
        <div style={{
          position: 'absolute', left: 0, top: '15%', bottom: '15%',
          width: 4, borderRadius: '0 3px 3px 0',
          background: col, boxShadow: `0 0 12px ${col}aa`,
        }} />
      )}
      {/* Content */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 700, width: 16, flexShrink: 0 }}>
          {ch.num}
        </span>
        {/* FIX: allow 2-line wrap instead of truncating */}
        <span style={{
          flex: 1, fontSize: 13,
          fontWeight: done ? 400 : wip ? 500 : 400,
          color: done ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.9)',
          textDecoration: done ? 'line-through' : 'none',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: '1.35',
          whiteSpace: 'normal',
        }}>{ch.title}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: col, flexShrink: 0, letterSpacing: '-0.2px' }}>
          {done ? '✓' : wip ? `${ch.done}/${ch.sections}` : '—'}
        </span>
      </div>
    </div>
  )
}

/* ─── Side Panel ──────────────────────────────────────────────── */
function SidePanel({
  ch,
  chapterProgress,
  loadingKey,
  onClose,
  onSectionComplete,
}: {
  ch: ChapterData
  chapterProgress: Record<string, 'done'>
  loadingKey: string | null
  onClose: () => void
  onSectionComplete: (sectionIndex: number) => void
}) {
  const pct  = ch.sections > 0 ? Math.round((ch.done / ch.sections) * 100) : 0
  const R = 28, SW = 5, circ = 2 * Math.PI * R
  const dash = (pct / 100) * circ

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(4,3,14,0.55)',
        backdropFilter: 'blur(4px)',
        animation: 'mq-overlay-in 0.25s ease both',
        cursor: 'pointer',
      }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 400, zIndex: 51,
        display: 'flex', flexDirection: 'column',
        background: 'rgba(10,9,28,0.92)',
        backdropFilter: 'blur(40px) saturate(180%)',
        borderLeft: '1px solid rgba(99,102,241,0.3)',
        animation: 'mq-panel-in 0.3s cubic-bezier(.4,0,.2,1) both',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.5), inset 1px 0 0 rgba(99,102,241,0.15)',
      }}>
        {/* Header */}
        <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
                Chapitre {ch.num}
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px', color: '#fff', lineHeight: 1.2 }}>
                {ch.title}
              </h2>
            </div>
            <button onClick={onClose} style={{
              width: 30, height: 30, borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)',
              fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginTop: 2, transition: 'all 0.15s',
            }}>✕</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16 }}>
            <svg width={70} height={70} viewBox="0 0 70 70" style={{ flexShrink: 0, overflow: 'visible' }}>
              <defs>
                <linearGradient id="pg2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={C.sky} />
                  <stop offset="100%" stopColor={C.indigo} />
                </linearGradient>
                <filter id="glow2">
                  <feGaussianBlur stdDeviation="2" result="b" />
                  <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <circle cx={35} cy={35} r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={SW} />
              <circle cx={35} cy={35} r={R} fill="none" stroke="url(#pg2)" strokeWidth={SW}
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circ}`}
                strokeDashoffset={circ * 0.25}
                filter="url(#glow2)" />
              <text x={35} y={38} textAnchor="middle" fill="white" fontSize="13" fontWeight="800" fontFamily={FONT}>
                {pct}%
              </text>
            </svg>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>Sections terminées</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.sky }}>{ch.done}/{ch.sections}</span>
              </div>
              <div style={{ height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${pct}%`, borderRadius: 99,
                  background: `linear-gradient(90deg,${C.sky},${C.indigo})`,
                  boxShadow: `0 0 8px ${C.sky}66`,
                }} />
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 5 }}>
                {pct === 100 ? '✓ Chapitre terminé'
                  : pct === 0 ? 'Pas encore commencé'
                  : `${ch.sections - ch.done} section${ch.sections - ch.done > 1 ? 's' : ''} restante${ch.sections - ch.done > 1 ? 's' : ''}`}
              </div>
            </div>
          </div>
        </div>

        {/* Sections list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>
            Sections
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ch.sectionList.map((sec, i) => {
              const isDone = chapterProgress[String(i)] === 'done'
              const isNext = !isDone && ch.sectionList.slice(0, i).every((_, j) => chapterProgress[String(j)] === 'done')
              const isLoading = loadingKey === `${ch.num}:${i}`
              return (
                <div key={i}
                  onClick={() => { if (isNext && !isDone) onSectionComplete(i) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 11,
                    background: isDone ? 'rgba(52,211,153,0.07)' : isNext ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isDone ? 'rgba(52,211,153,0.25)' : isNext ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    transition: 'all 0.15s',
                    cursor: isDone ? 'default' : isNext ? 'pointer' : 'default',
                    boxShadow: isNext ? '0 0 20px rgba(99,102,241,0.15)' : 'none',
                    opacity: isLoading ? 0.6 : 1,
                  }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isDone ? 'rgba(52,211,153,0.2)' : isNext ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.08)',
                    border: `1px solid ${isDone ? 'rgba(52,211,153,0.5)' : isNext ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.15)'}`,
                    fontSize: 9,
                  }}>
                    {isLoading
                      ? <span style={{ color: C.indigo, fontSize: 8 }}>…</span>
                      : isDone
                        ? <span style={{ color: C.emerald }}>✓</span>
                        : isNext
                          ? <span style={{ color: C.indigo, fontWeight: 800, fontSize: 8 }}>→</span>
                          : <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 8 }}>{i + 1}</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 13, fontWeight: isNext ? 600 : 400,
                      color: isDone ? 'rgba(255,255,255,0.4)' : isNext ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)',
                      textDecoration: isDone ? 'line-through' : 'none',
                    }}>{sec.text}</div>
                    {isNext && !isDone && (
                      <div style={{ fontSize: 10, color: 'rgba(99,102,241,0.9)', marginTop: 2, fontWeight: 600 }}>
                        Cliquer pour valider ↗
                      </div>
                    )}
                    {isDone && (
                      <div style={{ fontSize: 10, color: 'rgba(52,211,153,0.7)', marginTop: 2 }}>Terminé</div>
                    )}
                  </div>
                  <span style={{
                    fontSize: 9, fontWeight: 700, flexShrink: 0, padding: '2px 6px', borderRadius: 99,
                    background: sec.difficulty === 'hard' ? 'rgba(251,113,133,0.15)' : sec.difficulty === 'medium' ? 'rgba(251,191,36,0.15)' : 'rgba(52,211,153,0.15)',
                    color: sec.difficulty === 'hard' ? C.rose : sec.difficulty === 'medium' ? C.amber : C.emerald,
                  }}>
                    {sec.difficulty === 'hard' ? '🔥' : sec.difficulty === 'medium' ? '⚡' : '✦'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
            Clique sur la prochaine section pour la valider
          </div>
        </div>
      </div>
    </>
  )
}

/* ─── Nav items ───────────────────────────────────────────────── */
const NAV = [
  { icon: '⊞', label: 'Dashboard' },
  { icon: '◎', label: 'Mon mémoire' },
  { icon: '◈', label: 'Progression' },
  { icon: '◇', label: 'Achievements' },
]

/* ─── MAIN COMPONENT ──────────────────────────────────────────── */
export default function NewDashboard({
  user,
  plan,
  questProgress,
  totalPoints,
  streak,
  isLoading,
  error,
  planRemaining,
  planCreatedAt,
  onUpload,
  onQuestComplete,
  loadingKey,
}: NewDashboardProps) {
  const [navIdx, setNavIdx] = useState(0)
  const [selectedCh, setSelectedCh] = useState<ChapterData | null>(null)

  const today = new Date()
  const firstName = user.user_metadata?.full_name?.split(' ')[0] ?? user.email.split('@')[0]
  const firstInitial = firstName.charAt(0).toUpperCase()

  /* ── Dates ── */
  const startDate = useMemo(() => {
    if (planCreatedAt) return new Date(planCreatedAt)
    const d = new Date()
    d.setMonth(d.getMonth() - 3)
    return d
  }, [planCreatedAt])

  const deadlineDate = useMemo(() => {
    const d = new Date(startDate)
    d.setMonth(d.getMonth() + 9)
    return d
  }, [startDate])

  const total     = daysBetween(startDate, deadlineDate)
  const elapsed   = Math.min(Math.max(daysBetween(startDate, today), 0), total)
  const remaining = Math.max(total - elapsed, 0)
  const timePct   = total > 0 ? Math.round((elapsed / total) * 100) : 0

  /* ── Chapter data ── */
  const chapters: ChapterData[] = useMemo(() => {
    if (!plan) return []
    return plan.chapters.map(ch => {
      const chP = questProgress[ch.number] ?? {}
      const done = Object.values(chP).filter(v => v === 'done').length
      return { num: ch.number, title: ch.title, sections: ch.sections.length, done, sectionList: ch.sections }
    })
  }, [plan, questProgress])

  /* ── Stats ── */
  const totalSec     = chapters.reduce((a, c) => a + c.sections, 0)
  const doneSec      = chapters.reduce((a, c) => a + c.done, 0)
  const pct          = totalSec > 0 ? Math.round((doneSec / totalSec) * 100) : 0
  const doneChapters = chapters.filter(c => c.done === c.sections && c.sections > 0).length
  const isAhead      = pct >= timePct
  const delta        = Math.abs(pct - timePct)

  /* ── Level / XP ── */
  const levelInfo    = getLevelProgress(totalPoints)
  const currentLevel = levelInfo.currentLevel
  const xpPct        = levelInfo.progressPercent
  const xpToNext     = levelInfo.isMaxLevel ? 0 : (levelInfo.xpRequiredForNext - levelInfo.xpInCurrentLevel)
  const levelTitle   = currentLevel <= 2 ? 'Étudiant' : currentLevel <= 4 ? 'Chercheur Jr.' : currentLevel <= 7 ? 'Chercheur' : 'Expert'

  /* ── Sign out ── */
  const handleSignOut = async () => {
    const { signOut: signOutFn } = await import('@/lib/auth/actions')
    await signOutFn()
    window.location.href = '/'
  }

  /* ── Quest complete ── */
  const handleSectionComplete = async (chapterNumber: string, sectionIndex: number) => {
    await onQuestComplete(chapterNumber, sectionIndex)
  }

  return (
    <div style={{ fontFamily: FONT, height: '100vh', overflow: 'hidden', position: 'relative', display: 'flex', background: '#04030e' }}>

      {/* ── CSS animations ── */}
      <style>{`
        @keyframes mq-drift {
          0%   { transform: translate(0,0) scale(1); }
          33%  { transform: translate(-20px,15px) scale(1.04); }
          66%  { transform: translate(15px,-10px) scale(0.97); }
          100% { transform: translate(0,0) scale(1); }
        }
        @keyframes mq-pulse-today {
          0%,100% { box-shadow: 0 0 0 0px ${C.amber}88, 0 0 6px ${C.amber}; opacity:1; }
          50%     { box-shadow: 0 0 0 3px ${C.amber}22, 0 0 14px ${C.amber}; opacity:0.75; }
        }
        @keyframes mq-shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        @keyframes mq-arc-in { from { stroke-dasharray: 0 9999; } }
        @keyframes mq-panel-in {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes mq-overlay-in { from { opacity: 0; } to { opacity: 1; } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 99px; }
      `}</style>

      {/* ── Grain ── */}
      <svg style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', opacity: 0.35, zIndex: 0, pointerEvents: 'none' }}>
        <filter id="mq-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#mq-grain)" opacity="0.12" />
      </svg>

      {/* ── Aurora orbs ── */}
      {[
        { color: 'rgba(99,102,241,0.22)',  x: '8%',  y: '5%',  w: 700, h: 600, delay: '0s' },
        { color: 'rgba(167,139,250,0.14)', x: '75%', y: '60%', w: 600, h: 550, delay: '-4s' },
        { color: 'rgba(56,189,248,0.10)',  x: '45%', y: '30%', w: 500, h: 400, delay: '-8s' },
        { color: 'rgba(52,211,153,0.07)',  x: '20%', y: '75%', w: 400, h: 350, delay: '-12s' },
      ].map((o, i) => (
        <div key={i} style={{
          position: 'fixed', left: o.x, top: o.y, width: o.w, height: o.h, zIndex: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse, ${o.color} 0%, transparent 70%)`,
          animation: `mq-drift 20s ease-in-out infinite`,
          animationDelay: o.delay,
        }} />
      ))}

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 216, flexShrink: 0, height: '100vh',
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column',
        background: 'rgba(255,255,255,0.027)',
        backdropFilter: 'blur(32px) saturate(180%)',
        WebkitBackdropFilter: 'blur(32px) saturate(180%)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              background: `linear-gradient(135deg,${C.indigo},${C.violet})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 13, fontWeight: 800,
              boxShadow: `0 4px 18px ${C.indigo}66`,
            }}>M</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.3px', color: 'rgba(255,255,255,0.92)' }}>MemoireQuest</div>
              {/* FIX: was 0.25 → 0.5 */}
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.3px' }}>Thesis OS v1.0</div>
            </div>
          </div>
        </div>

        {/* Avatar */}
        <div style={{ padding: '14px 14px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: `linear-gradient(135deg,${C.indigo},${C.violet})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 14, fontWeight: 800,
              boxShadow: `0 0 0 2px rgba(99,102,241,0.3), 0 4px 14px rgba(99,102,241,0.4)`,
            }}>{firstInitial}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>{firstName}</div>
              {/* FIX: was 0.32 → 0.55 */}
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 1 }}>
                Niv. {currentLevel} · {levelTitle}
              </div>
            </div>
          </div>
          {/* FIX: XP bar height was 3 → 6px for visibility */}
          <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.1)', overflow: 'hidden', marginBottom: 4 }}>
            <div style={{
              height: '100%', width: `${xpPct}%`, borderRadius: 99,
              background: `linear-gradient(90deg,${C.indigo},${C.violet})`,
              boxShadow: `0 0 10px ${C.indigo}88`,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)',
                backgroundSize: '200px 100%',
                animation: 'mq-shimmer 2.5s linear infinite',
              }} />
            </div>
          </div>
          {/* FIX: XP labels were 0.2 → 0.45 */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)' }}>{totalPoints} XP</span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)' }}>
              {levelInfo.isMaxLevel ? 'Max !' : `+${xpToNext} XP → niv. ${currentLevel + 1}`}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 7px' }}>
          {NAV.map((item, i) => {
            const active = navIdx === i
            return (
              <button key={i} onClick={() => setNavIdx(i)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 11px', borderRadius: 9, border: 'none', cursor: 'pointer',
                background: active ? `linear-gradient(90deg,rgba(99,102,241,0.22),rgba(167,139,250,0.1))` : 'transparent',
                /* FIX: inactive was 0.32 → 0.6 */
                color: active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)',
                fontSize: 13, fontWeight: active ? 600 : 400,
                textAlign: 'left', transition: 'all 0.15s', marginBottom: 1,
                boxShadow: active ? 'inset 1px 0 0 rgba(99,102,241,0.7)' : 'none',
              }}>
                <span style={{ fontSize: 11, opacity: active ? 1 : 0.8 }}>{item.icon}</span>
                {item.label}
                {active && <div style={{ marginLeft: 'auto', width: 4, height: 4, borderRadius: '50%', background: C.indigo }} />}
              </button>
            )
          })}
        </nav>

        {/* Footer — sign out */}
        <div style={{ padding: '8px 7px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {/* FIX: was 0.65 → 0.85 */}
          <button onClick={handleSignOut} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 9,
            padding: '8px 11px', borderRadius: 9, border: 'none', cursor: 'pointer',
            background: 'transparent', color: 'rgba(251,113,133,0.85)', fontSize: 12, textAlign: 'left',
          }}>
            <span>↩</span> Déconnexion
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{
        flex: 1, height: '100vh', overflow: 'hidden',
        padding: '24px 36px 20px',
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {planRemaining !== null && <RateLimitWarning remaining={planRemaining} endpoint="plan" />}
        {error && (
          <p role="alert" style={{
            textAlign: 'center', fontSize: 13, color: '#fb7185',
            padding: '8px 16px', borderRadius: 10,
            background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.25)',
          }}>{error}</p>
        )}

        {plan ? (
          <>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div>
                <h1 style={{
                  fontSize: 26, fontWeight: 800, letterSpacing: '-0.6px', margin: 0,
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.95), rgba(255,255,255,0.6))',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>Bonjour, {firstName}.</h1>
                {/* FIX: subtitle was 0.32 → 0.55 */}
                <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>
                  {isAhead
                    ? `🟢 Tu es en avance de ${delta}% — profite-en pour consolider.`
                    : `⚡ ${delta}% de retard sur le temps écoulé — pousse un peu plus.`}
                </p>
              </div>
              {/* Streak pill */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
                borderRadius: 99,
                background: 'rgba(251,191,36,0.1)',
                border: '1px solid rgba(251,191,36,0.3)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 0 20px rgba(251,191,36,0.12)',
              }}>
                <span style={{ fontSize: 15 }}>🔥</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: C.amber, letterSpacing: '-0.5px' }}>{streak.current}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                  jour{streak.current !== 1 ? 's' : ''} de suite
                </span>
              </div>
            </div>

            {/* Bento grid */}
            <div style={{
              flex: 1, minHeight: 0, display: 'grid',
              gridTemplateColumns: '0.85fr 1.15fr',
              gridTemplateRows: '0.62fr 0.22fr 1fr',
              gap: 10,
            }}>

              {/* HERO: countdown + dot grid */}
              <GBorder gradient="linear-gradient(135deg, rgba(99,102,241,0.5), rgba(167,139,250,0.2), rgba(56,189,248,0.3))">
                <div style={{
                  height: '100%', padding: '22px 26px',
                  background: 'linear-gradient(145deg, rgba(99,102,241,0.1) 0%, rgba(4,3,14,0.95) 60%)',
                  backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  borderRadius: 17,
                }}>
                  <div>
                    {/* FIX: label was 0.3 → 0.55 */}
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>
                      Soutenance dans
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 6 }}>
                      <span style={{
                        fontSize: 68, fontWeight: 900, letterSpacing: '-3px', lineHeight: 1,
                        background: `linear-gradient(135deg, #fff 30%, ${C.indigo})`,
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                      }}>{remaining}</span>
                      <div style={{ paddingBottom: 8 }}>
                        <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>jours</div>
                        {/* FIX: semaines was 0.22 → 0.5 */}
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>≈ {Math.round(remaining / 7)} semaines</div>
                      </div>
                    </div>
                    {/* FIX: deadline was 0.25/0.5 → 0.5/0.75 */}
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.2px' }}>
                      Deadline · <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{fmt(deadlineDate, 'long')} {deadlineDate.getFullYear()}</span>
                    </div>
                  </div>
                  <div style={{ padding: '4px 0' }}>
                    <DotGrid start={startDate} deadline={deadlineDate} />
                  </div>
                  {/* Timeline bar */}
                  <div>
                    {/* FIX: track was 0.06 → 0.14 */}
                    <div style={{ height: 2, borderRadius: 99, background: 'rgba(255,255,255,0.14)', overflow: 'visible', position: 'relative', marginBottom: 7 }}>
                      <div style={{ height: '100%', width: `${timePct}%`, borderRadius: 99, background: `linear-gradient(90deg,${C.indigo},${C.violet})`, boxShadow: `0 0 12px ${C.indigo}66` }} />
                      <div style={{ position: 'absolute', left: `${timePct}%`, top: '50%', transform: 'translate(-50%,-50%)', width: 8, height: 8, borderRadius: '50%', background: C.amber, boxShadow: `0 0 10px ${C.amber}` }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      {/* FIX: dates were 0.2 → 0.5 */}
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{fmt(startDate)}</span>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>{timePct}% du temps écoulé</span>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{fmt(deadlineDate)}</span>
                    </div>
                  </div>
                </div>
              </GBorder>

              {/* ARC progress */}
              <GBorder gradient="linear-gradient(135deg, rgba(56,189,248,0.4), rgba(99,102,241,0.2), rgba(4,3,14,0.1))">
                <div style={{
                  height: '100%', padding: '20px 22px',
                  background: 'linear-gradient(145deg, rgba(56,189,248,0.07) 0%, rgba(4,3,14,0.95) 70%)',
                  backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
                  display: 'flex', alignItems: 'center', gap: 20,
                  borderRadius: 17,
                }}>
                  <Arc pct={pct} />
                  <div style={{ flex: 1 }}>
                    {/* FIX: label was 0.28 → 0.55 */}
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>
                      Avancement
                    </div>
                    {/* FIX: connected layout with dot connector — no more huge gap */}
                    {[
                      { label: 'Sections faites', val: `${doneSec}/${totalSec}`, color: C.sky },
                      { label: 'Chapitres finis',  val: `${doneChapters}/${chapters.length}`, color: C.emerald },
                      { label: 'En cours',          val: `${chapters.filter(c => c.done > 0 && c.done < c.sections).length} chap.`, color: C.violet },
                      /* FIX: Replaced "Temps restant X%" (duplicate with hero) with avance/retard delta */
                      { label: isAhead ? 'En avance de' : 'En retard de', val: `${delta} pts`, color: isAhead ? C.emerald : C.rose },
                    ].map(s => (
                      <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 9 }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, flexShrink: 0, boxShadow: `0 0 6px ${s.color}` }} />
                        {/* FIX: label was 0.32 → 0.65 */}
                        <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.65)' }}>{s.label}</span>
                        {/* Dot connector */}
                        <div style={{ flex: 1, borderBottom: '1px dashed rgba(255,255,255,0.1)', marginBottom: 2 }} />
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: s.color }}>{s.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </GBorder>

              {/* STATS bar */}
              <GBorder
                gradient="linear-gradient(90deg, rgba(99,102,241,0.4), rgba(167,139,250,0.3), rgba(251,191,36,0.3))"
                style={{ gridColumn: '1/3' as unknown as undefined }}
              >
                <div style={{
                  height: '100%', padding: '16px 20px',
                  background: 'rgba(4,3,14,0.88)',
                  backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
                  display: 'flex', alignItems: 'center',
                  borderRadius: 17,
                }}>
                  {[
                    {
                      label: 'Niveau',
                      val: String(currentLevel),
                      sub: currentLevel <= 2 ? 'Étudiant' : currentLevel <= 4 ? 'Chercheur Junior' : currentLevel <= 7 ? 'Chercheur Confirmé' : 'Expert ès Mémoires',
                      col: C.indigo,
                    },
                    {
                      label: 'XP Total',
                      val: String(totalPoints),
                      sub: levelInfo.isMaxLevel ? 'Niveau maximum !' : `+${xpToNext} XP avant niv. ${currentLevel + 1}`,
                      col: C.violet,
                    },
                    {
                      label: 'Série',
                      val: `${streak.current}j`,
                      sub: `Jokers dispo : ${streak.jokers}`,
                      col: C.amber,
                    },
                  ].map((s, i) => (
                    <div key={i} style={{
                      flex: 1, textAlign: 'center',
                      borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                      padding: '0 24px',
                    }}>
                      {/* FIX: label was 0.28 → 0.55 */}
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>
                        {s.label}
                      </div>
                      <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-1px', lineHeight: 1, color: '#fff', textShadow: `0 0 28px ${s.col}77`, marginBottom: 4 }}>
                        {s.val}
                      </div>
                      {/* FIX: sub was 0.25 → 0.5 */}
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{s.sub}</div>
                    </div>
                  ))}
                </div>
              </GBorder>

              {/* CHAPTERS grid */}
              <div style={{ gridColumn: '1/3' as unknown as undefined, display: 'flex', flexDirection: 'column', gap: 7, minHeight: 0 }}>
                {/* FIX: header was 0.25 → 0.5 */}
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', flexShrink: 0 }}>
                  Chapitres
                </div>
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gridTemplateRows: '1fr 1fr', gap: 7 }}>
                  {chapters.map(ch => (
                    <ChapterCard key={ch.num} ch={ch} onClick={() => setSelectedCh(ch)} />
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ marginBottom: 24, textAlign: 'center' }}>
              <h1 style={{
                fontSize: 26, fontWeight: 800, letterSpacing: '-0.6px',
                background: 'linear-gradient(90deg, rgba(255,255,255,0.95), rgba(255,255,255,0.55))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8,
              }}>Bonjour, {firstName}.</h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>
                Importe ton sujet de mémoire pour commencer ta quête.
              </p>
            </div>
            {isLoading
              ? <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Génération du plan en cours…</div>
              : <UploadZone onUpload={onUpload} isLoading={isLoading} />}
          </div>
        )}
      </main>

      {/* Side Panel */}
      {selectedCh && plan && (
        <SidePanel
          ch={selectedCh}
          chapterProgress={
            Object.fromEntries(
              Object.entries(questProgress[selectedCh.num] ?? {}).map(([k, v]) => [String(k), v])
            )
          }
          loadingKey={loadingKey}
          onClose={() => setSelectedCh(null)}
          onSectionComplete={(sectionIndex) => handleSectionComplete(selectedCh.num, sectionIndex)}
        />
      )}
    </div>
  )
}
