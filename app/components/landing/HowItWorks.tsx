"use client";

const STEPS = [
  {
    number: "01",
    title: "Connecte-toi avec Google",
    desc: "Une connexion sécurisée via OAuth Google. Tes données restent privées.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="currentColor" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Décris ce que tu veux mémoriser",
    desc: "Colle ton cours, tes notes ou ton sujet. L'IA analyse le contenu en profondeur.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15h8v2H8zm0-4h8v2H8zm0-4h5v2H8z" fill="currentColor" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "L'IA génère tes quêtes personnalisées",
    desc: "Un plan d'apprentissage unique avec des questions ciblées, adapté à ton niveau.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <section
      className="max-w-[880px] mx-auto mt-16 mb-10 px-5 max-sm:px-4"
      aria-labelledby="how-it-works-title"
    >
      <h2
        id="how-it-works-title"
        className="text-center text-[clamp(20px,4vw,28px)] font-bold tracking-tight mb-10 text-foreground"
      >
        Comment ça marche ?
      </h2>

      <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1 max-md:max-w-[480px] max-md:mx-auto">
        {STEPS.map((step) => (
          <article
            key={step.number}
            className="relative p-6 rounded-[18px] glass border border-[var(--border-glass)] overflow-hidden hover:-translate-y-[3px] transition-all duration-300"
          >
            <div
              className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
              aria-hidden="true"
            />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-[12px] bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent-blue)] shrink-0">
                {step.icon}
              </div>
              <span className="text-xs font-semibold text-[var(--accent-blue)] tracking-widest">
                {step.number}
              </span>
            </div>
            <h3 className="text-sm font-semibold tracking-tight mb-2">{step.title}</h3>
            <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">{step.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
