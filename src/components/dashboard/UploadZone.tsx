'use client'

import { useState, useRef, useEffect, type DragEvent, type ChangeEvent } from 'react'

interface UploadZoneProps {
  onUpload: (file: File) => Promise<void>
  isLoading: boolean
}

const MAX_MB = 25

const LOADING_STEPS = [
  { label: 'Lecture du PDF…', pct: 15 },
  { label: 'Identification du type de mémoire…', pct: 32 },
  { label: 'Analyse du cahier des charges…', pct: 55 },
  { label: 'Extraction des contraintes et blocs de compétences…', pct: 72 },
  { label: 'Génération du plan sur mesure…', pct: 88 },
  { label: 'Structuration des chapitres…', pct: 96 },
]

const UploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zM12 18l-4-4h2.5v-3h3v3H16l-4 4z" fill="currentColor" className="text-zinc-500 dark:text-zinc-400" />
  </svg>
)

function LoadingState() {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    const delays = [0, 2500, 5000, 8500, 13000, 17000]
    const timers = delays.map((delay, i) =>
      setTimeout(() => setStepIndex(i), delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  const current = LOADING_STEPS[stepIndex]

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" aria-label="Chargement" />

      {/* Barre de progression */}
      <div className="w-full max-w-xs">
        <div className="flex justify-between mb-1.5">
          <span className="text-xs text-zinc-400 dark:text-zinc-500">Analyse en cours</span>
          <span className="text-xs font-medium text-indigo-400">{current.pct}%</span>
        </div>
        <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${current.pct}%` }}
          />
        </div>
      </div>

      {/* Étape courante */}
      <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center min-h-[20px] transition-all duration-500">
        {current.label}
      </p>

      {/* Étapes passées */}
      <ul className="text-xs text-zinc-400 dark:text-zinc-600 space-y-1 text-center">
        {LOADING_STEPS.slice(0, stepIndex).map((s) => (
          <li key={s.label} className="flex items-center justify-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 6l3 3 5-5" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {s.label}
          </li>
        ))}
      </ul>

      {/* Message durée */}
      <div className="mt-6 px-5 py-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/50 max-w-xs text-center">
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-1">
          Environ 5 minutes d&apos;analyse
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Tu peux vaquer à tes occupations, tout se fait automatiquement.
        </p>
      </div>
    </div>
  )
}

export default function UploadZone({ onUpload, isLoading }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validate = (file: File): string | null => {
    if (file.type !== 'application/pdf') return 'Seuls les fichiers PDF sont acceptés.'
    if (file.size > MAX_MB * 1024 * 1024) return `Le fichier dépasse ${MAX_MB} MB.`
    return null
  }

  const handleFile = async (file: File) => {
    const err = validate(file)
    if (err) { setError(err); return }
    setError(null)
    await onUpload(file)
  }

  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true) }
  const onDragLeave = () => setIsDragging(false)
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const borderClass = isDragging ? 'border-indigo-500 bg-indigo-500/5' : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600'

  return (
    <div className="max-w-xl mx-auto mt-16 px-4">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 ${borderClass}`}
      >
        {isLoading ? (
          <LoadingState />
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4"><UploadIcon /></div>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-1">Glisse ton PDF ici</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-600 mb-5">PDF uniquement · max {MAX_MB} MB</p>
            <button
              onClick={() => inputRef.current?.click()}
              className="h-9 px-5 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition-all cursor-pointer"
            >
              Parcourir
            </button>
            <input ref={inputRef} type="file" accept="application/pdf" onChange={onChange} className="hidden" aria-label="Sélectionner un fichier PDF" />
          </>
        )}
      </div>

      {error && <p role="alert" className="mt-3 text-sm text-red-400 text-center">{error}</p>}

      {/* Disclaimer */}
      <p className="mt-5 text-xs text-zinc-400 dark:text-zinc-600 text-center leading-relaxed max-w-sm mx-auto">
        L&apos;IA peut faire des erreurs et ses suggestions restent indicatives. Elle ne produit aucun contenu à ta place — son rôle est uniquement de t&apos;aider à structurer ta méthode de travail. La rédaction du mémoire t&apos;appartient entièrement.
      </p>
    </div>
  )
}
