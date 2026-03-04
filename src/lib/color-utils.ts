export function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

export function tw(baseOpacity: number, intensity: number = 1.0): string {
  const o = Math.min(1, Math.max(0, baseOpacity * intensity))
  return `rgba(255,255,255,${o.toFixed(2)})`
}
