import { analyzeRequestSchema, aiResponseSchema, userProgressSchema, questSchema } from "@/lib/validation";

// ─── Full API Request → Response validation flow ───

describe("API validation flow", () => {
  describe("analyzeRequestSchema - input validation", () => {
    it("accepts a valid text request with all domains", () => {
      const domains = ["info", "marketing", "rh", "finance", "droit", "other"];
      for (const domain of domains) {
        const result = analyzeRequestSchema.safeParse({
          text: "Mon sujet de mémoire porte sur...",
          domain,
        });
        expect(result.success).toBe(true);
      }
    });

    it("accepts null text when file is provided", () => {
      const result = analyzeRequestSchema.safeParse({
        text: null,
        domain: "info",
        fileBase64: "data:application/pdf;base64,JVBERi0xLjQ...",
        fileType: "application/pdf",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty text without file", () => {
      const result = analyzeRequestSchema.safeParse({
        text: "  ",
        domain: "info",
      });
      expect(result.success).toBe(false);
    });

    it("rejects text exceeding 10000 chars", () => {
      const result = analyzeRequestSchema.safeParse({
        text: "x".repeat(10001),
        domain: "info",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("aiResponseSchema - output validation", () => {
    it("accepts a valid AI response with quests", () => {
      const response = {
        requirements_summary: {
          title: "Study on AI",
          main_objective: "Analyze AI impacts",
          deliverables: ["Report", "Presentation"],
        },
        analysis: {
          subject: "AI in healthcare",
          keywords: ["AI", "healthcare", "ethics"],
          difficulty: "Advanced",
          estimated_weeks: 12,
        },
        quests: [
          {
            id: 1,
            phase: "Phase 1",
            title: "Research",
            emoji: "📚",
            desc: "Literature review",
            tasks: [
              {
                id: "1-1",
                title: "Find sources",
                steps: [{ label: "Search Google Scholar" }],
                tip: "Use boolean operators",
              },
            ],
          },
        ],
      };

      const result = aiResponseSchema.safeParse(response);
      expect(result.success).toBe(true);
    });

    it("accepts partial response (only quests)", () => {
      const result = aiResponseSchema.safeParse({
        quests: [
          {
            id: 1,
            phase: "P1",
            title: "T",
            emoji: "🎯",
            desc: "D",
            tasks: [{ id: "1-1", title: "T", steps: [{ label: "S" }] }],
          },
        ],
      });
      expect(result.success).toBe(true);
    });

    it("rejects quest with empty tasks array", () => {
      const result = questSchema.safeParse({
        id: 1,
        phase: "P1",
        title: "T",
        emoji: "🎯",
        desc: "D",
        tasks: [],
      });
      expect(result.success).toBe(false);
    });

    it("rejects quest with too many tasks", () => {
      const tasks = Array.from({ length: 11 }, (_, i) => ({
        id: `1-${i}`,
        title: `Task ${i}`,
        steps: [{ label: "S" }],
      }));
      const result = questSchema.safeParse({
        id: 1,
        phase: "P1",
        title: "T",
        emoji: "🎯",
        desc: "D",
        tasks,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("userProgressSchema - save validation", () => {
    it("accepts valid user progress", () => {
      const result = userProgressSchema.safeParse({
        user_id: "550e8400-e29b-41d4-a716-446655440000",
        quests: [
          {
            id: 1,
            phase: "P1",
            title: "T",
            emoji: "🎯",
            desc: "D",
            tasks: [{ id: "1-1", title: "T", steps: [{ label: "S" }] }],
          },
        ],
        completed_steps: { "1-1-0": true },
        analysis: null,
        requirements_summary: null,
        domain: "info",
        active_quest: 1,
        updated_at: "2026-02-11T10:00:00.000Z",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid user_id (not UUID)", () => {
      const result = userProgressSchema.safeParse({
        user_id: "not-a-uuid",
        quests: [],
        completed_steps: {},
        analysis: null,
        requirements_summary: null,
        domain: null,
        active_quest: 1,
        updated_at: "2026-02-11T10:00:00.000Z",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid domain in progress", () => {
      const result = userProgressSchema.safeParse({
        user_id: "550e8400-e29b-41d4-a716-446655440000",
        quests: [
          {
            id: 1,
            phase: "P1",
            title: "T",
            emoji: "🎯",
            desc: "D",
            tasks: [{ id: "1-1", title: "T", steps: [{ label: "S" }] }],
          },
        ],
        completed_steps: {},
        analysis: null,
        requirements_summary: null,
        domain: "invalid_domain",
        active_quest: 1,
        updated_at: "2026-02-11T10:00:00.000Z",
      });
      expect(result.success).toBe(false);
    });
  });
});
