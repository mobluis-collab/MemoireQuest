export function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

export function tw(baseOpacity: number, intensity: number = 1.0, isDark: boolean = true): string {
  const o = Math.min(1, Math.max(0, baseOpacity * intensity))
  const ch = isDark ? 255 : 0
  return `rgba(${ch},${ch},${ch},${o.toFixed(2)})`
}

export function bg(baseOpacity: number, isDark: boolean = true): string {
  const o = Math.min(1, Math.max(0, baseOpacity))
  const ch = isDark ? 255 : 0
  return `rgba(${ch},${ch},${ch},${o.toFixed(2)})`
}
