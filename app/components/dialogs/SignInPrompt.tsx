"use client";

interface SignInPromptProps {
  onSignIn: () => void;
  onDismiss: () => void;
}

export function SignInPrompt({ onSignIn, onDismiss }: SignInPromptProps) {
  return (
    <div
      className="fixed inset-0 z-[200] bg-background/85 dark:bg-background/90 backdrop-blur-[60px] flex items-center justify-center animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Connexion"
    >
      <div className="text-center py-10 px-8 rounded-3xl glass border border-[var(--border-glass)] max-w-[400px] w-full shadow-2xl mx-4 max-sm:py-8 max-sm:px-5">
        <div className="text-[40px] mb-4">☁️</div>
        <div className="text-lg font-bold tracking-tight mb-2">Sauvegardez votre progression</div>
        <p className="text-sm leading-relaxed text-[var(--text-secondary)] mb-6">
          Connectez-vous avec Google pour sauvegarder votre analyse et votre progression dans le cloud. Retrouvez vos
          données sur n&apos;importe quel appareil.
        </p>
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              onDismiss();
              onSignIn();
            }}
            className="w-full min-h-[44px] py-2.5 px-5 rounded-full border-none bg-[var(--accent-blue)] text-white text-sm font-medium cursor-pointer hover:bg-[var(--accent-blue-hover)] transition-all"
          >
            <span className="mr-2">G</span> Se connecter avec Google
          </button>
          <button
            onClick={onDismiss}
            className="w-full min-h-[44px] py-2.5 px-5 rounded-full border border-[var(--border-glass)] bg-[var(--glass)] text-foreground text-[13px] font-medium cursor-pointer hover:bg-[var(--glass-strong)] transition-all"
          >
            Continuer sans compte
          </button>
        </div>
        <p className="text-[11px] text-[var(--text-tertiary)] mt-4 leading-relaxed">
          Sans connexion, votre progression sera perdue à la fermeture du navigateur.
        </p>
      </div>
    </div>
  );
}
