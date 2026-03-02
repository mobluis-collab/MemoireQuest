'use client'

import { useState, useMemo } from 'react'
import type { MemoirePlan, QuestProgress, StreakData } from '@/types/memoir'
import type { ComboState } from '@/lib/combo'
import NewDashboard from './new/NewDashboard'
import PrestigeModal from '@/components/prestige/PrestigeModal'
import { useToast } from '@/hooks/useToast'
import { usePrestigeMode } from '@/hooks/usePrestigeMode'
import { calculateLevel, MAX_LEVEL } from '@/lib/xp/levels'
import { getComboBonus } from '@/lib/combo'

const DEFAULT_STREAK: StreakData = { current: 0, last_activity: null, jokers: 0 }

interface User {
  email: string
  user_metadata?: { full_name?: string }
}

interface DashboardContentProps {
  user: User
  initialPlan: MemoirePlan | null
  initialQuestProgress: QuestProgress
  initialTotalPoints: number
  initialStreak: StreakData
  initialComboState?: ComboState
  planCreatedAt?: string
}

export default function DashboardContent({
  user,
  initialPlan,
  initialQuestProgress,
  initialTotalPoints,
  initialStreak,
  initialComboState,
  planCreatedAt,
}: DashboardContentProps) {
  const { showToast, ToastContainer } = useToast()
  const [plan, setPlan] = useState<MemoirePlan | null>(initialPlan)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [questProgress, setQuestProgress] = useState<QuestProgress>(initialQuestProgress)
  const [totalPoints, setTotalPoints] = useState(initialTotalPoints)
  const [streak, setStreak] = useState<StreakData>(initialStreak ?? DEFAULT_STREAK)
  const [planRemaining, setPlanRemaining] = useState<number | null>(null)
  const [loadingKey, setLoadingKey] = useState<string | null>(null)
  const [isPrestiging, setIsPrestiging] = useState(false)
  const [comboState, setComboState] = useState<ComboState>(
    initialComboState || { count: 0, lastQuestTime: null }
  )

  // Calculate total quests and completed quests for prestige
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
    openPrestigeModal: _openPrestigeModal,
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

      // Non-streaming error responses (rate limit, validation, auth)
      const ct = res.headers.get('content-type') ?? ''
      if (ct.includes('application/json')) {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Erreur lors de la génération du plan.')
        // Fallback: if server somehow responds with plain JSON
        setPlan(data.plan)
        if (data.remaining !== undefined) setPlanRemaining(data.remaining)
        return
      }

      // SSE streaming response
      if (!res.body) throw new Error('Pas de réponse du serveur.')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        // Process complete SSE messages
        const lines = buffer.split('\n\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          const match = line.match(/^data:\s*(.+)$/m)
          if (!match) continue
          try {
            const msg = JSON.parse(match[1])
            if (msg.type === 'done') {
              setPlan(msg.plan)
              if (msg.remaining !== undefined) setPlanRemaining(msg.remaining)
            } else if (msg.type === 'error') {
              throw new Error(msg.error)
            }
            // 'progress' events are ignored (keepalive only)
          } catch (parseErr) {
            if (parseErr instanceof Error && parseErr.message !== match[1]) throw parseErr
          }
        }
      }
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

      const oldLevel = calculateLevel(totalPoints)
      const newLevel = calculateLevel(data.totalPoints)

      setQuestProgress(data.questProgress)
      setTotalPoints(data.totalPoints)
      setStreak(data.streak)
      setComboState(data.comboState)

      if (newLevel > oldLevel) {
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
      setQuestProgress({})
      if (plan) {
        setPlan({
          ...plan,
          prestige_count: data.prestigeCount,
          title: `${plan.title} — Maître ès Mémoires ⭐`,
        })
      }
      showToast(`Prestige ${data.prestigeCount} activé !`, 'success')
      closePrestigeModal()
      setTimeout(() => window.location.reload(), 1500)
    } catch (error) {
      console.error('Prestige error:', error)
      showToast('Erreur lors du prestige', 'error')
    } finally {
      setIsPrestiging(false)
    }
  }

  return (
    <>
      <ToastContainer />
      <NewDashboard
        user={user}
        plan={plan}
        questProgress={questProgress}
        totalPoints={totalPoints}
        streak={streak}
        isLoading={isLoading}
        error={error}
        planRemaining={planRemaining}
        planCreatedAt={planCreatedAt}
        onUpload={handleUpload}
        onQuestComplete={handleQuestComplete}
        loadingKey={loadingKey}
      />
      {plan && (
        <PrestigeModal
          isOpen={showPrestigeModal}
          onClose={closePrestigeModal}
          onPrestige={handlePrestige}
          currentPrestigeCount={prestigeCount}
        />
      )}
    </>
  )
}
