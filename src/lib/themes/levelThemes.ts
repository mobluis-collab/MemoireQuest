export interface LevelTheme {
  level: number
  name: string
  primary: string
  primaryRgb: string
  gradient?: string
}

export const LEVEL_THEMES: LevelTheme[] = [
  {
    level: 1,
    name: 'Indigo',
    primary: '#6366f1',
    primaryRgb: '99, 102, 241',
  },
  {
    level: 2,
    name: 'Violet',
    primary: '#8b5cf6',
    primaryRgb: '139, 92, 246',
  },
  {
    level: 3,
    name: 'Pink',
    primary: '#ec4899',
    primaryRgb: '236, 72, 153',
  },
  {
    level: 4,
    name: 'Amber',
    primary: '#f59e0b',
    primaryRgb: '245, 158, 11',
  },
  {
    level: 5,
    name: 'Emerald',
    primary: '#10b981',
    primaryRgb: '16, 185, 129',
  },
  {
    level: 6,
    name: 'Cyan',
    primary: '#06b6d4',
    primaryRgb: '6, 182, 212',
  },
  {
    level: 7,
    name: 'Blue',
    primary: '#3b82f6',
    primaryRgb: '59, 130, 246',
  },
  {
    level: 8,
    name: 'Purple',
    primary: '#a855f7',
    primaryRgb: '168, 85, 247',
  },
  {
    level: 9,
    name: 'Gold',
    primary: '#eab308',
    primaryRgb: '234, 179, 8',
  },
  {
    level: 10,
    name: 'Rainbow',
    primary: '#8b5cf6',
    primaryRgb: '139, 92, 246',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
  },
]

export function getThemeForLevel(level: number): LevelTheme {
  const theme = LEVEL_THEMES.find((t) => t.level === level)
  return theme ?? LEVEL_THEMES[0]
}
