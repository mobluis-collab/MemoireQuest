export type ChapterStatus = 'not_started' | 'in_progress' | 'done'

export interface Section {
  text: string
  difficulty: 'easy' | 'medium' | 'hard'
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

// Quest progress : chapterNumber -> sectionIndex -> 'done'
export type QuestProgress = Record<string, Record<number, 'done'>>

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
