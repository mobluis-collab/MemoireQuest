'use client'

import { useState, useMemo, useEffect, useRef, useCallback, CSSProperties, ChangeEvent } from 'react'
import type { MemoirePlan, QuestProgress, StreakData, SectionProgress } from '@/types/memoir'
import { isSectionDone } from '@/types/memoir'
import { getLevelProgress } from '@/lib/xp/levels'
import UploadZone from '@/components/dashboard/UploadZone'
import RateLimitWarning from '@/components/ui/RateLimitWarning'
import MemoireView from './MemoireView'
import PomodoroTimer from './PomodoroTimer'
import ExtractionConfirm from './ExtractionConfirm'
import type { ExtractionResult } from '@/types/extraction'
import ProgressionView from './ProgressionView'
import AchievementsView from './AchievementsView'
import { useTheme as useThemeToggle } from '@/context/ThemeProvider'
import { hexToRgba, tw, bg } from '@/lib/color-utils'

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
  tips?: string
  sectionList: Array<{ text: string; difficulty: 'easy' | 'medium' | 'hard'; hint?: string; tasks?: string[] }>
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
  onSubtaskToggle: (chapterNumber: string, sectionIndex: number, taskIndex: number) => Promise<void>
  loadingKey: string | null
  accentColor: string
  onAccentChange?: (color: string) => void
  textIntensity: number
  onTextIntensityChange: (intensity: number) => void
  extractionResult?: ExtractionResult | null
  extractionLoading?: boolean
  onConfirmExtraction?: (extraction: ExtractionResult) => void
  onReanalyze?: () => void
}

/* ─── Palette ─────────────────────────────────────────────────── */
const C = {
  sky:      '#38bdf8',
  emerald:  '#34d399',
  amber:    '#fbbf24',
}
const FONT = "-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif"

/* ─── Helpers ─────────────────────────────────────────────────── */
const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 864e5)
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
const fmt = (d: Date, m: 'short' | 'long' = 'short') =>
  d.toLocaleDateString('fr-FR', { day: 'numeric', month: m })

/* ─── Focus Timer ────────────────────────────────────────────── */
function FocusTimer({ startTime, isDark, textIntensity }: { startTime: number | null; isDark: boolean; textIntensity: number }) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (!startTime) return
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime])
  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  return (
    <span style={{
      fontSize: 11, fontFamily: 'inherit',
      color: tw(0.30, textIntensity, isDark),
      letterSpacing: '0.5px',
    }}>
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')} de focus
    </span>
  )
}

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
function Arc({ pct, accentColor, textIntensity = 1.0, isDark = true }: { pct: number; accentColor: string; textIntensity?: number; isDark?: boolean }) {
  const R = 68, SW = 6, C2 = 86, circ = 2 * Math.PI * R
  const dash = (pct / 100) * circ
  return (
    <svg width={C2 * 2} height={C2 * 2} viewBox={`0 0 ${C2 * 2} ${C2 * 2}`}
      style={{ overflow: 'visible', flexShrink: 0 }}>
      <circle cx={C2} cy={C2} r={R} fill="none" stroke="var(--mq-stroke-soft)" strokeWidth={SW} />
      <circle cx={C2} cy={C2} r={R} fill="none"
        stroke={accentColor} strokeWidth={SW} strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ * 0.25}
        style={{ animation: 'mq-arc-in 1.2s cubic-bezier(.4,0,.2,1) both' }} />
      <text x={C2} y={C2 + 4} textAnchor="middle" fill={tw(0.88, textIntensity, isDark)}
        fontSize="34" fontWeight="800" fontFamily={FONT} letterSpacing="-1.5">{pct}%</text>
    </svg>
  )
}

/* ─── Dot grid ────────────────────────────────────────────────── */
function DotGrid({ start, deadline, accentColor }: { start: Date; deadline: Date; accentColor: string }) {
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
                background: isToday ? hexToRgba(accentColor, 0.90)
                  : isElapsed
                    ? hexToRgba(accentColor, 0.50)
                    : 'var(--mq-stroke-soft)',
                animation: 'none',
                transition: 'background 0.3s cubic-bezier(.4,0,.2,1)',
              }} />
            )
          })}
        </div>
      ))}
    </div>
  )
}

