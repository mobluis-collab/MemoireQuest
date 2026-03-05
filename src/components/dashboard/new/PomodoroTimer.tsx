'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { tw, bg } from '@/lib/color-utils'

interface PomodoroTimerProps {
  isOpen: boolean
  onClose: () => void
  textIntensity?: number
  isDark?: boolean
}

const POMODORO_DESC = 'La méthode Pomodoro alterne 25 min de travail concentré et 5 min de pause pour améliorer ta productivité et réduire la fatigue mentale.'

export default function PomodoroTimer({ isOpen, onClose, textIntensity = 1.0, isDark = true }: PomodoroTimerProps) {
  const [mode, setMode] = useState<'work' | 'break'>('work')
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [completedCycles, setCompletedCycles] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const totalTime = mode === 'work' ? 25 * 60 : 5 * 60

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) return 0
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning])

  // Handle timer reaching 0
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false)
      if (mode === 'work') {
        setCompletedCycles(prev => prev + 1)
        setMode('break')
        setTimeLeft(5 * 60)
        setIsRunning(true)
      } else {
        setMode('work')
        setTimeLeft(25 * 60)
      }
    }
  }, [timeLeft, isRunning, mode])

  const toggleRunning = useCallback(() => {
    setIsRunning(prev => !prev)
  }, [])

  const reset = useCallback(() => {
    setIsRunning(false)
    setMode('work')
    setTimeLeft(25 * 60)
  }, [])

  const skip = useCallback(() => {
    setIsRunning(false)
    if (mode === 'work') {
      setMode('break')
      setTimeLeft(5 * 60)
    } else {
      setMode('work')
      setTimeLeft(25 * 60)
    }
  }, [mode])

  // Keyboard: Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        if (isFullscreen) {
          setIsFullscreen(false)
        } else {
          onClose()
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose, isFullscreen])

  if (!isOpen) return null

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  const progress = timeLeft / totalTime
  const filledDots = completedCycles % 4

  /* ─── FULLSCREEN MODE ─── */
  if (isFullscreen) {
    const radius = 44
    const circumference = 2 * Math.PI * radius
    const dashOffset = circumference * (1 - progress)

    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        background: isDark ? 'rgba(4,3,14,0.55)' : 'rgba(255,255,255,0.45)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        animation: 'mq-overlay-in 0.25s ease both',
      }}>
        <style>{`@keyframes mq-overlay-in { from { opacity: 0; } to { opacity: 1; } }`}</style>

        {/* Top-right buttons: close + minimize */}
        <div style={{ position: 'absolute', top: 20, right: 24, display: 'flex', gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: `1px solid ${bg(0.10, isDark)}`,
              background: bg(0.06, isDark),
              color: tw(0.40, textIntensity, isDark),
              fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >
            {'\u2715'}
          </button>
          <button
            onClick={() => setIsFullscreen(false)}
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: `1px solid ${bg(0.10, isDark)}`,
              background: bg(0.06, isDark),
              color: tw(0.40, textIntensity, isDark),
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
            title="Mode compact"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M4 1V3.5H1M8 1V3.5H11M11 8.5H8V11M1 8.5H4V11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Mode label */}
        <div style={{
          fontSize: 13, fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '2px', color: tw(0.35, textIntensity, isDark),
          marginBottom: 32,
        }}>
          {mode === 'work' ? 'Concentration' : 'Pause'}
        </div>

        {/* Circle + Timer */}
        <div style={{
          position: 'relative', width: 220, height: 220,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 40,
        }}>
          <svg width={220} height={220} viewBox="0 0 100 100" style={{ position: 'absolute', top: 0, left: 0 }}>
            <circle cx={50} cy={50} r={radius} fill="none" stroke={bg(0.06, isDark)} strokeWidth={2} />
            <circle
              cx={50} cy={50} r={radius} fill="none"
              stroke={tw(0.25, textIntensity, isDark)}
              strokeWidth={2} strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={dashOffset}
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div style={{
            fontSize: 72, fontWeight: 200, fontFamily: 'inherit',
            letterSpacing: '-2px',
            color: mode === 'work' ? tw(0.90, textIntensity, isDark) : tw(0.60, textIntensity, isDark),
            position: 'relative', zIndex: 1,
          }}>
            {timeStr}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button onClick={toggleRunning} style={{
            borderRadius: 99, padding: '10px 20px',
            border: `1px solid ${bg(0.12, isDark)}`,
            background: isRunning ? bg(0.06, isDark) : bg(0.10, isDark),
            color: isRunning ? tw(0.60, textIntensity, isDark) : tw(0.80, textIntensity, isDark),
            fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
          }}>
            {isRunning ? '\u23F8 Pause' : '\u25B6 Play'}
          </button>
          <button onClick={reset} style={{
            borderRadius: 99, padding: '10px 20px',
            border: `1px solid ${bg(0.12, isDark)}`,
            background: bg(0.06, isDark), color: tw(0.60, textIntensity, isDark),
            fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
          }}>
            {'\u21BA'} Reset
          </button>
          <button onClick={skip} style={{
            borderRadius: 99, padding: '10px 20px',
            border: `1px solid ${bg(0.12, isDark)}`,
            background: bg(0.06, isDark), color: tw(0.60, textIntensity, isDark),
            fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
          }}>
            {'\u23ED'} Skip
          </button>
        </div>

        {/* Description */}
        <div style={{
          fontSize: 11, color: tw(0.25, textIntensity, isDark),
          textAlign: 'center', maxWidth: 320, lineHeight: '1.5',
          marginBottom: 24,
        }}>
          {POMODORO_DESC}
        </div>

        {/* Cycle dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: i < filledDots ? tw(0.50, textIntensity, isDark) : tw(0.12, textIntensity, isDark),
              transition: 'background 0.3s',
            }} />
          ))}
          {completedCycles > 0 && (
            <span style={{ fontSize: 11, color: tw(0.35, textIntensity, isDark), marginLeft: 8 }}>
              {completedCycles} pomodoro{completedCycles > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    )
  }

  /* ─── COMPACT MODE ─── */
  const compactRadius = 23
  const compactCirc = 2 * Math.PI * compactRadius
  const compactOffset = compactCirc * (1 - progress)

  return (
    <div style={{
      position: 'fixed',
      top: 16,
      right: 16,
      zIndex: 9998,
      width: 260,
      borderRadius: 14,
      border: `1px solid ${bg(0.10, isDark)}`,
      background: isDark ? 'rgba(4,3,14,0.70)' : 'rgba(255,255,255,0.70)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      padding: '16px 18px 14px',
      boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.08)',
      animation: 'mq-overlay-in 0.25s ease both',
    }}>
      <style>{`@keyframes mq-overlay-in { from { opacity: 0; } to { opacity: 1; } }`}</style>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 12,
      }}>
        <div style={{
          fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '1.5px', color: tw(0.30, textIntensity, isDark),
        }}>
          {mode === 'work' ? 'Concentration' : 'Pause'}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => setIsFullscreen(true)}
            style={{
              width: 24, height: 24, borderRadius: 6,
              border: `1px solid ${bg(0.10, isDark)}`,
              background: bg(0.06, isDark),
              color: tw(0.40, textIntensity, isDark),
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
            title="Plein écran"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 3.5V1H3.5M6.5 1H9V3.5M9 6.5V9H6.5M3.5 9H1V6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={onClose}
            style={{
              width: 24, height: 24, borderRadius: 6,
              border: `1px solid ${bg(0.10, isDark)}`,
              background: bg(0.06, isDark),
              color: tw(0.40, textIntensity, isDark),
              fontSize: 11, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >
            {'\u2715'}
          </button>
        </div>
      </div>

      {/* Timer row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        marginBottom: 8,
      }}>
        {/* Mini circle */}
        <svg width={52} height={52} viewBox="0 0 52 52" style={{ flexShrink: 0 }}>
          <circle cx={26} cy={26} r={compactRadius} fill="none" stroke={bg(0.06, isDark)} strokeWidth={2} />
          <circle
            cx={26} cy={26} r={compactRadius} fill="none"
            stroke={tw(0.25, textIntensity, isDark)}
            strokeWidth={2} strokeLinecap="round"
            strokeDasharray={compactCirc} strokeDashoffset={compactOffset}
            transform="rotate(-90 26 26)"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        {/* Time */}
        <div style={{
          fontSize: 32, fontWeight: 300, fontFamily: 'inherit',
          letterSpacing: '-1px',
          color: tw(0.85, textIntensity, isDark),
        }}>
          {timeStr}
        </div>
      </div>

      {/* Description */}
      <div style={{
        fontSize: 10, lineHeight: '1.4',
        color: tw(0.25, textIntensity, isDark),
        marginBottom: 10,
      }}>
        {POMODORO_DESC}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        <button onClick={toggleRunning} style={{
          borderRadius: 99, padding: '5px 12px',
          border: `1px solid ${bg(0.12, isDark)}`,
          background: isRunning ? bg(0.06, isDark) : bg(0.10, isDark),
          color: isRunning ? tw(0.50, textIntensity, isDark) : tw(0.75, textIntensity, isDark),
          fontSize: 11, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
        }}>
          {isRunning ? '\u23F8 Pause' : '\u25B6 Play'}
        </button>
        <button onClick={reset} style={{
          borderRadius: 99, padding: '5px 12px',
          border: `1px solid ${bg(0.12, isDark)}`,
          background: bg(0.06, isDark), color: tw(0.50, textIntensity, isDark),
          fontSize: 11, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
        }}>
          {'\u21BA'} Reset
        </button>
        <button onClick={skip} style={{
          borderRadius: 99, padding: '5px 12px',
          border: `1px solid ${bg(0.12, isDark)}`,
          background: bg(0.06, isDark), color: tw(0.50, textIntensity, isDark),
          fontSize: 11, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
        }}>
          {'\u23ED'} Skip
        </button>
      </div>

      {/* Footer: dots + cycle count */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: i < filledDots ? tw(0.50, textIntensity, isDark) : tw(0.12, textIntensity, isDark),
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
        <span style={{ fontSize: 10, color: tw(0.25, textIntensity, isDark) }}>
          {completedCycles} cycle{completedCycles !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}
