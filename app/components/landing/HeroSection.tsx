"use client";

import { signInWithGoogle } from "@/lib/auth/actions";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" />
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" />
    <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z" />
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58Z" />
  </svg>
);

export function HeroSection() {
  return (
    <section className="max-w-[680px] mx-auto text-center pt-24 pb-16 px-5 max-sm:pt-16 max-sm:px-4">
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-zinc-400 font-medium mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
        Propulsé par l&apos;IA · Gratuit
      </div>

      <h1 className="text-[clamp(32px,6vw,52px)] font-bold tracking-tight leading-[1.1] mb-5 text-white">
        Entraîne ta mémoire,{" "}
        <span className="text-indigo-400">atteins tes objectifs.</span>
      </h1>

      <p className="text-[17px] leading-relaxed text-zinc-400 max-w-[440px] mx-auto mb-10 max-md:text-[15px]">
        L&apos;IA génère des quêtes personnalisées pour ancrer durablement tes connaissances, étape par étape.
      </p>

      <button
        onClick={signInWithGoogle}
        aria-label="Se connecter avec Google"
        className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white text-zinc-900 text-sm font-medium hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
      >
        <GoogleIcon />
        Continuer avec Google
      </button>
    </section>
  );
}
