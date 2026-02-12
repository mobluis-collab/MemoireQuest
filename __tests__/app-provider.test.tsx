import React from "react";
import { renderHook, act } from "@testing-library/react";
import { AppProvider, useApp, getQuestProgress, getOverallProgress } from "@/context/AppProvider";
import { FALLBACK_QUESTS } from "@/lib/fallback-quests";

function wrapper({ children }: { children: React.ReactNode }) {
  return <AppProvider>{children}</AppProvider>;
}

describe("AppProvider integration", () => {
  it("provides initial state", () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    expect(result.current.state.page).toBe("landing");
    expect(result.current.state.domain).toBeNull();
    expect(result.current.state.quests).toEqual(FALLBACK_QUESTS);
    expect(result.current.state.analysisSource).toBeNull();
  });

  it("dispatches SET_PAGE", () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    act(() => {
      result.current.dispatch({ type: "SET_PAGE", payload: "onboard" });
    });
    expect(result.current.state.page).toBe("onboard");
  });

  it("dispatches SET_DOMAIN and preserves other state", () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    act(() => {
      result.current.dispatch({ type: "SET_DOMAIN", payload: "info" });
    });
    expect(result.current.state.domain).toBe("info");
    expect(result.current.state.page).toBe("landing"); // unchanged
  });

  it("full onboarding flow: domain → analysis source → dashboard", () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    // Step 1: Select domain
    act(() => {
      result.current.dispatch({ type: "SET_DOMAIN", payload: "marketing" });
    });
    expect(result.current.state.domain).toBe("marketing");

    // Step 2: Set custom quests from AI
    const aiQuests = [
      {
        id: 1,
        phase: "Phase 1",
        title: "Market Analysis",
        emoji: "📊",
        desc: "Analyze the market",
        tasks: [{ id: "1-1", title: "Research", steps: [{ label: "Find sources" }] }],
      },
    ];
    act(() => {
      result.current.dispatch({ type: "SET_QUESTS", payload: aiQuests });
      result.current.dispatch({ type: "SET_ANALYSIS_SOURCE", payload: "ai" });
      result.current.dispatch({ type: "SET_PAGE", payload: "dashboard" });
    });

    expect(result.current.state.page).toBe("dashboard");
    expect(result.current.state.quests).toEqual(aiQuests);
    expect(result.current.state.analysisSource).toBe("ai");
  });

  it("step completion flow with progress tracking", () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    // Complete first step of first task in first quest
    act(() => {
      result.current.dispatch({ type: "TOGGLE_STEP", payload: "1-1-0" });
    });
    expect(result.current.state.completedSteps["1-1-0"]).toBe(true);

    // Check progress
    const quest = result.current.state.quests[0];
    const progress = getQuestProgress(quest, result.current.state.completedSteps);
    expect(progress.done).toBe(1);
    expect(progress.pct).toBeGreaterThan(0);

    // Uncomplete the step
    act(() => {
      result.current.dispatch({ type: "TOGGLE_STEP", payload: "1-1-0" });
    });
    expect(result.current.state.completedSteps["1-1-0"]).toBe(false);
  });

  it("LOAD_USER_DATA restores full state", () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    act(() => {
      result.current.dispatch({
        type: "LOAD_USER_DATA",
        payload: {
          domain: "finance",
          activeQuest: 2,
          completedSteps: { "1-1-0": true, "1-1-1": true },
          analysis: { subject: "Corporate Finance" },
        },
      });
    });

    expect(result.current.state.page).toBe("dashboard");
    expect(result.current.state.domain).toBe("finance");
    expect(result.current.state.activeQuest).toBe(2);
    expect(result.current.state.hasSavedData).toBe(true);
    expect(result.current.state.completedSteps["1-1-0"]).toBe(true);
  });

  it("RESET clears everything", () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    // Modify state
    act(() => {
      result.current.dispatch({ type: "SET_DOMAIN", payload: "droit" });
      result.current.dispatch({ type: "SET_PAGE", payload: "dashboard" });
      result.current.dispatch({ type: "TOGGLE_STEP", payload: "1-1-0" });
    });

    // Reset
    act(() => {
      result.current.dispatch({ type: "RESET" });
    });

    expect(result.current.state.page).toBe("landing");
    expect(result.current.state.domain).toBeNull();
    expect(result.current.state.completedSteps).toEqual({});
  });

  it("overall progress tracks across all quests", () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    const totalSteps = result.current.state.quests.reduce(
      (s, q) => s + q.tasks.reduce((s2, t) => s2 + t.steps.length, 0),
      0
    );

    // No progress initially
    expect(getOverallProgress(result.current.state.quests, {})).toBe(0);

    // Complete some steps
    act(() => {
      result.current.dispatch({ type: "TOGGLE_STEP", payload: "1-1-0" });
      result.current.dispatch({ type: "TOGGLE_STEP", payload: "2-1-0" });
    });

    const pct = getOverallProgress(result.current.state.quests, result.current.state.completedSteps);
    expect(pct).toBe(Math.round((2 / totalSteps) * 100));
  });

  it("SET_ACTIVE_QUEST resets active task", () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    act(() => {
      result.current.dispatch({ type: "SET_ACTIVE_TASK", payload: "1-1" });
    });
    expect(result.current.state.activeTask).toBe("1-1");

    act(() => {
      result.current.dispatch({ type: "SET_ACTIVE_QUEST", payload: 2 });
    });
    expect(result.current.state.activeQuest).toBe(2);
    expect(result.current.state.activeTask).toBeNull();
  });

  it("throws when useApp is used outside provider", () => {
    // Suppress console.error for cleaner test output
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => {
      renderHook(() => useApp());
    }).toThrow("useApp must be used within AppProvider");
    consoleSpy.mockRestore();
  });
});
