"use client";

import { useEffect, useState } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { createClient } from "@/lib/supabase/client";
import { useTheme as useThemeToggle } from "@/context/ThemeProvider";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" />
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" />
    <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z" />
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58Z" />
  </svg>
);

const hasGoogleClientId = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function HeroSection() {
  const [authError, setAuthError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { isDark } = useThemeToggle();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("auth_error");
    if (err) {
      setAuthError(err);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setAuthError("Aucun identifiant reçu de Google.");
      return;
    }
    setAuthError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: credentialResponse.credential,
      });
      if (error) {
        setAuthError(error.message);
      } else {
        for (let i = 0; i < 20; i++) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) break;
          await new Promise((r) => setTimeout(r, 150));
        }
        window.location.href = "/dashboard";
      }
    } catch {
      setAuthError("Erreur de connexion. Réessaie.");
    }
  };

  const handleOAuthFallback = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) setAuthError(error.message);
  };

  const renderAuthButton = () => {
    if (!mounted) return <div style={{ height: 44 }} />;
    if (hasGoogleClientId) {
      return (
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setAuthError("La connexion Google a échoué.")}
          theme={isDark ? "filled_black" : "outline"}
          shape="pill"
          size="large"
          text="continue_with"
          width="300"
        />
      );
    }
    return (
      <button
        onClick={handleOAuthFallback}
        aria-label="Se connecter avec Google"
        className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full border border-black/15 dark:border-white/15 bg-black/[0.06] dark:bg-white/[0.06] text-zinc-800 dark:text-white/85 text-sm font-medium hover:bg-black/10 dark:hover:bg-white/10 hover:border-black/25 dark:hover:border-white/25 hover:-translate-y-px transition-all cursor-pointer"
      >
        <GoogleIcon />
        Continuer avec Google
      </button>
    );
  };

  return (
    <section className="max-w-[680px] mx-auto text-center pt-16 pb-10 px-5 max-sm:pt-10 max-sm:px-4">
<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] mb-4 text-zinc-900 dark:text-white">
        Ton m&eacute;moire. Structur&eacute; par l&apos;IA.{" "}
        <span className="text-zinc-400 dark:text-white/40">Termin&eacute; &agrave; temps.</span>
      </h1>

      <p className="text-[15px] leading-relaxed text-zinc-500 dark:text-white/45 max-w-[520px] mx-auto mb-3">
        D&eacute;pose ton cahier des charges, obtiens un plan de r&eacute;daction personnalis&eacute; et avance section par section comme un jeu.
      </p>

      <p className="text-sm text-zinc-400 dark:text-white/40 mb-8">
        Plan IA en 2 min &middot; Qu&ecirc;tes &amp; XP &middot; Suivi intelligent
      </p>

      {authError && (
        <p className="text-sm text-red-400 mb-4">{authError}</p>
      )}

      {renderAuthButton()}

      <p className="text-xs text-zinc-400 dark:text-white/25 mt-3">
        Aucune carte bancaire requise &middot; 2 min pour commencer
      </p>
    </section>
  );
}
