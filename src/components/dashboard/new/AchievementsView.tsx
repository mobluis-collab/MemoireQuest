'use client'

import { useState } from 'react'
import { tw, bg } from '@/lib/color-utils'
import { SectionProgress } from '@/types/memoir'

/* ─── Types ─────────────────────────────────────────────── */

interface Achievement {
  id: string
  title: string
  description: string
  unlocked: boolean
  progress?: { current: number; target: number }
  tier: number
}

interface AchievementsViewProps {
  totalPoints: number
  streak: { current: number; jokers: number }
  questProgress: Record<string, Record<string, SectionProgress>>
  chapters: Array<{ num: string; title: string; sections: number; done: number }>
  accentColor?: string
  textIntensity?: number
  isDark?: boolean
}

/* ─── Build achievements (unchanged) ────────────────────── */

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
    { id: 'first_section', tier: 0, title: 'Premier pas', description: 'Valider ta toute premi\u00e8re section', unlocked: doneSec >= 1 },
    { id: 'sections_5', tier: 0, title: '5 sections', description: 'Valider 5 sections au total', unlocked: doneSec >= 5, progress: { current: Math.min(doneSec, 5), target: 5 } },
    { id: 'streak_3', tier: 0, title: 'R\u00e9gulier', description: 'Travailler 3 jours cons\u00e9cutifs', unlocked: streak.current >= 3, progress: { current: Math.min(streak.current, 3), target: 3 } },
    { id: 'first_chapter', tier: 0, title: 'Chapitre boucl\u00e9', description: 'Compl\u00e9ter toutes les sections d\'un chapitre', unlocked: completedChapters >= 1 },

    // ─── Étage 2 (tier 1) — Jalons ───
    { id: 'sections_10', tier: 1, title: '10 sections', description: 'Valider 10 sections au total', unlocked: doneSec >= 10, progress: { current: Math.min(doneSec, 10), target: 10 } },
    { id: 'streak_7', tier: 1, title: 'Semaine parfaite', description: 'Une semaine compl\u00e8te de travail', unlocked: streak.current >= 7, progress: { current: Math.min(streak.current, 7), target: 7 } },
    { id: 'half_way', tier: 1, title: 'Mi-chemin', description: 'Atteindre 50% du m\u00e9moire', unlocked: pct >= 0.5, progress: totalSec > 0 ? { current: doneSec, target: Math.ceil(totalSec / 2) } : undefined },
    { id: 'chapters_3', tier: 1, title: '3 chapitres', description: 'Compl\u00e9ter 3 chapitres entiers', unlocked: completedChapters >= 3, progress: { current: Math.min(completedChapters, 3), target: 3 } },

    // ─── Étage 3 (tier 2) — Défis ───
    { id: 'sections_20', tier: 2, title: '20 sections', description: 'Valider 20 sections au total', unlocked: doneSec >= 20, progress: { current: Math.min(doneSec, 20), target: 20 } },
    { id: 'streak_14', tier: 2, title: 'Endurant', description: 'Deux semaines sans interruption', unlocked: streak.current >= 14, progress: { current: Math.min(streak.current, 14), target: 14 } },
    { id: 'points_1000', tier: 2, title: '1000 XP', description: 'Accumuler 1000 points d\'exp\u00e9rience', unlocked: totalPoints >= 1000, progress: { current: Math.min(totalPoints, 1000), target: 1000 } },

    // ─── Sommet (tier 3) — Aboutissement ───
    { id: 'all_done', tier: 3, title: 'Docteur \u00e8s M\u00e9moires', description: 'Compl\u00e9ter 100% du m\u00e9moire', unlocked: totalSec > 0 && doneSec === totalSec, progress: totalSec > 0 ? { current: doneSec, target: totalSec } : undefined },
  ]
}

/* ─── Trophy SVG Icons ──────────────────────────────────── */

