"use client";

import { useApp, getQuestProgress } from "@/context/AppProvider";

export function MobileBar() {
  const { state, dispatch } = useApp();
  const { quests, activeQuest } = state;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 h-16 pb-[env(safe-area-inset-bottom,0px)] glass-strong border-t border-[var(--border-glass)] items-center justify-around hidden max-md:flex px-1"
      role="tablist"
      aria-label="Navigation quêtes"
    >
      {quests.map((q) => {
        const qp = getQuestProgress(q, state.completedSteps);
        const isActive = activeQuest === q.id;
        return (
          <button
            key={q.id}
            role="tab"
            aria-selected={isActive}
            aria-label={q.title}
            onClick={() => dispatch({ type: "SET_ACTIVE_QUEST", payload: q.id })}
            className={`flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] text-[9px] font-medium cursor-pointer p-1 rounded-lg transition-all border-none bg-transparent font-sans flex-1 overflow-hidden ${
              isActive ? "text-[var(--accent-blue)]" : "text-[var(--text-tertiary)]"
            }`}
          >
            <span className="text-lg leading-none">{q.emoji}</span>
            <span className="truncate w-full text-center max-w-[56px]">{qp.pct === 100 ? "✓" : q.title}</span>
          </button>
        );
      })}
    </div>
  );
}
