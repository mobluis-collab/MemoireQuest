export type ChapterStatus = 'not_started' | 'in_progress' | 'done'

export interface Section {
  text: string
  difficulty: 'easy' | 'medium' | 'hard'
  hint?: string
  tasks?: string[]
}

export interface Chapter {
  number: string
  title: string
  objective: string
  sections: Section[]
  tips: string
}

export interface MemoirePlan {
  title: string
  chapters: Chapter[]
  prestige_count?: number
}

export type ChapterProgress = Record<string, ChapterStatus>

export type SectionProgress = 'done' | { tasks: boolean[] }

export function isSectionDone(p: SectionProgress | undefined): boolean {
  if (!p) return false
  if (p === 'done') return true
  return p.tasks.every(Boolean)
}

// Quest progress : chapterNumber -> sectionIndex -> SectionProgress (retro-compat: 'done' ou { tasks: boolean[] })
export type QuestProgress = Record<string, Record<number, SectionProgress>>

export interface StreakData {
  current: number
  last_activity: string | null
  jokers: number
  last_joker_used?: string | null
}

export interface LevelProgress {
  currentLevel: number
  xpInCurrentLevel: number
  xpRequiredForNext: number
  progressPercent: number
  isMaxLevel: boolean
}
