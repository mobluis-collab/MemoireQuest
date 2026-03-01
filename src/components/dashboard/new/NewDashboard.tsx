'use client'

import { useState, useMemo, useEffect, useRef, useCallback, CSSProperties } from 'react'
import type { MemoirePlan, QuestProgress, StreakData } from '@/types/memoir'
import { getLevelProgress } from '@/lib/xp/levels'
import UploadZone from '@/components/dashboard/UploadZone'
import RateLimitWarning from '@/components/ui/RateLimitWarning'
import MemoireView from './MemoireView'
import ProgressionView from './ProgressionView'
import AchievementsView from './AchievementsView'

/* ─── Types ───────────────────────────────────────────────────── */
interface User {
  email: string
  user_metadata?: { full_name?: string }
}

interface ChapterData {
  num: string
  title: string
  objective: string
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
  const R = 68, SW = 6, C2 = 86, circ = 2 * Math.PI * R
  const dash = (pct / 100) * circ
  return (
    <svg width={C2 * 2} height={C2 * 2} viewBox={`0 0 ${C2 * 2} ${C2 * 2}`}
      style={{ overflow: 'visible', flexShrink: 0 }}>
      <circle cx={C2} cy={C2} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={SW} />
      <circle cx={C2} cy={C2} r={R} fill="none"
        stroke="rgba(255,255,255,0.40)" strokeWidth={SW} strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ * 0.25}
        style={{ animation: 'mq-arc-in 1.2s cubic-bezier(.4,0,.2,1) both' }} />
      <text x={C2} y={C2 - 10} textAnchor="middle" fill="rgba(255,255,255,0.88)"
        fontSize="34" fontWeight="800" fontFamily={FONT} letterSpacing="-1.5">{pct}</text>
      <text x={C2} y={C2 + 14} textAnchor="middle" fill="rgba(255,255,255,0.35)"
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
                background: isToday ? 'rgba(255,255,255,0.8)'
                  : isElapsed
                    ? `rgba(255,255,255,${0.12 + (i / elapsed) * 0.25})`
                    : 'rgba(255,255,255,0.06)',
                animation: 'none',
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

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        position: 'relative', overflow: 'hidden',
        borderRadius: 12,
        background: hovered ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center',
        transition: 'all 0.15s',
        transform: hovered ? 'translateY(-1px)' : 'none',
        boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.2)' : 'none',
        cursor: 'pointer',
        minHeight: 0,
      }}>
      {/* Left accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: 2, borderRadius: '2px 0 0 2px',
        background: done ? 'rgba(255,255,255,0.5)' : wip ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
      }} />
      {/* Content */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, width: '100%', paddingLeft: 8 }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600, flexShrink: 0, letterSpacing: '0.2px', whiteSpace: 'nowrap', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {ch.num}
        </span>
        <span style={{
          flex: 1, fontSize: 13,
          fontWeight: 500,
          color: done ? 'rgba(255,255,255,0.50)' : wip ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.65)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: '1.4',
          whiteSpace: 'normal',
        }}>{ch.title}</span>
        {/* Status */}
        <span style={{
          flexShrink: 0, fontSize: 11, fontWeight: 600,
          color: done ? 'rgba(255,255,255,0.50)' : wip ? 'rgba(255,255,255,0.60)' : 'rgba(255,255,255,0.25)',
        }}>
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
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        animation: 'mq-panel-in 0.3s cubic-bezier(.4,0,.2,1) both',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.4)',
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
            {/* FIX: close button 30 → 36px, text 0.7 → 0.9 */}
            <button onClick={onClose} style={{
              width: 36, height: 36, borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.9)',
              fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginTop: 2, transition: 'all 0.15s',
            }}>✕</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16 }}>
            <svg width={70} height={70} viewBox="0 0 70 70" style={{ flexShrink: 0, overflow: 'visible' }}>
              <circle cx={35} cy={35} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={SW} />
              <circle cx={35} cy={35} r={R} fill="none" stroke="rgba(255,255,255,0.40)" strokeWidth={SW}
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circ}`}
                strokeDashoffset={circ * 0.25} />
              <text x={35} y={38} textAnchor="middle" fill="white" fontSize="13" fontWeight="800" fontFamily={FONT}>
                {pct}%
              </text>
            </svg>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                {/* FIX: 0.55 → 0.75 */}
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>Sections terminées</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.80)' }}>{ch.done}/{ch.sections}</span>
              </div>
              <div style={{ height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${pct}%`, borderRadius: 99,
                  background: 'rgba(255,255,255,0.35)',
                }} />
              </div>
              {/* FIX: 0.45 → 0.68 */}
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.68)', marginTop: 5 }}>
                {pct === 100 ? '✓ Chapitre terminé'
                  : pct === 0 ? 'Pas encore commencé'
                  : `${ch.sections - ch.done} section${ch.sections - ch.done > 1 ? 's' : ''} restante${ch.sections - ch.done > 1 ? 's' : ''}`}
              </div>
            </div>
          </div>
        </div>

        {/* Sections list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            {/* FIX: sections label 0.45 → 0.72, hint 0.3 → 0.55 */}
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.72)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Sections
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)' }}>
              Clique sur ✓ pour décocher
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ch.sectionList.map((sec, i) => {
              const isDone = chapterProgress[String(i)] === 'done'
              const isNext = !isDone && ch.sectionList.slice(0, i).every((_, j) => chapterProgress[String(j)] === 'done')
              const isLoading = loadingKey === `${ch.num}:${i}`
              const isClickable = isDone || isNext
              return (
                <div key={i}
                  onClick={() => { if (isClickable && !isLoading) onSectionComplete(i) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 11,
                    background: isDone ? 'rgba(255,255,255,0.04)' : isNext ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isNext ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)'}`,
                    transition: 'all 0.15s',
                    cursor: isClickable ? 'pointer' : 'default',
                    boxShadow: 'none',
                    opacity: isLoading ? 0.6 : 1,
                  }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isDone ? 'rgba(255,255,255,0.12)' : isNext ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.05)',
                    border: `1.5px solid ${isDone ? 'rgba(255,255,255,0.30)' : isNext ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.10)'}`,
                    fontSize: 10, fontWeight: 800,
                    boxShadow: 'none',
                    transition: 'all 0.15s',
                  }}>
                    {isLoading
                      ? <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 8 }}>…</span>
                      : isDone
                        ? <span style={{ color: 'rgba(255,255,255,0.6)' }}>✓</span>
                        : isNext
                          ? <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 800, fontSize: 8 }}>→</span>
                          : <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9 }}>{i + 1}</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 13, fontWeight: isNext ? 600 : 400,
                      /* FIX: locked sections 0.55 → 0.72 */
                      color: isDone ? 'rgba(255,255,255,0.65)' : isNext ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.72)',
                    }}>{sec.text}</div>
                    {isNext && (
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 2, fontWeight: 500 }}>
                        Cliquer pour valider
                      </div>
                    )}
                    {isDone && (
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.30)', marginTop: 2 }}>
                        Cliquer pour annuler
                      </div>
                    )}
                  </div>
                  <span style={{
                    fontSize: 9, fontWeight: 600, flexShrink: 0, padding: '2px 6px', borderRadius: 99,
                    background: 'rgba(255,255,255,0.05)',
                    color: 'rgba(255,255,255,0.35)',
                  }}>
                    {sec.difficulty === 'hard' ? 'difficile' : sec.difficulty === 'medium' ? 'moyen' : 'facile'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* FIX: footer hint 0.4 → 0.60 */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.60)', textAlign: 'center' }}>
            Clique sur la prochaine section pour la valider
          </div>
        </div>
      </div>
    </>
  )
}

