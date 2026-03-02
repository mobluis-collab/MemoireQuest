'use client'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-[#04030e] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-xl font-semibold text-white mb-3">
          Oups, quelque chose s&apos;est mal passé
        </h2>
        <p className="text-sm text-zinc-400 mb-6">
          Une erreur inattendue est survenue. Tu peux réessayer ou revenir à l&apos;accueil.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition-colors cursor-pointer"
          >
            Réessayer
          </button>
          <a
            href="/"
            className="px-5 py-2 rounded-xl text-sm font-medium border border-white/10 text-zinc-300 hover:bg-white/5 transition-colors"
          >
            Accueil
          </a>
        </div>
      </div>
    </div>
  )
}
