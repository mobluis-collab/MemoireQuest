import { isSectionDone } from '@/types/memoir'
import type { SectionProgress } from '@/types/memoir'

describe('isSectionDone', () => {
  it('retourne false pour undefined', () => {
    expect(isSectionDone(undefined)).toBe(false)
  })

  it('retourne true pour "done" (ancien format)', () => {
    expect(isSectionDone('done')).toBe(true)
  })

  it('retourne true quand toutes les tâches sont complétées', () => {
    const progress: SectionProgress = { tasks: [true, true, true] }
    expect(isSectionDone(progress)).toBe(true)
  })

  it('retourne false quand une tâche manque', () => {
    const progress: SectionProgress = { tasks: [true, false, true] }
    expect(isSectionDone(progress)).toBe(false)
  })

  it('retourne false quand aucune tâche complétée', () => {
    const progress: SectionProgress = { tasks: [false, false, false] }
    expect(isSectionDone(progress)).toBe(false)
  })

  it('retourne true pour un tableau de tâches vide', () => {
    const progress: SectionProgress = { tasks: [] }
    expect(isSectionDone(progress)).toBe(true)
  })

  it('gère une seule tâche complétée', () => {
    expect(isSectionDone({ tasks: [true] })).toBe(true)
  })

  it('gère une seule tâche non complétée', () => {
    expect(isSectionDone({ tasks: [false] })).toBe(false)
  })
})
