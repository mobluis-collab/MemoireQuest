'use client'

import { useState, useEffect, useRef } from 'react'

export function useAvatarAnimation(level: number) {
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const previousLevel = useRef(level)

  useEffect(() => {
    // Detect level up
    if (level > previousLevel.current && previousLevel.current > 0) {
      setShouldAnimate(true)

      // Reset animation after it completes
      const timer = setTimeout(() => {
        setShouldAnimate(false)
      }, 800) // Match animation duration

      return () => clearTimeout(timer)
    }

    previousLevel.current = level
  }, [level])

  return shouldAnimate
}
