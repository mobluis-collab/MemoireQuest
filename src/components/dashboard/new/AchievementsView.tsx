'use client'

import { tw, bg } from '@/lib/color-utils'

/* ─── Types ─────────────────────────────────────────────── */

interface Achievement {
  id: string
  title: string
  description: string
  unlocked: boolean
  progress?: { current: number; target: number }
  group: string
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

/* ─── Build achievements ─────────────────────────────────── */

function buildAchievements(
  totalPoints: number,
  streak: { current: number },
  questProgress: Record<string, Record<string, SectionProgress>>,
  chapters: Array<{ num: string; sections: number; done: number }>,
): Achievement[] {
  const totalSec = chapters.reduce((a, c) => a + c.sections, 0)
  const doneSec  = chapters.reduce((a, c) => a + c.done, 0)
  const completedChapters = chapters.filter(c => c.done === c.sections && c.sections > 0).length

  return [
    { id: 'first_section', title: 'Première section validée', description: 'Valider ta toute première section', group: 'Débutant', unlocked: doneSec >= 1 },
    { id: 'streak_3', title: '3 jours consécutifs', description: 'Travailler 3 jours de suite', group: 'Débutant', unlocked: streak.current >= 3, progress: { current: Math.min(streak.current, 3), target: 3 } },
    { id: 'sections_5', title: '5 sections validées', description: 'Valider 5 sections au total', group: 'Débutant', unlocked: doneSec >= 5, progress: { current: Math.min(doneSec, 5), target: 5 } },
    { id: 'first_chapter', title: 'Premier chapitre terminé', description: 'Compléter toutes les sections d\'un chapitre', group: 'Initié', unlocked: completedChapters >= 1 },
    { id: 'streak_7', title: '7 jours consécutifs', description: 'Une semaine complète de travail', group: 'Initié', unlocked: streak.current >= 7, progress: { current: Math.min(streak.current, 7), target: 7 } },
    { id: 'sections_10', title: '10 sections validées', description: 'Valider 10 sections au total', group: 'Initié', unlocked: doneSec >= 10, progress: { current: Math.min(doneSec, 10), target: 10 } },
    { id: 'half_way', title: '50% du mémoire', description: 'Atteindre la moitié du chemin', group: 'Initié', unlocked: totalSec > 0 && doneSec / totalSec >= 0.5, progress: totalSec > 0 ? { current: doneSec, target: Math.ceil(totalSec / 2) } : undefined },
    { id: 'chapters_3', title: '3 chapitres terminés', description: 'Compléter 3 chapitres entiers', group: 'Confirmé', unlocked: completedChapters >= 3, progress: { current: Math.min(completedChapters, 3), target: 3 } },
    { id: 'streak_14', title: '14 jours consécutifs', description: 'Deux semaines de travail sans interruption', group: 'Confirmé', unlocked: streak.current >= 14, progress: { current: Math.min(streak.current, 14), target: 14 } },
    { id: 'sections_20', title: '20 sections validées', description: 'Valider 20 sections au total', group: 'Confirmé', unlocked: doneSec >= 20, progress: { current: Math.min(doneSec, 20), target: 20 } },
    { id: 'all_done', title: 'Mémoire terminé', description: 'Compléter 100% du mémoire', group: 'Diplômé', unlocked: totalSec > 0 && doneSec === totalSec, progress: totalSec > 0 ? { current: doneSec, target: totalSec } : undefined },
  ]
}

/* ─── Card component ─────────────────────────────────────── */

function AchievementCard({ a, accentColor, textIntensity = 1.0, isDark = true }: { a: Achievement; accentColor: string; textIntensity?: number; isDark?: boolean }) {
  const pct = a.progress ? Math.round((a.progress.current / a.progress.target) * 100) : null

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '7px 10px',
      borderRadius: 7,
      background: a.unlocked ? bg(0.05, isDark) : 'transparent',
    }}>
      {/* Status circle */}
      <div style={{
        width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: a.unlocked ? bg(0.10, isDark) : 'transparent',
        border: `1.5px solid ${a.unlocked ? bg(0.15, isDark) : bg(0.07, isDark)}`,
      }}>
        {a.unlocked && (
          <span style={{ fontSize: 10, color: tw(0.60, textIntensity, isDark), lineHeight: 1 }}>&#10003;</span>
        )}
      </div>

      {/* Title */}
      <span style={{
        flex: 1, fontSize: 12, fontWeight: 500,
        color: a.unlocked ? tw(0.75, textIntensity, isDark) : tw(0.30, textIntensity, isDark),
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {a.title}
      </span>

      {/* Progress bar */}
      {!a.unlocked && a.progress && pct !== null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <div style={{
            width: 32, height: 2, borderRadius: 99,
            background: bg(0.06, isDark),
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${pct}%`, borderRadius: 99,
              background: accentColor,
              transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
            }} />
          </div>
          <span style={{ fontSize: 10, color: tw(0.50, textIntensity, isDark), minWidth: 22, textAlign: 'right' }}>
            {pct}%
          </span>
        </div>
      )}
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────── */

export default function AchievementsView({ totalPoints, streak, questProgress, chapters, accentColor = '#6366f1', textIntensity = 1.0, isDark = true }: AchievementsViewProps) {
  const achievements = buildAchievements(totalPoints, streak, questProgress, chapters)
  const unlocked = achievements.filter(a => a.unlocked).length
  const total = achievements.length
  const globalPct = Math.round((unlocked / total) * 100)

  const groups = [
    { label: 'Débutant' },
    { label: 'Initié' },
    { label: 'Confirmé' },
    { label: 'Diplômé' },
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
      <div style={{ flexShrink: 0, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <h1 style={{
            fontSize: 20, fontWeight: 600, letterSpacing: '-0.3px', margin: 0,
            color: tw(0.88, textIntensity, isDark),
          }}>Trophées</h1>
          <span style={{ fontSize: 12, fontWeight: 500, color: tw(0.35, textIntensity, isDark) }}>
            {unlocked} sur {total}
          </span>
        </div>

        {/* Global progress bar */}
        <div style={{
          marginTop: 12, width: '100%', height: 3, borderRadius: 99,
          background: bg(0.06, isDark),
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: `${globalPct}%`, borderRadius: 99,
            background: accentColor,
            transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
          }} />
        </div>
      </div>

      {/* Grid 2x2 */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 14,
        alignContent: 'start',
      }}>
        {grouped.map(({ label, items }) => {
          const groupUnlocked = items.filter(i => i.unlocked).length
          const groupTotal = items.length

          return (
            <div key={label} style={{
              background: bg(0.02, isDark),
              border: `1px solid ${bg(0.05, isDark)}`,
              borderRadius: 10,
              padding: 12,
              display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              {/* Group header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 4, padding: '0 2px',
              }}>
                <span style={{
                  fontSize: 12, fontWeight: 600, letterSpacing: '0.2px',
                  color: tw(0.50, textIntensity, isDark),
                }}>{label}</span>
                <span style={{
                  fontSize: 10, color: tw(0.22, textIntensity, isDark),
                }}>{groupUnlocked}/{groupTotal}</span>
              </div>

              {/* Achievements */}
              {items.map(a => (
                <AchievementCard key={a.id} a={a} accentColor={accentColor} textIntensity={textIntensity} isDark={isDark} />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
