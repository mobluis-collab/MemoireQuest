"use client";

import { Hero } from "./Hero";
import { Features } from "./Features";
import { Stats } from "./Stats";
import type { User } from "@supabase/supabase-js";

interface LandingProps {
  user: User | null;
  onSignIn: () => void;
}

export function Landing({ user, onSignIn }: LandingProps) {
  return (
    <main id="main-content" className="relative z-[1] pt-[52px]">
      <Hero user={user} onSignIn={onSignIn} />
      <Features />
      <Stats />
      <footer
        className="text-center py-10 px-5 text-xs text-[var(--text-tertiary)] mt-16"
        aria-label="Pied de page landing"
      >
        maimoirkouest · Open Source · Propulsé par Claude AI
      </footer>
    </main>
  );
}
