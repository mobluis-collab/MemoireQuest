'use client'

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react'

interface UploadZoneProps {
  onUpload: (file: File) => Promise<void>
  isLoading: boolean
}

const MAX_MB = 10

const UploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zM12 18l-4-4h2.5v-3h3v3H16l-4 4z" fill="currentColor" className="text-zinc-400" />
  </svg>
)

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

  const borderClass = isDragging ? 'border-indigo-500 bg-indigo-500/5' : 'border-zinc-700 hover:border-zinc-600'

  return (
    <div className="max-w-xl mx-auto mt-16 px-4">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-200 ${borderClass}`}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" aria-label="Chargement" />
            <p className="text-sm text-zinc-400">Analyse en cours…</p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mx-auto mb-4"><UploadIcon /></div>
            <p className="text-sm font-medium text-zinc-300 mb-1">Glisse ton PDF ici</p>
            <p className="text-xs text-zinc-600 mb-5">PDF uniquement · max {MAX_MB} MB</p>
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
    </div>
  )
}
