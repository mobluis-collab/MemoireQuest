'use client'

import { useState, useEffect } from 'react'
import { X, Trophy } from 'lucide-react'

interface Card {
  id: number
  content: string
  isFlipped: boolean
  isMatched: boolean
}

interface MemoryGameProps {
  isOpen: boolean
  onClose: () => void
}

const CARDS_CONTENT = [
  'Introduction',
  'Méthodologie',
  'Contexte',
  'Analyse',
  'Résultats',
  'Discussion',
  'Conclusion',
  'Références'
]

export default function MemoryGame({ isOpen, onClose }: MemoryGameProps) {
  const [cards, setCards] = useState<Card[]>([])
  const [flippedIndices, setFlippedIndices] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [isWon, setIsWon] = useState(false)

  // Initialiser le jeu
  useEffect(() => {
    if (isOpen) {
      initializeGame()
    }
  }, [isOpen])

  const initializeGame = () => {
    // Créer paires de cartes
    const cardPairs = CARDS_CONTENT.flatMap((content, index) => [
      { id: index * 2, content, isFlipped: false, isMatched: false },
      { id: index * 2 + 1, content, isFlipped: false, isMatched: false }
    ])

    // Mélanger
    const shuffled = cardPairs.sort(() => Math.random() - 0.5)
    setCards(shuffled)
    setFlippedIndices([])
    setMoves(0)
    setIsWon(false)
  }

  const handleCardClick = (index: number) => {
    // Ignorer si déjà 2 cartes retournées ou carte déjà retournée
    if (flippedIndices.length === 2 || cards[index].isFlipped || cards[index].isMatched) {
      return
    }

    const newCards = [...cards]
    newCards[index].isFlipped = true
    setCards(newCards)

    const newFlippedIndices = [...flippedIndices, index]
    setFlippedIndices(newFlippedIndices)

    // Si 2 cartes retournées
    if (newFlippedIndices.length === 2) {
      setMoves(moves + 1)

      const [firstIndex, secondIndex] = newFlippedIndices
      const firstCard = newCards[firstIndex]
      const secondCard = newCards[secondIndex]

      if (firstCard.content === secondCard.content) {
        // Match trouvé
        newCards[firstIndex].isMatched = true
        newCards[secondIndex].isMatched = true
        setCards(newCards)
        setFlippedIndices([])

        // Vérifier victoire
        if (newCards.every(card => card.isMatched)) {
          setTimeout(() => setIsWon(true), 500)
        }
      } else {
        // Pas de match, retourner après délai
        setTimeout(() => {
          const resetCards = [...newCards]
          resetCards[firstIndex].isFlipped = false
          resetCards[secondIndex].isFlipped = false
          setCards(resetCards)
          setFlippedIndices([])
        }, 1000)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-zinc-100">
              🎮 Jeu de Mémoire
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Retrouve les paires de sections !
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">Coups :</span>
            <span className="font-bold text-indigo-400">{moves}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">Paires trouvées :</span>
            <span className="font-bold text-emerald-400">
              {cards.filter(c => c.isMatched).length / 2} / {CARDS_CONTENT.length}
            </span>
          </div>
        </div>

        {/* Grille 4x4 */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {cards.map((card, index) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(index)}
              disabled={card.isFlipped || card.isMatched}
              className={[
                'aspect-square rounded-lg border-2 transition-all duration-300 text-xs font-semibold',
                card.isMatched
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 cursor-default'
                  : card.isFlipped
                  ? 'bg-indigo-500/20 border-indigo-500 text-indigo-100'
                  : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600 text-transparent cursor-pointer'
              ].join(' ')}
            >
              {card.isFlipped || card.isMatched ? card.content : '?'}
            </button>
          ))}
        </div>

        {/* Victoire */}
        {isWon && (
          <div className="bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-500/50 rounded-lg p-4 text-center animate-in zoom-in">
            <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-2 animate-bounce" />
            <p className="text-lg font-bold text-zinc-100 mb-1">
              Félicitations ! 🎉
            </p>
            <p className="text-sm text-zinc-400">
              Terminé en <strong className="text-amber-400">{moves}</strong> coups
            </p>
            <button
              onClick={initializeGame}
              className="mt-4 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Rejouer
            </button>
          </div>
        )}

        {/* Bouton rejouer */}
        {!isWon && moves > 0 && (
          <div className="text-center">
            <button
              onClick={initializeGame}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors text-sm"
            >
              Recommencer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
