"use client";

import { AnimNum } from "@/components/ui/AnimNum";

export function Stats() {
  return (
    <section
      className="max-w-[880px] mx-auto mt-14 px-5 flex gap-px animate-rise [animation-delay:0.4s] max-md:flex-col max-md:gap-0 max-sm:px-4 max-sm:mt-10"
      aria-label="Statistiques"
    >
      {[
        { value: 6, prefix: "", suffix: "", label: "Quêtes adaptées", dur: 900 },
        { value: 25, prefix: "~", suffix: "", label: "Missions sur-mesure", dur: 1100 },
        { value: 87, prefix: "~", suffix: "", label: "Actions concrètes", dur: 1300 },
      ].map((s, i) => (
        <div
          key={s.label}
          className={`flex-1 text-center py-6 px-4 glass border border-[var(--border-glass)] ${
            i === 0
              ? "rounded-l-[14px] max-md:rounded-t-[14px] max-md:rounded-bl-none"
              : i === 2
                ? "rounded-r-[14px] max-md:rounded-b-[14px] max-md:rounded-tr-none"
                : "max-md:rounded-none"
          }`}
        >
          <div className="text-[28px] font-bold tracking-[-0.04em] text-gradient">
            {s.prefix}
            <AnimNum value={s.value} dur={s.dur} />
            {s.suffix}
          </div>
          <div className="text-xs text-[var(--text-tertiary)] mt-0.5 font-medium">{s.label}</div>
        </div>
      ))}
    </section>
  );
}
