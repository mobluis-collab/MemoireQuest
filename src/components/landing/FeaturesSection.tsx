"use client";

const FEATURES = [
  {
    label: "STRUCTURE",
    title: "Fini les plans bancals",
    desc: "L'IA extrait la structure directement de ton cahier des charges. Chapitres, sections et sous-tâches prêts en 2 minutes.",
  },
  {
    label: "MOTIVATION",
    title: "Chaque section = une victoire",
    desc: "Système de quêtes avec XP et niveaux. Tu vois ta progression en temps réel et tu restes motivé jusqu'à la soutenance.",
  },
  {
    label: "GUIDANCE",
    title: "Plus jamais la page blanche",
    desc: "Conseils de rédaction contextuels extraits de ton cahier des charges. Tu sais exactement quoi écrire, section par section.",
  },
  {
    label: "RÉGULARITÉ",
    title: "Streaks & badges pour tenir le rythme",
    desc: "Maintiens ta régularité avec les streaks quotidiens et débloque des badges en progressant. Comme un jeu, mais pour ton diplôme.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="max-w-[880px] mx-auto px-5 pb-12 max-sm:px-4">
      <h2 className="text-center text-[22px] font-bold tracking-tight text-zinc-800 dark:text-white/90 mb-3">
        Tout ce qu&apos;il te faut pour finir ton m&eacute;moire.
      </h2>
      <p className="text-center text-sm text-zinc-400 dark:text-white/35 mb-6">
        Un outil pens&eacute; pour les &eacute;tudiants en alternance.
      </p>

      <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
        {FEATURES.map((f) => (
          <div
            key={f.label}
            className="group p-6 rounded-[14px] border border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] hover:bg-gradient-to-br hover:from-black/[0.04] hover:to-transparent dark:hover:from-white/[0.04] dark:hover:to-transparent hover:border-black/10 dark:hover:border-white/10 transition-all duration-300"
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
