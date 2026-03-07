'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { tw, bg } from '@/lib/color-utils'

interface ChapterData {
  num: string
  title: string
  sections: number
  done: number
  sectionList: Array<{ text: string; difficulty: 'easy' | 'medium' | 'hard' }>
}

interface ProgressionViewProps {
  chapters: ChapterData[]
  totalPoints: number
  streak: { current: number; jokers: number }
  startDate: Date
  deadlineDate?: Date
  accentColor?: string
  textIntensity?: number
  isDark?: boolean
}

const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 864e5)

export default function ProgressionView({ chapters, totalPoints, streak, startDate, deadlineDate, accentColor = '#6366f1', textIntensity = 1.0, isDark = true }: ProgressionViewProps) {
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null)

  const today = new Date()
  const hasDeadline = !!deadlineDate
  const total     = hasDeadline ? daysBetween(startDate, deadlineDate) : 0
  const elapsed   = hasDeadline ? Math.min(Math.max(daysBetween(startDate, today), 0), total) : 0
  const remaining = hasDeadline ? Math.max(total - elapsed, 0) : 0
  const timePct   = hasDeadline && total > 0 ? Math.round((elapsed / total) * 100) : 0

  const totalSec  = chapters.reduce((a, c) => a + c.sections, 0)
  const doneSec   = chapters.reduce((a, c) => a + c.done, 0)
  const globalPct = totalSec > 0 ? Math.round((doneSec / totalSec) * 100) : 0

  const easyTotal  = chapters.flatMap(c => c.sectionList).filter(s => s.difficulty === 'easy').length
  const medTotal   = chapters.flatMap(c => c.sectionList).filter(s => s.difficulty === 'medium').length
  const hardTotal  = chapters.flatMap(c => c.sectionList).filter(s => s.difficulty === 'hard').length

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const daysAgo = 6 - i
    return daysAgo < streak.current
  })

  const selectedCh = selectedChapter ? chapters.find(c => c.num === selectedChapter) : null

  /* ─── Runner Game ─── */
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<{
    active: boolean
    over: boolean
    frame: number
    score: number
    speed: number
    player: { x: number; y: number; w: number; h: number; vy: number; legFrame: number }
    obstacles: Array<{ x: number; w: number; h: number; type: number }>
    planes: Array<{ x: number; y: number }>
    lastObstacleX: number
    W: number
    H: number
    groundY: number
    animId: number
  } | null>(null)

  const [scoreDisplay, setScoreDisplay] = useState('0000')
  const [bestScore, setBestScore] = useState(0)
  const [gameActive, setGameActive] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [waitingToStart, setWaitingToStart] = useState(true)

  const initGame = useCallback((W: number, H: number) => {
    const groundY = H * 0.80
    return {
      active: true,
      over: false,
      frame: 0,
      score: 0,
      speed: 3,
      player: { x: 40, y: groundY - 28, w: 18, h: 28, vy: 0, legFrame: 0 },
      obstacles: [] as Array<{ x: number; w: number; h: number; type: number }>,
      planes: [{ x: W * 0.6, y: H * 0.2 }, { x: W * 1.2, y: H * 0.35 }],
      lastObstacleX: W + 100,
      W,
      H,
      groundY,
      animId: 0,
    }
  }, [])

  const drawGame = useCallback((ctx: CanvasRenderingContext2D, g: NonNullable<typeof gameRef.current>) => {
    const { W, H, groundY, player, obstacles, planes, frame, speed } = g
    const c = isDark ? '255,255,255' : '0,0,0'
    const bgColor = isDark ? '#04030e' : '#ffffff'

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, W, H)

    // Paper planes (background decor)
    planes.forEach(p => {
      ctx.strokeStyle = `rgba(${c},0.08)`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(p.x + 16, p.y + 5)
      ctx.lineTo(p.x + 4, p.y + 8)
      ctx.lineTo(p.x + 8, p.y + 4)
      ctx.closePath()
      ctx.stroke()
    })

    // Ground — ruler
    ctx.strokeStyle = `rgba(${c},0.15)`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, groundY)
    ctx.lineTo(W, groundY)
    ctx.stroke()

    const scrollOffset = (frame * speed * 0.8) % 20
    for (let x = -scrollOffset; x < W; x += 10) {
      const isBig = Math.round(x + scrollOffset) % 50 < 5
      const tickH = isBig ? 6 : 3
      ctx.strokeStyle = `rgba(${c},0.12)`
      ctx.beginPath()
      ctx.moveTo(x, groundY)
      ctx.lineTo(x, groundY + tickH)
      ctx.stroke()
      if (isBig) {
        ctx.fillStyle = `rgba(${c},0.04)`
        ctx.font = '6px monospace'
        ctx.fillText('cm', x - 3, groundY + 14)
      }
    }

    // Obstacles
    obstacles.forEach(obs => {
      if (obs.type === 0) {
        // Book pile
        const bookCount = Math.ceil(obs.h / 5)
        for (let b = 0; b < bookCount; b++) {
          const bw = obs.w - (b % 2 === 0 ? 0 : 2)
          const bx = obs.x + (obs.w - bw) / 2
          const by = groundY - (b + 1) * 5
          const opacity = 0.35 + (b / bookCount) * 0.25
          ctx.fillStyle = `rgba(${c},${opacity})`
          ctx.fillRect(bx, by, bw, 5)
          ctx.strokeStyle = `rgba(${c},${opacity + 0.1})`
          ctx.lineWidth = 0.5
          ctx.strokeRect(bx, by, bw, 5)
        }
      } else if (obs.type === 1) {
        // Pencil
        const px = obs.x + obs.w / 2 - 2
        ctx.fillStyle = `rgba(${c},0.45)`
        ctx.fillRect(px, groundY - obs.h, 4, obs.h - 6)
        // Tip
        ctx.fillStyle = `rgba(${c},0.70)`
        ctx.beginPath()
        ctx.moveTo(px, groundY - obs.h)
        ctx.lineTo(px + 4, groundY - obs.h)
        ctx.lineTo(px + 2, groundY - obs.h - 6)
        ctx.closePath()
        ctx.fill()
        // Eraser
        ctx.fillStyle = `rgba(${c},0.30)`
        ctx.fillRect(px, groundY - 4, 4, 4)
      } else {
        // Coffee cup
        const cx = obs.x
        const cy = groundY - obs.h
        const cupW = obs.w
        const cupH = obs.h - 4
        ctx.fillStyle = `rgba(${c},0.35)`
        ctx.fillRect(cx, cy + 4, cupW, cupH)
        // Rim
        ctx.fillStyle = `rgba(${c},0.45)`
        ctx.fillRect(cx - 2, cy + 2, cupW + 4, 4)
        // Handle
        ctx.strokeStyle = `rgba(${c},0.30)`
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(cx + cupW + 2, cy + cupH / 2 + 4, 4, -Math.PI / 2, Math.PI / 2)
        ctx.stroke()
        // Steam (only if game active)
        if (g.active && !g.over) {
          ctx.strokeStyle = `rgba(${c},0.15)`
          ctx.lineWidth = 1
          for (let s = 0; s < 2; s++) {
            const sx = cx + cupW * (0.3 + s * 0.4)
            ctx.beginPath()
            ctx.moveTo(sx, cy)
            ctx.quadraticCurveTo(sx + Math.sin(frame * 0.1 + s) * 3, cy - 6, sx, cy - 12)
            ctx.stroke()
          }
        }
      }
    })

    // Player
    const p = player
    const pc = `rgba(${c},0.82)`

    // Mortarboard
    ctx.fillStyle = pc
    ctx.fillRect(p.x - 4, p.y, 18, 3)       // wide top
    ctx.fillRect(p.x, p.y + 3, 10, 3)        // base
    // Pompon
    ctx.strokeStyle = pc
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(p.x + 12, p.y)
    ctx.lineTo(p.x + 16, p.y - 4)
    ctx.stroke()
    ctx.fillRect(p.x + 15, p.y - 5, 2, 2)

    // Head
    ctx.fillStyle = pc
    ctx.fillRect(p.x + 1, p.y + 6, 8, 8)
    // Eye
    ctx.fillStyle = bgColor
    ctx.fillRect(p.x + 6, p.y + 8, 2, 2)

    // Body
    ctx.fillStyle = pc
    ctx.fillRect(p.x, p.y + 14, 10, 8)

    // Backpack
    ctx.fillStyle = `rgba(${c},0.55)`
    ctx.fillRect(p.x - 3, p.y + 14, 4, 6)

    // Legs
    const legPhase = Math.floor(p.legFrame / 4) % 2
    const onGround = p.y >= g.groundY - p.h
    ctx.fillStyle = pc
    if (!onGround) {
      // In air — legs tucked
      ctx.fillRect(p.x + 1, p.y + 22, 3, 4)
      ctx.fillRect(p.x + 6, p.y + 22, 3, 4)
    } else if (legPhase === 0) {
      ctx.fillRect(p.x + 1, p.y + 22, 3, 6)
      ctx.fillRect(p.x + 6, p.y + 22, 3, 4)
    } else {
      ctx.fillRect(p.x + 1, p.y + 22, 3, 4)
      ctx.fillRect(p.x + 6, p.y + 22, 3, 6)
    }

    // Game over overlay
    if (g.over) {
      ctx.fillStyle = 'rgba(4,3,14,0.50)'
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = `rgba(${c},0.55)`
      ctx.font = '600 13px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Raté !', W / 2, H / 2 - 6)
      ctx.fillStyle = `rgba(${c},0.30)`
      ctx.font = '10px sans-serif'
      ctx.fillText(`Score : ${g.score}`, W / 2, H / 2 + 12)
      ctx.textAlign = 'start'
    }
  }, [isDark])

  const startGameLoop = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const parent = canvas.parentElement
    if (!parent) return
    const rect = parent.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    const W = Math.round(rect.width)
    const H = Math.round(rect.height)
    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = `${W}px`
    canvas.style.height = `${H}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const g = initGame(W, H)
    gameRef.current = g
    setGameActive(true)
    setGameOver(false)
    setScoreDisplay('0000')

    const GRAVITY = 0.55
    const JUMP_FORCE = -8.5

    const handleJump = () => {
      if (!g.active || g.over) {
        // Reset
        Object.assign(g, initGame(W, H))
        setGameActive(true)
        setGameOver(false)
        setScoreDisplay('0000')
        return
      }
      if (g.player.y >= g.groundY - g.player.h) {
        g.player.vy = JUMP_FORCE
      }
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        const tag = document.activeElement?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
        e.preventDefault()
        handleJump()
      }
    }
    const onClick = () => handleJump()

    document.addEventListener('keydown', onKey)
    canvas.addEventListener('click', onClick)
    canvas.addEventListener('touchstart', onClick, { passive: true })

    const loop = () => {
      if (!g.active) return

      if (!g.over) {
        g.frame++
        g.speed = Math.min(3 + g.score * 0.008, 10)

        // Player physics
        g.player.vy += GRAVITY
        g.player.y += g.player.vy
        if (g.player.y >= g.groundY - g.player.h) {
          g.player.y = g.groundY - g.player.h
          g.player.vy = 0
        }
        g.player.legFrame++

        // Score
        if (g.frame % 5 === 0) {
          g.score++
          setScoreDisplay(String(g.score).padStart(4, '0'))
        }

        // Move obstacles
        g.obstacles.forEach(o => { o.x -= g.speed })
        g.obstacles = g.obstacles.filter(o => o.x + o.w > -20)

        // Move planes
        g.planes.forEach(p => {
          p.x -= g.speed * 0.3
          if (p.x < -30) {
            p.x = W + 30 + Math.random() * 60
            p.y = H * (0.1 + Math.random() * 0.35)
          }
        })

        // Spawn obstacles
        const rightmost = g.obstacles.length > 0 ? Math.max(...g.obstacles.map(o => o.x + o.w)) : 0
        const gap = 110 + Math.random() * 70 + 180 / g.speed
        if (rightmost < W - gap || g.obstacles.length === 0) {
          const type = Math.floor(Math.random() * 3)
          let w: number, h: number
          if (type === 0) { // Books
            const count = 2 + Math.floor(Math.random() * 4)
            w = 14 + Math.random() * 6
            h = count * 5
          } else if (type === 1) { // Pencil
            w = 8
            h = 22 + Math.random() * 14
          } else { // Coffee
            w = 12 + Math.random() * 4
            h = 16 + Math.random() * 8
          }
          g.obstacles.push({ x: W + 10, w, h, type })
        }

        // Collision AABB with 3px margin
        const m = 3
        const px = g.player.x + m
        const py = g.player.y + m
        const pw = g.player.w - m * 2
        const ph = g.player.h - m * 2
        for (const obs of g.obstacles) {
          const ox = obs.x + m
          const oy = g.groundY - obs.h + m
          const ow = obs.w - m * 2
          const oh = obs.h - m * 2
          if (px < ox + ow && px + pw > ox && py < oy + oh && py + ph > oy) {
            g.over = true
            setGameOver(true)
            setGameActive(false)
            setBestScore(prev => Math.max(prev, g.score))
            break
          }
        }
      }

      drawGame(ctx, g)
      g.animId = requestAnimationFrame(loop)
    }

    g.animId = requestAnimationFrame(loop)

    return () => {
      g.active = false
      cancelAnimationFrame(g.animId)
      document.removeEventListener('keydown', onKey)
      canvas.removeEventListener('click', onClick)
      canvas.removeEventListener('touchstart', onClick)
    }
  }, [initGame, drawGame])

  // Keyboard listener to start game from waiting state
  useEffect(() => {
    if (!waitingToStart) return
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        const tag = document.activeElement?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
        e.preventDefault()
        setWaitingToStart(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [waitingToStart])

  // Idle screen — draw student standing still before game starts
  useEffect(() => {
    if (!waitingToStart) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const parent = canvas.parentElement
    if (!parent) return

    const draw = () => {
      const rect = parent.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      const W = Math.round(rect.width)
      const H = Math.round(rect.height)
      canvas.width = W * dpr
      canvas.height = H * dpr
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const groundY = H * 0.80
      const c = isDark ? '255,255,255' : '0,0,0'
      const bgColor = isDark ? '#04030e' : '#ffffff'

      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, W, H)

      // Ground line
      ctx.strokeStyle = `rgba(${c},0.15)`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, groundY)
      ctx.lineTo(W, groundY)
      ctx.stroke()

      // Ruler ticks
      for (let x = 0; x < W; x += 10) {
        const isBig = x % 50 < 5
        ctx.strokeStyle = `rgba(${c},0.12)`
        ctx.beginPath()
        ctx.moveTo(x, groundY)
        ctx.lineTo(x, groundY + (isBig ? 6 : 3))
        ctx.stroke()
      }

      // Student standing still
      const px = 40
      const py = groundY - 28
      const pc = `rgba(${c},0.82)`

      ctx.fillStyle = pc
      ctx.fillRect(px - 4, py, 18, 3)
      ctx.fillRect(px, py + 3, 10, 3)
      ctx.strokeStyle = pc
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(px + 12, py)
      ctx.lineTo(px + 16, py - 4)
      ctx.stroke()
      ctx.fillRect(px + 15, py - 5, 2, 2)
      ctx.fillStyle = pc
      ctx.fillRect(px + 1, py + 6, 8, 8)
      ctx.fillStyle = bgColor
      ctx.fillRect(px + 6, py + 8, 2, 2)
      ctx.fillStyle = pc
      ctx.fillRect(px, py + 14, 10, 8)
      ctx.fillStyle = `rgba(${c},0.55)`
      ctx.fillRect(px - 3, py + 14, 4, 6)
      ctx.fillStyle = pc
      ctx.fillRect(px + 1, py + 22, 3, 6)
      ctx.fillRect(px + 6, py + 22, 3, 6)
    }

    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(parent)
    return () => ro.disconnect()
  }, [waitingToStart, isDark])

  // Start game loop only after play button clicked
  useEffect(() => {
    if (waitingToStart) return

    let cleanup: (() => void) | undefined
    const startTimeout = setTimeout(() => {
      cleanup = startGameLoop()
    }, 100)

    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!parent) return

    const ro = new ResizeObserver(() => {
      if (cleanup) cleanup()
      cleanup = startGameLoop()
    })
    ro.observe(parent)

    return () => {
      clearTimeout(startTimeout)
      if (cleanup) cleanup()
      ro.disconnect()
    }
  }, [startGameLoop, waitingToStart])

  return (
    <>
      {/* ─── Main 2x2 grid ─── */}
      <div style={{
        height: '100%',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 10,
        padding: 16,
      }}>

        {/* ═══ TOP-LEFT: Stats pills (2x2 sub-grid) ═══ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          padding: 14,
          borderRadius: 12,
          background: 'var(--mq-card-bg)',
          border: '1px solid var(--mq-border)',
          alignContent: 'center',
        }}>
          {/* Complété */}
          <div style={{ textAlign: 'center', padding: '8px 6px' }}>
            <div style={{ fontSize: 12, color: 'var(--mq-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 3 }}>Complété</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--mq-text-primary)', letterSpacing: '-1px' }}>{globalPct}%</div>
            <div style={{ fontSize: 10, color: tw(0.35, textIntensity, isDark), marginTop: 2 }}>{doneSec}/{totalSec} sections</div>
          </div>
          {/* Temps */}
          <div style={{ textAlign: 'center', padding: '8px 6px' }}>
            <div style={{ fontSize: 12, color: 'var(--mq-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 3 }}>Temps</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--mq-text-primary)', letterSpacing: '-1px' }}>{hasDeadline ? `${timePct}%` : '\u2014'}</div>
            <div style={{ fontSize: 10, color: tw(0.35, textIntensity, isDark), marginTop: 2 }}>{hasDeadline ? `${remaining} jours restants` : 'Aucune deadline'}</div>
          </div>
          {/* Points */}
          <div style={{ textAlign: 'center', padding: '8px 6px' }}>
            <div style={{ fontSize: 12, color: 'var(--mq-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 3 }}>Points</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--mq-text-primary)', letterSpacing: '-1px' }}>{totalPoints}</div>
          </div>
          {/* Régularité */}
          <div style={{ textAlign: 'center', padding: '8px 6px' }}>
            <div style={{ fontSize: 12, color: 'var(--mq-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 3 }}>Régularité</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--mq-text-primary)', letterSpacing: '-1px' }}>{streak.current}j</div>
            <div style={{ fontSize: 10, color: tw(0.35, textIntensity, isDark), marginTop: 2 }}>de suite</div>
          </div>
        </div>

        {/* ═══ TOP-RIGHT: Mini-jeu Récréation ═══ */}
        <div style={{
          padding: 14, borderRadius: 12,
          background: 'var(--mq-card-bg)',
          border: '1px solid var(--mq-border)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden', cursor: 'pointer',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: 10, color: 'var(--mq-text-muted)', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8, flexShrink: 0,
          }}>
            <span>Récréation</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: tw(0.60, textIntensity, isDark), fontVariantNumeric: 'tabular-nums', letterSpacing: '1px' }}>
              {scoreDisplay}
            </span>
          </div>
          <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', borderRadius: 6 }} />

            {/* Bouton play — écran d'attente */}
            {waitingToStart && (
              <button
                onClick={() => setWaitingToStart(false)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: `1px solid ${bg(0.15, isDark)}`,
                  background: bg(0.08, isDark),
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(4px)',
                }}
                onMouseEnter={e => {
                  ;(e.currentTarget as HTMLButtonElement).style.background = bg(0.15, isDark)
                  ;(e.currentTarget as HTMLButtonElement).style.transform = 'translate(-50%, -50%) scale(1.1)'
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLButtonElement).style.background = bg(0.08, isDark)
                  ;(e.currentTarget as HTMLButtonElement).style.transform = 'translate(-50%, -50%) scale(1)'
                }}
                title="Jouer"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 1.5L12 7L3 12.5V1.5Z" fill={tw(0.50, textIntensity, isDark)} />
                </svg>
              </button>
            )}

            {/* Hint quand game over */}
            {!waitingToStart && !gameActive && (
              <div style={{
                position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center',
                fontSize: 10, color: tw(0.25, textIntensity, isDark), letterSpacing: '0.5px',
              }}>
                Espace pour rejouer
              </div>
            )}
          </div>
          <div style={{ fontSize: 9, color: tw(0.25, textIntensity, isDark), marginTop: 4, flexShrink: 0 }}>
            Meilleur : {bestScore}
          </div>
        </div>

        {/* ═══ BOTTOM-LEFT: Chapters (compact bars) ═══ */}
        <div style={{
          padding: 14,
          borderRadius: 12,
          background: 'var(--mq-card-bg)',
          border: '1px solid var(--mq-border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{ fontSize: 10, color: 'var(--mq-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10, flexShrink: 0 }}>
            Par chapitre
          </div>
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: 2 }}>
            {chapters.map(ch => {
              const pct = ch.sections > 0 ? Math.round((ch.done / ch.sections) * 100) : 0
              return (
                <div
                  key={ch.num}
                  onClick={() => setSelectedChapter(ch.num)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
                    cursor: 'pointer', borderRadius: 4, padding: '3px 4px',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = bg(0.04, isDark) }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                >
                  <span style={{ fontSize: 10, color: tw(0.30, textIntensity, isDark), width: 24, flexShrink: 0, fontWeight: 600 }}>{ch.num}</span>
                  <div style={{ flex: 1, height: 4, borderRadius: 99, background: bg(0.06, isDark), overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: accentColor, transition: 'width 0.6s ease' }} />
                  </div>
                  <span style={{ fontSize: 10, color: tw(0.40, textIntensity, isDark), width: 28, textAlign: 'right', flexShrink: 0, fontWeight: 500 }}>{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ═══ BOTTOM-RIGHT: Streak + Difficulty (merged) ═══ */}
        <div style={{
          padding: 14,
          borderRadius: 12,
          background: 'var(--mq-card-bg)',
          border: '1px solid var(--mq-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          overflow: 'hidden',
        }}>
          {/* Streak section */}
          <div>
            <div style={{ fontSize: 10, color: 'var(--mq-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
              7 derniers jours
            </div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
              {last7.map((active, i) => {
                const isToday = i === 6
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <div style={{
                      width: '100%', aspectRatio: '1', borderRadius: 4,
                      background: active
                        ? isToday ? bg(0.15, isDark) : bg(0.08, isDark)
                        : bg(0.04, isDark),
                      border: `1px solid ${active ? bg(0.10, isDark) : 'var(--mq-stroke-soft)'}`,
                    }} />
                    <span style={{ fontSize: 8, color: tw(0.30, textIntensity, isDark), fontWeight: 500 }}>
                      {['L', 'M', 'M', 'J', 'V', 'S', 'D'][(new Date().getDay() + i - 6 + 7) % 7]}
                    </span>
                  </div>
                )
              })}
            </div>
            <div style={{ fontSize: 10, color: tw(0.50, textIntensity, isDark) }}>
              {streak.current === 0
                ? "Commence aujourd'hui."
                : `${streak.current} jour${streak.current > 1 ? 's' : ''} de suite.`}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: bg(0.06, isDark), flexShrink: 0 }} />

          {/* Difficulty section */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 10, color: 'var(--mq-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
              Par difficulté
            </div>
            {[
              { label: 'Facile', total: easyTotal },
              { label: 'Moyen', total: medTotal },
              { label: 'Difficile', total: hardTotal },
            ].map(d => (
              <div key={d.label} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 10, color: tw(0.50, textIntensity, isDark) }}>{d.label}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: tw(0.60, textIntensity, isDark) }}>{d.total}</span>
                </div>
                <div style={{ height: 3, borderRadius: 99, background: bg(0.06, isDark), overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: totalSec > 0 ? `${Math.round((d.total / totalSec) * 100)}%` : '0%',
                    borderRadius: 99,
                    background: accentColor,
                    transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ─── Chapter overlay ─── */}
      {selectedChapter && selectedCh && (
        <div
          onClick={() => setSelectedChapter(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.60)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'mqOverlayIn 0.2s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: 420, maxHeight: '80vh', overflowY: 'auto',
              background: 'var(--mq-card-bg)',
              border: '1px solid var(--mq-border)',
              borderRadius: 16, padding: 24,
              animation: 'mqCardIn 0.25s ease',
            }}
          >
            {/* Close button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 10, color: tw(0.30, textIntensity, isDark), fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>
                  Chapitre {selectedCh.num}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: tw(0.85, textIntensity, isDark), letterSpacing: '-0.3px' }}>
                  {selectedCh.title}
                </div>
              </div>
              <button
                onClick={() => setSelectedChapter(null)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 18, color: tw(0.40, textIntensity, isDark),
                  padding: '4px 8px', borderRadius: 6,
                  lineHeight: 1,
                }}
              >
                {'\u2715'}
              </button>
            </div>

            {/* Progress summary */}
            <div style={{
              display: 'flex', gap: 12, marginBottom: 18,
              padding: '12px 14px', borderRadius: 10,
              background: bg(0.03, isDark),
              border: `1px solid ${bg(0.06, isDark)}`,
            }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: tw(0.85, textIntensity, isDark) }}>
                  {selectedCh.sections > 0 ? Math.round((selectedCh.done / selectedCh.sections) * 100) : 0}%
                </div>
                <div style={{ fontSize: 9, color: tw(0.35, textIntensity, isDark), marginTop: 2 }}>Complété</div>
              </div>
              <div style={{ width: 1, background: bg(0.06, isDark) }} />
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: tw(0.85, textIntensity, isDark) }}>
                  {selectedCh.done}/{selectedCh.sections}
                </div>
                <div style={{ fontSize: 9, color: tw(0.35, textIntensity, isDark), marginTop: 2 }}>Sections</div>
              </div>
            </div>

            {/* Full progress bar */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ height: 6, borderRadius: 99, background: bg(0.06, isDark), overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${selectedCh.sections > 0 ? Math.round((selectedCh.done / selectedCh.sections) * 100) : 0}%`,
                  borderRadius: 99,
                  background: accentColor,
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>

            {/* Section list */}
            <div style={{ fontSize: 10, color: tw(0.30, textIntensity, isDark), fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
              Sections
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {selectedCh.sectionList.map((sec, idx) => {
                const isDone = idx < selectedCh.done
                const diffColors: Record<string, string> = { easy: tw(0.35, textIntensity, isDark), medium: tw(0.45, textIntensity, isDark), hard: tw(0.55, textIntensity, isDark) }
                const diffLabels: Record<string, string> = { easy: 'Facile', medium: 'Moyen', hard: 'Difficile' }
                return (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 8,
                    background: isDone ? bg(0.03, isDark) : 'transparent',
                    border: `1px solid ${isDone ? bg(0.06, isDark) : bg(0.04, isDark)}`,
                    opacity: isDone ? 0.65 : 1,
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: 4,
                      border: `1.5px solid ${isDone ? tw(0.30, textIntensity, isDark) : bg(0.12, isDark)}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: tw(0.40, textIntensity, isDark),
                      flexShrink: 0,
                    }}>
                      {isDone ? '\u2713' : ''}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 11, fontWeight: 500,
                        color: isDone ? tw(0.40, textIntensity, isDark) : tw(0.75, textIntensity, isDark),
                        textDecoration: isDone ? 'line-through' : 'none',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {sec.text}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 9, fontWeight: 600,
                      color: diffColors[sec.difficulty],
                      flexShrink: 0,
                    }}>
                      {diffLabels[sec.difficulty]}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes mqOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes mqCardIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  )
}
