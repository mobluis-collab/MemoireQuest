export interface Achievement {
  id: string
  title: string
  xp: number
  icon: string
  condition: (data: AchievementCheckData) => boolean
}

export interface AchievementCheckData {
  totalQuestsCompleted: number
  currentStreak: number
  questCompletionTime?: Date
  questsCompletedToday: number
  chapterCompletionRate?: number
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'FIRST_STEP',
    title: 'Premier pas',
    xp: 5,
    icon: 'Target',
    condition: (data) => data.totalQuestsCompleted >= 1,
  },
  {
    id: 'ON_FIRE',
    title: 'En feu',
    xp: 20,
    icon: 'Flame',
    condition: (data) => data.currentStreak >= 5,
  },
  {
    id: 'NIGHT_OWL',
    title: 'Couche-tard',
    xp: 10,
    icon: 'Moon',
    condition: (data) => {
      if (!data.questCompletionTime) return false
      const hour = data.questCompletionTime.getHours()
      return hour >= 22 || hour < 6
    },
  },
  {
    id: 'EARLY_BIRD',
    title: 'Lève-tôt',
    xp: 10,
    icon: 'Sunrise',
    condition: (data) => {
      if (!data.questCompletionTime) return false
      const hour = data.questCompletionTime.getHours()
      return hour >= 5 && hour < 8
    },
  },
  {
    id: 'SPEED_RUNNER',
    title: 'Sprinter',
    xp: 15,
    icon: 'Zap',
    condition: (data) => data.questsCompletedToday >= 5,
  },
  {
    id: 'PERFECTIONIST',
    title: 'Perfectionniste',
    xp: 25,
    icon: 'Gem',
    condition: (data) => data.chapterCompletionRate === 100,
  },
]

/**
 * Vérifie quels badges sont nouvellement débloqués
 * @param currentAchievements - Badges déjà débloqués (array d'IDs)
 * @param data - Données pour vérifier les conditions
 * @returns Liste des badges nouvellement débloqués
 */
export function checkNewAchievements(
  currentAchievements: string[],
  data: AchievementCheckData
): Achievement[] {
  const newlyUnlocked: Achievement[] = []

  for (const achievement of ACHIEVEMENTS) {
    if (!currentAchievements.includes(achievement.id) && achievement.condition(data)) {
      newlyUnlocked.push(achievement)
    }
  }

  return newlyUnlocked
}

/**
 * Retourne le total d'XP bonus des achievements débloqués
 */
export function getTotalAchievementXP(achievementIds: string[]): number {
  return ACHIEVEMENTS.filter((a) => achievementIds.includes(a.id)).reduce((sum, a) => sum + a.xp, 0)
}
