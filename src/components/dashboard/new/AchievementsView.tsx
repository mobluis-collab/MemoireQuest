'use client'

import { useState } from 'react'

/* ─── Types ──────────────────────────────────────────────── */

interface Achievement {
  id: string
  icon: string
  title: string
  description: string
  unlocked: boolean
  progress?: { current: number; target: number }
  tier: number // 0=base, 1=jalons, 2=défis, 3=sommet
}

interface AchievementsViewProps {
  totalPoints: number
  streak: { current: number; jokers: number }
  questProgress: Record<string, Record<string, 'done'>>
  chapters: Array<{ num: string; title: string; sections: number; done: number }>
}

/* ─── Tier labels ────────────────────────────────────────── */

const TIER_LABELS = ['Premiers pas', 'Jalons', 'Défis', 'Aboutissement']

/* ─── Build achievements ─────────────────────────────────── */

function buildAchievements(
  totalPoints: number,
  streak: { current: number },
  questProgress: Record<string, Record<string, 'done'>>,
  chapters: Array<{ num: string; sections: number; done: number }>,
): Achievement[] {
  const totalSec = chapters.reduce((a, c) => a + c.sections, 0)
  const doneSec  = chapters.reduce((a, c) => a + c.done, 0)
  const completedChapters = chapters.filter(c => c.done === c.sections && c.sections > 0).length

  return [
    // Tier 0 — Base (4)
    {
      id: 'first_step', icon: '→', title: 'Premier pas',
      description: 'Valider ta première section',
      tier: 0, unlocked: doneSec >= 1,
    },
    {
      id: 'xp_100', icon: '·', title: '100 points',
      description: "Atteindre 100 points d'expérience",
      tier: 0, unlocked: totalPoints >= 100,
      progress: { current: Math.min(totalPoints, 100), target: 100 },
    },
    {
      id: 'streak_3', icon: '∿', title: 'Régulier',
      description: '3 jours consécutifs',
      tier: 0, unlocked: streak.current >= 3,
      progress: { current: Math.min(streak.current, 3), target: 3 },
    },
    {
      id: 'sections_5', icon: '§', title: '5 sections',
      description: 'Valider 5 sections',
      tier: 0, unlocked: doneSec >= 5,
      progress: { current: Math.min(doneSec, 5), target: 5 },
    },
    // Tier 1 — Jalons (4)
    {
      id: 'first_chapter', icon: '¶', title: 'Premier chapitre',
      description: 'Terminer un chapitre en entier',
      tier: 1, unlocked: completedChapters >= 1,
    },
    {
      id: 'xp_300', icon: '◇', title: '300 points',
      description: "Atteindre 300 points d'expérience",
      tier: 1, unlocked: totalPoints >= 300,
      progress: { current: Math.min(totalPoints, 300), target: 300 },
    },
    {
      id: 'streak_7', icon: '∞', title: 'Semaine parfaite',
      description: '7 jours consécutifs',
      tier: 1, unlocked: streak.current >= 7,
      progress: { current: Math.min(streak.current, 7), target: 7 },
    },
    {
      id: 'half_way', icon: '½', title: 'Mi-chemin',
      description: '50% du mémoire',
      tier: 1, unlocked: totalSec > 0 && doneSec / totalSec >= 0.5,
      progress: totalSec > 0 ? { current: doneSec, target: Math.ceil(totalSec / 2) } : undefined,
    },
    // Tier 2 — Défis (3)
    {
      id: 'sections_20', icon: '◆', title: '20 sections',
      description: 'Valider 20 sections',
      tier: 2, unlocked: doneSec >= 20,
      progress: { current: Math.min(doneSec, 20), target: 20 },
    },
    {
      id: 'streak_14', icon: '∎', title: 'Endurant',
      description: '14 jours consécutifs',
      tier: 2, unlocked: streak.current >= 14,
      progress: { current: Math.min(streak.current, 14), target: 14 },
    },
    {
      id: 'xp_1000', icon: '◈', title: '1 000 points',
      description: "Atteindre 1 000 points d'expérience",
      tier: 2, unlocked: totalPoints >= 1000,
      progress: { current: Math.min(totalPoints, 1000), target: 1000 },
    },
    // Tier 3 — Sommet (1)
    {
      id: 'all_done', icon: '✦', title: 'Docteur ès Mémoires',
      description: 'Compléter 100% du mémoire',
      tier: 3, unlocked: totalSec > 0 && doneSec === totalSec,
      progress: { current: doneSec, target: totalSec },
    },
  ]
}

/* ─── Pyramid block ──────────────────────────────────────── */

