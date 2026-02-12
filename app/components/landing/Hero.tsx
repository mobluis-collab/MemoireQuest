"use client";

import type { User } from "@supabase/supabase-js";
import { useApp } from "@/context/AppProvider";

interface HeroProps {
  user: User | null;
  onSignIn: () => void;
}

export function Hero({ user, onSignIn }: HeroProps) {
  const { dispatch } = useApp();

  return (
    <section className="max-w-[680px] mx-auto text-center pt-20 pb-12 px-5 max-md:pt-14 max-sm:pt-10 max-sm:px-4">
      {/* Chip */}
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full glass border border-[var(--border-glass)] text-xs text-[var(--text-secondary)] font-medium mb-6 animate-rise">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse-dot" />
        Propulsé par l&apos;IA · Gratuit
      </div>

      {/* Title */}
      <h1 className="text-[clamp(34px,7vw,56px)] font-bold tracking-[-0.04em] leading-[1.08] mb-4 animate-rise [animation-delay:0.08s]">
        Votre mémoire, <span className="text-gradient">notre guide.</span>
      </h1>

      {/* Subtitle */}
      <p className="text-[17px] leading-relaxed text-[var(--text-secondary)] max-w-[440px] mx-auto mb-8 animate-rise [animation-delay:0.16s] max-md:text-[15px]">
        L&apos;IA analyse votre sujet et crée un plan d&apos;action personnalisé. Vous avancez pas à pas, on vous
        accompagne.
      </p>

      {/* CTAs */}
      <div className="flex items-center justify-center gap-2.5 flex-wrap animate-rise [animation-delay:0.24s] max-sm:flex-col max-sm:gap-3 max-sm:px-4">
        <button
          onClick={() => {
            dispatch({ type: "SET_PAGE", payload: "onboard" });
          }}
          className="min-h-[44px] px-7 py-2.5 rounded-full border-none bg-[var(--accent-blue)] text-white text-sm font-medium cursor-pointer hover:bg-[var(--accent-blue-hover)] hover:scale-[1.02] hover:shadow-[0_4px_20px_var(--accent-glow)] active:scale-[0.98] transition-all max-sm:w-full"
        >
          Analyser mon sujet →
        </button>
        <a
          href="https://github.com/mobluis-collab/MemoireQuest"
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[44px] px-6 py-2.5 rounded-full border border-[var(--border-glass)] bg-[var(--glass)] text-foreground text-sm font-medium cursor-pointer hover:bg-[var(--glass-strong)] hover:border-[var(--border-glass-hover)] transition-all no-underline inline-flex items-center justify-center max-sm:w-full"
        >
          GitHub ↗
        </a>
      </div>
    </section>
  );
}
