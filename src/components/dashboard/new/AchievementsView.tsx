'use client'

import { useState } from 'react'
import { tw, bg } from '@/lib/color-utils'

/* ─── Types ─────────────────────────────────────────────── */

interface Achievement {
  id: string
  title: string
  description: string
  unlocked: boolean
  progress?: { current: number; target: number }
  tier: number // 0=base, 1=étage2, 2=étage3, 3=sommet
}

import { SectionProgress } from '@/types/memoir'

interface AchievementsViewProps {
  totalPoints: number
  streak: { current: number; jokers: number }
  questProgress: Record<string, Record<string, SectionProgress>>
  chapters: Array<{ num: string; title: string; sections: number; done: number }>
  accentColor?: string
  textIntensity?: number
  isDark?: boolean
}

/* ─── Build achievements (pyramid layout) ────────────────── */

function buildAchievements(
  totalPoints: number,
  streak: { current: number },
  questProgress: Record<string, Record<string, SectionProgress>>,
  chapters: Array<{ num: string; sections: number; done: number }>,
): Achievement[] {
  const totalSec = chapters.reduce((a, c) => a + c.sections, 0)
  const doneSec  = chapters.reduce((a, c) => a + c.done, 0)
  const completedChapters = chapters.filter(c => c.done === c.sections && c.sections > 0).length
  const pct = totalSec > 0 ? doneSec / totalSec : 0

  return [
    // ─── Base (tier 0) — Premiers pas ───
    { id: 'first_section', tier: 0, title: 'Premier pas', description: 'Valider ta toute première section', unlocked: doneSec >= 1 },
    { id: 'sections_5', tier: 0, title: '5 sections', description: 'Valider 5 sections au total', unlocked: doneSec >= 5, progress: { current: Math.min(doneSec, 5), target: 5 } },
    { id: 'streak_3', tier: 0, title: 'Régulier', description: 'Travailler 3 jours consécutifs', unlocked: streak.current >= 3, progress: { current: Math.min(streak.current, 3), target: 3 } },
    { id: 'first_chapter', tier: 0, title: 'Chapitre bouclé', description: 'Compléter toutes les sections d\'un chapitre', unlocked: completedChapters >= 1 },

    // ─── Étage 2 (tier 1) — Jalons ───
    { id: 'sections_10', tier: 1, title: '10 sections', description: 'Valider 10 sections au total', unlocked: doneSec >= 10, progress: { current: Math.min(doneSec, 10), target: 10 } },
    { id: 'streak_7', tier: 1, title: 'Semaine parfaite', description: 'Une semaine complète de travail', unlocked: streak.current >= 7, progress: { current: Math.min(streak.current, 7), target: 7 } },
    { id: 'half_way', tier: 1, title: 'Mi-chemin', description: 'Atteindre 50% du mémoire', unlocked: pct >= 0.5, progress: totalSec > 0 ? { current: doneSec, target: Math.ceil(totalSec / 2) } : undefined },
    { id: 'chapters_3', tier: 1, title: '3 chapitres', description: 'Compléter 3 chapitres entiers', unlocked: completedChapters >= 3, progress: { current: Math.min(completedChapters, 3), target: 3 } },

    // ─── Étage 3 (tier 2) — Défis ───
    { id: 'sections_20', tier: 2, title: '20 sections', description: 'Valider 20 sections au total', unlocked: doneSec >= 20, progress: { current: Math.min(doneSec, 20), target: 20 } },
    { id: 'streak_14', tier: 2, title: 'Endurant', description: 'Deux semaines sans interruption', unlocked: streak.current >= 14, progress: { current: Math.min(streak.current, 14), target: 14 } },
    { id: 'points_1000', tier: 2, title: '1000 XP', description: 'Accumuler 1000 points d\'expérience', unlocked: totalPoints >= 1000, progress: { current: Math.min(totalPoints, 1000), target: 1000 } },

    // ─── Sommet (tier 3) — Aboutissement ───
    { id: 'all_done', tier: 3, title: 'Docteur ès Mémoires', description: 'Compléter 100% du mémoire', unlocked: totalSec > 0 && doneSec === totalSec, progress: totalSec > 0 ? { current: doneSec, target: totalSec } : undefined },
  ]
}

