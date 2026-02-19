'use client'

import { useState } from 'react'
import type { MemoirePlan } from '@/types/memoir'
import PlanDisplay from './PlanDisplay'
import UploadZone from './UploadZone'

interface DashboardContentProps {
  initialPlan: MemoirePlan | null
  userId: string
}

export default function DashboardContent({ initialPlan }: DashboardContentProps) {
  const [plan, setPlan] = useState<MemoirePlan | null>(initialPlan)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async (file: File) => {
    setIsLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/plan', { method: 'POST', body: formData })
      if (!res.ok) {
        const { error: msg } = await res.json().catch(() => ({}))
        throw new Error(msg ?? 'Erreur lors de la génération du plan.')
      }
      const data = await res.json() as { plan: MemoirePlan }
      setPlan(data.plan)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenerate = () => setPlan(null)

  return (
    <div>
      {error && (
        <p role="alert" className="mx-auto mt-6 max-w-xl text-center text-sm text-red-400 px-4">
          {error}
        </p>
      )}
      {plan
        ? <PlanDisplay plan={plan} onRegenerate={handleRegenerate} />
        : <UploadZone onUpload={handleUpload} isLoading={isLoading} />
      }
    </div>
  )
}
