'use client'

import { useState } from 'react'

interface Achievement {
  id: string
  icon: string
  title: string
  description: string
  unlocked: boolean
  progress?: { current: number; target: number }
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface AchievementsViewProps {
  totalPoints: number
  streak: { current: number; jokers: number }
  questProgress: Record<string, Record<string, 'done'>>
  chapters: Array<{ num: string; title: string; sections: number; done: number }>
}

const RARITY_LABELS = {
  common: 'Commun',
  rare: 'Rare',
  epic: 'Épique',
  legendary: 'Légendaire',
}

const RARITY_OPACITY = {
  common: 0.25,
  rare: 0.35,
  epic: 0.50,
  legendary: 0.70,
}

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
    {
      id: 'first_step',
      icon: '→',
      title: 'Premier pas',
      description: 'Valider ta première section',
      rarity: 'common',
      unlocked: doneSec >= 1,
    },
    {
      id: 'xp_100',
      icon: '·',
      title: '100 points',
      description: "Atteindre 100 points d'expérience",
      rarity: 'common',
      unlocked: totalPoints >= 100,
      progress: { current: Math.min(totalPoints, 100), target: 100 },
    },
    {
      id: 'streak_3',
      icon: '∿',
      title: 'Régulier',
      description: '3 jours de travail consécutifs',
      rarity: 'common',
      unlocked: streak.current >= 3,
      progress: { current: Math.min(streak.current, 3), target: 3 },
    },
    {
      id: 'sections_5',
      icon: '§',
      title: 'Chercheur Jr.',
      description: 'Valider 5 sections',
      rarity: 'common',
      unlocked: doneSec >= 5,
      progress: { current: Math.min(doneSec, 5), target: 5 },
    },
    {
      id: 'first_chapter',
      icon: '¶',
      title: 'Premier chapitre',
      description: 'Terminer un chapitre en entier',
      rarity: 'rare',
      unlocked: completedChapters >= 1,
    },
    {
      id: 'xp_300',
      icon: '◇',
      title: '300 points',
      description: "Atteindre 300 points d'expérience",
      rarity: 'rare',
      unlocked: totalPoints >= 300,
      progress: { current: Math.min(totalPoints, 300), target: 300 },
    },
    {
      id: 'streak_7',
      icon: '∞',
      title: 'Semaine parfaite',
      description: '7 jours de travail consécutifs',
      rarity: 'rare',
      unlocked: streak.current >= 7,
      progress: { current: Math.min(streak.current, 7), target: 7 },
    },
    {
      id: 'half_way',
      icon: '½',
      title: 'Mi-chemin',
      description: 'Compléter 50% du mémoire',
      rarity: 'rare',
      unlocked: totalSec > 0 && doneSec / totalSec >= 0.5,
      progress: totalSec > 0 ? { current: doneSec, target: Math.ceil(totalSec / 2) } : undefined,
    },
    {
      id: 'sections_20',
      icon: '◆',
      title: 'Chercheur Confirmé',
      description: 'Valider 20 sections',
      rarity: 'epic',
      unlocked: doneSec >= 20,
      progress: { current: Math.min(doneSec, 20), target: 20 },
    },
    {
      id: 'streak_14',
      icon: '∎',
      title: 'Endurant',
      description: '14 jours de travail consécutifs',
      rarity: 'epic',
      unlocked: streak.current >= 14,
      progress: { current: Math.min(streak.current, 14), target: 14 },
    },
    {
      id: 'xp_1000',
      icon: '◈',
      title: '1 000 points',
      description: "Atteindre 1000 points d'expérience",
      rarity: 'epic',
      unlocked: totalPoints >= 1000,
      progress: { current: Math.min(totalPoints, 1000), target: 1000 },
    },
    {
      id: 'all_done',
      icon: '✦',
      title: 'Docteur ès Mémoires',
      description: 'Compléter 100% du mémoire',
      rarity: 'legendary',
      unlocked: totalSec > 0 && doneSec === totalSec,
      progress: { current: doneSec, target: totalSec },
    },
  ]
}

