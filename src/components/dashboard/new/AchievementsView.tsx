'use client'

import { useState } from 'react'

/* ─── Types ──────────────────────────────────────────────── */

interface Achievement {
  id: string
  title: string
  description: string
  unlocked: boolean
  progress?: { current: number; target: number }
  group: string
}

interface AchievementsViewProps {
  totalPoints: number
  streak: { current: number; jokers: number }
  questProgress: Record<string, Record<string, 'done'>>
  chapters: Array<{ num: string; title: string; sections: number; done: number }>
}

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
    // Premiers pas
    { id: 'first_step', title: 'Premier pas', description: 'Valider ta première section', group: 'Premiers pas', unlocked: doneSec >= 1 },
    { id: 'xp_100', title: '100 points', description: '100 points d\'expérience', group: 'Premiers pas', unlocked: totalPoints >= 100, progress: { current: Math.min(totalPoints, 100), target: 100 } },
    { id: 'streak_3', title: '3 jours', description: '3 jours de travail consécutifs', group: 'Premiers pas', unlocked: streak.current >= 3, progress: { current: Math.min(streak.current, 3), target: 3 } },
    { id: 'sections_5', title: '5 sections', description: 'Valider 5 sections', group: 'Premiers pas', unlocked: doneSec >= 5, progress: { current: Math.min(doneSec, 5), target: 5 } },
    // Jalons
    { id: 'first_chapter', title: 'Premier chapitre', description: 'Terminer un chapitre entier', group: 'Jalons', unlocked: completedChapters >= 1 },
    { id: 'xp_300', title: '300 points', description: '300 points d\'expérience', group: 'Jalons', unlocked: totalPoints >= 300, progress: { current: Math.min(totalPoints, 300), target: 300 } },
    { id: 'streak_7', title: 'Semaine parfaite', description: '7 jours consécutifs', group: 'Jalons', unlocked: streak.current >= 7, progress: { current: Math.min(streak.current, 7), target: 7 } },
    { id: 'half_way', title: 'Mi-chemin', description: '50% du mémoire', group: 'Jalons', unlocked: totalSec > 0 && doneSec / totalSec >= 0.5, progress: totalSec > 0 ? { current: doneSec, target: Math.ceil(totalSec / 2) } : undefined },
    // Défis
    { id: 'sections_20', title: '20 sections', description: 'Valider 20 sections', group: 'Défis', unlocked: doneSec >= 20, progress: { current: Math.min(doneSec, 20), target: 20 } },
    { id: 'streak_14', title: 'Endurant', description: '14 jours consécutifs', group: 'Défis', unlocked: streak.current >= 14, progress: { current: Math.min(streak.current, 14), target: 14 } },
    { id: 'xp_1000', title: '1 000 points', description: '1 000 points d\'expérience', group: 'Défis', unlocked: totalPoints >= 1000, progress: { current: Math.min(totalPoints, 1000), target: 1000 } },
    // Final
    { id: 'all_done', title: 'Mémoire terminé', description: '100% du mémoire complété', group: 'Aboutissement', unlocked: totalSec > 0 && doneSec === totalSec, progress: { current: doneSec, target: totalSec } },
  ]
}

/* ─── Row component ──────────────────────────────────────── */

function AchievementRow({ a }: { a: Achievement }) {
  const [hovered, setHovered] = useState(false)
  const pct = a.progress ? Math.round((a.progress.current / a.progress.target) * 100) : null

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        borderRadius: 10,
        background: hovered ? 'rgba(255,255,255,0.03)' : 'transparent',
        transition: 'background 0.15s',
        cursor: 'default',
      }}
    >
      {/* Check / circle */}
      <div style={{
        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1.5px solid rgba(255,255,255,${a.unlocked ? '0.30' : '0.10'})`,
        background: a.unlocked ? 'rgba(255,255,255,0.08)' : 'transparent',
      }}>
        {a.unlocked && (
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)' }}>✓</span>
        )}
      </div>

      {/* Title + progress */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 500,
          color: `rgba(255,255,255,${a.unlocked ? '0.80' : '0.35'})`,
          textDecoration: a.unlocked ? 'none' : 'none',
        }}>
          {a.title}
        </div>
        {/* Description on hover or if has progress */}
        {(hovered || (a.progress && !a.unlocked)) && (
          <div style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.30)',
            marginTop: 2,
          }}>
            {a.description}
          </div>
        )}
      </div>

      {/* Progress indicator */}
      {a.progress && !a.unlocked && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          flexShrink: 0,
        }}>
          {/* Mini bar */}
          <div style={{
            width: 48, height: 3, borderRadius: 99,
            background: 'rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${pct}%`,
              borderRadius: 99,
              background: 'rgba(255,255,255,0.20)',
              transition: 'width 0.5s ease',
            }} />
          </div>
          <span style={{
            fontSize: 10, fontWeight: 500,
            color: 'rgba(255,255,255,0.30)',
            minWidth: 28, textAlign: 'right',
          }}>
            {pct}%
          </span>
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

  // Group achievements
  const groups = ['Premiers pas', 'Jalons', 'Défis', 'Aboutissement']
  const grouped = groups.map(g => ({
    label: g,
    items: achievements.filter(a => a.group === g),
  }))

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ flexShrink: 0, marginBottom: 20 }}>
        <h1 style={{
          fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', margin: 0,
          color: 'rgba(255,255,255,0.85)',
        }}>Progression</h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
          {unlocked} sur {total}
        </p>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
        {grouped.map(({ label, items }) => (
          <div key={label} style={{ marginBottom: 20 }}>
            {/* Group label */}
            <div style={{
              fontSize: 10, fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.6px',
              color: 'rgba(255,255,255,0.20)',
              padding: '0 14px',
              marginBottom: 4,
            }}>{label}</div>

            {/* Items */}
            {items.map(a => (
              <AchievementRow key={a.id} a={a} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