/* ─── Tier metadata ──────────────────────────────────────── */

const TIERS = [
  { name: 'Premiers pas', bgOpacity: 0.02, borderOpacity: 0.06 },
  { name: 'Jalons',       bgOpacity: 0.04, borderOpacity: 0.08 },
  { name: 'Défis',        bgOpacity: 0.06, borderOpacity: 0.10 },
  { name: 'Aboutissement', bgOpacity: 0.08, borderOpacity: 0.15 },
]

/* ─── Pyramid block ──────────────────────────────────────── */

function PyramidBlock({
  achievement,
  tierBg,
  tierBorder,
  isSummit,
  accentColor,
  textIntensity,
  isDark,
  isHovered,
  onHover,
  onLeave,
}: {
  achievement: Achievement
  tierBg: number
  tierBorder: number
  isSummit: boolean
  accentColor: string
  textIntensity: number
  isDark: boolean
  isHovered: boolean
  onHover: () => void
  onLeave: () => void
}) {
  const u = achievement.unlocked
  const pct = achievement.progress
    ? Math.round((achievement.progress.current / achievement.progress.target) * 100)
    : null
  const size = isSummit ? 72 : 56

  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: isSummit ? 14 : 10,
        background: u ? bg(tierBg + 0.04, isDark) : bg(tierBg, isDark),
        border: `1px solid ${u ? bg(tierBorder + 0.04, isDark) : bg(tierBorder, isDark)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'default',
        opacity: u ? 1 : 0.40,
        transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
        transform: isHovered ? 'scale(1.12)' : 'scale(1)',
        boxShadow: isHovered
          ? `0 4px 20px ${bg(0.12, isDark)}`
          : u
            ? `0 1px 6px ${bg(0.04, isDark)}`
            : 'none',
      }}
    >
      {/* Icon */}
      <span style={{
        fontSize: isSummit ? 22 : 16,
        color: u ? tw(0.80, textIntensity, isDark) : tw(0.25, textIntensity, isDark),
        lineHeight: 1,
        userSelect: 'none',
      }}>
        {u ? '✓' : '○'}
      </span>

      {/* Progress ring for locked items with progress */}
      {!u && pct !== null && pct > 0 && (
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          viewBox="0 0 100 100"
        >
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke={bg(0.06, isDark)}
            strokeWidth="2"
          />
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke={accentColor}
            strokeWidth="2"
            strokeDasharray={`${2 * Math.PI * 44}`}
            strokeDashoffset={`${2 * Math.PI * 44 * (1 - pct / 100)}`}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(.4,0,.2,1)' }}
          />
        </svg>
      )}

      {/* Tooltip on hover */}
      {isHovered && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: 8,
          padding: '10px 14px',
          background: isDark ? 'rgba(10,10,20,0.95)' : 'rgba(255,255,255,0.97)',
          border: `1px solid ${bg(0.10, isDark)}`,
          borderRadius: 10,
          boxShadow: `0 8px 32px ${bg(0.15, isDark)}`,
          whiteSpace: 'nowrap',
          zIndex: 50,
          backdropFilter: 'blur(12px)',
          minWidth: 160,
        }}>
          {/* Title */}
          <div style={{
            fontSize: 13,
            fontWeight: 600,
            color: tw(0.88, textIntensity, isDark),
            marginBottom: 3,
          }}>
            {achievement.title}
          </div>

          {/* Description */}
          <div style={{
            fontSize: 11,
            color: tw(0.45, textIntensity, isDark),
            marginBottom: pct !== null && !u ? 8 : 0,
          }}>
            {achievement.description}
          </div>

          {/* Progress bar in tooltip */}
          {!u && pct !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                flex: 1,
                height: 3,
                borderRadius: 99,
                background: bg(0.08, isDark),
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${pct}%`,
                  borderRadius: 99,
                  background: accentColor,
                  transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
                }} />
              </div>
              <span style={{
                fontSize: 10,
                fontWeight: 500,
                color: tw(0.50, textIntensity, isDark),
              }}>
                {achievement.progress!.current}/{achievement.progress!.target}
              </span>
            </div>
          )}

          {/* Unlocked badge */}
          {u && (
            <div style={{
              marginTop: 4,
              fontSize: 10,
              fontWeight: 600,
              color: tw(0.55, textIntensity, isDark),
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}>
              Débloqué
            </div>
          )}

          {/* Tooltip arrow */}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: `6px solid ${bg(0.10, isDark)}`,
          }} />
        </div>
      )}
    </div>
  )
}

