import { z } from "zod";

// ─── Domain validation ───
export const domainSchema = z.enum(["info", "marketing", "rh", "finance", "droit", "other"]);

// ─── Step schema ───
export const stepSchema = z.object({
  label: z.string().min(1).max(500),
});

// ─── Task schema ───
export const taskSchema = z.object({
  id: z.string().min(1).max(20),
  title: z.string().min(1).max(200),
  steps: z.array(stepSchema).min(1).max(10),
  tip: z.string().max(500).optional(),
});

// ─── Quest schema ───
export const questSchema = z.object({
  id: z.number().int().positive(),
  phase: z.string().min(1).max(50),
  title: z.string().min(1).max(100),
  emoji: z.string().min(1).max(4),
  desc: z.string().min(1).max(300),
  tasks: z.array(taskSchema).min(1).max(10),
});

// ─── Analysis schema ───
export const analysisSchema = z.object({
  subject: z.string().min(1).max(500),
  keywords: z.array(z.string().max(50)).max(10).optional(),
  domain_specific: z.string().max(500).optional(),
  difficulty: z.string().max(30).optional(),
  estimated_weeks: z.number().int().positive().max(52).optional(),
});

// ─── Requirements Summary schema ───
export const requirementsSummarySchema = z.object({
  title: z.string().max(300).optional(),
  main_objective: z.string().max(500).optional(),
  deliverables: z.array(z.string().max(300)).max(20).optional(),
  constraints: z.array(z.string().max(300)).max(20).optional(),
  evaluation_criteria: z.array(z.string().max(300)).max(20).optional(),
});

// ─── Full AI Response schema ───
export const aiResponseSchema = z.object({
  requirements_summary: requirementsSummarySchema.optional(),
  analysis: analysisSchema.optional(),
  quests: z.array(questSchema).min(1).max(10).optional(),
});

// ─── Analyze Request schema (for /api/analyze) ───
export const analyzeRequestSchema = z
  .object({
    text: z.string().max(10000).nullable().optional(),
    domain: domainSchema,
    fileBase64: z.string().max(15_000_000).nullable().optional(), // ~10MB in base64
    fileType: z.string().max(50).nullable().optional(),
  })
  .refine((data) => data.text?.trim() || data.fileBase64, { message: "Texte ou fichier requis" });

// ─── User Progress schema (for Supabase writes) ───
export const userProgressSchema = z.object({
  user_id: z.string().uuid(),
  quests: z.array(questSchema),
  completed_steps: z.record(z.string(), z.boolean()),
  analysis: analysisSchema.nullable(),
  requirements_summary: requirementsSummarySchema.nullable(),
  domain: domainSchema.nullable(),
  active_quest: z.number().int().positive(),
  updated_at: z.string().datetime(),
  version: z.number().int().nonnegative().optional(),
});

// ─── Sanitize user input for AI prompts ───
export function sanitizeForPrompt(text: string): string {
  // Remove potential prompt injection patterns
  const dangerous = [
    /ignore\s+(all\s+)?previous\s+instructions/gi,
    /system\s*:/gi,
    /you\s+are\s+now/gi,
    /act\s+as\s+(if\s+you\s+are|a)/gi,
    /disregard\s+(all|any|the)/gi,
    /forget\s+(all|everything|your)/gi,
  ];

  let sanitized = text;
  for (const pattern of dangerous) {
    sanitized = sanitized.replace(pattern, "[FILTERED]");
  }

  return sanitized.slice(0, 10000);
}
