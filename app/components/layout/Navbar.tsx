"use client";

import { useTheme } from "@/context/ThemeProvider";
import { useApp } from "@/context/AppProvider";
import { DOMAINS } from "@/types";
import type { User } from "@supabase/supabase-js";

interface NavbarProps {
  user: User | null;
  authLoading: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  onSave: () => void;
  onReset: () => Promise<void>;
}

export function Navbar({ user, authLoading, onSignIn, onSignOut, onSave, onReset }: NavbarProps) {
  const { isDark, toggle } = useTheme();
  const { state, dispatch } = useApp();
  const { page, domain, analysisSource, saveStatus, hasSavedData } = state;

  const handleLogoClick = () => {
    if (page === "dashboard" && !window.confirm("Voulez-vous vraiment quitter ? Votre progression est sauvegardée."))
      return;
    dispatch({ type: "SET_PAGE", payload: "landing" });
    dispatch({ type: "SET_DOMAIN", payload: null });
    dispatch({ type: "SET_ACTIVE_TASK", payload: null });
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-[52px] pt-[env(safe-area-inset-top,0px)] flex items-center justify-between px-5 max-sm:px-3 glass-strong border-b border-[var(--border-glass)]"
      role="navigation"
      aria-label="Navigation principale"
    >
      {/* Brand */}
      <button
        onClick={handleLogoClick}
        className="flex items-center gap-2 text-sm font-semibold tracking-tight cursor-pointer bg-transparent border-none text-foreground min-h-[44px]"
        aria-label="Retour à l'accueil"
      >
        <span className="w-[26px] h-[26px] rounded-[7px] bg-[var(--accent-blue)] flex items-center justify-center text-[13px] text-white font-bold shrink-0">
          m
        </span>
        <span className="max-sm:hidden">maimoirkouest</span>
      </button>

      {/* Right side */}
      <div className="flex items-center gap-1.5 max-sm:gap-1">
        {/* Domain badge — hidden on mobile */}
        {page === "dashboard" && domain && (
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-[var(--card-bg)] border border-[var(--border-glass)] text-[var(--text-secondary)] font-medium max-md:hidden">
            {DOMAINS.find((d) => d.id === domain)?.label}
          </span>
        )}

        {/* IA badge — hidden on small mobile */}
        {page === "dashboard" && analysisSource === "ai" && (
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-[var(--green-soft)] text-[var(--green)] border-transparent font-semibold max-sm:hidden">
            ✦ IA
          </span>
        )}

        {/* Save status — icon only on mobile */}
        {page === "dashboard" && saveStatus && (
          <span
            role="status"
            aria-live="polite"
            className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
              saveStatus === "saved"
                ? "bg-[var(--green-soft)] text-[var(--green)]"
                : saveStatus === "error"
                  ? "bg-[var(--red-soft)] text-[var(--red)]"
                  : "bg-[var(--card-bg)] text-[var(--text-secondary)]"
            }`}
          >
            <span className="max-sm:hidden">
              {saveStatus === "saving" ? "⏳" : saveStatus === "saved" ? "✓ Sauvegardé" : "⚠️ Erreur"}
            </span>
            <span className="sm:hidden">{saveStatus === "saving" ? "⏳" : saveStatus === "saved" ? "✓" : "⚠️"}</span>
          </span>
        )}

        {/* Save button — icon only on mobile */}
        {page === "dashboard" && user && (
          <button
            onClick={onSave}
            className="min-h-[44px] px-3 py-1.5 rounded-full border-none bg-[var(--accent-blue)] text-white text-[11px] font-medium cursor-pointer hover:bg-[var(--accent-blue-hover)] transition-all"
            aria-label="Sauvegarder"
          >
            <span className="max-sm:hidden">{saveStatus === "saving" ? "Sauvegarde…" : "Sauvegarder"}</span>
            <span className="sm:hidden">💾</span>
          </button>
        )}

        {/* New analysis — hidden on small mobile */}
        {page === "dashboard" && (
          <button
            onClick={onReset}
            className="min-h-[44px] px-3 py-1.5 rounded-full border border-[var(--border-glass)] bg-[var(--glass)] text-foreground text-[11px] font-medium cursor-pointer hover:bg-[var(--glass-strong)] transition-all max-sm:hidden"
            aria-label="Nouvelle analyse"
          >
            Nouvelle analyse
          </button>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="w-[44px] h-[44px] max-sm:w-9 max-sm:h-9 rounded-lg border border-[var(--border-glass)] bg-[var(--card-bg)] text-[var(--text-secondary)] flex items-center justify-center text-[15px] cursor-pointer hover:bg-[var(--card-bg-hover)] hover:text-foreground transition-all shrink-0"
          aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
        >
          {isDark ? "☀︎" : "☾"}
        </button>

        {/* Auth */}
        {user ? (
          <div className="flex items-center gap-1.5">
            <img
              src={user.user_metadata?.avatar_url}
              alt={user.user_metadata?.full_name || "Avatar"}
              className="w-7 h-7 rounded-full border border-[var(--border-glass)] shrink-0"
            />
            <button
              onClick={onSignOut}
              className="min-h-[44px] px-3 py-1.5 rounded-full border border-[var(--border-glass)] bg-[var(--glass)] text-foreground text-[11px] font-medium cursor-pointer hover:bg-[var(--glass-strong)] transition-all max-sm:hidden"
            >
              Déconnexion
            </button>
          </div>
        ) : (
          !authLoading && (
            <button
              onClick={onSignIn}
              className="min-h-[44px] px-3.5 py-1.5 rounded-full border-none bg-[var(--accent-blue)] text-white text-[13px] font-medium cursor-pointer hover:bg-[var(--accent-blue-hover)] transition-all"
              aria-label="Se connecter avec Google"
            >
              <span className="max-sm:hidden">
                <span className="mr-1.5">G</span> Connexion
              </span>
              <span className="sm:hidden">G</span>
            </button>
          )
        )}

        {page === "landing" && user && hasSavedData && (
          <button
            onClick={() => dispatch({ type: "SET_PAGE", payload: "dashboard" })}
            className="min-h-[44px] px-3.5 py-1.5 rounded-full border-none bg-[var(--accent-blue)] text-white text-[13px] font-medium cursor-pointer hover:bg-[var(--accent-blue-hover)] transition-all"
            aria-label="Reprendre ma progression"
          >
            Reprendre
          </button>
        )}
      </div>
    </nav>
  );
}