function TrophyIcon({ id, size = 24, color }: { id: string; size?: number; color: string }) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

  switch (id) {
    case 'first_section':
      return <svg {...props}><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
    case 'sections_5':
      return <svg {...props}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
    case 'streak_3':
      return <svg {...props}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
    case 'first_chapter':
      return <svg {...props}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="9" y1="7" x2="15" y2="7"/></svg>
    case 'sections_10':
      return <svg {...props}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
    case 'streak_7':
      return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    case 'half_way':
      return <svg {...props}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
    case 'chapters_3':
      return <svg {...props}><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
    case 'sections_20':
      return <svg {...props}><polygon points="12,2 22,8.5 12,15 2,8.5"/><polyline points="2,15.5 12,22 22,15.5"/><polyline points="2,12 12,18.5 22,12"/></svg>
    case 'streak_14':
      return <svg {...props}><path d="M12 2l8 4v6c0 5.25-3.5 10.74-8 12-4.5-1.26-8-6.75-8-12V6l8-4z"/></svg>
    case 'points_1000':
      return <svg {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/></svg>
    case 'all_done':
      return <svg {...props}><path d="M2 8l4 12h12l4-12-5 4-5-8-5 8-5-4z"/><line x1="4" y1="20" x2="20" y2="20"/></svg>
    default:
      return <svg {...props}><circle cx="12" cy="12" r="10"/></svg>
  }
}

/* ─── Blue accent helpers for unlocked trophies ────────── */

function blueBg(opacity: number, isDark: boolean): string {
  return isDark
    ? `rgba(56, 139, 255, ${opacity})`
    : `rgba(37, 99, 205, ${opacity})`
}

function blueTw(opacity: number): string {
  return `rgba(56, 139, 255, ${opacity})`
}

/* ─── Trophy Card ───────────────────────────────────────── */

function TrophyCard({
  achievement,
  isSummit,
  textIntensity,
  isDark,
  isHovered,
  onHover,
  onLeave,
}: {
  achievement: Achievement
  isSummit: boolean
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
  const iconSize = isSummit ? 28 : 24
  const hexSize = isSummit ? 56 : 48

  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        position: 'relative',
        borderRadius: 14,
        padding: isSummit ? '24px 16px 18px' : '20px 14px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 10,
        transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
        cursor: 'default',
        ...(isSummit ? { maxWidth: 220 } : {}),
        // Background & border — unlocked uses blue accent
        background: isHovered
          ? (u ? blueBg(0.12, isDark) : bg(0.07, isDark))
          : (u ? blueBg(0.08, isDark) : bg(0.05, isDark)),
        border: `1px solid ${isHovered
          ? (u ? blueBg(0.40, isDark) : bg(0.20, isDark))
          : (u
            ? blueBg(0.25, isDark)
            : bg(0.15, isDark))
        }`,
        transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: isHovered && u ? `0 4px 30px ${blueBg(0.15, isDark)}` : 'none',
      }}
    >
      {/* Icon container with hexagon background */}
      <div style={{
        position: 'relative',
        width: hexSize,
        height: hexSize,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Hexagon SVG background */}
        <svg viewBox="0 0 48 48" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <polygon
            points="24,3 44,14 44,34 24,45 4,34 4,14"
            fill={u ? blueBg(0.10, isDark) : bg(0.08, isDark)}
            stroke={u ? blueBg(0.30, isDark) : bg(0.25, isDark)}
            strokeWidth="0.8"
          />
        </svg>

        {/* Icon */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <TrophyIcon
            id={achievement.id}
            size={iconSize}
            color={u ? blueTw(0.90) : tw(0.70, textIntensity, isDark)}
          />
        </div>

        {/* Lock icon for locked items */}
        {!u && (
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke={tw(0.40, textIntensity, isDark)} strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"
            style={{ position: 'absolute', bottom: 0, right: 0, zIndex: 2 }}
          >
            <rect x="5" y="11" width="14" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        )}
      </div>

      {/* Title */}
      <div style={{
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '-0.1px',
        color: u ? blueTw(0.95) : tw(0.60, textIntensity, isDark),
        lineHeight: '1.3',
      }}>
        {achievement.title}
      </div>

      {/* Description */}
      <div style={{
        fontSize: 11,
        color: u ? blueTw(0.60) : tw(0.45, textIntensity, isDark),
        lineHeight: '1.4',
      }}>
        {achievement.description}
      </div>

      {/* Progress bar (locked with progress) */}
      {!u && pct !== null && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
          <div style={{
            width: '100%',
            height: 2,
            borderRadius: 99,
            background: bg(0.10, isDark),
            overflow: 'hidden',
            marginTop: 2,
          }}>
            <div style={{
              height: '100%',
              borderRadius: 99,
              background: tw(0.50, textIntensity, isDark),
              width: `${pct}%`,
              transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
            }} />
          </div>
          <span style={{
            fontSize: 10,
            fontWeight: 500,
            color: tw(0.50, textIntensity, isDark),
            fontVariantNumeric: 'tabular-nums',
          }}>
            {achievement.progress!.current} / {achievement.progress!.target}
          </span>
        </div>
      )}

      {/* Unlocked badge */}
      {u && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke={blueTw(0.90)} strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span style={{
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
            color: blueTw(0.90),
          }}>
            d{'\u00e9'}bloqu{'\u00e9'}
          </span>
        </div>
      )}
    </div>
  )
}

