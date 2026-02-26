'use client'

import { useState, useMemo } from 'react'
import type { MemoirePlan, QuestProgress, StreakData } from '@/types/memoir'
import type { ComboState } from '@/lib/combo'
import UploadZone from './UploadZone'
import QuestJournal from '@/components/journal/QuestJournal'
import RateLimitWarning from '@/components/ui/RateLimitWarning'
import PrestigeModal from '@/components/prestige/PrestigeModal'
import { useToast } from '@/hooks/useToast'
import { usePrestigeMode } from '@/hooks/usePrestigeMode'
import { calculateLevel, MAX_LEVEL } from '@/lib/xp/levels'
import { getComboBonus } from '@/lib/combo'

const DEFAULT_STREAK: StreakData = { current: 0, last_activity: null, jokers: 0 }

interface DashboardContentProps {
  initialPlan: MemoirePlan | null
  initialQuestProgress: QuestProgress
  initialTotalPoints: number
  initialStreak: StreakData
  initialComboState?: ComboState
}

export default function DashboardContent({
  initialPlan,
  initialQuestProgress,
  initialTotalPoints,
  initialStreak,
  initialComboState,
}: DashboardContentProps) {
  const { showToast, ToastContainer } = useToast()
  const [plan, setPlan] = useState<MemoirePlan | null>(initialPlan)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [questProgress, setQuestProgress] = useState<QuestProgress>(initialQuestProgress)
  const [totalPoints, setTotalPoints] = useState(initialTotalPoints)
  const [streak, setStreak] = useState<StreakData>(initialStreak)
  const [planRemaining, setPlanRemaining] = useState<number | null>(null)
  const [loadingKey, setLoadingKey] = useState<string | null>(null)
  const [isPrestiging, setIsPrestiging] = useState(false)
  const [comboState, setComboState] = useState<ComboState>(
    initialComboState || { count: 0, lastQuestTime: null }
  )

  // Calculate total quests and completed quests
  const { totalQuests, completedQuests } = useMemo(() => {
    if (!plan) return { totalQuests: 0, completedQuests: 0 }

    const total = plan.chapters.reduce((acc, ch) => acc + ch.sections.length, 0)
    const completed = Object.values(questProgress).reduce((acc, chapterProgress) => {
      return acc + Object.values(chapterProgress).filter(v => v === 'done').length
    }, 0)

    return { totalQuests: total, completedQuests: completed }
  }, [plan, questProgress])

  // Prestige mode logic
  const {
    showPrestigeModal,
    isEligibleForPrestige,
    prestigeCount,
    openPrestigeModal,
    closePrestigeModal,
  } = usePrestigeMode({
    totalXP: totalPoints,
    totalQuests,
    completedQuests,
    prestigeCount: plan?.prestige_count || 0,
  })

  const handleUpload = async (file: File) => {
    setIsLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/plan', { method: 'POST', body: formData })
      if (!res.ok) {
        const { error: msg } = await res.json().catch(() => ({}))
        throw new Error(msg ?? 'Erreur lors de la génération du plan.')
      }
      const data = await res.json() as { plan: MemoirePlan; remaining?: number }
      setPlan(data.plan)
      if (data.remaining !== undefined) setPlanRemaining(data.remaining)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuestComplete = async (chapterNumber: string, sectionIndex: number) => {
    const key = `${chapterNumber}:${sectionIndex}`
    setLoadingKey(key)
    try {
      const res = await fetch('/api/quests/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterNumber, sectionIndex, pointsEarned: 4 }),
      })
      if (!res.ok) return
      const data = await res.json() as {
        questProgress: QuestProgress
        totalPoints: number
        streak: StreakData
        comboState: ComboState
      }

      // Détection level up avec le système XP dynamique
      const oldLevel = calculateLevel(totalPoints)
      const newLevel = calculateLevel(data.totalPoints)

      setQuestProgress(data.questProgress)
      setTotalPoints(data.totalPoints)
      setStreak(data.streak)
      setComboState(data.comboState)

      if (newLevel > oldLevel) {
        // Toast spécial si niveau 10 atteint
        if (newLevel === MAX_LEVEL) {
          showToast(`🏆 Niveau ${newLevel} atteint ! Niveau maximum !`, 'success')
        } else {
          showToast(`✨ Niveau ${newLevel} atteint !`, 'success')
        }
      }
    } finally {
      setLoadingKey(null)
    }
  }

  const handlePrestige = async () => {
    if (!isEligibleForPrestige || isPrestiging) return

    setIsPrestiging(true)
    try {
      const res = await fetch('/api/prestige', { method: 'POST' })
      if (!res.ok) {
        showToast('Erreur lors du prestige', 'error')
        return
      }

      const data = await res.json() as { prestigeCount: number }

      // Reset local state
      setQuestProgress({})

      // Update plan with new prestige count
      if (plan) {
        setPlan({
          ...plan,
          prestige_count: data.prestigeCount,
          title: `${plan.title} — Maître ès Mémoires ⭐`,
        })
      }

      showToast(`Prestige ${data.prestigeCount} activé !`, 'success')
      closePrestigeModal()

      // Reload page to refresh data from server
      setTimeout(() => window.location.reload(), 1500)
    } catch (error) {
      console.error('Prestige error:', error)
      showToast('Erreur lors du prestige', 'error')
    } finally {
      setIsPrestiging(false)
    }
  }

  return (
    <div>
      <ToastContainer />
      {planRemaining !== null && (
        <RateLimitWarning remaining={planRemaining} endpoint="plan" />
      )}
      {error && (
        <p role="alert" className="mx-auto mt-6 max-w-xl text-center text-sm text-red-400 px-4">
          {error}
        </p>
      )}
      {plan ? (
        <>
          <QuestJournal
            plan={plan}
            questProgress={questProgress}
            totalPoints={totalPoints}
            streak={streak}
            onQuestComplete={handleQuestComplete}
            loadingKey={loadingKey}
            comboCount={comboState.count}
            comboBonusXP={getComboBonus(comboState.count)}
          />
          <PrestigeModal
            isOpen={showPrestigeModal}
            onClose={closePrestigeModal}
            onPrestige={handlePrestige}
            currentPrestigeCount={prestigeCount}
          />
        </>
      ) : (
        <UploadZone onUpload={handleUpload} isLoading={isLoading} />
      )}
    </div>
  )
}
