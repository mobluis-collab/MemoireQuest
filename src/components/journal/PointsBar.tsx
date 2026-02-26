'use client'

const GOAL = 100

interface PointsBarProps {
  totalPoints: number
}

export default function PointsBar({ totalPoints }: PointsBarProps) {
  const clamped = Math.min(totalPoints, GOAL)
  const pct = Math.round((clamped / GOAL) * 100)

  return (
    <div className="w-full space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-zinc-100">
          {clamped}/{GOAL} pts
        </span>
        <span className="text-zinc-400">Objectif : {GOAL} pts</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={GOAL}
        />
      </div>
    </div>
  )
}