/* ─── Confetti burst ──────────────────────────────────────────── */
const CONFETTI_COLORS = ['#6366f1', '#34d399', '#fbbf24', '#fb7185', '#38bdf8', '#a78bfa', '#fff']

function ConfettiBurst({ title, onDone }: { title: string; onDone: () => void }) {
  const particles = useRef(
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      left: 5 + Math.random() * 90,
      delay: Math.random() * 0.6,
      dur: 1.4 + Math.random() * 1.2,
      size: 5 + Math.random() * 7,
      isCircle: Math.random() > 0.5,
      rotEnd: 180 + Math.random() * 540,
    }))
  ).current

  useEffect(() => {
    const t = setTimeout(onDone, 3500)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200, pointerEvents: 'none', overflow: 'hidden',
    }}>
      {/* Backdrop */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(4,3,14,0.55)',
        backdropFilter: 'blur(2px)',
        animation: 'mq-overlay-in 0.2s ease both',
      }} />
      {/* Banner */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        animation: 'mq-celebrate-in 0.5s cubic-bezier(.34,1.56,.64,1) both',
        zIndex: 201,
      }}>
        <div style={{ fontSize: 72, marginBottom: 12, lineHeight: 1 }}>🎉</div>
        <div style={{
          fontSize: 28, fontWeight: 900, letterSpacing: '-0.5px',
          background: `linear-gradient(90deg, ${C.emerald}, ${C.sky})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: 6,
        }}>Chapitre terminé !</div>
        <div style={{
          fontSize: 15, color: 'rgba(255,255,255,0.75)',
          maxWidth: 300, lineHeight: 1.4,
        }}>{title}</div>
        <div style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
          +XP accordé 🚀
        </div>
      </div>
      {/* Particles */}
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.left}%`,
          top: '-12px',
          width: p.size, height: p.size,
          background: p.color,
          borderRadius: p.isCircle ? '50%' : '2px',
          opacity: 0,
          animation: `mq-confetti-fall ${p.dur}s ease-in ${p.delay}s both`,
        }} />
      ))}
    </div>
  )
}