function AchievementCard({ a }: { a: Achievement }) {
  const [hovered, setHovered] = useState(false)
  const progressPct = a.progress
    ? Math.round((a.progress.current / a.progress.target) * 100)
    : null
  const opa = RARITY_OPACITY[a.rarity]

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '16px',
        borderRadius: 14,
        background: hovered ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
        border: `1px solid rgba(255,255,255,${hovered ? '0.12' : '0.08'})`,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        transition: 'all 0.2s',
        cursor: 'default',
        opacity: a.unlocked ? 1 : 0.55,
      }}>

      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `rgba(255,255,255,${a.unlocked ? '0.08' : '0.04'})`,
          border: `1px solid rgba(255,255,255,${a.unlocked ? '0.15' : '0.08'})`,
          fontSize: 18,
          color: `rgba(255,255,255,${opa})`,
          fontWeight: 300,
        }}>{a.icon}</div>

        {/* Title + rarity */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span style={{
              fontSize: 13, fontWeight: 600,
              color: `rgba(255,255,255,${a.unlocked ? '0.88' : '0.55'})`,
            }}>{a.title}</span>
            <span style={{
              fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 99,
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.35)',
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>{RARITY_LABELS[a.rarity]}</span>
          </div>
          <div style={{
            fontSize: 11, lineHeight: 1.4,
            color: `rgba(255,255,255,${a.unlocked ? '0.50' : '0.35'})`,
          }}>{a.description}</div>
        </div>

        {/* Status */}
        <div style={{
          width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `rgba(255,255,255,${a.unlocked ? '0.10' : '0.04'})`,
          border: `1px solid rgba(255,255,255,${a.unlocked ? '0.20' : '0.08'})`,
          fontSize: 10,
        }}>
          {a.unlocked
            ? <span style={{ color: 'rgba(255,255,255,0.55)' }}>✓</span>
            : <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9 }}>○</span>}
        </div>
      </div>

      {/* Progress bar */}
      {a.progress && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.40)' }}>
              {a.progress.current} / {a.progress.target}
            </span>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.55)' }}>
              {progressPct}%
            </span>
          </div>
          <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${progressPct}%`,
              borderRadius: 99,
              background: `rgba(255,255,255,${a.unlocked ? '0.35' : '0.15'})`,
              transition: 'width 0.8s cubic-bezier(.4,0,.2,1)',
            }} />
          </div>
        </div>
      )}
    </div>
  )
}

export default function AchievementsView({ totalPoints, streak, questProgress, chapters }: AchievementsViewProps) {
  const achievements = buildAchievements(totalPoints, streak, questProgress, chapters)
  const unlocked = achievements.filter(a => a.unlocked).length
  const total = achievements.length

  const byRarity = {
    legendary: achievements.filter(a => a.rarity === 'legendary'),
    epic: achievements.filter(a => a.rarity === 'epic'),
    rare: achievements.filter(a => a.rarity === 'rare'),
    common: achievements.filter(a => a.rarity === 'common'),
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ flexShrink: 0 }}>
        <h1 style={{
          fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', margin: 0,
          color: 'rgba(255,255,255,0.88)',
        }}>Badges</h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', marginTop: 3 }}>
          {unlocked} / {total} débloqués
        </p>
      </div>

      {/* Summary bar */}
      <div style={{ flexShrink: 0 }}>
        <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${Math.round((unlocked / total) * 100)}%`,
            borderRadius: 99,
            background: 'rgba(255,255,255,0.35)',
            transition: 'width 0.8s cubic-bezier(.4,0,.2,1)',
          }} />
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
          {(Object.entries(RARITY_LABELS) as [keyof typeof RARITY_LABELS, string][]).reverse().map(([rarity, label]) => {
            const count = achievements.filter(a => a.rarity === rarity && a.unlocked).length
            const total_r = achievements.filter(a => a.rarity === rarity).length
            return (
              <div key={rarity} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: `rgba(255,255,255,${RARITY_OPACITY[rarity]})`,
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>
                  {label} <strong style={{ color: 'rgba(255,255,255,0.65)' }}>{count}/{total_r}</strong>
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Achievements grid */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
        {(['legendary', 'epic', 'rare', 'common'] as const).map(rarity => (
          <div key={rarity} style={{ marginBottom: 18 }}>
            <div style={{
              fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px',
              color: 'rgba(255,255,255,0.35)',
              marginBottom: 10,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              {RARITY_LABELS[rarity]}
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 10,
            }}>
              {byRarity[rarity].map(a => (
                <AchievementCard key={a.id} a={a} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