/* ─── Main component — Pyramide ──────────────────────────── */

export default function AchievementsView({
  totalPoints,
  streak,
  questProgress,
  chapters,
  accentColor = '#6366f1',
  textIntensity = 1.0,
  isDark = true,
}: AchievementsViewProps) {
  const achievements = buildAchievements(totalPoints, streak, questProgress, chapters)
  const unlocked = achievements.filter(a => a.unlocked).length
  const total = achievements.length

  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // Group by tier (pyramid rows: bottom → top)
  const tiers = [0, 1, 2, 3].map(t => achievements.filter(a => a.tier === t))

  // Pyramid rows are displayed top → bottom visually but tier 3 is at top
  const pyramidRows = [
    { tier: 3, items: tiers[3] }, // Sommet — 1 block
    { tier: 2, items: tiers[2] }, // Défis — 3 blocks
    { tier: 1, items: tiers[1] }, // Jalons — 4 blocks
    { tier: 0, items: tiers[0] }, // Premiers pas — 4 blocks
  ]

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ flexShrink: 0, marginBottom: 24 }}>
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
        }}>
          <h1 style={{
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: '-0.3px',
            margin: 0,
            color: tw(0.88, textIntensity, isDark),
          }}>
            Trophées
          </h1>
          <span style={{
            fontSize: 13,
            fontWeight: 500,
            color: tw(0.40, textIntensity, isDark),
          }}>
            {unlocked} / {total}
          </span>
        </div>
      </div>

      {/* Pyramid container */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        paddingBottom: 20,
      }}>
        {pyramidRows.map(({ tier, items }) => {
          const meta = TIERS[tier]

          return (
            <div key={tier} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              {/* Tier label — left side, only on wider rows */}
              <div style={{
                width: 80,
                textAlign: 'right',
                paddingRight: 12,
                flexShrink: 0,
              }}>
                <span style={{
                  fontSize: 10,
                  fontWeight: 500,
                  color: tw(0.25, textIntensity, isDark),
                  letterSpacing: '0.3px',
                  textTransform: 'uppercase',
                }}>
                  {meta.name}
                </span>
              </div>

              {/* Blocks */}
              <div style={{
                display: 'flex',
                gap: tier === 3 ? 0 : 8,
                justifyContent: 'center',
              }}>
                {items.map(a => (
                  <PyramidBlock
                    key={a.id}
                    achievement={a}
                    tierBg={meta.bgOpacity}
                    tierBorder={meta.borderOpacity}
                    isSummit={tier === 3}
                    accentColor={accentColor}
                    textIntensity={textIntensity}
                    isDark={isDark}
                    isHovered={hoveredId === a.id}
                    onHover={() => setHoveredId(a.id)}
                    onLeave={() => setHoveredId(null)}
                  />
                ))}
              </div>

              {/* Spacer to balance the label */}
              <div style={{ width: 80, flexShrink: 0 }} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
