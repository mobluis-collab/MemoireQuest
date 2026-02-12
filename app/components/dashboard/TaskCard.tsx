"use client";

import { useState, useEffect, useRef } from "react";
import { useApp, getTaskProgress } from "@/context/AppProvider";
import type { Task } from "@/types";

interface TaskCardProps {
  task: Task;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}

export function TaskCard({ task, index, isOpen, onToggle }: TaskCardProps) {
  const { state, dispatch } = useApp();
  const [showTip, setShowTip] = useState(false);
  const tp = getTaskProgress(task, state.completedSteps);
  const status = tp.pct === 100 ? "done" : tp.pct > 0 ? "partial" : "";
  const prevPctRef = useRef(tp.pct);
  const [justCompleted, setJustCompleted] = useState(false);

  // Detect when task reaches 100%
  useEffect(() => {
    if (tp.pct === 100 && prevPctRef.current < 100) {
      setJustCompleted(true);
      const timer = setTimeout(() => setJustCompleted(false), 1200);
      return () => clearTimeout(timer);
    }
    prevPctRef.current = tp.pct;
  }, [tp.pct]);

  return (
    <div
      className={`rounded-2xl glass border transition-all duration-300 overflow-hidden animate-rise-fast ${
        justCompleted ? "animate-celebrate" : ""
      } ${
        isOpen
          ? "border-[var(--accent-blue)]/30 dark:border-[var(--accent-blue)]/30 shadow-lg"
          : status === "done"
            ? "border-[var(--green)]/20"
            : "border-[var(--border-glass)] hover:border-[var(--border-glass-hover)]"
      }`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 px-[18px] min-h-[48px] cursor-pointer transition-colors duration-200 hover:bg-[var(--card-bg-hover)] border-none bg-transparent text-left font-sans max-md:p-3.5 max-md:px-3"
        aria-expanded={isOpen}
        aria-controls={`task-${task.id}-steps`}
        aria-label={`${task.title} — ${tp.done}/${tp.total} étapes`}
      >
        {/* Status circle */}
        <div
          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs shrink-0 transition-all duration-300 ${
            status === "done"
              ? "border-[var(--green)] bg-[var(--green)] text-white"
              : status === "partial"
                ? "border-[var(--accent-blue)] bg-[var(--accent-soft)] text-transparent"
                : "border-[var(--border-glass)] text-transparent"
          }`}
          aria-label={status === "done" ? "Terminé" : status === "partial" ? "En cours" : "À faire"}
        >
          {status === "done" && "✓"}
        </div>

        {/* Meta */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold tracking-tight">{task.title}</div>
          <div className="text-xs text-[var(--text-tertiary)] mt-px">
            {tp.done}/{tp.total} étapes{status === "done" ? " · ✓" : ""}
          </div>
        </div>

        {/* Arrow */}
        <span
          className={`text-sm text-[var(--text-tertiary)] transition-transform duration-300 shrink-0 ${
            isOpen ? "rotate-90" : ""
          }`}
          aria-hidden="true"
        >
          ›
        </span>
      </button>

      {/* Steps panel — animated slide-down */}
      {isOpen && (
        <div
          id={`task-${task.id}-steps`}
          className="px-[18px] pb-4 max-md:px-3 max-md:pb-3.5 animate-slide-down overflow-hidden"
        >
          {task.steps.map((step, sIdx) => {
            const sk = `${task.id}-${sIdx}`;
            const isDone = !!state.completedSteps[sk];
            return (
              <div
                key={sk}
                className="flex items-start gap-2.5 py-2.5 border-b border-[var(--border-glass)] last:border-b-0 transition-all duration-200 max-sm:gap-2"
              >
                <span className="text-[10px] font-mono text-[var(--text-tertiary)] min-w-[18px] text-center pt-[3px] shrink-0 max-sm:min-w-[14px]">
                  {sIdx + 1}
                </span>
                {/* Checkbox with 44px touch area */}
                <button
                  onClick={() => dispatch({ type: "TOGGLE_STEP", payload: sk })}
                  className={`w-5 h-5 rounded-md border-[1.5px] shrink-0 mt-px flex items-center justify-center text-[10px] cursor-pointer transition-all duration-250 bg-transparent -m-3 p-3 box-content ${
                    isDone
                      ? "bg-[var(--accent-blue)] border-[var(--accent-blue)] text-white animate-check-bounce"
                      : "border-[var(--border-glass)] text-transparent hover:border-[var(--accent-blue)]"
                  }`}
                  aria-label={isDone ? `Décocher "${step.label}"` : `Cocher "${step.label}"`}
                  aria-checked={isDone}
                  role="checkbox"
                >
                  {isDone && "✓"}
                </button>
                <span
                  className={`text-[13px] leading-relaxed flex-1 transition-all duration-300 ${
                    isDone ? "line-through opacity-40 text-[var(--text-secondary)]" : "text-[var(--text-secondary)]"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}

          {/* Tip toggle */}
          <div className="flex justify-end mt-2">
            <button
              onClick={() => setShowTip(!showTip)}
              className="min-h-[44px] px-3 py-1.5 rounded-lg border border-[var(--border-glass)] bg-[var(--card-bg)] text-[var(--text-tertiary)] text-[11px] font-medium cursor-pointer transition-all hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] hover:bg-[var(--accent-soft)] font-sans"
              aria-expanded={showTip}
              aria-label={showTip ? "Masquer le conseil" : "Afficher le conseil IA"}
            >
              {showTip ? "Masquer" : "💡 Conseil IA"}
            </button>
          </div>
          {showTip && task.tip && (
            <div className="mt-2.5 p-3.5 px-4 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent-blue)]/10 text-[13px] leading-relaxed text-[var(--text-secondary)] animate-rise-fast">
              💡 {task.tip}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
