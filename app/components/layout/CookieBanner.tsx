"use client";

interface CookieBannerProps {
  onAccept: () => void;
  onRefuse: () => void;
}

export function CookieBanner({ onAccept, onRefuse }: CookieBannerProps) {
  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-banner-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative glass-strong border border-[var(--border-glass)] rounded-2xl p-6 max-w-[460px] w-full shadow-2xl animate-rise">
        {/* Top shine line */}
        <div
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent rounded-t-2xl"
          aria-hidden="true"
        />

        {/* Icon */}
        <div className="w-10 h-10 rounded-[12px] bg-[var(--accent-soft)] flex items-center justify-center mb-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M21.598 11.064a1 1 0 0 0-.92-.925 8.985 8.985 0 0 1-3.998-1.05A9.018 9.018 0 0 1 13.484 5.9a1 1 0 0 0-1.71-.009 9 9 0 1 0 9.824 5.173zm-9.98 7.936A7 7 0 0 1 9 5.027a11.029 11.029 0 0 0 3.17 3.668 11.034 11.034 0 0 0 4.748 1.915 7 7 0 0 1-5.3 8.39z" fill="var(--accent-blue)" />
          </svg>
        </div>

        <h2 id="cookie-banner-title" className="text-base font-semibold mb-2">
          Politique des cookies
        </h2>

        <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-5">
          Ce site utilise des cookies de session uniquement pour l&apos;authentification Google.
          Aucun cookie publicitaire ou de traçage n&apos;est utilisé.{" "}
          <a href="/privacy" className="text-[var(--accent-blue)] underline hover:opacity-80 transition-opacity">
            En savoir plus
          </a>
        </p>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onRefuse}
            className="min-h-[40px] px-5 py-2 rounded-full border border-[var(--border-glass)] bg-[var(--glass)] text-foreground text-xs font-medium cursor-pointer hover:bg-[var(--glass-strong)] hover:border-[var(--border-glass-hover)] transition-all"
          >
            Refuser
          </button>
          <button
            onClick={onAccept}
            className="min-h-[40px] px-5 py-2 rounded-full border-none bg-white text-zinc-900 text-xs font-semibold cursor-pointer hover:bg-zinc-100 shadow-[0_2px_12px_rgba(255,255,255,0.15)] transition-all"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
