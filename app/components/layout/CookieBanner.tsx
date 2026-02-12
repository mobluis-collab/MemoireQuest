"use client";

interface CookieBannerProps {
  onAccept: () => void;
  onRefuse: () => void;
}

export function CookieBanner({ onAccept, onRefuse }: CookieBannerProps) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[300] p-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] glass-strong border-t border-[var(--border-glass)] flex items-center justify-center gap-4 flex-wrap animate-rise max-sm:flex-col max-sm:gap-3 max-sm:px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Consentement cookies"
    >
      <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed max-w-[600px] text-center">
        Ce site utilise des cookies de session pour l&apos;authentification Google. Aucun cookie publicitaire n&apos;est
        utilisé.{" "}
        <a href="/privacy" className="text-[var(--accent-blue)] underline">
          En savoir plus
        </a>
      </p>
      <div className="flex gap-2 shrink-0 max-sm:w-full">
        <button
          onClick={onRefuse}
          className="min-h-[44px] px-4 py-2 rounded-full border border-[var(--border-glass)] bg-[var(--glass)] text-foreground text-xs font-medium cursor-pointer hover:bg-[var(--glass-strong)] transition-all max-sm:flex-1"
        >
          Refuser
        </button>
        <button
          onClick={onAccept}
          className="min-h-[44px] px-4 py-2 rounded-full border-none bg-[var(--accent-blue)] text-white text-xs font-medium cursor-pointer hover:bg-[var(--accent-blue-hover)] transition-all max-sm:flex-1"
        >
          Accepter
        </button>
      </div>
    </div>
  );
}
