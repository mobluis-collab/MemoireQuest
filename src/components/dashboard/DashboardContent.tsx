'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import type { MemoirePlan, QuestProgress, StreakData, SectionProgress } from '@/types/memoir'
import { isSectionDone } from '@/types/memoir'
import type { ExtractionResult } from '@/types/extraction'
import type { ComboState } from '@/lib/combo'
import { updateCombo, getComboBonus } from '@/lib/combo'
import NewDashboard from './new/NewDashboard'
import { tw, bg } from '@/lib/color-utils'
import { useTheme as useThemeToggle } from '@/context/ThemeProvider'
import PrestigeModal from '@/components/prestige/PrestigeModal'
import { useToast } from '@/hooks/useToast'
import { usePrestigeMode } from '@/hooks/usePrestigeMode'
import { calculateLevel, getXPForDifficulty, MAX_LEVEL, LEVEL_THRESHOLDS } from '@/lib/xp/levels'

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
  const { isDark } = useThemeToggle()
  const [plan, setPlan] = useState<MemoirePlan | null>(initialPlan)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [questProgress, setQuestProgress] = useState<QuestProgress>(initialQuestProgress)
  const [totalPoints, setTotalPoints] = useState(initialTotalPoints)
  const [streak, setStreak] = useState<StreakData>(initialStreak ?? DEFAULT_STREAK)
  const [planRemaining, setPlanRemaining] = useState<number | null>(null)
  const [loadingKey] = useState<string | null>(null)
  const [isPrestiging, setIsPrestiging] = useState(false)
  const [comboState, setComboState] = useState<ComboState>(
    initialComboState || { count: 0, lastQuestTime: null }
  )
  const [accentColor, setAccentColor] = useState('#6366f1')
  const [textIntensity, setTextIntensity] = useState(1.2)
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null)
  const [pdfBase64, setPdfBase64] = useState<string | null>(null)
  const [extractionLoading, setExtractionLoading] = useState(false)

  // ---- Debounced sync to Supabase ----
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingSyncRef = useRef<{
    questProgress: QuestProgress
    totalPoints: number
    streakData: StreakData
    comboState: ComboState
  } | null>(null)

  const flushSync = useCallback(() => {
    const data = pendingSyncRef.current
    if (!data) return
    pendingSyncRef.current = null
    fetch('/api/quests/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => {
      // Silently fail — data is still in client state
      // Will be synced on next action
      console.warn('[sync] Failed to persist quest state')
    })
  }, [])

  const scheduleSyncDebounced = useCallback((
    qp: QuestProgress,
    tp: number,
    sd: StreakData,
    cs: ComboState,
  ) => {
    pendingSyncRef.current = {
      questProgress: qp,
      totalPoints: tp,
      streakData: sd,
      comboState: cs,
    }
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
    syncTimerRef.current = setTimeout(flushSync, 2000)
  }, [flushSync])

  // Flush on unmount / page leave
  useEffect(() => {
    const handleBeforeUnload = () => flushSync()
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
      flushSync()
    }
  }, [flushSync])

  // Load accent color and text intensity from preferences API
  useEffect(() => {
    fetch('/api/preferences')
      .then(res => res.json())
      .then(data => {
        if (data.accent_color) setAccentColor(data.accent_color)
        if (data.text_intensity != null) setTextIntensity(data.text_intensity)
      })
      .catch(() => {}) // silently fallback to default
  }, [])

  // Optimistic update for text intensity
  const handleTextIntensityChange = useCallback((intensity: number) => {
    setTextIntensity(intensity)
    fetch('/api/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text_intensity: intensity }),
    }).catch(() => {})
  }, [])

  // Update CSS variables when textIntensity or isDark changes
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--mq-text-primary', tw(0.88, textIntensity, isDark))
    root.style.setProperty('--mq-text-secondary', tw(0.60, textIntensity, isDark))
    root.style.setProperty('--mq-text-muted', tw(0.40, textIntensity, isDark))
    root.style.setProperty('--mq-text-subtle', tw(0.20, textIntensity, isDark))
  }, [textIntensity, isDark])

  // Calculate total quests and completed quests for prestige
  const { totalQuests, completedQuests } = useMemo(() => {
    if (!plan) return { totalQuests: 0, completedQuests: 0 }
    const total = plan.chapters.reduce((acc, ch) => acc + ch.sections.length, 0)
    const completed = Object.values(questProgress).reduce((acc, chapterProgress) => {
      return acc + Object.values(chapterProgress).filter(v => isSectionDone(v as SectionProgress)).length
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

  // Phase 1 — Extract metadata from PDF
  const handleUpload = async (file: File) => {
    setExtractionLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/plan/extract', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error ?? 'Erreur lors de l\'analyse du document.')

      setExtractionResult(data.extraction)
      setPdfBase64(data.pdfBase64)
      if (data.remaining !== undefined) setPlanRemaining(data.remaining)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setExtractionLoading(false)
    }
  }

  // Phase 2 — Generate plan with confirmed metadata
  const handleGeneratePlan = async (confirmedExtraction: ExtractionResult) => {
    if (!pdfBase64) return
    setIsLoading(true)
    setError(null)
    setExtractionResult(null)

    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfBase64, extraction: confirmedExtraction }),
      })

      // Non-streaming error
      const ct = res.headers.get('content-type') ?? ''
      if (ct.includes('application/json') && !ct.includes('text/event-stream')) {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Erreur lors de la génération du plan.')
        setPlan(data.plan)
        if (data.remaining !== undefined) setPlanRemaining(data.remaining)
        return
      }

      // SSE streaming response
      if (!res.body) throw new Error('Pas de réponse du serveur.')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let planReceived = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

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
              planReceived = true
            } else if (msg.type === 'error') {
              throw new Error(msg.error)
            }
          } catch (parseErr) {
            if (parseErr instanceof Error && parseErr.message !== match[1]) throw parseErr
          }
        }
      }
      if (!planReceived) throw new Error('Le plan n\'a pas pu être généré. Réessaie.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setIsLoading(false)
      setPdfBase64(null)
    }
  }

  // Reset extraction to allow re-upload
  const handleReanalyze = () => {
    setExtractionResult(null)
    setPdfBase64(null)
  }

  // ---- Client-side XP calculation helpers ----

  /**
   * Recalculates total XP from scratch based on current quest progress and plan.
   * This avoids incremental bugs — we always derive XP from the source of truth.
   */
  const recalculateXP = useCallback((
    currentPlan: MemoirePlan,
    progress: QuestProgress,
    currentCombo: ComboState,
  ): { newTotalPoints: number; newCombo: ComboState } => {
    let xpTotal = 0
    let combo = currentCombo

    for (const chapter of currentPlan.chapters) {
      const chapterProgress = progress[chapter.number] ?? {}
      const hardCount = chapter.sections.filter(s => s.difficulty === 'hard').length
      const isBossChapter = hardCount / chapter.sections.length >= 0.6

      let completedInChapter = 0

      for (let i = 0; i < chapter.sections.length; i++) {
        const sec = chapter.sections[i]
        const secProgress = chapterProgress[i] as SectionProgress | undefined
        if (isSectionDone(secProgress)) {
          xpTotal += getXPForDifficulty(sec.difficulty)
          completedInChapter++
        }
      }

      // Boss chapter bonus: all sections done
      if (isBossChapter && completedInChapter === chapter.sections.length) {
        xpTotal += 50
      }
    }

    // Cap at max XP
    const maxXP = LEVEL_THRESHOLDS[MAX_LEVEL - 1]
    xpTotal = Math.min(maxXP, xpTotal)

    return { newTotalPoints: xpTotal, newCombo: combo }
  }, [])

  /**
   * Updates streak based on current activity
   */
  const updateStreak = useCallback((currentStreak: StreakData, sectionJustCompleted: boolean): StreakData => {
    if (!sectionJustCompleted) return currentStreak

    const today = new Date().toISOString().split('T')[0]
    const lastActivity = currentStreak.last_activity ? currentStreak.last_activity.split('T')[0] : null
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    if (lastActivity === today) {
      // Already active today
      return currentStreak
    } else if (lastActivity === yesterday) {
      return { ...currentStreak, current: currentStreak.current + 1, last_activity: today }
    } else {
      return { ...currentStreak, current: 1, last_activity: today }
    }
  }, [])

  // ---- Quest completion (fully client-side) ----

  const handleQuestComplete = useCallback((chapterNumber: string, sectionIndex: number) => {
    if (!plan) return

    const chProgress: Record<string, SectionProgress> = { ...(questProgress[chapterNumber] ?? {}) }
    const key = String(sectionIndex)
    const wasDone = isSectionDone(chProgress[key])

    if (wasDone) {
      delete chProgress[key]
    } else {
      chProgress[key] = 'done'
    }

    const newQP = { ...questProgress, [chapterNumber]: chProgress }
    const isNowDone = !wasDone

    // Recalculate XP from scratch
    const { newTotalPoints } = recalculateXP(plan, newQP, comboState)

    // Update combo if section was just completed
    const newCombo = isNowDone ? updateCombo(comboState) : comboState
    const comboBonus = isNowDone ? getComboBonus(newCombo.count) : 0
    const finalPoints = Math.min(LEVEL_THRESHOLDS[MAX_LEVEL - 1], newTotalPoints + comboBonus)

    // Update streak
    const newStreak = updateStreak(streak, isNowDone)

    // Level up toast
    const oldLevel = calculateLevel(totalPoints)
    const newLevel = calculateLevel(finalPoints)

    // Apply all state updates
    setQuestProgress(newQP)
    setTotalPoints(finalPoints)
    setComboState(newCombo)
    setStreak(newStreak)

    if (newLevel > oldLevel) {
      if (newLevel === MAX_LEVEL) {
        showToast(`🏆 Niveau ${newLevel} atteint ! Niveau maximum !`, 'success')
      } else {
        showToast(`✨ Niveau ${newLevel} atteint !`, 'success')
      }
    }

    // Debounced persist
    scheduleSyncDebounced(newQP, finalPoints, newStreak, newCombo)
  }, [plan, questProgress, totalPoints, streak, comboState, recalculateXP, updateStreak, showToast, scheduleSyncDebounced])

  const handleSubtaskToggle = useCallback((chapterNumber: string, sectionIndex: number, taskIndex: number) => {
    if (!plan) return

    const chProgress: Record<string, SectionProgress> = { ...(questProgress[chapterNumber] ?? {}) }
    const secKey = String(sectionIndex)
    const secProgress = chProgress[secKey]

    // Find the section in plan to get task count
    const chapter = plan.chapters.find(ch => ch.number === chapterNumber)
    const section = chapter?.sections[sectionIndex]
    const taskCount = section?.tasks?.length ?? (taskIndex + 1)

    let tasksBools: boolean[]
    if (secProgress && typeof secProgress === 'object' && 'tasks' in secProgress) {
      tasksBools = [...secProgress.tasks]
    } else if (secProgress === 'done') {
      tasksBools = Array(taskCount).fill(true) as boolean[]
    } else {
      tasksBools = Array(taskCount).fill(false) as boolean[]
    }
    while (tasksBools.length <= taskIndex) tasksBools.push(false)
    tasksBools[taskIndex] = !tasksBools[taskIndex]

    const wasAllDone = isSectionDone(secProgress)
    const isNowAllDone = tasksBools.every(Boolean)

    chProgress[secKey] = isNowAllDone ? 'done' : { tasks: tasksBools }

    const newQP = { ...questProgress, [chapterNumber]: chProgress }

    // Recalculate XP from scratch
    const { newTotalPoints } = recalculateXP(plan, newQP, comboState)

    // Update combo only if section just became fully complete
    const justCompleted = !wasAllDone && isNowAllDone
    const newCombo = justCompleted ? updateCombo(comboState) : comboState
    const comboBonus = justCompleted ? getComboBonus(newCombo.count) : 0
    const finalPoints = Math.min(LEVEL_THRESHOLDS[MAX_LEVEL - 1], newTotalPoints + comboBonus)

    // Update streak
    const newStreak = updateStreak(streak, justCompleted)

    // Level up toast
    const oldLevel = calculateLevel(totalPoints)
    const newLevel = calculateLevel(finalPoints)

    // Apply all state updates
    setQuestProgress(newQP)
    setTotalPoints(finalPoints)
    setComboState(newCombo)
    setStreak(newStreak)

    if (newLevel > oldLevel) {
      if (newLevel === MAX_LEVEL) {
        showToast(`🏆 Niveau ${newLevel} atteint ! Niveau maximum !`, 'success')
      } else {
        showToast(`✨ Niveau ${newLevel} atteint !`, 'success')
      }
    }

    // Debounced persist
    scheduleSyncDebounced(newQP, finalPoints, newStreak, newCombo)
  }, [plan, questProgress, totalPoints, streak, comboState, recalculateXP, updateStreak, showToast, scheduleSyncDebounced])

  const handlePrestige = async () => {
    if (!isEligibleForPrestige || isPrestiging) return
    setIsPrestiging(true)
    try {
      const res = await fetch('/api/prestige', { method: 'POST' })
      if (!res.ok) {
        showToast('Erreur lors du prestige', 'error')
        closePrestigeModal()
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
        onSubtaskToggle={handleSubtaskToggle}
        loadingKey={loadingKey}
        accentColor={accentColor}
        textIntensity={textIntensity}
        onTextIntensityChange={handleTextIntensityChange}
        extractionResult={extractionResult}
        extractionLoading={extractionLoading}
        onConfirmExtraction={handleGeneratePlan}
        onReanalyze={handleReanalyze}
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
