"use client";

import { useApp, getQuestProgress, getOverallProgress } from "@/context/AppProvider";
import { Sidebar } from "./Sidebar";
import { TaskCard } from "./TaskCard";
import { AnalysisCard } from "./AnalysisCard";
import { MobileBar } from "@/components/layout/MobileBar";
import type { User } from "@supabase/supabase-js";

interface DashboardProps {
  user: User | null;
  aiError: string | null;
  onDeleteAccount: () => Promise<void>;
}

export function Dashboard({ user, aiError, onDeleteAccount }: DashboardProps) {
  const { state, dispatch } = useApp();
  const { quests, activeQuest, activeTask, completedSteps, analysis, requirementsSummary, analysisSource } = state;
  const quest = quests.find((q) => q.id === activeQuest);
  const qp = quest ? getQuestProgress(quest, completedSteps) : { done: 0, total: 0, pct: 0 };
  const overallPct = getOverallProgress(quests, completedSteps);

  const isFirstQuest = activeQuest === quests[0]?.id;

  return (
    <>
      <div className="relative z-[1] pt-[52px] flex min-h-screen min-h-[100dvh] max-md:block">
        <Sidebar user={user} onDeleteAccount={onDeleteAccount} />

        <main
          id="main-content"
          className="flex-1 py-7 px-8 pb-24 max-w-[900px] overflow-y-auto max-md:p-5 max-md:px-4 max-md:pb-24"
          aria-label="Contenu principal"
        >
          {/* AI error / fallback banner */}
          {aiError && (
            <div
              className="p-3 px-4 rounded-xl bg-[var(--red-soft)] text-[var(--red)] text-[13px] mb-4 border border-[var(--red)]/15"
              role="alert"
            >
              ⚠️ {aiError}
            </div>
          )}

          {/* Fallback notice — when using generic plan */}
          {analysisSource === "fallback" && !aiError && (
            <div
              className="p-3 px-4 rounded-xl bg-[rgba(255,159,10,0.06)] dark:bg-[rgba(255,159,10,0.08)] border border-[rgba(255,159,10,0.15)] dark:border-[rgba(255,159,10,0.2)] text-[13px] mb-4 animate-rise-fast"
              role="status"
            >
              <span className="font-semibold text-[#c77d00] dark:text-[#ff9f0a]">Plan standard</span>
              <span className="text-[var(--text-secondary)]">
                {" "}
                — Ce plan est g&eacute;n&eacute;rique. Pour un plan personnalis&eacute; bas&eacute; sur votre sujet,
                relancez une analyse IA.
              </span>
            </div>
          )}

          {/* Quest completion celebration */}
          {qp.pct === 100 && quest && (
            <div
              className="p-4 px-5 rounded-2xl bg-[var(--green-soft)] border border-[var(--green)]/20 mb-5 animate-rise-fast"
              role="status"
            >
              <div className="text-[15px] font-semibold text-[var(--green)] mb-0.5">
                &#x2728; Qu&ecirc;te termin&eacute;e !
              </div>
              <div className="text-[13px] text-[var(--text-secondary)]">
                Bravo, vous avez termin&eacute; &laquo;&nbsp;{quest.title}&nbsp;&raquo;. Passez &agrave; la qu&ecirc;te
                suivante pour continuer votre progression.
              </div>
            </div>
          )}

          {/* Overall completion celebration */}
          {overallPct === 100 && (
            <div
              className="p-5 rounded-2xl bg-gradient-to-r from-[var(--accent-soft)] to-[rgba(191,90,242,0.08)] border border-[var(--accent-blue)]/20 mb-5 text-center animate-celebrate"
              role="status"
            >
              <div className="text-2xl mb-2">&#x1F389;</div>
              <div className="text-[17px] font-bold text-foreground mb-1">F&eacute;licitations !</div>
              <div className="text-[13px] text-[var(--text-secondary)]">
                Vous avez compl&eacute;t&eacute; toutes les qu&ecirc;tes de votre plan. Votre m&eacute;moire est sur la
                bonne voie !
              </div>
            </div>
          )}

          {/* Analysis cards (only on first quest) */}
          {isFirstQuest && <AnalysisCard analysis={analysis} requirementsSummary={requirementsSummary} />}

          {/* Quest header */}
          {quest && (
            <>
              <div className="mb-5 animate-rise-fast" key={quest.id}>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] font-mono px-2.5 py-1 rounded-lg bg-[var(--accent-soft)] text-[var(--accent-blue)] mb-2">
                  {quest.emoji} {quest.phase}
                </div>
                <h2 className="text-[22px] font-bold tracking-tight mb-1 max-md:text-xl">{quest.title}</h2>
                <p className="text-sm text-[var(--text-secondary)]">{quest.desc}</p>
              </div>

              {/* Quest progress */}
              <div className="mb-5 animate-rise-fast [animation-delay:0.05s]">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-[var(--text-secondary)] font-medium">
                    {qp.done}/{qp.total} sous-étapes
                  </span>
                  <span
                    className={`text-xs font-mono font-semibold ${
                      qp.pct === 100 ? "text-[var(--green)]" : "text-[var(--accent-blue)]"
                    }`}
                  >
                    {qp.pct}%
                  </span>
                </div>
                <div className="h-1 rounded bg-[var(--border-glass)] overflow-hidden">
                  <div
                    className={`h-full rounded transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      qp.pct === 100 ? "bg-[var(--green)]" : "bg-gradient-to-r from-[var(--accent-blue)] to-[#bf5af2]"
                    }`}
                    style={{ width: `${qp.pct}%` }}
                    role="progressbar"
                    aria-valuenow={qp.pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </div>

              {/* Tasks list */}
              <div className="flex flex-col gap-1.5" role="list" aria-label="Liste des missions">
                {quest.tasks.map((task, tIdx) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={tIdx}
                    isOpen={activeTask === task.id}
                    onToggle={() =>
                      dispatch({
                        type: "SET_ACTIVE_TASK",
                        payload: activeTask === task.id ? null : task.id,
                      })
                    }
                  />
                ))}
              </div>
            </>
          )}
        </main>
      </div>

      <MobileBar />
    </>
  );
}
