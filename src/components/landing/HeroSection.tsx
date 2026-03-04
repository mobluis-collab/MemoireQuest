"use client";

import { useEffect, useState } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { createClient } from "@/lib/supabase/client";
import { useTheme as useThemeToggle } from "@/context/ThemeProvider";

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
        window.location.href = "/dashboard";
      }
    } catch {
      setAuthError("Erreur de connexion. Réessaie.");
    }
  };

  return (
    <section className="max-w-[680px] mx-auto text-center pt-24 pb-16 px-5 max-sm:pt-16 max-sm:px-4">
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/40 font-medium mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-white/45 animate-pulse" />
        Propulsé par l&apos;IA · Gratuit
      </div>

      <h1 className="text-[clamp(32px,6vw,52px)] font-bold tracking-tight leading-[1.1] mb-5 text-white">
        Ton mémoire,{" "}
        <span className="text-white/50">structuré par l&apos;IA.</span>
      </h1>

      <p className="text-[17px] leading-relaxed text-white/40 max-w-[480px] mx-auto mb-10 max-md:text-[15px]">
        Dépose ton cahier des charges, reçois un plan de rédaction complet et personnalisé.
        De l&apos;introduction à la conclusion, étape par étape.
      </p>

      {authError && (
        <p className="text-sm text-red-400 mb-4">{authError}</p>
      )}

      {mounted ? (
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setAuthError("La connexion Google a échoué.")}
          theme={isDark ? "filled_black" : "outline"}
          shape="pill"
          size="large"
          text="continue_with"
          width="300"
        />
      ) : (
        <div style={{ height: 44 }} />
      )}
    </section>
  );
}
