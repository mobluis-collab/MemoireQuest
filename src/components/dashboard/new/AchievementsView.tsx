'use client'

const C = {
  indigo: '#6366f1', sky: '#38bdf8', violet: '#a78bfa',
  emerald: '#34d399', amber: '#fbbf24', rose: '#fb7185',
}

interface Achievement {
  id: string
  icon: string
  title: string
  description: string
  color: string
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

const RARITY_COLORS = {
  common: C.sky,
  rare: C.indigo,
  epic: C.violet,
  legendary: C.amber,
}

const RARITY_LABELS = {
  common: 'Commun',
  rare: 'Rare',
  epic: 'Épique',
  legendary: 'Légendaire',
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
      icon: '🚀',
      title: 'Premier pas',
      description: 'Valider ta première section',
      color: C.sky,
      rarity: 'common',
      unlocked: doneSec >= 1,
    },
    {
      id: 'xp_100',
      icon: '⚡',
      title: '100 XP',
      description: 'Atteindre 100 points d\'expérience',
      color: C.amber,
      rarity: 'common',
      unlocked: totalPoints >= 100,
      progress: { current: Math.min(totalPoints, 100), target: 100 },
    },
    {
      id: 'streak_3',
      icon: '🔥',
      title: 'En feu',
      description: '3 jours de travail consécutifs',
      color: C.amber,
      rarity: 'common',
      unlocked: streak.current >= 3,
      progress: { current: Math.min(streak.current, 3), target: 3 },
    },
    {
      id: 'sections_5',
      icon: '📝',
      title: 'Chercheur Jr.',
      description: 'Valider 5 sections',
      color: C.sky,
      rarity: 'common',
      unlocked: doneSec >= 5,
      progress: { current: Math.min(doneSec, 5), target: 5 },
    },
    {
      id: 'first_chapter',
      icon: '📖',
      title: 'Premier chapitre',
      description: 'Terminer un chapitre en entier',
      color: C.emerald,
      rarity: 'rare',
      unlocked: completedChapters >= 1,
    },
    {
      id: 'xp_300',
      icon: '💎',
      title: '300 XP',
      description: 'Atteindre 300 points d\'expérience',
      color: C.violet,
      rarity: 'rare',
      unlocked: totalPoints >= 300,
      progress: { current: Math.min(totalPoints, 300), target: 300 },
    },
    {
      id: 'streak_7',
      icon: '🌟',
      title: 'Semaine parfaite',
      description: '7 jours de travail consécutifs',
      color: C.amber,
      rarity: 'rare',
      unlocked: streak.current >= 7,
      progress: { current: Math.min(streak.current, 7), target: 7 },
    },
    {
      id: 'half_way',
      icon: '🏃',
      title: 'Mi-chemin',
      description: 'Compléter 50% du mémoire',
      color: C.indigo,
      rarity: 'rare',
      unlocked: totalSec > 0 && doneSec / totalSec >= 0.5,
      progress: totalSec > 0 ? { current: doneSec, target: Math.ceil(totalSec / 2) } : undefined,
    },
    {
      id: 'sections_20',
      icon: '🔬',
      title: 'Chercheur Confirmé',
      description: 'Valider 20 sections',
      color: C.emerald,
      rarity: 'epic',
      unlocked: doneSec >= 20,
      progress: { current: Math.min(doneSec, 20), target: 20 },
    },
    {
      id: 'streak_14',
      icon: '⚔️',
      title: 'Guerrier du savoir',
      description: '14 jours de travail consécutifs',
      color: C.rose,
      rarity: 'epic',
      unlocked: streak.current >= 14,
      progress: { current: Math.min(streak.current, 14), target: 14 },
    },
    {
      id: 'xp_1000',
      icon: '👑',
      title: 'Maître XP',
      description: 'Atteindre 1000 points d\'expérience',
      color: C.amber,
      rarity: 'epic',
      unlocked: totalPoints >= 1000,
      progress: { current: Math.min(totalPoints, 1000), target: 1000 },
    },
    {
      id: 'all_done',
      icon: '🏆',
      title: 'Docteur ès Mémoires',
      description: 'Compléter 100% du mémoire',
      color: C.amber,
      rarity: 'legendary',
      unlocked: totalSec > 0 && doneSec === totalSec,
      progress: { current: doneSec, target: totalSec },
    },
  ]
}

