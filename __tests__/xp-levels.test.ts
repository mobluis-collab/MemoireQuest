import { calculateLevel, getLevelProgress, getXPForDifficulty, LEVEL_THRESHOLDS, MAX_LEVEL } from '@/lib/xp/levels'

describe('calculateLevel', () => {
  it('retourne niveau 1 pour 0 XP', () => {
    expect(calculateLevel(0)).toBe(1)
  })

  it('retourne niveau 1 pour 49 XP (juste en dessous du seuil)', () => {
    expect(calculateLevel(49)).toBe(1)
  })

  it('retourne niveau 2 pour exactement 50 XP', () => {
    expect(calculateLevel(50)).toBe(2)
  })

  it('retourne le niveau max pour XP très élevé', () => {
    expect(calculateLevel(99999)).toBe(MAX_LEVEL)
  })

  it('retourne le niveau max pour le dernier seuil exact', () => {
    const lastThreshold = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
    expect(calculateLevel(lastThreshold)).toBe(MAX_LEVEL)
  })

  it('retourne niveau 1 pour XP négatif', () => {
    expect(calculateLevel(-10)).toBe(1)
  })

  it('passe chaque seuil correctement', () => {
    LEVEL_THRESHOLDS.forEach((threshold, i) => {
      expect(calculateLevel(threshold)).toBe(i + 1)
    })
  })
})

describe('getLevelProgress', () => {
  it('retourne 0% progression au début du niveau 1', () => {
    const progress = getLevelProgress(0)
    expect(progress.currentLevel).toBe(1)
    expect(progress.progressPercent).toBe(0)
    expect(progress.isMaxLevel).toBe(false)
  })

  it('retourne 50% à mi-chemin du niveau 1', () => {
    const progress = getLevelProgress(25)
    expect(progress.currentLevel).toBe(1)
    expect(progress.progressPercent).toBe(50)
  })

  it('retourne isMaxLevel true au niveau max', () => {
    const progress = getLevelProgress(99999)
    expect(progress.isMaxLevel).toBe(true)
    expect(progress.currentLevel).toBe(MAX_LEVEL)
    expect(progress.progressPercent).toBe(100)
  })

  it('calcule correctement xpInCurrentLevel', () => {
    const progress = getLevelProgress(60) // niveau 2 (seuil 50), 10 XP dans le niveau
    expect(progress.currentLevel).toBe(2)
    expect(progress.xpInCurrentLevel).toBe(10)
  })
})

describe('getXPForDifficulty', () => {
  it('retourne 10 pour easy', () => {
    expect(getXPForDifficulty('easy')).toBe(10)
  })

  it('retourne 20 pour medium', () => {
    expect(getXPForDifficulty('medium')).toBe(20)
  })

  it('retourne 30 pour hard', () => {
    expect(getXPForDifficulty('hard')).toBe(30)
  })
})