function PyramidBlock({ a, size, tierIndex }: { a: Achievement; size: number; tierIndex: number }) {
  const [hovered, setHovered] = useState(false)
  const progressPct = a.progress
    ? Math.round((a.progress.current / a.progress.target) * 100)
    : null

  // More luminous for higher tiers
  const baseBg = [0.02, 0.03, 0.04, 0.06][tierIndex]
  const unlockedBg = [0.06, 0.08, 0.10, 0.14][tierIndex]
  const borderOpa = [0.08, 0.10, 0.12, 0.18][tierIndex]
  const unlockedBorder = [0.12, 0.15, 0.18, 0.25][tierIndex]

  const isSummit = tierIndex === 3

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: isSummit ? 16 : 12,
        background: `rgba(255,255,255,${a.unlocked ? unlockedBg : baseBg})`,
        border: `1px solid rgba(255,255,255,${a.unlocked ? unlockedBorder : borderOpa})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.25s ease',
        cursor: 'default',
        opacity: a.unlocked ? 1 : 0.40,
        transform: hovered ? 'scale(1.08)' : 'scale(1)',
      }}
    >
      {/* Icon */}
      <span style={{
        fontSize: isSummit ? 22 : 16,
        color: `rgba(255,255,255,${a.unlocked ? 0.75 : 0.30})`,
        fontWeight: 300,
        userSelect: 'none',
      }}>{a.icon}</span>

      {/* Checkmark for unlocked */}
      {a.unlocked && (
        <span style={{
          position: 'absolute',
          top: 4, right: 5,
          fontSize: 8,
          color: 'rgba(255,255,255,0.45)',
        }}>✓</span>
      )}

      {/* Hover tooltip */}
      {hovered && (
        <div style={{
          position: 'absolute',
          bottom: '110%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(10,10,20,0.95)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 10,
          padding: '10px 14px',
          width: 180,
          zIndex: 50,
          pointerEvents: 'none',
        }}>
          <div style={{
            fontSize: 12, fontWeight: 600,
            color: 'rgba(255,255,255,0.85)',
            marginBottom: 3,
          }}>{a.title}</div>
          <div style={{
            fontSize: 10, lineHeight: 1.4,
            color: 'rgba(255,255,255,0.45)',
            marginBottom: a.progress ? 8 : 0,
          }}>{a.description}</div>

          {a.progress && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>
                  {a.progress.current} / {a.progress.target}
                </span>
                <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.50)' }}>
                  {progressPct}%
                </span>
              </div>
              <div style={{ height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${progressPct}%`,
                  borderRadius: 99,
                  background: `rgba(255,255,255,${a.unlocked ? 0.40 : 0.18})`,
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          )}

          {/* Tooltip arrow */}
          <div style={{
            position: 'absolute',
            bottom: -5,
            left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: 8, height: 8,
            background: 'rgba(10,10,20,0.95)',
            borderRight: '1px solid rgba(255,255,255,0.12)',
            borderBottom: '1px solid rgba(255,255,255,0.12)',
          }} />
        </div>
      )}
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────── */

export default function AchievementsView({ totalPoints, streak, questProgress, chapters }: AchievementsViewProps) {
  const achievements = buildAchievements(totalPoints, streak, questProgress, chapters)
  const unlocked = achievements.filter(a => a.unlocked).length
  const total = achievements.length

  // Group by tier (0→3)
  const tiers = [0, 1, 2, 3].map(t => achievements.filter(a => a.tier === t))

  // Block sizes: bigger for higher tiers
  const blockSizes = [56, 60, 64, 76]

  // Pyramid rows: bottom to top → tiers [0, 1, 2, 3]
  // Render top to bottom: tier 3 (sommet), tier 2, tier 1, tier 0 (base)
  const pyramidOrder = [3, 2, 1, 0]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ flexShrink: 0, marginBottom: 24 }}>
        <h1 style={{
          fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', margin: 0,
          color: 'rgba(255,255,255,0.85)',
        }}>Progression</h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
          {unlocked} / {total}
        </p>
      </div>

      {/* Pyramid */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
      }}>
        {pyramidOrder.map(tierIdx => {
          const tierAchievements = tiers[tierIdx]
          const size = blockSizes[tierIdx]
          const label = TIER_LABELS[tierIdx]

          return (
            <div key={tierIdx} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}>
              {/* Tier label */}
              <span style={{
                width: 90,
                textAlign: 'right',
                fontSize: 10,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.22)',
                letterSpacing: '0.3px',
                flexShrink: 0,
              }}>{label}</span>

              {/* Blocks row */}
              <div style={{
                display: 'flex',
                gap: 8,
                justifyContent: 'center',
              }}>
                {tierAchievements.map(a => (
                  <PyramidBlock
                    key={a.id}
                    a={a}
                    size={size}
                    tierIndex={tierIdx}
                  />
                ))}
              </div>

              {/* Spacer to balance the label */}
              <span style={{ width: 90, flexShrink: 0 }} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
