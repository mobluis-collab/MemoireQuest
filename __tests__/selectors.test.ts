import { getQuestProgress, getTaskProgress, getOverallProgress } from "@/context/AppProvider";
import type { Quest } from "@/types";

const mockQuest: Quest = {
  id: 1,
  phase: "Phase 1",
  title: "Cadrage",
  emoji: "🎯",
  desc: "Test quest",
  tasks: [
    {
      id: "1-1",
      title: "Task A",
      steps: [{ label: "Step 1" }, { label: "Step 2" }],
    },
    {
      id: "1-2",
      title: "Task B",
      steps: [{ label: "Step 1" }, { label: "Step 2" }, { label: "Step 3" }],
    },
  ],
};

// ─── getQuestProgress ───

describe("getQuestProgress", () => {
  it("returns 0% for no completed steps", () => {
    const result = getQuestProgress(mockQuest, {});
    expect(result).toEqual({ done: 0, total: 5, pct: 0 });
  });

  it("returns correct progress for partial completion", () => {
    const completed = { "1-1-0": true, "1-1-1": true };
    const result = getQuestProgress(mockQuest, completed);
    expect(result).toEqual({ done: 2, total: 5, pct: 40 });
  });

  it("returns 100% for all steps completed", () => {
    const completed = {
      "1-1-0": true,
      "1-1-1": true,
      "1-2-0": true,
      "1-2-1": true,
      "1-2-2": true,
    };
    const result = getQuestProgress(mockQuest, completed);
    expect(result).toEqual({ done: 5, total: 5, pct: 100 });
  });

  it("ignores false values", () => {
    const completed = { "1-1-0": true, "1-1-1": false };
    const result = getQuestProgress(mockQuest, completed);
    expect(result).toEqual({ done: 1, total: 5, pct: 20 });
  });

  it("ignores steps from other quests", () => {
    const completed = { "1-1-0": true, "2-1-0": true, "3-1-0": true };
    const result = getQuestProgress(mockQuest, completed);
    expect(result).toEqual({ done: 1, total: 5, pct: 20 });
  });
});

// ─── getTaskProgress ───

describe("getTaskProgress", () => {
  const task = mockQuest.tasks[1]; // 3 steps

  it("returns 0% for no completed steps", () => {
    const result = getTaskProgress(task, {});
    expect(result).toEqual({ done: 0, total: 3, pct: 0 });
  });

  it("returns correct partial progress", () => {
    const result = getTaskProgress(task, { "1-2-0": true });
    expect(result).toEqual({ done: 1, total: 3, pct: 33 });
  });

  it("returns 100% for all done", () => {
    const result = getTaskProgress(task, { "1-2-0": true, "1-2-1": true, "1-2-2": true });
    expect(result).toEqual({ done: 3, total: 3, pct: 100 });
  });
});

// ─── getOverallProgress ───

describe("getOverallProgress", () => {
  const quests: Quest[] = [
    mockQuest,
    {
      id: 2,
      phase: "Phase 2",
      title: "Research",
      emoji: "📚",
      desc: "Test",
      tasks: [{ id: "2-1", title: "Task C", steps: [{ label: "S1" }, { label: "S2" }] }],
    },
  ];

  it("returns 0% for no completed steps", () => {
    expect(getOverallProgress(quests, {})).toBe(0);
  });

  it("returns correct progress across quests", () => {
    // 7 total steps (5 from quest 1 + 2 from quest 2)
    const completed = { "1-1-0": true, "2-1-0": true };
    expect(getOverallProgress(quests, completed)).toBe(29); // 2/7 = 28.57 → 29%
  });

  it("returns 100% when all done", () => {
    const completed = {
      "1-1-0": true,
      "1-1-1": true,
      "1-2-0": true,
      "1-2-1": true,
      "1-2-2": true,
      "2-1-0": true,
      "2-1-1": true,
    };
    expect(getOverallProgress(quests, completed)).toBe(100);
  });

  it("returns 0% for empty quests", () => {
    expect(getOverallProgress([], {})).toBe(0);
  });
});
