"use client";

import { useEffect, useRef, useState } from "react";

const CHAPTERS = [
  { title: "Introduction", progress: 100 },
  { title: "Contexte & problématique", progress: 75 },
  { title: "Méthodologie", progress: 40 },
  { title: "Résultats", progress: 10 },
  { title: "Conclusion", progress: 0 },
];

export default function DashboardPreview() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg)");

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;
      setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
    };

    const handleLeave = () => {
      setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg)");
    };

    card.addEventListener("mousemove", handleMove);
    card.addEventListener("mouseleave", handleLeave);
    return () => {
      card.removeEventListener("mousemove", handleMove);
      card.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  const totalProgress = Math.round(
    CHAPTERS.reduce((sum, ch) => sum + ch.progress, 0) / CHAPTERS.length
  );

  return (
    <section className="max-w-[680px] mx-auto px-5 pb-6 max-sm:px-4">
      <div
        ref={cardRef}
        className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.03] dark:bg-white/[0.03] p-5 transition-transform duration-200 ease-out"
        style={{ transform }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="currentColor" className="text-zinc-400 dark:text-white/40" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-700 dark:text-white/80">Mon mémoire</div>
              <div className="text-[11px] text-zinc-400 dark:text-white/30">Niveau 3 &middot; 1 250 XP</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-zinc-700 dark:text-white/80">{totalProgress}%</div>
            <div className="text-[11px] text-zinc-400 dark:text-white/30">progression</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-black/5 dark:bg-white/5 mb-5">
          <div
            className="h-full rounded-full bg-zinc-400 dark:bg-white/40 transition-all duration-500"
            style={{ width: `${totalProgress}%` }}
          />
        </div>

        {/* Chapters */}
        <div className="space-y-2.5">
          {CHAPTERS.map((ch) => (
            <div key={ch.title} className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                ch.progress === 100
                  ? "border-zinc-400 dark:border-white/40 bg-zinc-400 dark:bg-white/40"
                  : "border-black/10 dark:border-white/10"
              }`}>
                {ch.progress === 100 && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[13px] font-medium truncate ${
                    ch.progress === 100
                      ? "text-zinc-400 dark:text-white/35 line-through"
                      : "text-zinc-700 dark:text-white/75"
                  }`}>
                    {ch.title}
                  </span>
                  <span className="text-[11px] text-zinc-400 dark:text-white/30 ml-2 shrink-0">{ch.progress}%</span>
                </div>
                <div className="w-full h-1 rounded-full bg-black/5 dark:bg-white/5">
                  <div
                    className="h-full rounded-full bg-zinc-400 dark:bg-white/30 transition-all duration-500"
                    style={{ width: `${ch.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer stats */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.06]">
          <div className="text-[11px] text-zinc-400 dark:text-white/30">
            <span className="font-semibold text-zinc-600 dark:text-white/50">5</span> chapitres
          </div>
          <div className="text-[11px] text-zinc-400 dark:text-white/30">
            <span className="font-semibold text-zinc-600 dark:text-white/50">12</span> quêtes
          </div>
          <div className="text-[11px] text-zinc-400 dark:text-white/30">
            <span className="font-semibold text-zinc-600 dark:text-white/50">3</span> jours de streak
          </div>
        </div>
      </div>
    </section>
  );
}
