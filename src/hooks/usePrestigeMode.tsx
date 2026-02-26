'use client'

import { useState, useEffect } from 'react'
import { calculateLevel } from '@/lib/xp/levels'

interface UsePrestigeModeOptions {
  totalXP: number
  totalQuests: number
  completedQuests: number
  prestigeCount: number
}

export function usePrestigeMode({
  totalXP,
  totalQuests,
  completedQuests,
  prestigeCount,
}: UsePrestigeModeOptions) {
  const [showPrestigeModal, setShowPrestigeModal] = useState(false)
  const [hasShownThisSession, setHasShownThisSession] = useState(false)

  const currentLevel = calculateLevel(totalXP)
  const isMaxLevel = currentLevel >= 10
  const completionRate = totalQuests > 0 ? (completedQuests / totalQuests) * 100 : 0
  const isFullyCompleted = completionRate === 100

  const isEligibleForPrestige = isMaxLevel && isFullyCompleted

  useEffect(() => {
    // Show modal automatically when reaching level 10 + 100% completion
    // But only once per session
    if (isEligibleForPrestige && !hasShownThisSession) {
      setShowPrestigeModal(true)
      setHasShownThisSession(true)
    }
  }, [isEligibleForPrestige, hasShownThisSession])

  const openPrestigeModal = () => setShowPrestigeModal(true)
  const closePrestigeModal = () => setShowPrestigeModal(false)

  return {
    showPrestigeModal,
    isEligibleForPrestige,
    prestigeCount,
    openPrestigeModal,
    closePrestigeModal,
  }
}
