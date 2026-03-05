'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { tw, bg } from '@/lib/color-utils'

interface PomodoroTimerProps {
  isOpen: boolean
  onClose: () => void
  textIntensity?: number
  isDark?: boolean
}

export default function PomodoroTimer({ isOpen, onClose, textIntensity = 1.0, isDark = true }: PomodoroTimerProps) {
  const [mode, setMode] = useState<'work' | 'break'>('work')
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [completedCycles, setCompletedCycles] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const totalTime = mode === 'work' ? 25 * 60 : 5 * 60

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            return 0
          }
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
        setIsRunning(true) // auto-start break
      } else {
        setMode('work')
        setTimeLeft(25 * 60)
        // Don't auto-start work
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

  // Keyboard: Escape to close
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const timeStr = `${String(minutes).padStart(2, '0')} : ${String(seconds).padStart(2, '0')}`

  // SVG circle progress
  const radius = 44
  const circumference = 2 * Math.PI * radius
  const progress = timeLeft / totalTime
  const dashOffset = circumference * (1 - progress)

  // Cycle dots (show 4, filled based on completedCycles % 4)
  const filledDots = completedCycles % 4

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
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 20,
          right: 24,
          width: 32,
          height: 32,
          borderRadius: 8,
          border: `1px solid ${bg(0.10, isDark)}`,
          background: bg(0.06, isDark),
          color: tw(0.40, textIntensity, isDark),
          fontSize: 14,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s',
        }}
      >
        {'\u2715'}
      </button>

      {/* Mode label */}
      <div style={{
        fontSize: 13,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '2px',
        color: tw(0.35, textIntensity, isDark),
        marginBottom: 32,
      }}>
        {mode === 'work' ? 'Concentration' : 'Pause'}
      </div>

      {/* Circle + Timer */}
      <div style={{
        position: 'relative',
        width: 220,
        height: 220,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
      }}>
        <svg
          width={220}
          height={220}
          viewBox="0 0 100 100"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          {/* Track */}
          <circle
            cx={50}
            cy={50}
            r={radius}
            fill="none"
            stroke={bg(0.06, isDark)}
            strokeWidth={2}
          />
          {/* Progress */}
          <circle
            cx={50}
            cy={50}
            r={radius}
            fill="none"
            stroke={tw(0.25, textIntensity, isDark)}
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>

        {/* Timer text centered in circle */}
        <div style={{
          fontSize: 72,
          fontWeight: 200,
          fontFamily: 'monospace',
          letterSpacing: '-2px',
          color: mode === 'work' ? tw(0.90, textIntensity, isDark) : tw(0.60, textIntensity, isDark),
          position: 'relative',
          zIndex: 1,
        }}>
          {timeStr}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 32,
      }}>
        <button
          onClick={toggleRunning}
          style={{
            borderRadius: 99,
            padding: '10px 20px',
            border: `1px solid ${bg(0.12, isDark)}`,
            background: isRunning ? bg(0.06, isDark) : bg(0.10, isDark),
            color: isRunning ? tw(0.60, textIntensity, isDark) : tw(0.80, textIntensity, isDark),
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {isRunning ? '\u23F8 Pause' : '\u25B6 Play'}
        </button>
        <button
          onClick={reset}
          style={{
            borderRadius: 99,
            padding: '10px 20px',
            border: `1px solid ${bg(0.12, isDark)}`,
            background: bg(0.06, isDark),
            color: tw(0.60, textIntensity, isDark),
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {'\u21BA'} Reset
        </button>
        <button
          onClick={skip}
          style={{
            borderRadius: 99,
            padding: '10px 20px',
            border: `1px solid ${bg(0.12, isDark)}`,
            background: bg(0.06, isDark),
            color: tw(0.60, textIntensity, isDark),
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {'\u23ED'} Skip
        </button>
      </div>

      {/* Pomodoro cycle dots */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: i < filledDots ? tw(0.50, textIntensity, isDark) : tw(0.12, textIntensity, isDark),
              transition: 'background 0.3s',
            }}
          />
        ))}
        {completedCycles > 0 && (
          <span style={{
            fontSize: 11,
            color: tw(0.35, textIntensity, isDark),
            marginLeft: 8,
          }}>
            {completedCycles} pomodoro{completedCycles > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  )
}
