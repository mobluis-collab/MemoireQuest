"use client";

import { useRef, useState, useCallback } from "react";
import { useApp } from "@/context/AppProvider";
import { DOMAINS, type DomainId } from "@/types";
import type { User } from "@supabase/supabase-js";

interface OnboardingProps {
  user: User | null;
  onSignIn: () => void;
  onStartAnalysis: (content: string, domain: DomainId, fileBase64?: string | null, fileType?: string | null) => void;
}

export function Onboarding({ user, onSignIn, onStartAnalysis }: OnboardingProps) {
  const { state, dispatch } = useApp();
  const { domain } = state;
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState("");
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [useTextInput, setUseTextInput] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File | null) => {
    setFile(f);
    setFileBase64(null);
    setFileType(null);
    if (!f) return;

    const reader = new FileReader();
    const isPdf = f.type === "application/pdf" || f.name?.toLowerCase().endsWith(".pdf");

    if (isPdf) {
      reader.onload = (e) => {
        setFileBase64(e.target?.result as string);
        setFileType("application/pdf");
        setTextContent("");
      };
      reader.readAsDataURL(f);
    } else {
      reader.onload = (e) => {
        setTextContent(e.target?.result as string);
        setFileBase64(null);
        setFileType(null);
      };
      reader.readAsText(f);
    }
  }, []);

  const hasContent = useTextInput ? textContent.trim().length > 30 : !!file;

  const handleSubmit = () => {
    if (!domain || !hasContent) return;
    // If not logged in, show auth prompt instead of starting analysis
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
    const hasPdf = fileBase64 && fileType === "application/pdf";
    onStartAnalysis(hasPdf ? "" : textContent, domain, hasPdf ? fileBase64 : null, hasPdf ? fileType : null);
  };

  return (
    <div className="relative z-[1] pt-[84px] px-5 pb-10 max-w-[560px] mx-auto max-md:pt-[74px] max-md:px-4 max-sm:pb-20">
      {/* Step 1: Domain */}
      <div className="animate-rise">
        <div className="text-[11px] font-semibold font-mono text-[var(--accent-blue)] uppercase tracking-[0.06em] mb-1.5">
          Étape 01
        </div>
        <h2 className="text-[26px] font-bold tracking-[-0.035em] mb-1.5 max-md:text-[22px]">Votre domaine</h2>
        <p className="text-[15px] text-[var(--text-secondary)] mb-6">Pour adapter l&apos;analyse IA à votre cursus.</p>

        <div className="grid grid-cols-2 gap-2 max-md:grid-cols-1" role="radiogroup" aria-label="Sélection du domaine">
          {DOMAINS.map((d) => (
            <button
              key={d.id}
              role="radio"
              aria-checked={domain === d.id}
              onClick={() => dispatch({ type: "SET_DOMAIN", payload: d.id })}
              className={`p-4 rounded-[14px] glass border cursor-pointer transition-all duration-300 flex items-center gap-3 text-left bg-transparent font-sans ${
                domain === d.id
                  ? "border-[var(--accent-blue)] bg-[var(--accent-soft)] shadow-[0_0_0_1px_var(--accent-blue)]"
                  : "border-[var(--border-glass)] hover:bg-[var(--card-bg-hover)] hover:border-[var(--border-glass-hover)] hover:-translate-y-px"
              }`}
            >
              <span className="w-[34px] h-[34px] rounded-[9px] bg-[var(--accent-soft)] flex items-center justify-center text-sm shrink-0">
                {d.icon}
              </span>
              <div>
                <div className="text-sm font-semibold text-foreground">{d.label}</div>
                <div className="text-[11px] text-[var(--text-secondary)]">{d.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Content */}
      {domain && (
        <div className="mt-8 animate-rise [animation-delay:0.08s]">
          <div className="text-[11px] font-semibold font-mono text-[var(--accent-blue)] uppercase tracking-[0.06em] mb-1.5">
            Étape 02
          </div>
          <h2 className="text-[26px] font-bold tracking-[-0.035em] mb-1.5 max-md:text-[22px]">Votre sujet</h2>
          <p className="text-[15px] text-[var(--text-secondary)] mb-6">
            L&apos;IA va analyser votre document et créer un plan personnalisé.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-2 mb-4 text-xs text-[var(--text-secondary)]">
            {useTextInput ? (
              <>
                <span>Mode texte</span> ·{" "}
                <button
                  onClick={() => setUseTextInput(false)}
                  className="text-[var(--accent-blue)] underline font-medium bg-transparent border-none cursor-pointer font-sans min-h-[44px] px-1"
                >
                  Uploader un fichier
                </button>
              </>
            ) : (
              <>
                <span>Mode fichier</span> ·{" "}
                <button
                  onClick={() => setUseTextInput(true)}
                  className="text-[var(--accent-blue)] underline font-medium bg-transparent border-none cursor-pointer font-sans min-h-[44px] px-1"
                >
                  Coller du texte
                </button>
              </>
            )}
          </div>

          {useTextInput ? (
            <textarea
              className="w-full min-h-[160px] p-4 rounded-[14px] border border-[var(--border-glass)] bg-[var(--card-bg)] text-foreground font-sans text-[13px] leading-relaxed resize-y outline-none focus:border-[var(--accent-blue)] transition-colors placeholder:text-[var(--text-tertiary)]"
              placeholder="Collez ici votre sujet de mémoire, cahier des charges, ou consignes…"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              aria-label="Texte du sujet"
            />
          ) : (
            <>
              <input
                ref={fileRef}
                type="file"
                accept=".txt,.md,.rtf,.pdf,application/pdf"
                className="sr-only"
                onChange={(e) => handleFile(e.target.files?.[0] || null)}
                aria-label="Sélectionner un fichier"
              />
              <button
                onClick={() => fileRef.current?.click()}
                className={`w-full border-[1.5px] rounded-[18px] p-11 px-5 text-center cursor-pointer transition-all duration-300 bg-[var(--card-bg)] font-sans ${
                  file
                    ? "border-solid border-[var(--accent-blue)] bg-[var(--accent-soft)]"
                    : "border-dashed border-[var(--border-glass)] hover:border-[var(--accent-blue)] hover:bg-[var(--accent-soft)]"
                }`}
              >
                {file ? (
                  <>
                    <div className="w-12 h-12 rounded-[14px] glass border border-[var(--border-glass)] flex items-center justify-center text-xl mx-auto mb-3.5">
                      ✓
                    </div>
                    <div className="text-sm font-semibold text-[var(--accent-blue)]">{file.name}</div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-1">Cliquez pour changer</div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-[14px] glass border border-[var(--border-glass)] flex items-center justify-center text-xl mx-auto mb-3.5">
                      ↑
                    </div>
                    <div className="text-sm font-medium">Cliquez pour uploader</div>
                    <div className="text-xs text-[var(--text-tertiary)]">PDF ou fichier texte</div>
                  </>
                )}
              </button>
            </>
          )}

          {/* AI disclaimer */}
          <div className="mt-5 p-4 rounded-[14px] bg-[rgba(255,159,10,0.06)] dark:bg-[rgba(255,159,10,0.08)] border border-[rgba(255,159,10,0.15)] dark:border-[rgba(255,159,10,0.2)]">
            <div className="text-[13px] font-semibold text-[#c77d00] dark:text-[#ff9f0a] mb-1.5">Avertissement IA</div>
            <div className="text-xs leading-relaxed text-[var(--text-secondary)]">
              Votre document sera envoyé à Anthropic (Claude AI) pour analyse. Les résultats sont fournis à titre
              indicatif et pédagogique uniquement. Consultez notre{" "}
              <a href="/privacy" target="_blank" className="underline text-inherit">
                politique de confidentialité
              </a>{" "}
              et nos{" "}
              <a href="/cgu" target="_blank" className="underline text-inherit">
                CGU
              </a>
              .
            </div>
          </div>

          {/* Auth prompt — shown when not logged in */}
          {showAuthPrompt && !user && (
            <div className="mt-5 p-4 rounded-[14px] bg-[var(--accent-soft)] border border-[var(--accent-blue)]/20 animate-rise-fast">
              <div className="text-[13px] font-semibold text-foreground mb-1.5">Connexion requise</div>
              <div className="text-xs leading-relaxed text-[var(--text-secondary)] mb-3">
                Connectez-vous avec Google pour lancer l&apos;analyse IA. Votre sujet et votre domaine seront
                conserv&eacute;s.
              </div>
              <button
                onClick={onSignIn}
                className="min-h-[44px] px-5 py-2 rounded-full border-none bg-[var(--accent-blue)] text-white text-[13px] font-medium cursor-pointer hover:bg-[var(--accent-blue-hover)] transition-all w-full"
              >
                <span className="mr-1.5">G</span> Se connecter avec Google
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2.5 mt-7 max-sm:flex-col-reverse">
            <button
              onClick={() => dispatch({ type: "SET_DOMAIN", payload: null })}
              className="min-h-[44px] px-5 py-2 rounded-full border border-[var(--border-glass)] bg-[var(--glass)] text-foreground text-[13px] font-medium cursor-pointer hover:bg-[var(--glass-strong)] transition-all"
            >
              Retour
            </button>
            <button
              onClick={handleSubmit}
              disabled={!hasContent}
              className="min-h-[44px] px-5 py-2 rounded-full border-none bg-[var(--accent-blue)] text-white text-[13px] font-medium cursor-pointer hover:bg-[var(--accent-blue-hover)] transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              Analyser avec l&apos;IA →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
