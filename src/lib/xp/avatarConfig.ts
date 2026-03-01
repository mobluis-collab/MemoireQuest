/**
 * Configuration des stades d'évolution de l'avatar
 * 10 niveaux répartis en 4 stades thématiques (parcours académique)
 */

export interface AvatarStage {
  title: string
  nextEvolutionLevel: number | null
}

const STAGES: AvatarStage[] = [
  { title: 'Apprenti Chercheur', nextEvolutionLevel: 4 }, // Niveaux 1-3
  { title: 'Chercheur Junior',   nextEvolutionLevel: 7 }, // Niveaux 4-6
  { title: 'Chercheur Confirmé', nextEvolutionLevel: 10 }, // Niveaux 7-9
  { title: 'Docteur',            nextEvolutionLevel: null }, // Niveau 10 (max)
]

/**
 * Retourne le stade d'évolution correspondant au niveau donné
 */
export function getAvatarStage(level: number): AvatarStage {
  if (level >= 10) return STAGES[3]
  if (level >= 7)  return STAGES[2]
  if (level >= 4)  return STAGES[1]
  return STAGES[0]
}
