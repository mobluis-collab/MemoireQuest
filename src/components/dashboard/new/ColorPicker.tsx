'use client'

import { useState, useRef, useEffect, CSSProperties } from 'react'

/* ─── Types ───────────────────────────────────────────────────── */
interface ColorPickerProps {
  currentColor: string
  onColorChange: (color: string) => void
}

/* ─── Palette prédéfinie ──────────────────────────────────────── */
const PRESET_COLORS = [
  '#7C3AED', // violet (défaut)
  '#3B82F6', // bleu
  '#10B981', // vert
  '#F59E0B', // ambre
  '#EF4444', // rouge
  '#EC4899', // rose
  '#06B6D4', // cyan
  '#F97316', // orange
] as const

/* ─── Composant ───────────────────────────────────────────────── */
export default function ColorPicker({ currentColor, onColorChange }: ColorPickerProps) {
  const [selectedColor, setSelectedColor] = useState<string>(currentColor)
  const [customPickerOpen, setCustomPickerOpen] = useState(false)
  const [customColor, setCustomColor] = useState<string>(currentColor)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [plusHovered, setPlusHovered] = useState(false)
  const [applyHovered, setApplyHovered] = useState(false)

  const colorInputRef = useRef<HTMLInputElement>(null)
  const customPanelRef = useRef<HTMLDivElement>(null)
  const [panelHeight, setPanelHeight] = useState(0)

  /* Sync si la prop change de l'extérieur */
  useEffect(() => {
    setSelectedColor(currentColor)
  }, [currentColor])

  /* Mesurer la hauteur réelle du panel custom pour l'animation accordion */
  useEffect(() => {
    if (customPanelRef.current) {
      setPanelHeight(customPanelRef.current.scrollHeight)
    }
  }, [customPickerOpen, customColor])

  /* ─── Handlers ───────────────────────────────────────────────── */
  const handlePresetClick = (color: string) => {
    setSelectedColor(color)
    onColorChange(color)
  }

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColor(e.target.value)
    setSelectedColor(e.target.value)
  }

  const handleApplyCustom = () => {
    onColorChange(selectedColor)
  }

  const toggleCustomPicker = () => {
    setCustomPickerOpen((prev) => !prev)
  }

  /* ─── Styles ─────────────────────────────────────────────────── */
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    padding: '12px 0',
  }

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 10,
    justifyItems: 'center',
    alignItems: 'center',
  }

  const swatchBase: CSSProperties = {
    width: 28,
    height: 28,
    borderRadius: '50%',
    cursor: 'pointer',
    border: '2px solid transparent',
    transition: 'transform 0.2s cubic-bezier(.4,0,.2,1)',
    flexShrink: 0,
  }

  const plusSwatchStyle: CSSProperties = {
    ...swatchBase,
    background: 'rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 1,
    transform: plusHovered ? 'scale(1.05)' : 'scale(1)',
  }

  const customPanelWrapperStyle: CSSProperties = {
    maxHeight: customPickerOpen ? panelHeight : 0,
    overflow: 'hidden',
    transition: 'max-height 0.3s cubic-bezier(.4,0,.2,1)',
  }

  const customPanelStyle: CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    alignItems: 'center',
  }

  const colorInputWrapperStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  }

  const nativeInputStyle: CSSProperties = {
    width: 40,
    height: 40,
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    background: 'transparent',
    padding: 0,
  }

  const previewDotStyle: CSSProperties = {
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: customColor,
    border: '1px solid rgba(255,255,255,0.2)',
    flexShrink: 0,
  }

  const hexTextStyle: CSSProperties = {
    fontFamily: "monospace, 'Courier New', Courier",
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.5,
    userSelect: 'all',
  }

  const applyBtnStyle: CSSProperties = {
    background: selectedColor,
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '6px 16px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    opacity: applyHovered ? 0.85 : 1,
    transition: 'opacity 0.2s ease',
    alignSelf: 'stretch',
  }

  /* ─── Rendu ──────────────────────────────────────────────────── */
  const isCustomSelected =
    !PRESET_COLORS.includes(selectedColor as typeof PRESET_COLORS[number])

  return (
    <div style={containerStyle}>
      {/* Grille de ronds prédéfinis + bouton "+" */}
      <div style={gridStyle}>
        {PRESET_COLORS.map((color, index) => {
          const isSelected = selectedColor.toUpperCase() === color.toUpperCase()
          const isHovered = hoveredIndex === index

          const style: CSSProperties = {
            ...swatchBase,
            background: color,
            border: isSelected
              ? '2px solid rgba(255,255,255,0.8)'
              : '2px solid transparent',
            transform: isSelected
              ? 'scale(1.1)'
              : isHovered
                ? 'scale(1.05)'
                : 'scale(1)',
          }

          return (
            <div
              key={color}
              style={style}
              onClick={() => handlePresetClick(color)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              role="button"
              tabIndex={0}
              aria-label={`Couleur ${color}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handlePresetClick(color)
                }
              }}
            />
          )
        })}

        {/* 9ème rond : "+" toggle custom picker */}
        <div
          style={{
            ...plusSwatchStyle,
            border: isCustomSelected && customPickerOpen
              ? '2px solid rgba(255,255,255,0.8)'
              : '2px solid rgba(255,255,255,0.15)',
            transform: isCustomSelected && customPickerOpen
              ? 'scale(1.1)'
              : plusHovered
                ? 'scale(1.05)'
                : 'scale(1)',
          }}
          onClick={toggleCustomPicker}
          onMouseEnter={() => setPlusHovered(true)}
          onMouseLeave={() => setPlusHovered(false)}
          role="button"
          tabIndex={0}
          aria-label="Couleur personnalisée"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              toggleCustomPicker()
            }
          }}
        >
          +
        </div>
      </div>

      {/* Custom picker (accordion) */}
      <div style={customPanelWrapperStyle}>
        <div ref={customPanelRef} style={customPanelStyle}>
          <div style={colorInputWrapperStyle}>
            <input
              ref={colorInputRef}
              type="color"
              value={customColor}
              onChange={handleCustomColorChange}
              style={nativeInputStyle}
              aria-label="Sélecteur de couleur personnalisée"
            />
            <div style={previewDotStyle} />
            <span style={hexTextStyle}>{customColor.toUpperCase()}</span>
          </div>

          <button
            style={applyBtnStyle}
            onClick={handleApplyCustom}
            onMouseEnter={() => setApplyHovered(true)}
            onMouseLeave={() => setApplyHovered(false)}
          >
            Appliquer
          </button>
        </div>
      </div>
    </div>
  )
}