/* ─── Onboarding screen ───────────────────────────────────────── */
function OnboardingScreen({ firstName, onUpload, isLoading }: {
  firstName: string
  onUpload: (file: File) => Promise<void>
  isLoading: boolean
}) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '0 20px',
    }}>
      <h1 style={{
        fontSize: 42, fontWeight: 800, letterSpacing: '-1.5px',
        color: 'rgba(255,255,255,0.92)',
        margin: '0 0 10px', textAlign: 'center', lineHeight: 1.15,
      }}>Importe ton cahier des charges.</h1>
      <p style={{
        fontSize: 16, color: 'rgba(255,255,255,0.40)',
        margin: '0 0 40px', textAlign: 'center',
        fontWeight: 400,
      }}>On s&#39;occupe du reste.</p>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <UploadZone onUpload={onUpload} isLoading={isLoading} />
      </div>
    </div>
  )
}

/* ─── Nav items ───────────────────────────────────────────────── */
type ActiveView = 'dashboard' | 'memoire' | 'progression' | 'achievements'
const NAV: Array<{ icon: string; label: string; view: ActiveView }> = [
  { icon: '⊞', label: 'Dashboard',     view: 'dashboard'     },
  { icon: '◎', label: 'Mon mémoire',   view: 'memoire'       },
  { icon: '◈', label: 'Progression',   view: 'progression'   },
  { icon: '◇', label: 'Achievements',  view: 'achievements'  },
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
  const [activeView, setActiveView] = useState<ActiveView>('dashboard')
  const [selectedCh, setSelectedCh] = useState<ChapterData | null>(null)
  const [celebratingChapter, setCelebratingChapter] = useState<string | null>(null)
  const prevChaptersRef = useRef<ChapterData[]>([])

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
      return { num: ch.number, title: ch.title, objective: ch.objective ?? '', sections: ch.sections.length, done, sectionList: ch.sections }
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

  /* ── Chapter completion detection ── */
  useEffect(() => {
    const prev = prevChaptersRef.current
    if (prev.length > 0 && chapters.length > 0) {
      const justCompleted = chapters.find(ch => {
        const prevCh = prev.find(p => p.num === ch.num)
        return prevCh
          && prevCh.done < prevCh.sections
          && ch.done === ch.sections
          && ch.sections > 0
      })
      if (justCompleted) setCelebratingChapter(justCompleted.num)
    }
    prevChaptersRef.current = chapters
  }, [chapters])

  const handleCelebrationDone = useCallback(() => setCelebratingChapter(null), [])

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
        @keyframes mq-confetti-fall {
          0%   { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }
          80%  { opacity: 0.8; }
          100% { opacity: 0; transform: translateY(105vh) rotate(720deg) scale(0.5); }
        }
        @keyframes mq-celebrate-in {
          0%   { opacity: 0; transform: translate(-50%,-50%) scale(0.4); }
          70%  { opacity: 1; transform: translate(-50%,-50%) scale(1.05); }
          100% { opacity: 1; transform: translate(-50%,-50%) scale(1); }
        }
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

      {/* ── Aurora orbs — very subtle ── */}
      {[
        { color: 'rgba(99,102,241,0.07)',  x: '8%',  y: '5%',  w: 700, h: 600, delay: '0s' },
        { color: 'rgba(167,139,250,0.05)', x: '75%', y: '60%', w: 600, h: 550, delay: '-4s' },
        { color: 'rgba(56,189,248,0.04)',  x: '45%', y: '30%', w: 500, h: 400, delay: '-8s' },
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
              background: 'rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 800,
              border: '1px solid rgba(255,255,255,0.12)',
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
              background: 'rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 800,
              border: '1px solid rgba(255,255,255,0.15)',
            }}>{firstInitial}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>{firstName}</div>
              {/* FIX: was 0.32 → 0.55 */}
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 1 }}>
                Niv. {currentLevel} · {levelTitle}
              </div>
            </div>
          </div>
          <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 4 }}>
            <div style={{
              height: '100%', width: `${xpPct}%`, borderRadius: 99,
              background: 'rgba(255,255,255,0.35)',
            }} />
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.40)' }}>
            {totalPoints} XP{levelInfo.isMaxLevel ? '' : ` · encore ${xpToNext} avant le niv. ${currentLevel + 1}`}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 7px' }}>
          {NAV.map((item, i) => {
            const active = activeView === item.view
            return (
              <button key={i} onClick={() => setActiveView(item.view)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 11px 8px 13px', borderRadius: 9, border: 'none', cursor: 'pointer',
                background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                color: active ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.45)',
                fontSize: 13, fontWeight: active ? 600 : 400,
                textAlign: 'left', transition: 'all 0.15s', marginBottom: 1,
                borderLeft: active ? '2px solid rgba(255,255,255,0.5)' : '2px solid transparent',
              }}>
                <span style={{ fontSize: 11, opacity: active ? 1 : 0.75 }}>{item.icon}</span>
                {item.label}
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
          {/* ── Non-dashboard views ── */}
          {activeView !== 'dashboard' && (
            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              {activeView === 'memoire' && (
                <MemoireView
                  chapters={chapters}
                  questProgress={
                    Object.fromEntries(
                      Object.entries(questProgress).map(([k, v]) =>
                        [k, Object.fromEntries(Object.entries(v).map(([ik, iv]) => [String(ik), iv]))]
                      )
                    )
                  }
                  loadingKey={loadingKey}
                  onQuestComplete={handleSectionComplete}
                />
              )}
              {activeView === 'progression' && (
                <ProgressionView
                  chapters={chapters}
                  totalPoints={totalPoints}
                  streak={streak}
                  startDate={startDate}
                  deadlineDate={deadlineDate}
                />
              )}
              {activeView === 'achievements' && (
                <AchievementsView
                  totalPoints={totalPoints}
                  streak={streak}
                  questProgress={
                    Object.fromEntries(
                      Object.entries(questProgress).map(([k, v]) =>
                        [k, Object.fromEntries(Object.entries(v).map(([ik, iv]) => [String(ik), iv]))]
                      )
                    )
                  }
                  chapters={chapters}
                />
              )}
            </div>
          )}

          {/* ── Dashboard view ── */}
          {activeView === 'dashboard' && (
            <>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div>
                <h1 style={{
                  fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', margin: 0,
                  color: 'rgba(255,255,255,0.88)',
                }}>Bonjour, {firstName}.</h1>
                <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.40)', marginTop: 3 }}>
                  {isAhead
                    ? `En avance de ${delta}% sur le planning.`
                    : `${delta}% de retard — une section à la fois.`}
                </p>
              </div>
              {/* Streak pill */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
                borderRadius: 99,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>{streak.current}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
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
              <div style={{
                borderRadius: 18,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.02)',
              }}>
                <div style={{
                  height: '100%', padding: '22px 26px',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  borderRadius: 17,
                }}>
                  <div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>
                      Soutenance dans
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 6 }}>
                      <span style={{
                        fontSize: 68, fontWeight: 900, letterSpacing: '-3px', lineHeight: 1,
                        color: 'rgba(255,255,255,0.9)',
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
                    <div style={{ height: 2, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'visible', position: 'relative', marginBottom: 7 }}>
                      <div style={{ height: '100%', width: `${timePct}%`, borderRadius: 99, background: 'rgba(255,255,255,0.30)' }} />
                      <div style={{ position: 'absolute', left: `${timePct}%`, top: '50%', transform: 'translate(-50%,-50%)', width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.6)' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      {/* FIX: dates were 0.2 → 0.5 */}
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{fmt(startDate)}</span>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>{timePct}% du temps écoulé</span>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{fmt(deadlineDate)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ARC progress */}
              <div style={{
                borderRadius: 18,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.02)',
              }}>
                <div style={{
                  height: '100%', padding: '20px 22px',
                  display: 'flex', alignItems: 'center', gap: 20,
                  borderRadius: 17,
                }}>
                  <Arc pct={pct} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>
                      Avancement
                    </div>
                    {[
                      { label: 'Sections faites', val: `${doneSec}/${totalSec}` },
                      { label: 'Chapitres finis',  val: `${doneChapters}/${chapters.length}` },
                      { label: 'En cours',          val: `${chapters.filter(c => c.done > 0 && c.done < c.sections).length} chap.` },
                    ].map(s => (
                      <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 9 }}>
                        <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.50)' }}>{s.label}</span>
                        <div style={{ flex: 1, borderBottom: '1px dashed rgba(255,255,255,0.06)', marginBottom: 2 }} />
                        <span style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,0.80)' }}>{s.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* STATS bar */}
              <div style={{
                gridColumn: '1/3',
                borderRadius: 18,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.02)',
              }}>
                <div style={{
                  height: '100%', padding: '16px 20px',
                  display: 'flex', alignItems: 'center',
                  borderRadius: 17,
                }}>
                  {[
                    {
                      label: 'Niveau',
                      val: String(currentLevel),
                      sub: levelTitle,
                    },
                    {
                      label: 'Points',
                      val: String(totalPoints),
                      sub: levelInfo.isMaxLevel ? 'Niveau max' : `encore ${xpToNext} avant le niv. ${currentLevel + 1}`,
                    },
                    {
                      label: 'Régularité',
                      val: `${streak.current}j`,
                      sub: streak.current > 1 ? 'Continue comme ça' : 'Valide une section aujourd\'hui',
                    },
                  ].map((s, i) => (
                    <div key={i} style={{
                      flex: 1, textAlign: 'center',
                      borderRight: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                      padding: '0 24px',
                    }}>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.40)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>
                        {s.label}
                      </div>
                      <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1, color: 'rgba(255,255,255,0.88)', marginBottom: 4 }}>
                        {s.val}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{s.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CHAPTERS grid — adaptatif au nombre de chapitres */}
              <div style={{ gridColumn: '1/3' as unknown as undefined, display: 'flex', flexDirection: 'column', gap: 7, minHeight: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                  {/* FIX: "Chapitres" label 0.5 → 0.75, count badge 0.35 → 0.60 */}
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Chapitres
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.60)' }}>
                    {chapters.length} chapitre{chapters.length > 1 ? 's' : ''}
                  </div>
                </div>
                <div style={{
                  flex: 1, overflowY: 'auto',
                  display: 'grid',
                  gridTemplateColumns: chapters.length <= 2
                    ? 'repeat(2, 1fr)'
                    : chapters.length <= 4
                      ? 'repeat(2, 1fr)'
                      : 'repeat(3, 1fr)',
                  gridAutoRows: 'minmax(0, 1fr)',
                  gap: 7,
                }}>
                  {chapters.map(ch => (
                    <ChapterCard key={ch.num} ch={ch} onClick={() => setSelectedCh(ch)} />
                  ))}
                </div>
              </div>
            </div>
            </>
          )}
          </>
        ) : (
          <OnboardingScreen
            firstName={firstName}
            onUpload={onUpload}
            isLoading={isLoading}
          />
        )}
      </main>

      {/* Confetti celebration */}
      {celebratingChapter && (
        <ConfettiBurst
          title={chapters.find(c => c.num === celebratingChapter)?.title ?? ''}
          onDone={handleCelebrationDone}
        />
      )}

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