/* ─── Tier labels ───────────────────────────────────────── */

const TIER_LABELS = ['Premiers pas', 'Jalons', 'D\u00e9fis', 'Aboutissement']

/* ─── Main component ────────────────────────────────────── */

export default function AchievementsView({
  totalPoints,
  streak,
  questProgress,
  chapters,
  textIntensity = 1.0,
  isDark = true,
}: AchievementsViewProps) {
  const achievements = buildAchievements(totalPoints, streak, questProgress, chapters)
  const unlocked = achievements.filter(a => a.unlocked).length
  const total = achievements.length

  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // Group by tier
  const tiers = [0, 1, 2, 3].map(t => achievements.filter(a => a.tier === t))

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'auto',
      padding: '0 0 40px 0',
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
            Troph{'\u00e9'}es
          </h1>
          <span style={{
            fontSize: 13,
            fontWeight: 500,
            color: tw(0.40, textIntensity, isDark),
          }}>
            {unlocked} / {total}
          </span>
        </div>
        <p style={{
          fontSize: 13,
          color: tw(0.40, textIntensity, isDark),
          margin: '6px 0 0',
          fontWeight: 400,
        }}>
          Relève les défis pour débloquer de nouveaux badges !
        </p>
      </div>

      {/* Tiers: 0 → 1 → 2 → 3 (base to summit) */}
      {[0, 1, 2, 3].map((tierIdx, i) => {
        const items = tiers[tierIdx]
        const isSummit = tierIdx === 3

        // Grid columns: tier 0,1 = 4 cols, tier 2 = 3 cols, tier 3 = 1 col
        const gridCols = tierIdx <= 1 ? 'repeat(4, 1fr)' : tierIdx === 2 ? 'repeat(3, 1fr)' : '1fr'

        return (
          <div key={tierIdx}>
            {/* Separator (between tiers, not before first) */}
            {i > 0 && (
              <div style={{
                height: 1,
                background: `linear-gradient(90deg, transparent, ${bg(0.10, isDark)} 30%, ${bg(0.10, isDark)} 70%, transparent)`,
                margin: '4px 0 24px 0',
              }} />
            )}

            {/* Tier label */}
            <div style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              color: tw(0.60, textIntensity, isDark),
              marginBottom: 12,
              paddingLeft: 2,
            }}>
              {TIER_LABELS[tierIdx]}
            </div>

            {/* Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: gridCols,
              gap: 10,
              ...(isSummit ? { maxWidth: 220 } : {}),
              marginBottom: 4,
            }}>
              {items.map(a => (
                <TrophyCard
                  key={a.id}
                  achievement={a}
                  isSummit={isSummit}
                  textIntensity={textIntensity}
                  isDark={isDark}
                  isHovered={hoveredId === a.id}
                  onHover={() => setHoveredId(a.id)}
                  onLeave={() => setHoveredId(null)}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
