"use client";

import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from "react";
import type { AppState, AppAction, Quest } from "@/types";
import { FALLBACK_QUESTS } from "@/lib/fallback-quests";

const initialState: AppState = {
  page: "landing",
  domain: null,
  quests: FALLBACK_QUESTS,
  analysis: null,
  requirementsSummary: null,
  analysisSource: null,
  completedSteps: {},
  activeQuest: 1,
  activeTask: null,
  hasSavedData: false,
  saveStatus: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_PAGE":
      return { ...state, page: action.payload };
    case "SET_DOMAIN":
      return { ...state, domain: action.payload };
    case "SET_QUESTS":
      return { ...state, quests: action.payload };
    case "SET_ANALYSIS":
      return { ...state, analysis: action.payload };
    case "SET_REQUIREMENTS_SUMMARY":
      return { ...state, requirementsSummary: action.payload };
    case "SET_ANALYSIS_SOURCE":
      return { ...state, analysisSource: action.payload };
    case "TOGGLE_STEP": {
      const key = action.payload;
      return {
        ...state,
        completedSteps: {
          ...state.completedSteps,
          [key]: !state.completedSteps[key],
        },
      };
    }
    case "SET_ACTIVE_QUEST":
      return { ...state, activeQuest: action.payload, activeTask: null };
    case "SET_ACTIVE_TASK":
      return { ...state, activeTask: action.payload };
    case "SET_HAS_SAVED_DATA":
      return { ...state, hasSavedData: action.payload };
    case "SET_SAVE_STATUS":
      return { ...state, saveStatus: action.payload };
    case "LOAD_USER_DATA":
      return { ...state, ...action.payload, hasSavedData: true, page: "dashboard" };
    case "RESET":
      return {
        ...initialState,
        page: "landing",
      };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

// ─── Derived selectors ───

export function getQuestProgress(quest: Quest, completedSteps: Record<string, boolean>) {
  let done = 0;
  let total = 0;
  quest.tasks.forEach((t) => {
    t.steps.forEach((_, i) => {
      total++;
      if (completedSteps[`${t.id}-${i}`]) done++;
    });
  });
  return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
}

export function getTaskProgress(
  task: { id: string; steps: { label: string }[] },
  completedSteps: Record<string, boolean>
) {
  const done = task.steps.filter((_, i) => completedSteps[`${task.id}-${i}`]).length;
  return { done, total: task.steps.length, pct: Math.round((done / task.steps.length) * 100) };
}

export function getOverallProgress(quests: Quest[], completedSteps: Record<string, boolean>) {
  const totalSteps = quests.reduce((s, q) => s + q.tasks.reduce((s2, t) => s2 + t.steps.length, 0), 0);
  const doneSteps = Object.values(completedSteps).filter(Boolean).length;
  return totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;
}
