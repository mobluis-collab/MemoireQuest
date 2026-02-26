'use client'

import { useEffect, useState } from 'react'

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA'
]

export function useKonamiCode(onSuccess: () => void) {
  const [keys, setKeys] = useState<string[]>([])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ajouter la touche à la séquence
      setKeys(prevKeys => {
        const newKeys = [...prevKeys, e.code]

        // Garder seulement les dernières touches (longueur du code Konami)
        const limitedKeys = newKeys.slice(-KONAMI_CODE.length)

        // Vérifier si la séquence correspond
        const isMatch = limitedKeys.length === KONAMI_CODE.length &&
          limitedKeys.every((key, index) => key === KONAMI_CODE[index])

        if (isMatch) {
          onSuccess()
          return [] // Reset après succès
        }

        return limitedKeys
      })

      // Reset après 2 secondes d'inactivité
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setKeys([])
      }, 2000)
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      clearTimeout(timeoutId)
    }
  }, [onSuccess])
}
