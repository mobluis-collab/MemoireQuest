"use client";

const FEATURES = [
  {
    label: "Structure",
    title: "Plan généré par l'IA",
    desc: "Chapitres, sections et sous-tâches extraits directement de ton cahier des charges. Rien d'inventé.",
  },
  {
    label: "Progression",
    title: "Système de quêtes",
    desc: "Coche tes sous-tâches une par une, gagne de l'XP et monte en niveau. Ta progression est visible en temps réel.",
  },
  {
    label: "Conseils",
    title: "Guidance contextuelle",
    desc: "Chaque section inclut des conseils issus de ton cahier des charges pour te guider dans la rédaction.",
  },
  {
    label: "Suivi",
    title: "Streaks et achievements",
    desc: "Maintiens ta régularité avec les streaks quotidiens et débloque des badges en progressant.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="max-w-[880px] mx-auto px-5 pb-12 max-sm:px-4">
      <h2 className="text-center text-[22px] font-bold tracking-tight text-zinc-800 dark:text-white/90 mb-3">
        Tout ce qu&apos;il te faut pour finir ton m&eacute;moire.
      </h2>
      <p className="text-center text-sm text-zinc-400 dark:text-white/35 mb-6">
        Un outil pensé pour les étudiants.
      </p>

      <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
        {FEATURES.map((f) => (
          <div
            key={f.label}
            className="p-6 rounded-[14px] border border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02]"
          >
            <div className="text-[10px] font-semibold text-zinc-300 dark:text-white/20 tracking-wider uppercase mb-2">
              {f.label}
            </div>
            <h3 className="text-[15px] font-semibold text-zinc-700 dark:text-white/80 mb-1.5">
              {f.title}
            </h3>
            <p className="text-[12.5px] leading-relaxed text-zinc-400 dark:text-white/35">
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
