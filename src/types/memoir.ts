export interface Chapter {
  number: string
  title: string
  objective: string
  sections: string[]
  tips: string
}

export interface MemoirePlan {
  title: string
  chapters: Chapter[]
}
