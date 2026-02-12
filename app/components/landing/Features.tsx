"use client";

const FEATURES = [
  {
    icon: "🧠",
    title: "Analyse IA profonde",
    desc: "L'IA lit votre cahier des charges et comprend votre sujet en détail.",
  },
  {
    icon: "🎯",
    title: "Plan personnalisé",
    desc: "Un plan d'action unique, adapté à VOTRE sujet, pas un template générique.",
  },
  { icon: "🚀", title: "Guidage pas à pas", desc: "Chaque étape découpée en sous-actions. Impossible de se perdre." },
];

export function Features() {
  return (
    <section
      className="max-w-[880px] mx-auto mt-10 px-5 grid grid-cols-3 gap-2.5 animate-rise [animation-delay:0.32s] max-md:grid-cols-1 max-sm:px-4 max-sm:gap-3"
      aria-label="Fonctionnalités"
    >
      {FEATURES.map((f) => (
        <article
          key={f.title}
          className="p-6 px-5 rounded-[18px] glass border border-[var(--border-glass)] relative overflow-hidden transition-all duration-300 hover:-translate-y-[3px] hover:shadow-lg group"
        >
          {/* Top shine line */}
          <div
            className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-white/10"
            aria-hidden="true"
          />
          <div
            className="w-9 h-9 rounded-[10px] bg-[var(--accent-soft)] flex items-center justify-center text-base mb-3"
            aria-hidden="true"
          >
            {f.icon}
          </div>
          <h3 className="text-sm font-semibold tracking-tight mb-1">{f.title}</h3>
          <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">{f.desc}</p>
        </article>
      ))}
    </section>
  );
}
