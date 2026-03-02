export interface ComboState {
  count: number
  lastQuestTime: number | null
}

const COMBO_TIMEOUT = 2 * 60 * 60 * 1000 // 2 heures en millisecondes

/**
 * Met à jour le state du combo après une quête complétée
 * Si > 2h depuis la dernière quête, le combo repart à 1
 * Sinon, on incrémente
 */
export function updateCombo(currentState: ComboState): ComboState {
  const now = Date.now()

  // Premier quest ou timeout dépassé → reset à 1
  if (!currentState.lastQuestTime || (now - currentState.lastQuestTime) > COMBO_TIMEOUT) {
    return {
      count: 1,
      lastQuestTime: now,
    }
  }

  // Combo continue
  return {
    count: currentState.count + 1,
    lastQuestTime: now,
  }
}

/**
 * Calcule le bonus XP basé sur le nombre de combos
 * - combo >= 5 → +10 XP
 * - combo >= 3 → +5 XP
 * - combo < 3 → 0 XP
 */
export function getComboBonus(comboCount: number): number {
  if (comboCount >= 5) return 10
  if (comboCount >= 3) return 5
  return 0
}

