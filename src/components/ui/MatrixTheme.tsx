'use client'

import { useEffect, useRef } from 'react'

interface MatrixThemeProps {
  isActive: boolean
}

export default function MatrixTheme({ isActive }: MatrixThemeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!isActive) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Configuration
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()'.split('')
    const fontSize = 14
    const columns = Math.floor(canvas.width / fontSize)
    const drops: number[] = Array(columns).fill(0)

    // Animation
    const draw = () => {
      // Fond noir semi-transparent pour effet de traînée
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Texte vert Matrix
      ctx.fillStyle = '#0F0'
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]
        const x = i * fontSize
        const y = drops[i] * fontSize

        ctx.fillText(char, x, y)

        // Réinitialiser aléatoirement
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }

        drops[i]++
      }
    }

    const interval = setInterval(draw, 50)

    // Gestion du resize
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', handleResize)
    }
  }, [isActive])

  if (!isActive) return null

  return (
    <>
      {/* Canvas Matrix en arrière-plan */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[9999]"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Filtre vert Matrix sur toute l'app */}
      <div
        className="fixed inset-0 pointer-events-none z-[9998] bg-black/30"
        style={{
          backdropFilter: 'hue-rotate(90deg) saturate(1.5)',
        }}
      />

      {/* Notification */}
      <div className="fixed top-4 right-4 z-[10000] bg-black/90 border border-green-500 px-4 py-2 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-5">
        <p className="text-green-500 text-sm font-mono">
          🎮 <strong>MATRIX MODE ACTIVATED</strong>
        </p>
        <p className="text-green-500/70 text-xs font-mono mt-1">
          Press ESC to exit
        </p>
      </div>
    </>
  )
}
