"use client";

import { useEffect, useState } from "react";

interface AnalysisOverlayProps {
  status: string;
  progress: number;
}

export function AnalysisOverlay({ status, progress }: AnalysisOverlayProps) {
  const pct = Math.min(Math.round(progress), 100);
  const [elapsed, setElapsed] = useState(0);

  // Track elapsed time
  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return min > 0 ? `${min}m${sec.toString().padStart(2, "0")}s` : `${sec}s`;
  };

  return (
    <div
      className="fixed inset-0 z-[200] bg-background/85 dark:bg-background/90 backdrop-blur-[60px] flex items-center justify-center animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Analyse en cours"
      aria-live="polite"
    >
      <div className="text-center p-10 rounded-3xl glass border border-[var(--border-glass)] min-w-[280px] max-w-[380px] shadow-2xl mx-4 max-sm:p-8">
        {/* Spinner */}
        <div
          className="w-10 h-10 rounded-full border-[2.5px] border-[var(--border-glass)] border-t-[var(--accent-blue)] animate-spin-slow mx-auto mb-4"
          aria-hidden="true"
        />

        <div className="text-base font-semibold mb-1">Analyse IA en cours</div>
        <div className="text-[13px] text-[var(--text-secondary)] leading-relaxed mt-1">{status}</div>

        {/* Progress bar */}
        <div className="w-[200px] h-[3px] rounded bg-[var(--border-glass)] mt-3 mx-auto overflow-hidden">
          <div
            className="h-full rounded bg-gradient-to-r from-[var(--accent-blue)] to-[#bf5af2] transition-[width] duration-200 ease-linear"
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <div className="text-xs text-[var(--text-tertiary)] mt-2 font-mono">
          {pct}% &middot; {formatTime(elapsed)}
        </div>

        {/* Slow analysis warning */}
        {elapsed >= 60 && (
          <div className="mt-3 text-[11px] text-[var(--text-tertiary)] leading-relaxed animate-fade-in">
            L&apos;analyse prend plus de temps que pr&eacute;vu. En cas de probl&egrave;me, un plan standard sera
            utilis&eacute;.
          </div>
        )}
      </div>
    </div>
  );
}
