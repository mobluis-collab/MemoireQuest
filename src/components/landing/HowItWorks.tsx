"use client";

const STEPS = [
  {
    number: "01",
    title: "Connecte-toi avec Google",
    desc: "Une connexion sécurisée en un clic. Tes documents et ton plan restent strictement privés.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="currentColor" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Dépose ton cahier des charges (PDF)",
    desc: "L'IA lit et analyse tes exigences, contraintes, objectifs et format attendu.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15h8v2H8zm0-4h8v2H8zm0-4h5v2H8z" fill="currentColor" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Reçois ton plan de rédaction sur mesure",
    desc: "Structure complète, chapitres, sous-parties et conseils de rédaction adaptés à ton sujet.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="currentColor" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section
      className="max-w-[880px] mx-auto mt-4 mb-16 px-5 max-sm:px-4"
      aria-labelledby="how-it-works-title"
    >
      <h2
        id="how-it-works-title"
        className="text-center text-2xl font-bold tracking-tight mb-10 text-white/90"
      >
        Comment ça marche ?
      </h2>

      <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1 max-md:max-w-[480px] max-md:mx-auto">
        {STEPS.map((step) => (
          <article
            key={step.number}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-white/15 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/[0.08] flex items-center justify-center text-white/45 shrink-0">
                {step.icon}
              </div>
              <span className="text-xs font-semibold text-white/25 tracking-widest">
                {step.number}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white/85 tracking-tight mb-2">{step.title}</h3>
            <p className="text-[13px] leading-relaxed text-white/35">{step.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
