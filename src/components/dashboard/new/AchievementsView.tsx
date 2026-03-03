'use client'

import { useState } from 'react'

/* ─── Types ─────────────────────────────────────────────── */

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
    // Débutant
    { id: 'first_section', title: 'Première section validée', description: 'Valider ta toute première section', group: 'Débutant', unlocked: doneSec >= 1 },
    { id: 'streak_3', title: '3 jours consécutifs', description: 'Travailler 3 jours de suite', group: 'Débutant', unlocked: streak.current >= 3, progress: { current: Math.min(streak.current, 3), target: 3 } },
    { id: 'sections_5', title: '5 sections validées', description: 'Valider 5 sections au total', group: 'Débutant', unlocked: doneSec >= 5, progress: { current: Math.min(doneSec, 5), target: 5 } },
    // Initié
    { id: 'first_chapter', title: 'Premier chapitre terminé', description: 'Compléter toutes les sections d\'un chapitre', group: 'Initié', unlocked: completedChapters >= 1 },
    { id: 'streak_7', title: '7 jours consécutifs', description: 'Une semaine complète de travail', group: 'Initié', unlocked: streak.current >= 7, progress: { current: Math.min(streak.current, 7), target: 7 } },
    { id: 'sections_10', title: '10 sections validées', description: 'Valider 10 sections au total', group: 'Initié', unlocked: doneSec >= 10, progress: { current: Math.min(doneSec, 10), target: 10 } },
    { id: 'half_way', title: '50% du mémoire', description: 'Atteindre la moitié du chemin', group: 'Initié', unlocked: totalSec > 0 && doneSec / totalSec >= 0.5, progress: totalSec > 0 ? { current: doneSec, target: Math.ceil(totalSec / 2) } : undefined },
    // Confirmé
    { id: 'chapters_3', title: '3 chapitres terminés', description: 'Compléter 3 chapitres entiers', group: 'Confirmé', unlocked: completedChapters >= 3, progress: { current: Math.min(completedChapters, 3), target: 3 } },
    { id: 'streak_14', title: '14 jours consécutifs', description: 'Deux semaines de travail sans interruption', group: 'Confirmé', unlocked: streak.current >= 14, progress: { current: Math.min(streak.current, 14), target: 14 } },
    { id: 'sections_20', title: '20 sections validées', description: 'Valider 20 sections au total', group: 'Confirmé', unlocked: doneSec >= 20, progress: { current: Math.min(doneSec, 20), target: 20 } },
    // Diplômé
    { id: 'all_done', title: 'Mémoire terminé', description: 'Compléter 100% du mémoire', group: 'Diplômé', unlocked: totalSec > 0 && doneSec === totalSec, progress: totalSec > 0 ? { current: doneSec, target: totalSec } : undefined },
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
        background: hovered ? 'var(--mq-sidebar-bg)' : 'transparent',
        transition: 'background 0.15s',
        cursor: 'default',
      }}
    >
      {/* Check / circle */}
      <div style={{
        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1.5px solid rgba(255,255,255,${a.unlocked ? '0.30' : '0.10'})`,
        background: a.unlocked ? 'var(--mq-border)' : 'transparent',
      }}>
        {a.unlocked && (
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)' }}>✓</span>
        )}
      </div>

      {/* Title + description on hover */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 500,
          color: `rgba(255,255,255,${a.unlocked ? '0.80' : '0.35'})`,
        }}>
          {a.title}
        </div>
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
          <div style={{
            width: 48, height: 3, borderRadius: 99,
            background: 'var(--mq-stroke-soft)',
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

  // Group achievements with descriptions
  const groups: { label: string; desc: string }[] = [
    { label: 'Débutant', desc: 'Les bases pour bien démarrer.' },
    { label: 'Initié', desc: 'Tu prends le rythme.' },
    { label: 'Confirmé', desc: 'Tu tiens la distance.' },
    { label: 'Diplômé', desc: 'La ligne d\'arrivée.' },
  ]
  const grouped = groups.map(g => ({
    ...g,
    items: achievements.filter(a => a.group === g.label),
  }))

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ flexShrink: 0, marginBottom: 28 }}>
        <h1 style={{
          fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', margin: 0,
          color: 'var(--mq-text-primary)',
        }}>Progression</h1>
        <p style={{ fontSize: 13, color: 'var(--mq-text-muted)', marginTop: 6 }}>
          {unlocked} sur {total}
        </p>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
        {grouped.map(({ label, desc, items }) => (
          <div key={label} style={{ marginBottom: 28 }}>
            {/* Group label + description */}
            <div style={{ padding: '0 14px', marginBottom: 10 }}>
              <div style={{
                fontSize: 13, fontWeight: 600,
                letterSpacing: '0.3px',
                color: 'rgba(255,255,255,0.55)',
              }}>{label}</div>
              <div style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.30)',
                marginTop: 3,
              }}>{desc}</div>
            </div>

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