function AchievementCard({ a }: { a: Achievement }) {
  const rarityColor = RARITY_COLORS[a.rarity]
  const progressPct = a.progress
    ? Math.round((a.progress.current / a.progress.target) * 100)
    : null

  return (
    <div style={{
      padding: '16px',
      borderRadius: 14,
      background: a.unlocked
        ? `${rarityColor}10`
        : 'rgba(255,255,255,0.025)',
      border: `1px solid ${a.unlocked ? `${rarityColor}35` : 'rgba(255,255,255,0.08)'}`,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      transition: 'all 0.2s',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Glow effect for unlocked */}
      {a.unlocked && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 14,
          background: `radial-gradient(circle at 50% 0%, ${rarityColor}0a, transparent 70%)`,
          pointerEvents: 'none',
        }} />
      )}

      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: a.unlocked ? `${rarityColor}20` : 'rgba(255,255,255,0.05)',
          border: `1px solid ${a.unlocked ? `${rarityColor}40` : 'rgba(255,255,255,0.1)'}`,
          fontSize: 22,
          filter: a.unlocked ? 'none' : 'grayscale(1) opacity(0.4)',
        }}>{a.icon}</div>

        {/* Title + rarity */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span style={{
              fontSize: 13, fontWeight: 700,
              color: a.unlocked ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.38)',
            }}>{a.title}</span>
            <span style={{
              fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 99,
              background: `${rarityColor}18`,
              color: a.unlocked ? rarityColor : 'rgba(255,255,255,0.25)',
              border: `1px solid ${a.unlocked ? `${rarityColor}30` : 'rgba(255,255,255,0.1)'}`,
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>{RARITY_LABELS[a.rarity]}</span>
          </div>
          <div style={{
            fontSize: 11, lineHeight: 1.4,
            color: a.unlocked ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.25)',
          }}>{a.description}</div>
        </div>

        {/* Status */}
        <div style={{
          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: a.unlocked ? `${rarityColor}25` : 'rgba(255,255,255,0.06)',
          border: `1px solid ${a.unlocked ? `${rarityColor}50` : 'rgba(255,255,255,0.12)'}`,
          fontSize: 10,
        }}>
          {a.unlocked
            ? <span style={{ color: rarityColor }}>✓</span>
            : <span style={{ color: 'rgba(255,255,255,0.2)' }}>🔒</span>}
        </div>
      </div>

      {/* Progress bar — only if not unlocked and has progress */}
      {!a.unlocked && a.progress && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
              {a.progress.current} / {a.progress.target}
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)' }}>
              {progressPct}%
            </span>
          </div>
          <div style={{ height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${progressPct}%`,
              borderRadius: 99,
              background: `linear-gradient(90deg, ${rarityColor}80, ${rarityColor}40)`,
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
          fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', margin: 0,
          background: 'linear-gradient(90deg, rgba(255,255,255,0.95), rgba(255,255,255,0.6))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>Achievements</h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>
          {unlocked} / {total} badges débloqués
        </p>
      </div>

      {/* Summary bar */}
      <div style={{ flexShrink: 0 }}>
        <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${Math.round((unlocked / total) * 100)}%`,
            borderRadius: 99,
            background: `linear-gradient(90deg, ${C.amber}, ${C.violet})`,
            boxShadow: `0 0 12px ${C.amber}66`,
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
                  background: RARITY_COLORS[rarity],
                  boxShadow: `0 0 6px ${RARITY_COLORS[rarity]}88`,
                }} />
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>
                  {label} <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{count}/{total_r}</strong>
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
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px',
              color: `${RARITY_COLORS[rarity]}bb`,
              marginBottom: 10,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{ flex: 1, height: 1, background: `${RARITY_COLORS[rarity]}25` }} />
              {RARITY_LABELS[rarity]}
              <div style={{ flex: 1, height: 1, background: `${RARITY_COLORS[rarity]}25` }} />
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
