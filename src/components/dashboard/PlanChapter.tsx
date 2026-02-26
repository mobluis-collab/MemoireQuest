import type { Chapter } from '@/types/memoir'

interface PlanChapterProps {
  chapter: Chapter
}

export default function PlanChapter({ chapter }: PlanChapterProps) {
  return (
    <article className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
      <div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-600/30 to-transparent"
        aria-hidden="true"
      />

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <span className="shrink-0 w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-xs font-bold text-indigo-400">
          {chapter.number}
        </span>
        <div>
          <h3 className="text-white font-semibold text-sm leading-snug">{chapter.title}</h3>
          <p className="text-zinc-500 text-xs mt-0.5 leading-relaxed">{chapter.objective}</p>
        </div>
      </div>

      {/* Sections */}
      <ul className="space-y-1 mb-3 ml-11">
        {chapter.sections.map((section, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
            <span className="mt-1 w-1 h-1 rounded-full bg-indigo-500/60 shrink-0" aria-hidden="true" />
            {section.text}
          </li>
        ))}
      </ul>

      {/* Tip */}
      {chapter.tips && (
        <p className="ml-11 text-xs text-zinc-600 italic leading-relaxed">
          {chapter.tips}
        </p>
      )}
    </article>
  )
}