/* ─── Chapter card ────────────────────────────────────────────── */
function ChapterCard({ ch, onClick, textIntensity = 1.0, isDark = true }: { ch: ChapterData; onClick: () => void; textIntensity?: number; isDark?: boolean }) {
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
        background: hovered ? 'var(--mq-card-hover)' : bg(0.03, isDark),
        border: '1px solid var(--mq-border)',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center',
        transition: 'all 0.15s cubic-bezier(.4,0,.2,1)',
        transform: hovered ? 'translateY(-1px)' : 'none',
        boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.2)' : 'none',
        cursor: 'pointer',
        minHeight: 0,
      }}>
      {/* Left accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: 2, borderRadius: '2px 0 0 2px',
        background: done ? bg(0.5, isDark) : wip ? bg(0.25, isDark) : 'var(--mq-border)',
      }} />
      {/* Content */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, width: '100%', paddingLeft: 8 }}>
        <span style={{ fontSize: 10, color: tw(0.35, textIntensity, isDark), fontWeight: 600, flexShrink: 0, letterSpacing: '0.2px', whiteSpace: 'nowrap', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {ch.num}
        </span>
        <span style={{
          flex: 1, fontSize: 13,
          fontWeight: 500,
          color: done ? tw(0.50, textIntensity, isDark) : wip ? tw(0.85, textIntensity, isDark) : tw(0.65, textIntensity, isDark),
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
          color: done ? tw(0.50, textIntensity, isDark) : wip ? tw(0.60, textIntensity, isDark) : tw(0.25, textIntensity, isDark),
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
  accentColor,
  textIntensity = 1.0,
  isDark = true,
}: {
  ch: ChapterData
  chapterProgress: Record<string, SectionProgress>
  loadingKey: string | null
  onClose: () => void
  onSectionComplete: (sectionIndex: number) => void
  accentColor: string
  textIntensity?: number
  isDark?: boolean
}) {
  const pct  = ch.sections > 0 ? Math.round((ch.done / ch.sections) * 100) : 0
  const R = 28, SW = 5, circ = 2 * Math.PI * R
  const dash = (pct / 100) * circ

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'var(--mq-bg-overlay)',
        backdropFilter: 'blur(4px)',
        animation: 'mq-overlay-in 0.25s ease both',
        cursor: 'pointer',
      }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 400, zIndex: 51,
        display: 'flex', flexDirection: 'column',
        background: isDark ? 'rgba(10,9,28,0.92)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(40px) saturate(180%)',
        borderLeft: '1px solid var(--mq-border)',
        animation: 'mq-panel-in 0.3s cubic-bezier(.4,0,.2,1) both',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.4)',
      }}>
        {/* Header */}
        <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid var(--mq-border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: tw(0.5, textIntensity, isDark), fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
                Chapitre {ch.num}
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px', color: tw(0.92, textIntensity, isDark), lineHeight: 1.2 }}>
                {ch.title}
              </h2>
            </div>
            {/* FIX: close button 30 → 36px, text 0.7 → 0.9 */}
            <button onClick={onClose} style={{
              width: 36, height: 36, borderRadius: '50%',
              border: `1px solid ${bg(0.2, isDark)}`,
              background: bg(0.09, isDark), color: tw(0.9, textIntensity, isDark),
              fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginTop: 2, transition: 'all 0.15s cubic-bezier(.4,0,.2,1)',
            }}>✕</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16 }}>
            <svg width={70} height={70} viewBox="0 0 70 70" style={{ flexShrink: 0, overflow: 'visible' }}>
              <circle cx={35} cy={35} r={R} fill="none" stroke="var(--mq-stroke-soft)" strokeWidth={SW} />
              <circle cx={35} cy={35} r={R} fill="none" stroke="var(--mq-text-muted)" strokeWidth={SW}
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circ}`}
                strokeDashoffset={circ * 0.25} />
              <text x={35} y={38} textAnchor="middle" fill={isDark ? 'white' : 'black'} fontSize="13" fontWeight="800" fontFamily={FONT}>
                {pct}%
              </text>
            </svg>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                {/* FIX: 0.55 → 0.75 */}
                <span style={{ fontSize: 12, color: tw(0.75, textIntensity, isDark) }}>Sections terminées</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: tw(0.80, textIntensity, isDark) }}>{ch.done}/{ch.sections}</span>
              </div>
              <div style={{ height: 5, borderRadius: 99, background: bg(0.06, isDark), overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${pct}%`, borderRadius: 99,
                  background: accentColor,
                  transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
                }} />
              </div>
              {/* FIX: 0.45 → 0.68 */}
              <div style={{ fontSize: 11, color: tw(0.68, textIntensity, isDark), marginTop: 5 }}>
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
            <div style={{ fontSize: 10, color: tw(0.72, textIntensity, isDark), fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Sections
            </div>
            <div style={{ fontSize: 10, color: tw(0.55, textIntensity, isDark) }}>
              Clique sur ✓ pour décocher
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ch.sectionList.map((sec, i) => {
              const isDone = isSectionDone(chapterProgress[String(i)])
              const isNext = !isDone && ch.sectionList.slice(0, i).every((_, j) => isSectionDone(chapterProgress[String(j)]))
              const isLoading = loadingKey === `${ch.num}:${i}`
              const isClickable = isDone || isNext
              return (
                <div key={i}
                  onClick={() => { if (isClickable && !isLoading) onSectionComplete(i) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 11,
                    background: isDone ? 'var(--mq-card-bg)' : isNext ? 'var(--mq-stroke-soft)' : bg(0.02, isDark),
                    border: `1px solid ${isNext ? 'var(--mq-border-hover)' : 'var(--mq-stroke-soft)'}`,
                    transition: 'all 0.15s cubic-bezier(.4,0,.2,1)',
                    cursor: isClickable ? 'pointer' : 'default',
                    boxShadow: 'none',
                    opacity: isLoading ? 0.6 : 1,
                  }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isDone ? bg(0.12, isDark) : isNext ? bg(0.10, isDark) : bg(0.05, isDark),
                    border: `1.5px solid ${isDone ? bg(0.30, isDark) : isNext ? bg(0.25, isDark) : bg(0.10, isDark)}`,
                    fontSize: 10, fontWeight: 800,
                    boxShadow: 'none',
                    transition: 'all 0.15s cubic-bezier(.4,0,.2,1)',
                  }}>
                    {isLoading
                      ? <span style={{ color: tw(0.5, textIntensity, isDark), fontSize: 8 }}>…</span>
                      : isDone
                        ? <span style={{ color: tw(0.6, textIntensity, isDark) }}>✓</span>
                        : isNext
                          ? <span style={{ color: tw(0.7, textIntensity, isDark), fontWeight: 800, fontSize: 8 }}>→</span>
                          : <span style={{ color: tw(0.25, textIntensity, isDark), fontSize: 9 }}>{i + 1}</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 13, fontWeight: isNext ? 600 : 400,
                      /* FIX: locked sections 0.55 → 0.72 */
                      color: isDone ? tw(0.65, textIntensity, isDark) : isNext ? tw(0.95, textIntensity, isDark) : tw(0.72, textIntensity, isDark),
                    }}>{sec.text}</div>
                    {isNext && (
                      <div style={{ fontSize: 10, color: tw(0.45, textIntensity, isDark), marginTop: 2, fontWeight: 500 }}>
                        Cliquer pour valider
                      </div>
                    )}
                    {isDone && (
                      <div style={{ fontSize: 10, color: tw(0.30, textIntensity, isDark), marginTop: 2 }}>
                        Cliquer pour annuler
                      </div>
                    )}
                  </div>
                  <span style={{
                    fontSize: 9, fontWeight: 600, flexShrink: 0, padding: '2px 6px', borderRadius: 99,
                    background: bg(0.05, isDark),
                    color: tw(0.35, textIntensity, isDark),
                  }}>
                    {sec.difficulty === 'hard' ? 'difficile' : sec.difficulty === 'medium' ? 'moyen' : 'facile'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* FIX: footer hint 0.4 → 0.60 */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--mq-border)', flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: tw(0.60, textIntensity, isDark), textAlign: 'center' }}>
            Clique sur la prochaine section pour la valider
          </div>
        </div>
      </div>
    </>
  )
}

/* ─── Chapter complete ────────────────────────────────────────── */
function ChapterComplete({ title, onDone, textIntensity = 1.0, isDark = true }: {
  title: string; onDone: () => void; textIntensity?: number; isDark?: boolean
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <>
      <style>{`
        @keyframes mq-glow-pulse {
          0%, 100% { box-shadow: none; }
          50% { box-shadow: 0 0 40px 15px ${tw(0.12, 1, isDark)}; }
        }
        @keyframes mq-check-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes mq-text-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'var(--mq-bg-overlay)',
        backdropFilter: 'blur(2px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        animation: 'mq-check-in 0.2s ease-out both',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          border: `2px solid ${tw(0.25, textIntensity, isDark)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'mq-glow-pulse 1.5s ease-in-out 2',
        }}>
          <span style={{
            fontSize: 32, fontWeight: 300,
            color: tw(0.88, textIntensity, isDark),
            animation: 'mq-check-in 0.4s ease-out 0.3s both',
          }}>{'✓'}</span>
        </div>
        <div style={{
          marginTop: 24, fontSize: 24, fontWeight: 800,
          letterSpacing: '-0.5px',
          color: tw(0.92, textIntensity, isDark),
          animation: 'mq-text-in 0.5s ease-out 0.5s both',
        }}>Chapitre validé</div>
        <div style={{
          fontSize: 14, color: tw(0.50, textIntensity, isDark),
          maxWidth: 280, lineHeight: 1.4, marginTop: 8, textAlign: 'center',
          animation: 'mq-text-in 0.5s ease-out 0.6s both',
        }}>{title}</div>
        <div style={{
          fontSize: 12, color: tw(0.35, textIntensity, isDark),
          marginTop: 16,
          animation: 'mq-text-in 0.5s ease-out 0.7s both',
        }}>+XP accordé</div>
      </div>
    </>
  )
}

/* ─── Onboarding screen ───────────────────────────────────────── */
/* ─── Re-upload overlay ─────────────────────────────────────── */
const REUPLOAD_STEPS = [
  { label: 'Lecture du PDF…', pct: 15 },
  { label: 'Identification du type de mémoire…', pct: 32 },
  { label: 'Analyse du cahier des charges…', pct: 55 },
  { label: 'Extraction des contraintes…', pct: 72 },
  { label: 'Génération du plan et des conseils…', pct: 88 },
  { label: 'Structuration finale…', pct: 96 },
]

function ReuploadOverlay({ accentColor, textIntensity = 1.0, isDark = true }: { accentColor: string; textIntensity?: number; isDark?: boolean }) {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    const delays = [0, 2500, 5000, 8500, 13000, 17000]
    const timers = delays.map((delay, i) =>
      setTimeout(() => setStepIndex(i), delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  const current = REUPLOAD_STEPS[stepIndex]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: isDark ? 'rgba(4,3,14,0.85)' : 'rgba(245,245,247,0.92)',
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'mq-overlay-in 0.3s ease',
    }}>
      <div style={{
        width: 400, padding: '40px 36px',
        borderRadius: 20,
        background: 'var(--mq-card-bg)',
        border: `1px solid ${bg(0.10, isDark)}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
      }}>
        {/* Spinner */}
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: `2.5px solid ${bg(0.10, isDark)}`,
          borderTopColor: bg(0.6, isDark),
          animation: 'mq-spin 0.8s linear infinite',
        }} />

        {/* Titre */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--mq-text-primary)', marginBottom: 4 }}>
            Analyse en cours
          </div>
          <div style={{ fontSize: 12, color: 'var(--mq-text-muted)' }}>
            Régénération du plan avec conseils…
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: tw(0.45, textIntensity, isDark) }}>{current.label}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: tw(0.75, textIntensity, isDark) }}>{current.pct}%</span>
          </div>
          <div style={{
            height: 5, borderRadius: 99,
            background: bg(0.06, isDark), overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 99,
              background: accentColor,
              width: `${current.pct}%`,
              transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
            }} />
          </div>
        </div>

        {/* Completed steps */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {REUPLOAD_STEPS.slice(0, stepIndex).map((s) => (
            <div key={s.label} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 11, color: tw(0.30, textIntensity, isDark),
            }}>
              <span style={{ color: tw(0.50, textIntensity, isDark), fontSize: 10 }}>✓</span>
              {s.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function OnboardingScreen({ firstName, onUpload, isLoading, textIntensity = 1.0, isDark = true }: {
  firstName: string
  onUpload: (file: File) => Promise<void>
  isLoading: boolean
  textIntensity?: number
  isDark?: boolean
}) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '0 20px',
    }}>
      <h1 style={{
        fontSize: 42, fontWeight: 800, letterSpacing: '-1.5px',
        color: tw(0.92, textIntensity, isDark),
        margin: '0 0 10px', textAlign: 'center', lineHeight: 1.15,
      }}>Importe ton cahier des charges.</h1>
      <p style={{
        fontSize: 16, color: 'var(--mq-text-muted)',
        margin: '0 0 40px', textAlign: 'center',
        fontWeight: 400,
      }}>On s&#39;occupe du reste.</p>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <UploadZone onUpload={onUpload} isLoading={isLoading} />
      </div>
    </div>
  )
}

/* ─── Scrollbar custom ────────────────────────────────────────── */
function ScrollbarStyle({ isDark = true }: { isDark?: boolean }) {
  return (
    <style>{`
      .mq-dashboard-scroll::-webkit-scrollbar { width: 4px; }
      .mq-dashboard-scroll::-webkit-scrollbar-track { background: transparent; }
      .mq-dashboard-scroll::-webkit-scrollbar-thumb { background: ${bg(0.08, isDark)}; border-radius: 99px; }
      .mq-dashboard-scroll::-webkit-scrollbar-thumb:hover { background: ${bg(0.15, isDark)}; }
    `}</style>
  )
}

/* ─── Nav items ───────────────────────────────────────────────── */
type ActiveView = 'dashboard' | 'memoire' | 'progression' | 'achievements'
const NAV: Array<{ icon: string; label: string; view: ActiveView }> = [
  { icon: '⊞', label: 'Dashboard',     view: 'dashboard'     },
  { icon: '◎', label: 'Mon mémoire',   view: 'memoire'       },
  { icon: '◈', label: 'Progression',   view: 'progression'   },
  { icon: '◇', label: 'Trophées',      view: 'achievements'  },
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
  onSubtaskToggle,
  loadingKey,
  accentColor,
  textIntensity,
  onTextIntensityChange,
  extractionResult,
  extractionLoading,
  onConfirmExtraction,
  onReanalyze,
}: NewDashboardProps) {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard')
  const [showIntensity, setShowIntensity] = useState(false)
  const [selectedCh, setSelectedCh] = useState<ChapterData | null>(null)
  const [celebratingChapter, setCelebratingChapter] = useState<string | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [hoveredNav, setHoveredNav] = useState<number | null>(null)
  const [focusMode, setFocusMode] = useState(false)
  const [focusSection, setFocusSection] = useState<{ chapterIdx: number; sectionIdx: number } | null>(null)
  const [focusStartTime, setFocusStartTime] = useState<number | null>(null)
  const [pomodoroOpen, setPomodoroOpen] = useState(false)
  const [manualDeadline, setManualDeadline] = useState('')
  const prevChaptersRef = useRef<ChapterData[]>([])
  const reuploadRef = useRef<HTMLInputElement>(null)

  /* ── Sidebar collapsed persistence ── */
  useEffect(() => {
    const saved = localStorage.getItem('mq-sidebar-collapsed')
    if (saved === 'true') setSidebarCollapsed(true)
  }, [])
  useEffect(() => {
    localStorage.setItem('mq-sidebar-collapsed', String(sidebarCollapsed))
  }, [sidebarCollapsed])

  /* ── View transition handler (Animation 7) ── */
  const handleViewChange = useCallback((view: ActiveView) => {
    if (view === activeView) return
    setIsTransitioning(true)
    setTimeout(() => {
      setActiveView(view)
      setIsTransitioning(false)
    }, 50)
  }, [activeView])

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      switch (e.key) {
        case '1':
          handleViewChange('dashboard')
          break
        case '2':
          handleViewChange('memoire')
          break
        case '3':
          handleViewChange('progression')
          break
        case '4':
          handleViewChange('achievements')
          break
        case '[':
          setSidebarCollapsed(prev => !prev)
          break
        case ']':
          setSidebarCollapsed(prev => !prev)
          break
        case 'Escape':
          if (focusMode) {
            setFocusMode(false)
            setFocusSection(null)
            setFocusStartTime(null)
          } else if (showShortcuts) {
            setShowShortcuts(false)
          } else {
            handleViewChange('dashboard')
          }
          break
        case '?':
          setShowShortcuts(prev => !prev)
          break
        case 'f':
        case 'F':
          setFocusMode(prev => {
            if (prev) { setFocusSection(null); setFocusStartTime(null) }
            return !prev
          })
          break
        case 'p':
        case 'P':
          setPomodoroOpen(prev => !prev)
          break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleViewChange, showShortcuts, focusMode, pomodoroOpen])

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
    if (plan?.deadline) {
      const d = new Date(plan.deadline)
      if (!isNaN(d.getTime())) return d
    }
    return null
  }, [plan])

  const total     = deadlineDate ? daysBetween(startDate, deadlineDate) : 0
  const elapsed   = deadlineDate ? Math.min(Math.max(daysBetween(startDate, today), 0), total) : 0
  const remaining = deadlineDate ? Math.max(total - elapsed, 0) : 0
  const timePct   = deadlineDate && total > 0 ? Math.round((elapsed / total) * 100) : 0

  /* ── Chapter data ── */
  const chapters: ChapterData[] = useMemo(() => {
    if (!plan) return []
    return plan.chapters.map(ch => {
      const chP = questProgress[ch.number] ?? {}
      const done = Object.values(chP).filter(v => isSectionDone(v as SectionProgress)).length
      return {
        num: ch.number,
        title: ch.title,
        objective: ch.objective ?? '',
        sections: ch.sections.length,
        done,
        tips: ch.tips,
        sectionList: ch.sections,
      }
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

  /* ── Re-upload ── */
  const handleReupload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(file)
      if (reuploadRef.current) reuploadRef.current.value = ''
    }
  }, [onUpload])

  /* ── Save manual deadline ── */
  const handleSaveDeadline = useCallback(async () => {
    if (!manualDeadline || !plan) return
    try {
      const res = await fetch('/api/user/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field: 'deadline',
          value: manualDeadline,
        }),
      })
      if (res.ok) {
        window.location.reload()
      }
    } catch (err) {
      console.error('Failed to save deadline:', err)
    }
  }, [manualDeadline, plan])

  /* ── Quest complete ── */
  const handleSectionComplete = async (chapterNumber: string, sectionIndex: number) => {
    await onQuestComplete(chapterNumber, sectionIndex)
  }

  const handleSubtaskToggle = async (chapterNumber: string, sectionIndex: number, taskIndex: number) => {
    await onSubtaskToggle(chapterNumber, sectionIndex, taskIndex)
  }

  const { isDark, toggle } = useThemeToggle()

  return (
    <div style={{ fontFamily: FONT, height: '100vh', overflow: 'hidden', position: 'relative', display: 'flex', background: 'var(--mq-bg)', cursor: 'default' }}>

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
        @keyframes mq-spin { to { transform: rotate(360deg); } }
        @keyframes mq-focus-breathe {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes mq-focus-ripple {
          to { transform: scale(3); opacity: 0; }
        }
        @keyframes mq-orbit-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        /* Fix I-beam cursor on non-editable text */
        .mq-dashboard-scroll,
        .mq-dashboard-scroll * {
          cursor: default;
        }
        .mq-dashboard-scroll button,
        .mq-dashboard-scroll a,
        .mq-dashboard-scroll [role="button"],
        .mq-dashboard-scroll input,
        .mq-dashboard-scroll textarea,
        .mq-dashboard-scroll select {
          cursor: pointer;
        }
        .mq-dashboard-scroll input[type="text"],
        .mq-dashboard-scroll input[type="search"],
        .mq-dashboard-scroll input[type="email"],
        .mq-dashboard-scroll input[type="number"],
        .mq-dashboard-scroll textarea {
          cursor: text;
        }
      `}</style>

      <ScrollbarStyle isDark={isDark} />

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
        width: focusMode ? 0 : (sidebarCollapsed ? 56 : 216), flexShrink: 0, height: '100vh',
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column',
        background: 'var(--mq-sidebar-bg)',
        cursor: 'default', userSelect: 'none',
        backdropFilter: 'blur(32px) saturate(180%)',
        WebkitBackdropFilter: 'blur(32px) saturate(180%)',
        borderRight: focusMode ? 'none' : '1px solid var(--mq-border)',
        transition: 'width 0.35s cubic-bezier(.4,0,.2,1), border-right 0.35s cubic-bezier(.4,0,.2,1), opacity 0.35s cubic-bezier(.4,0,.2,1)',
        overflow: 'hidden',
        opacity: focusMode ? 0 : 1,
        pointerEvents: focusMode ? 'none' : 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 18px 16px', borderBottom: '1px solid var(--mq-card-hover)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              background: bg(0.1, isDark),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: tw(0.8, textIntensity, isDark), fontSize: 13, fontWeight: 800,
              border: `1px solid ${bg(0.12, isDark)}`,
            }}>M</div>
            {!sidebarCollapsed && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.3px', color: tw(0.92, textIntensity, isDark) }}>maimouarkwest</div>
                {/* FIX: was 0.25 → 0.5 */}
                <div style={{ fontSize: 10, color: tw(0.5, textIntensity, isDark), letterSpacing: '0.3px' }}>Thesis OS v1.0</div>
              </div>
            )}
          </div>
        </div>

        {/* Avatar */}
        <div style={{ padding: sidebarCollapsed ? '14px 0 12px' : '14px 14px 12px', borderBottom: '1px solid var(--mq-card-hover)', display: 'flex', flexDirection: 'column', alignItems: sidebarCollapsed ? 'center' : 'stretch' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: sidebarCollapsed ? 0 : 10, justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
            <div style={{
              width: sidebarCollapsed ? 28 : 34, height: sidebarCollapsed ? 28 : 34, borderRadius: '50%', flexShrink: 0,
              background: bg(0.1, isDark),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: tw(0.8, textIntensity, isDark), fontSize: sidebarCollapsed ? 11 : 14, fontWeight: 800,
              border: '1px solid var(--mq-border-hover)',
              transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
            }}>{firstInitial}</div>
            {!sidebarCollapsed && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: tw(0.92, textIntensity, isDark) }}>{firstName}</div>
                {/* FIX: was 0.32 → 0.55 */}
                <div style={{ fontSize: 11, color: tw(0.55, textIntensity, isDark), marginTop: 1 }}>
                  Niv. {currentLevel} {'\u00B7'} {levelTitle}
                </div>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <>
              <div style={{ height: 4, borderRadius: 99, background: bg(0.06, isDark), overflow: 'hidden', marginBottom: 4 }}>
                <div style={{
                  height: '100%', width: `${xpPct}%`, borderRadius: 99,
                  background: accentColor,
                  transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
                }} />
              </div>
              <div style={{ fontSize: 9, color: tw(0.35, textIntensity, isDark) }}>
                {totalPoints} XP{levelInfo.isMaxLevel ? '' : ` \u00B7 encore ${xpToNext} avant le niv. ${currentLevel + 1}`}
              </div>
            </>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 7px' }}>
          {NAV.map((item, i) => {
            const active = activeView === item.view
            const isHovered = hoveredNav === i
            return (
              <button
                key={i}
                onClick={() => handleViewChange(item.view)}
                onMouseEnter={() => setHoveredNav(i)}
                onMouseLeave={() => setHoveredNav(null)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: sidebarCollapsed ? 0 : 9,
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  padding: sidebarCollapsed ? '8px 0' : '8px 11px 8px 13px',
                  borderRadius: 9, border: 'none', cursor: 'pointer',
                  background: active ? bg(0.06, isDark) : 'transparent',
                  color: active ? tw(0.90, textIntensity, isDark) : tw(0.45, textIntensity, isDark),
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  textAlign: 'left',
                  transition: 'all 0.15s cubic-bezier(.4,0,.2,1), transform 0.15s cubic-bezier(.4,0,.2,1)',
                  transform: isHovered && !active ? 'scale(1.04)' : 'scale(1)',
                  marginBottom: 1,
                  borderLeft: sidebarCollapsed ? 'none' : active ? `2px solid ${bg(0.12, isDark)}` : '2px solid transparent',
                }}
              >
                <span style={{
                  fontSize: 15, flexShrink: 0, width: 20, textAlign: 'center',
                  color: active ? tw(0.60, textIntensity, isDark) : tw(0.25, textIntensity, isDark),
                  transition: 'color 0.3s cubic-bezier(.4,0,.2,1)',
                }}>{item.icon}</span>
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            )
          })}
          {/* Intensité toggle */}
          <button
            onClick={() => setShowIntensity(!showIntensity)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: sidebarCollapsed ? 0 : 9,
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              padding: sidebarCollapsed ? '8px 0' : '8px 11px 8px 13px',
              borderRadius: 9, border: 'none', cursor: 'pointer',
              background: showIntensity ? bg(0.06, isDark) : 'transparent',
              color: showIntensity ? tw(0.90, textIntensity, isDark) : tw(0.45, textIntensity, isDark),
              fontSize: 13, fontWeight: showIntensity ? 600 : 400,
              textAlign: 'left' as const,
              transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
              marginBottom: 1,
              borderLeft: sidebarCollapsed ? 'none' : showIntensity ? `2px solid ${bg(0.12, isDark)}` : '2px solid transparent',
            }}
          >
            <span style={{ fontSize: 15, flexShrink: 0, width: 20, textAlign: 'center', color: showIntensity ? tw(0.60, textIntensity, isDark) : tw(0.25, textIntensity, isDark), transition: 'color 0.3s cubic-bezier(.4,0,.2,1)' }}>{'\u25D0'}</span>
            {!sidebarCollapsed && <span>Intensit{'\u00E9'}</span>}
          </button>

          {/* Slider accordion */}
          {!sidebarCollapsed && (
          <div style={{
            maxHeight: showIntensity ? '80px' : '0px',
            overflow: 'hidden',
            transition: 'max-height 0.3s cubic-bezier(.4,0,.2,1)',
          }}>
            <div style={{ padding: '6px 13px 10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 10, color: tw(0.35, textIntensity, isDark) }}>Texte</span>
                <span style={{ fontSize: 10, color: tw(0.50, textIntensity, isDark), fontWeight: 600 }}>{Math.round(textIntensity * 100)}%</span>
              </div>
              <style>{`
                .mq-intensity-slider {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 100%;
                  height: 3px;
                  border-radius: 99px;
                  background: ${bg(0.08, isDark)};
                  outline: none;
                  cursor: pointer;
                }
                .mq-intensity-slider::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 14px;
                  height: 14px;
                  border-radius: 50%;
                  background: ${bg(0.80, isDark)};
                  border: none;
                  cursor: pointer;
                }
                .mq-intensity-slider::-moz-range-thumb {
                  width: 14px;
                  height: 14px;
                  border-radius: 50%;
                  background: ${bg(0.80, isDark)};
                  border: none;
                  cursor: pointer;
                }
              `}</style>
              <input
                type="range"
                min={50}
                max={150}
                step={5}
                value={Math.round(textIntensity * 100)}
                onChange={(e) => onTextIntensityChange(Number(e.target.value) / 100)}
                className="mq-intensity-slider"
              />
            </div>
          </div>
          )}
        </nav>

        {/* Re-upload + sign out */}
        <div style={{ padding: '8px 7px', borderTop: '1px solid var(--mq-card-hover)', display: 'flex', flexDirection: 'column', gap: 1 }}>
          {!sidebarCollapsed && plan && (
            <>
              <input
                ref={reuploadRef}
                type="file"
                accept="application/pdf"
                onChange={handleReupload}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => reuploadRef.current?.click()}
                disabled={isLoading}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                  padding: '8px 11px', borderRadius: 9, border: 'none', cursor: isLoading ? 'wait' : 'pointer',
                  background: 'transparent', color: tw(0.50, textIntensity, isDark), fontSize: 12, textAlign: 'left',
                  opacity: isLoading ? 0.4 : 1,
                  transition: 'opacity 0.15s cubic-bezier(.4,0,.2,1)',
                }}>
                <span style={{ fontSize: 11, color: tw(0.25, textIntensity, isDark) }}>{'\u2191'}</span> {isLoading ? 'Analyse en cours\u2026' : 'R\u00E9-importer un PDF'}
              </button>
            </>
          )}
          {/* Theme toggle */}
          <button onClick={toggle} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: sidebarCollapsed ? 0 : 9,
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            padding: sidebarCollapsed ? '8px 0' : '8px 11px',
            borderRadius: 9, border: 'none', cursor: 'pointer',
            background: 'transparent', color: 'var(--mq-text-secondary)', fontSize: 12, textAlign: 'left',
            transition: 'all 0.15s cubic-bezier(.4,0,.2,1)',
          }}>
            <span style={{ fontSize: 13, flexShrink: 0, width: 20, textAlign: 'center' }}>{isDark ? '\u2600' : '\u263D'}</span>
            {!sidebarCollapsed && <span>{isDark ? 'Mode clair' : 'Mode sombre'}</span>}
          </button>
          <button onClick={handleSignOut} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: sidebarCollapsed ? 0 : 9,
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            padding: sidebarCollapsed ? '8px 0' : '8px 11px',
            borderRadius: 9, border: 'none', cursor: 'pointer',
            background: 'transparent', color: 'rgba(251,113,133,0.85)', fontSize: 12, textAlign: 'left',
          }}>
            <span style={{ flexShrink: 0, width: 20, textAlign: 'center' }}>{'\u21A9'}</span>
            {!sidebarCollapsed && <span>D{'\u00E9'}connexion</span>}
          </button>
        </div>
      </aside>

      {/* Sidebar collapse toggle — outside aside to avoid overflow:hidden clipping */}
      {!focusMode && (
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label={sidebarCollapsed ? 'Ouvrir le menu' : 'Fermer le menu'}
          style={{
            position: 'fixed',
            top: 28,
            left: sidebarCollapsed ? 44 : 204,
            zIndex: 20,
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: 'var(--mq-card-bg)',
            border: '1px solid var(--mq-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 10,
            color: tw(0.5, textIntensity, isDark),
            transition: 'left 0.35s cubic-bezier(.4,0,.2,1), transform 0.3s cubic-bezier(.4,0,.2,1)',
            transform: sidebarCollapsed ? 'rotate(180deg)' : 'none',
            boxShadow: `0 1px 4px ${bg(0.10, isDark)}`,
          }}
        >
          {'\u2039'}
        </button>
      )}

      {/* ── MAIN ── */}
      <main className="mq-dashboard-scroll" style={{
        flex: 1, height: '100vh', overflow: 'auto',
        padding: '24px 36px 20px',
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', gap: 10,
        cursor: 'default',
      }}>
        {/* Barre d'outils — dans le flux, plus d'absolute */}
        {!focusMode && plan && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
            flexShrink: 0,
            marginBottom: 4,
            userSelect: 'none',
          }}>
            <button
              onClick={() => setPomodoroOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 99,
                border: `1px solid ${bg(0.10, isDark)}`,
                background: bg(0.05, isDark),
                color: tw(0.45, textIntensity, isDark),
                fontSize: 11, fontWeight: 500, cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
                backdropFilter: 'blur(8px)',
              }}
              title="Pomodoro (P)"
            >
              <span style={{ fontSize: 12 }}>{'\u25D4'}</span>
              <span>Pomodoro</span>
            </button>
            <div style={{ position: 'relative', display: 'inline-flex' }}>
              <button
                onClick={(e) => {
                  const btn = e.currentTarget
                  const rect = btn.getBoundingClientRect()
                  const ripple = document.createElement('div')
                  const x = e.clientX - rect.left
                  const y = e.clientY - rect.top
                  ripple.style.cssText = `
                    position:absolute; border-radius:50%; pointer-events:none;
                    left:${x}px; top:${y}px; width:40px; height:40px;
                    margin-left:-20px; margin-top:-20px;
                    background:${isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.12)'};
                    transform:scale(0);
                    animation: mq-focus-ripple 0.5s ease-out forwards;
                  `
                  btn.appendChild(ripple)
                  setTimeout(() => ripple.remove(), 500)
                  setFocusMode(true)
                }}
                style={{
                  position: 'relative',
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 99,
                  border: `1px solid ${bg(0.14, isDark)}`,
                  background: bg(0.06, isDark),
                  color: tw(0.55, textIntensity, isDark),
                  fontSize: 11, fontWeight: 500, cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
                  overflow: 'hidden',
                  zIndex: 1,
                }}
                title="Mode focus (F)"
              >
                <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{
                    position: 'absolute', inset: -6, borderRadius: '50%',
                    background: isDark
                      ? 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)'
                      : 'radial-gradient(circle, rgba(0,0,0,0.08) 0%, transparent 70%)',
                    animation: 'mq-focus-breathe 3s ease-in-out infinite',
                    pointerEvents: 'none',
                  }} />
                  <span style={{
                    position: 'absolute', inset: -4, borderRadius: '50%',
                    border: `1px solid ${bg(0.08, isDark)}`,
                    animation: 'mq-orbit-spin 4s linear infinite',
                    pointerEvents: 'none',
                  }}>
                    <span style={{
                      position: 'absolute', top: -1.5, left: '50%',
                      width: 3, height: 3, marginLeft: -1.5,
                      borderRadius: '50%',
                      background: tw(0.35, textIntensity, isDark),
                    }} />
                  </span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ position: 'relative', zIndex: 1 }}>
                    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.8"/>
                  </svg>
                </span>
                <span>Focus</span>
              </button>
            </div>
          </div>
        )}
        {planRemaining !== null && <RateLimitWarning remaining={planRemaining} endpoint="plan" />}
        {error && (
          <p role="alert" style={{
            textAlign: 'center', fontSize: 13, color: '#fb7185',
            padding: '8px 16px', borderRadius: 10,
            background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.25)',
          }}>{error}</p>
        )}

        {plan ? (
          <div style={{
            flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
            opacity: isTransitioning ? 0 : 1,
            transform: isTransitioning ? 'translateY(8px)' : 'translateY(0)',
            transition: 'opacity 0.2s cubic-bezier(.4,0,.2,1), transform 0.2s cubic-bezier(.4,0,.2,1)',
          }}>
          {/* ── Non-dashboard views ── */}
          {activeView !== 'dashboard' && (
            <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
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
                  onSubtaskToggle={handleSubtaskToggle}
                  accentColor={accentColor}
                  textIntensity={textIntensity}
                  isDark={isDark}
                />
              )}
              {activeView === 'progression' && (
                <ProgressionView
                  chapters={chapters}
                  totalPoints={totalPoints}
                  streak={streak}
                  startDate={startDate}
                  deadlineDate={deadlineDate ?? undefined}
                  accentColor={accentColor}
                  textIntensity={textIntensity}
                  isDark={isDark}
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
                  accentColor={accentColor}
                  textIntensity={textIntensity}
                  isDark={isDark}
                />
              )}
            </div>
          )}

          {/* ── Dashboard view ── */}
          {activeView === 'dashboard' && (
            <>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, userSelect: 'none' }}>
              <div>
                <h1 style={{
                  fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', margin: 0,
                  color: 'var(--mq-text-primary)',
                }}>Bonjour, {firstName}.</h1>
                <p style={{ fontSize: 12.5, color: 'var(--mq-text-muted)', marginTop: 3 }}>
                  {deadlineDate
                    ? (isAhead
                      ? `En avance de ${delta}% sur le planning.`
                      : `${delta}% de retard — une section à la fois.`)
                    : `${pct}% complété — continue comme ça.`}
                </p>
              </div>
              {/* Streak pill */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
                borderRadius: 99,
                background: bg(0.05, isDark),
                border: `1px solid ${bg(0.10, isDark)}`,
                userSelect: 'none',
              }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: tw(0.45, textIntensity, isDark) }}>{streak.current}</span>
                <span style={{ fontSize: 12, color: tw(0.35, textIntensity, isDark) }}>
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
                border: '1px solid var(--mq-border)',
                background: bg(0.02, isDark),
              }}>
                <div style={{
                  height: '100%', padding: '22px 26px',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  borderRadius: 17,
                }}>
                  {deadlineDate ? (
                    <>
                      <div>
                        <div style={{ fontSize: 10, color: tw(0.25, textIntensity, isDark), fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>
                          Soutenance dans
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 6 }}>
                          <span style={{
                            fontSize: 68, fontWeight: 900, letterSpacing: '-3px', lineHeight: 1,
                            color: tw(0.88, textIntensity, isDark),
                          }}>{remaining}</span>
                          <div style={{ paddingBottom: 8 }}>
                            <div style={{ fontSize: 16, color: tw(0.65, textIntensity, isDark), fontWeight: 500 }}>jours</div>
                            <div style={{ fontSize: 11, color: tw(0.5, textIntensity, isDark) }}>{'\u2248'} {Math.round(remaining / 7)} semaines</div>
                          </div>
                        </div>
                        <div style={{ fontSize: 11, color: tw(0.5, textIntensity, isDark), letterSpacing: '0.2px' }}>
                          Deadline {'\u00B7'} <span style={{ color: tw(0.8, textIntensity, isDark), fontWeight: 600 }}>{fmt(deadlineDate, 'long')} {deadlineDate.getFullYear()}</span>
                        </div>
                      </div>
                      <div style={{ padding: '4px 0' }}>
                        <DotGrid start={startDate} deadline={deadlineDate} accentColor={accentColor} />
                      </div>
                      {/* Timeline bar */}
                      <div>
                        <div style={{ height: 2, borderRadius: 99, background: bg(0.06, isDark), overflow: 'visible', position: 'relative', marginBottom: 7 }}>
                          <div style={{ height: '100%', width: `${timePct}%`, borderRadius: 99, background: accentColor, transition: 'width 0.6s cubic-bezier(.4,0,.2,1)' }} />
                          <div style={{ position: 'absolute', left: `${timePct}%`, top: '50%', transform: 'translate(-50%,-50%)', width: 6, height: 6, borderRadius: '50%', background: bg(0.6, isDark) }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 10, color: tw(0.5, textIntensity, isDark) }}>{fmt(startDate)}</span>
                          <span style={{ fontSize: 10, color: tw(0.65, textIntensity, isDark), fontWeight: 600 }}>{timePct}% du temps écoul{'\u00E9'}</span>
                          <span style={{ fontSize: 10, color: tw(0.5, textIntensity, isDark) }}>{fmt(deadlineDate)}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '16px 0' }}>
                      <div style={{ fontSize: 28, color: tw(0.15, textIntensity, isDark) }}>
                        {'\u2014'}
                      </div>
                      <div style={{ fontSize: 12, color: tw(0.45, textIntensity, isDark), lineHeight: 1.5, maxWidth: 260, textAlign: 'center' }}>
                        Aucune deadline d{'\u00E9'}tect{'\u00E9'}e dans ton cahier des charges
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <input
                          type="date"
                          value={manualDeadline}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setManualDeadline(e.target.value)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: 8,
                            border: `1px solid ${bg(0.12, isDark)}`,
                            background: bg(0.04, isDark),
                            color: tw(0.70, textIntensity, isDark),
                            fontSize: 12,
                            fontFamily: 'inherit',
                            outline: 'none',
                            cursor: 'pointer',
                          }}
                        />
                        {manualDeadline && (
                          <button
                            onClick={handleSaveDeadline}
                            style={{
                              padding: '6px 14px',
                              borderRadius: 8,
                              border: `1px solid ${bg(0.15, isDark)}`,
                              background: bg(0.08, isDark),
                              color: tw(0.65, textIntensity, isDark),
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                          >
                            Valider
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ARC progress */}
              <div style={{
                borderRadius: 18,
                border: '1px solid var(--mq-border)',
                background: bg(0.02, isDark),
              }}>
                <div style={{
                  height: '100%', padding: '20px 22px',
                  display: 'flex', alignItems: 'center', gap: 20,
                  borderRadius: 17,
                }}>
                  <Arc pct={pct} accentColor={accentColor} textIntensity={textIntensity} isDark={isDark} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: tw(0.25, textIntensity, isDark), fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>
                      Avancement
                    </div>
                    {[
                      { label: 'Sections faites', val: `${doneSec}/${totalSec}` },
                      { label: 'Chapitres finis',  val: `${doneChapters}/${chapters.length}` },
                      { label: 'En cours',          val: `${chapters.filter(c => c.done > 0 && c.done < c.sections).length} chap.` },
                    ].map(s => (
                      <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 9 }}>
                        <span style={{ fontSize: 11.5, color: tw(0.50, textIntensity, isDark) }}>{s.label}</span>
                        <div style={{ flex: 1, borderBottom: '1px dashed var(--mq-stroke-soft)', marginBottom: 2 }} />
                        <span style={{ fontSize: 11.5, fontWeight: 600, color: tw(0.80, textIntensity, isDark) }}>{s.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* STATS bar */}
              <div style={{
                gridColumn: '1/3',
                borderRadius: 18,
                border: '1px solid var(--mq-border)',
                background: bg(0.02, isDark),
              }}>
                <div style={{
                  height: '100%', padding: '16px 20px',
                  display: 'flex', alignItems: 'center',
                  borderRadius: 17,
                  userSelect: 'none',
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
                      borderRight: i < 2 ? '1px solid var(--mq-stroke-soft)' : 'none',
                      padding: '0 24px',
                    }}>
                      <div style={{ fontSize: 10, color: tw(0.25, textIntensity, isDark), fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>
                        {s.label}
                      </div>
                      <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1, color: 'var(--mq-text-primary)', marginBottom: 4 }}>
                        {s.val}
                      </div>
                      <div style={{ fontSize: 11, color: tw(0.35, textIntensity, isDark) }}>{s.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CHAPTERS grid — adaptatif au nombre de chapitres */}
              <div style={{ gridColumn: '1 / 3', display: 'flex', flexDirection: 'column', gap: 7, minHeight: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                  {/* FIX: "Chapitres" label 0.5 → 0.75, count badge 0.35 → 0.60 */}
                  <div style={{ fontSize: 10, color: tw(0.75, textIntensity, isDark), fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Chapitres
                  </div>
                  <div style={{ fontSize: 10, color: tw(0.60, textIntensity, isDark) }}>
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
                    <ChapterCard key={ch.num} ch={ch} onClick={() => setSelectedCh(ch)} textIntensity={textIntensity} isDark={isDark} />
                  ))}
                </div>
              </div>
            </div>
            </>
          )}
          </div>
        ) : isLoading && !plan ? (
          /* Phase 2 loading — generating plan */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            gap: 20,
            background: isDark ? '#04030e' : '#ffffff',
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: `2px solid ${bg(0.08, isDark)}`,
              borderTopColor: tw(0.40, textIntensity, isDark),
              animation: 'mq-spin 0.8s linear infinite',
            }} />
            <div style={{ fontSize: 14, color: tw(0.50, textIntensity, isDark), fontWeight: 500 }}>
              G{'\u00e9'}n{'\u00e9'}ration du plan en cours...
            </div>
            <div style={{ fontSize: 12, color: tw(0.25, textIntensity, isDark) }}>
              L{'\u0027'}IA utilise tes m{'\u00e9'}tadonn{'\u00e9'}es v{'\u00e9'}rifi{'\u00e9'}es pour cr{'\u00e9'}er un plan sur mesure.
            </div>
          </div>
        ) : extractionResult && onConfirmExtraction && onReanalyze ? (
          /* Phase intermédiaire : confirmation des métadonnées */
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            background: isDark ? '#04030e' : '#ffffff',
          }}>
            <ExtractionConfirm
              extraction={extractionResult}
              onConfirm={onConfirmExtraction}
              onReanalyze={onReanalyze}
              isDark={isDark}
              textIntensity={textIntensity}
              accentColor={accentColor}
            />
          </div>
        ) : (
          <OnboardingScreen
            firstName={firstName}
            onUpload={onUpload}
            isLoading={isLoading || (extractionLoading ?? false)}
            textIntensity={textIntensity}
            isDark={isDark}
          />
        )}
      </main>

      {/* Chapter complete celebration */}
      {celebratingChapter && (
        <ChapterComplete
          title={chapters.find(c => c.num === celebratingChapter)?.title ?? ''}
          onDone={handleCelebrationDone}
          textIntensity={textIntensity}
          isDark={isDark}
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
          accentColor={accentColor}
          textIntensity={textIntensity}
          isDark={isDark}
        />
      )}

      <PomodoroTimer
        isOpen={pomodoroOpen}
        onClose={() => setPomodoroOpen(false)}
        textIntensity={textIntensity}
        isDark={isDark}
      />

      {/* Re-upload loading overlay */}
      {isLoading && plan && <ReuploadOverlay accentColor={accentColor} textIntensity={textIntensity} isDark={isDark} />}

      {/* Focus mode — section selection overlay */}
      {focusMode && !focusSection && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9990,
          background: isDark ? 'rgba(4,3,14,0.85)' : 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column',
          animation: 'mq-overlay-in 0.25s ease both',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '2px', color: tw(0.30, textIntensity, isDark),
            marginBottom: 24,
          }}>
            Sur quoi veux-tu te concentrer ?
          </div>
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 6,
            maxHeight: '60vh', overflowY: 'auto',
            width: 400, maxWidth: '90vw',
          }}>
            {chapters.map((chapter, ci) =>
              chapter.sectionList.map((section, si) => (
                <button
                  key={`${ci}-${si}`}
                  onClick={() => {
                    setFocusSection({ chapterIdx: ci, sectionIdx: si })
                    setFocusStartTime(Date.now())
                    setPomodoroOpen(true)
                  }}
                  style={{
                    textAlign: 'left',
                    padding: '12px 16px', borderRadius: 10,
                    border: `1px solid ${bg(0.08, isDark)}`,
                    background: bg(0.04, isDark),
                    color: tw(0.65, textIntensity, isDark),
                    fontSize: 13, cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = bg(0.08, isDark) }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = bg(0.04, isDark) }}
                >
                  <div style={{ fontSize: 10, color: tw(0.30, textIntensity, isDark), marginBottom: 4 }}>
                    {chapter.num} — {chapter.title}
                  </div>
                  <div style={{ fontWeight: 500 }}>
                    {section.text}
                  </div>
                </button>
              ))
            )}
          </div>
          <button
            onClick={() => { setFocusMode(false) }}
            style={{
              marginTop: 20,
              padding: '6px 16px', borderRadius: 99,
              border: `1px solid ${bg(0.08, isDark)}`,
              background: 'transparent',
              color: tw(0.35, textIntensity, isDark),
              fontSize: 11, cursor: 'pointer',
            }}
          >
            Annuler
          </button>
        </div>
      )}

      {/* Focus mode — immersive view */}
      {focusMode && focusSection && (() => {
        const focusChapter = chapters[focusSection.chapterIdx]
        const focusSec = focusChapter?.sectionList[focusSection.sectionIdx]
        if (!focusChapter || !focusSec) return null

        const chProgress = questProgress[focusChapter.num] ?? {}
        const secProgress = chProgress[focusSection.sectionIdx]
        const hasTasks = Array.isArray(focusSec.tasks) && focusSec.tasks.length > 0
        let taskStates: boolean[] = []
        if (hasTasks) {
          if (secProgress === 'done') {
            taskStates = focusSec.tasks!.map(() => true)
          } else if (secProgress && typeof secProgress === 'object' && 'tasks' in secProgress) {
            taskStates = secProgress.tasks
          } else {
            taskStates = focusSec.tasks!.map(() => false)
          }
        }

        return (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 9990,
            background: isDark ? '#030210' : '#fafafa',
            display: 'flex', flexDirection: 'column',
            animation: 'mq-overlay-in 0.25s ease both',
          }}>
            {/* Header bar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 20px',
              borderBottom: `1px solid ${bg(0.06, isDark)}`,
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 10, color: tw(0.25, textIntensity, isDark), textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                  Focus
                </span>
                <span style={{ fontSize: 12, color: tw(0.50, textIntensity, isDark) }}>
                  {focusChapter.title} — {focusSec.text}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <FocusTimer startTime={focusStartTime} isDark={isDark} textIntensity={textIntensity} />
                <button
                  onClick={() => {
                    setFocusMode(false)
                    setFocusSection(null)
                    setFocusStartTime(null)
                  }}
                  style={{
                    padding: '5px 12px', borderRadius: 99,
                    border: `1px solid ${bg(0.10, isDark)}`,
                    background: bg(0.06, isDark),
                    color: tw(0.45, textIntensity, isDark),
                    fontSize: 11, fontWeight: 500, cursor: 'pointer',
                  }}
                >
                  Quitter focus
                </button>
              </div>
            </div>

            {/* Main content */}
            <div style={{
              flex: 1, overflow: 'auto',
              display: 'flex', justifyContent: 'center',
              padding: '40px 20px',
            }}>
              <div style={{ maxWidth: 640, width: '100%' }}>
                <h2 style={{
                  fontSize: 22, fontWeight: 600,
                  color: tw(0.85, textIntensity, isDark),
                  marginBottom: 16, margin: 0,
                }}>
                  {focusSec.text}
                </h2>

                {/* Difficulty badge */}
                <div style={{ marginTop: 8, marginBottom: 20 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
                    background: bg(0.06, isDark),
                    border: `1px solid ${bg(0.08, isDark)}`,
                    color: tw(0.50, textIntensity, isDark),
                  }}>
                    {focusSec.difficulty === 'hard' ? 'Difficile' : focusSec.difficulty === 'medium' ? 'Moyen' : 'Facile'}
                  </span>
                </div>

                {/* Hint */}
                {focusSec.hint && (
                  <div style={{
                    padding: '14px 18px', borderRadius: 10,
                    border: `1px solid ${bg(0.08, isDark)}`,
                    background: bg(0.04, isDark),
                    color: tw(0.55, textIntensity, isDark),
                    fontSize: 13, lineHeight: '1.6',
                    marginBottom: 24,
                  }}>
                    <div style={{
                      fontSize: 9, fontWeight: 600, textTransform: 'uppercase',
                      letterSpacing: '1.5px', color: tw(0.25, textIntensity, isDark),
                      marginBottom: 8,
                    }}>
                      Conseil de r{'\u00E9'}daction
                    </div>
                    {focusSec.hint}
                  </div>
                )}

                {/* Tips from chapter */}
                {focusChapter.tips && (
                  <div style={{
                    padding: '14px 18px', borderRadius: 10,
                    borderLeft: `3px solid ${bg(0.10, isDark)}`,
                    background: bg(0.03, isDark),
                    color: tw(0.45, textIntensity, isDark),
                    fontSize: 12, lineHeight: '1.6', fontStyle: 'italic',
                    marginBottom: 24,
                  }}>
                    <div style={{
                      fontSize: 9, fontWeight: 600, textTransform: 'uppercase',
                      letterSpacing: '1.5px', color: tw(0.25, textIntensity, isDark),
                      marginBottom: 8, fontStyle: 'normal',
                    }}>
                      Conseils du chapitre
                    </div>
                    {focusChapter.tips}
                  </div>
                )}

                {/* Subtasks */}
                {hasTasks && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{
                      fontSize: 9, fontWeight: 600, textTransform: 'uppercase',
                      letterSpacing: '1.5px', color: tw(0.25, textIntensity, isDark),
                      marginBottom: 4,
                    }}>
                      Sous-t{'\u00E2'}ches
                    </div>
                    {focusSec.tasks!.map((taskText, idx) => {
                      const isComplete = taskStates[idx] ?? false
                      const isTaskLoading = loadingKey === `${focusChapter.num}:${focusSection.sectionIdx}:${idx}`
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            if (!isTaskLoading) onSubtaskToggle(focusChapter.num, focusSection.sectionIdx, idx)
                          }}
                          style={{
                            textAlign: 'left',
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '12px 16px', borderRadius: 10,
                            border: `1px solid ${bg(isComplete ? 0.12 : 0.06, isDark)}`,
                            background: bg(isComplete ? 0.06 : 0.02, isDark),
                            color: tw(isComplete ? 0.35 : 0.70, textIntensity, isDark),
                            fontSize: 14, cursor: isTaskLoading ? 'default' : 'pointer',
                            transition: 'all 0.15s',
                            opacity: isTaskLoading ? 0.5 : 1,
                          }}
                        >
                          <div style={{
                            width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: `1.5px solid ${isComplete ? bg(0.25, isDark) : bg(0.15, isDark)}`,
                            background: isComplete ? bg(0.70, isDark) : 'transparent',
                            fontSize: 11,
                          }}>
                            {isComplete && <span style={{ color: tw(0.92, textIntensity, isDark) }}>&#10003;</span>}
                          </div>
                          <span style={{
                            textDecoration: isComplete ? 'line-through' : 'none',
                            textDecorationColor: bg(0.15, isDark),
                          }}>
                            {taskText}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* Keyboard shortcuts overlay */}
      {showShortcuts && (
        <>
          <div
            onClick={() => setShowShortcuts(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 9998,
              background: 'var(--mq-bg-overlay)',
              backdropFilter: 'blur(6px)',
              animation: 'mq-overlay-in 0.2s ease both',
              cursor: 'pointer',
            }}
          />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999,
            width: 380, padding: '28px 32px',
            borderRadius: 18,
            background: isDark ? 'rgba(10,9,28,0.95)' : 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(40px) saturate(180%)',
            border: `1px solid ${bg(0.12, isDark)}`,
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            animation: 'mq-overlay-in 0.2s ease both',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: tw(0.92, textIntensity, isDark), margin: 0, letterSpacing: '-0.3px' }}>
                Raccourcis clavier
              </h3>
              <button
                onClick={() => setShowShortcuts(false)}
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  border: `1px solid ${bg(0.15, isDark)}`,
                  background: bg(0.06, isDark),
                  color: tw(0.7, textIntensity, isDark),
                  fontSize: 12, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {'\u2715'}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { keys: '1', desc: 'Dashboard' },
                { keys: '2', desc: 'Mon m\u00E9moire' },
                { keys: '3', desc: 'Progression' },
                { keys: '4', desc: 'Troph\u00E9es' },
                { keys: '[ ]', desc: 'Ouvrir / fermer la sidebar' },
                { keys: 'F', desc: 'Mode focus' },
                { keys: 'P', desc: 'Pomodoro' },
                { keys: 'Esc', desc: 'Retour au dashboard / quitter focus' },
                { keys: '?', desc: 'Afficher / masquer cette aide' },
              ].map((shortcut) => (
                <div key={shortcut.keys} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '6px 0',
                }}>
                  <span style={{ fontSize: 13, color: tw(0.65, textIntensity, isDark) }}>
                    {shortcut.desc}
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {shortcut.keys.split(' ').map((k) => (
                      <kbd key={k} style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        minWidth: 28, height: 26, padding: '0 8px',
                        borderRadius: 7,
                        background: bg(0.08, isDark),
                        border: `1px solid ${bg(0.15, isDark)}`,
                        fontSize: 12, fontWeight: 600,
                        color: tw(0.80, textIntensity, isDark),
                        fontFamily: FONT,
                      }}>
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: 16, paddingTop: 14,
              borderTop: `1px solid ${bg(0.08, isDark)}`,
              fontSize: 11, color: tw(0.35, textIntensity, isDark),
              textAlign: 'center',
            }}>
              Appuie sur <kbd style={{
                padding: '1px 6px', borderRadius: 4,
                background: bg(0.06, isDark),
                border: `1px solid ${bg(0.12, isDark)}`,
                fontSize: 11, fontWeight: 600,
                color: tw(0.60, textIntensity, isDark),
              }}>?</kbd> ou <kbd style={{
                padding: '1px 6px', borderRadius: 4,
                background: bg(0.06, isDark),
                border: `1px solid ${bg(0.12, isDark)}`,
                fontSize: 11, fontWeight: 600,
                color: tw(0.60, textIntensity, isDark),
              }}>Esc</kbd> pour fermer
            </div>
          </div>
        </>
      )}
    </div>
  )
}
