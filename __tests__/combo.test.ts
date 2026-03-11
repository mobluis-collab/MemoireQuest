import { updateCombo, getComboBonus, ComboState } from '@/lib/combo'

describe('updateCombo', () => {
  it('retourne combo 1 quand aucun quest précédent', () => {
    const state: ComboState = { count: 0, lastQuestTime: null }
    const result = updateCombo(state)
    expect(result.count).toBe(1)
    expect(result.lastQuestTime).toBeDefined()
  })

  it('incrémente le combo si dans les 2h', () => {
    const recentTime = Date.now() - (30 * 60 * 1000) // 30 min ago
    const state: ComboState = { count: 3, lastQuestTime: recentTime }
    const result = updateCombo(state)
    expect(result.count).toBe(4)
  })

  it('reset le combo à 1 si plus de 2h', () => {
    const oldTime = Date.now() - (3 * 60 * 60 * 1000) // 3h ago
    const state: ComboState = { count: 5, lastQuestTime: oldTime }
    const result = updateCombo(state)
    expect(result.count).toBe(1)
  })

  it('reset exactement à la limite de 2h', () => {
    const exactLimit = Date.now() - (2 * 60 * 60 * 1000 + 1) // 2h + 1ms
    const state: ComboState = { count: 3, lastQuestTime: exactLimit }
    const result = updateCombo(state)
    expect(result.count).toBe(1)
  })

  it('continue juste avant la limite de 2h', () => {
    const justBefore = Date.now() - (2 * 60 * 60 * 1000 - 1000) // 2h - 1s
    const state: ComboState = { count: 3, lastQuestTime: justBefore }
    const result = updateCombo(state)
    expect(result.count).toBe(4)
  })

  it('met à jour le lastQuestTime', () => {
    const before = Date.now()
    const state: ComboState = { count: 1, lastQuestTime: before - 1000 }
    const result = updateCombo(state)
    expect(result.lastQuestTime).toBeGreaterThanOrEqual(before)
  })
})

describe('getComboBonus', () => {
  it('retourne 0 pour combo de 1', () => {
    expect(getComboBonus(1)).toBe(0)
  })

  it('retourne 0 pour combo de 2', () => {
    expect(getComboBonus(2)).toBe(0)
  })

  it('retourne 5 pour combo de 3', () => {
    expect(getComboBonus(3)).toBe(5)
  })

  it('retourne 5 pour combo de 4', () => {
    expect(getComboBonus(4)).toBe(5)
  })

  it('retourne 10 pour combo de 5', () => {
    expect(getComboBonus(5)).toBe(10)
  })

  it('retourne 10 pour combo de 10', () => {
    expect(getComboBonus(10)).toBe(10)
  })

  it('retourne 0 pour combo de 0', () => {
    expect(getComboBonus(0)).toBe(0)
  })
})
