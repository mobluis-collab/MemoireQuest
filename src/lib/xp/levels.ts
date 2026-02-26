import type { LevelProgress } from '@/types/memoir'

// XP par niveau de difficulté
export const XP_BY_DIFFICULTY = {
  easy: 10,
  medium: 20,
  hard: 30,
} as const

// Seuils de niveau (cumulative XP required to reach each level)
// Niveau 1 = 0 XP, Niveau 2 = 50 XP, etc.
export const LEVEL_THRESHOLDS = [0, 50, 120, 210, 320, 450, 600, 770, 960, 1170] as const

export const MAX_LEVEL = 10

/**
 * Calcule le niveau actuel basé sur l'XP total
 */
export function calculateLevel(totalXP: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) {
      return i + 1 // Les niveaux commencent à 1
    }
  }
  return 1
}

/**
 * Retourne les informations de progression du niveau actuel
 */
export function getLevelProgress(totalXP: number): LevelProgress {
  const currentLevel = calculateLevel(totalXP)
  const isMaxLevel = currentLevel >= MAX_LEVEL

  if (isMaxLevel) {
    return {
      currentLevel: MAX_LEVEL,
      xpInCurrentLevel: 0,
      xpRequiredForNext: 0,
      progressPercent: 100,
      isMaxLevel: true,
    }
  }

  const currentLevelThreshold = LEVEL_THRESHOLDS[currentLevel - 1]
  const nextLevelThreshold = LEVEL_THRESHOLDS[currentLevel]
  const xpInCurrentLevel = totalXP - currentLevelThreshold
  const xpRequiredForNext = nextLevelThreshold - currentLevelThreshold
  const progressPercent = Math.round((xpInCurrentLevel / xpRequiredForNext) * 100)

  return {
    currentLevel,
    xpInCurrentLevel,
    xpRequiredForNext,
    progressPercent,
    isMaxLevel: false,
  }
}

/**
 * Retourne l'XP pour une difficulté donnée
 */
export function getXPForDifficulty(difficulty: 'easy' | 'medium' | 'hard'): number {
  return XP_BY_DIFFICULTY[difficulty]
}
