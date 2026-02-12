"use client";

import { useCallback } from "react";
import { useApp, getQuestProgress, getOverallProgress } from "@/context/AppProvider";
import { ProgressRing } from "./ProgressRing";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface SidebarProps {
  user: User | null;
  onDeleteAccount: () => Promise<void>;
}

export function Sidebar({ user, onDeleteAccount }: SidebarProps) {
  const { state, dispatch } = useApp();
  const { quests, activeQuest, completedSteps, analysisSource } = state;
  const overallPct = getOverallProgress(quests, completedSteps);

  const exportData = useCallback(async () => {
    if (!user) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch("/api/user/export", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (!res.ok) return;

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `maimoirkouest-export.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [user]);

  return (
    <aside
      className="w-[260px] shrink-0 border-r border-[var(--border-glass)] p-5 px-3.5 sticky top-[52px] h-[calc(100vh-52px)] h-[calc(100dvh-52px)] overflow-y-auto bg-black/[0.03] dark:bg-black/30 backdrop-blur-[20px] max-md:hidden"
      role="complementary"
      aria-label="Barre latérale"
    >
      <ProgressRing percentage={overallPct} />

      {analysisSource && (
        <div className="px-1 mb-4">
          {analysisSource === "ai" ? (
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-[var(--green-soft)] text-[var(--green)] font-semibold">
              ✦ Plan personnalisé par l&apos;IA
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-[var(--card-bg)] border border-[var(--border-glass)] text-[var(--text-secondary)] font-medium">
              Plan standard (guide g&eacute;n&eacute;rique)
            </span>
          )}
        </div>
      )}

      <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)] px-2 mb-1.5 font-mono">
        Quêtes
      </div>

      <nav aria-label="Liste des quêtes">
        {quests.map((q) => {
          const qp = getQuestProgress(q, completedSteps);
          const isActive = activeQuest === q.id;
          return (
            <button
              key={q.id}
              onClick={() => dispatch({ type: "SET_ACTIVE_QUEST", payload: q.id })}
              className={`w-full flex items-center gap-2 py-2 px-2.5 rounded-[10px] cursor-pointer transition-all duration-200 mb-px text-[13px] font-medium border-none font-sans text-left ${
                isActive
                  ? "bg-[var(--accent-soft)] text-foreground"
                  : "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--card-bg-hover)] hover:text-foreground"
              }`}
              aria-current={isActive ? "true" : undefined}
            >
              <span className="text-[15px] w-[22px] text-center shrink-0">{q.emoji}</span>
              <span className="flex-1">{q.title}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                  qp.pct === 100
                    ? "bg-[var(--green-soft)] text-[var(--green)]"
                    : "bg-[var(--card-bg)] text-[var(--text-tertiary)]"
                }`}
              >
                {qp.pct}%
              </span>
            </button>
          );
        })}
      </nav>

      {/* Info box */}
      <div className="mt-5 p-3 px-2.5 rounded-[10px] bg-[var(--card-bg)] border border-[var(--border-glass)] text-[10px] text-[var(--text-tertiary)] leading-relaxed">
        {user
          ? "☁️ Votre progression est sauvegardée automatiquement dans le cloud."
          : "💾 Connectez-vous avec Google pour sauvegarder votre progression."}
      </div>

      {/* RGPD export + Delete account */}
      {user && (
        <>
          <button
            onClick={exportData}
            className="mt-2.5 w-full py-2 px-2.5 rounded-[10px] border border-[var(--border-glass)] bg-[var(--card-bg)] text-[var(--text-secondary)] text-[11px] font-medium font-sans cursor-pointer transition-all hover:bg-[var(--card-bg-hover)]"
            aria-label="Exporter mes données (RGPD)"
          >
            Exporter mes donn&eacute;es
          </button>
          <button
            onClick={async () => {
              if (
                !window.confirm(
                  "Voulez-vous vraiment supprimer votre compte et toutes vos données ? Cette action est irréversible."
                )
              )
                return;
              if (!window.confirm("Dernière confirmation : toutes vos données seront définitivement supprimées."))
                return;
              await onDeleteAccount();
            }}
            className="mt-1.5 w-full py-2 px-2.5 rounded-[10px] border border-[var(--red)]/20 bg-[var(--red-soft)] text-[var(--red)] text-[11px] font-medium font-sans cursor-pointer transition-all hover:opacity-80"
          >
            Supprimer mon compte et mes donn&eacute;es
          </button>
        </>
      )}
    </aside>
  );
}
