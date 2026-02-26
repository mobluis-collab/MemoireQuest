'use client'

import { useEffect } from 'react'
import { calculateLevel } from '@/lib/xp/levels'
import { getThemeForLevel } from '@/lib/themes/levelThemes'

export function useTheme(totalXP: number) {
  const level = calculateLevel(totalXP)
  const theme = getThemeForLevel(level)

  useEffect(() => {
    const root = document.documentElement

    // Appliquer les CSS variables
    root.style.setProperty('--theme-primary', theme.primary)
    root.style.setProperty('--theme-primary-rgb', theme.primaryRgb)

    if (theme.gradient) {
      root.style.setProperty('--theme-gradient', theme.gradient)
    } else {
      root.style.removeProperty('--theme-gradient')
    }

    // Optionnel : ajouter une classe pour le niveau actuel
    root.setAttribute('data-theme-level', level.toString())
  }, [level, theme])

  return { level, theme }
}
