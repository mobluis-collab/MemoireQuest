import { NextResponse } from "next/server";
import { getAuthUser, createServerClient } from "@/lib/supabase-server";
import { analyzeRequestSchema, aiResponseSchema, sanitizeForPrompt } from "@/lib/validation";
import { buildSystemPrompt } from "@/lib/domain-prompts";
import { checkRateLimit, getCachedAnalysis, setCachedAnalysis } from "@/lib/redis";
import type { DomainId } from "@/types";

const DOMAIN_LABELS: Record<DomainId, string> = {
  info: "Informatique",
  marketing: "Marketing",
  rh: "Ressources Humaines",
  finance: "Finance",
  droit: "Droit",
  other: "Autre domaine",
};

// ─── Retry with exponential backoff ───
async function fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(url, options);

    if (res.ok) return res;

    // Retry on 429 (rate limit) or 5xx (server error)
    if ((res.status === 429 || res.status >= 500) && attempt < retries - 1) {
      const retryAfter = res.headers.get("retry-after");
      const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : Math.min(1000 * Math.pow(2, attempt), 10000);
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }

    return res;
  }
  throw new Error("Max retries exceeded");
}

export async function POST(request: Request) {
  try {
    // ── Auth: verify JWT ──
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
    }

    // ── Rate limiting by user ID (Redis or in-memory fallback) ──
    const { allowed } = await checkRateLimit(user.id);
    if (!allowed) {
      return NextResponse.json({ error: "Trop de requêtes. Veuillez réessayer dans une minute." }, { status: 429 });
    }

    // ── Parse & validate input with Zod ──
    const raw = await request.json();
    const parsed = analyzeRequestSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Données invalides" }, { status: 400 });
    }

    const { text, domain, fileBase64, fileType } = parsed.data;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("[API] ANTHROPIC_API_KEY is not configured");
      return NextResponse.json({ error: "Clé API non configurée" }, { status: 500 });
    }

    const domainLabel = DOMAIN_LABELS[domain as DomainId] || domain;
    const hasPdf = !!(fileBase64 && fileType === "application/pdf");
    const textContent = hasPdf ? "" : text || "";

    // ── Check cache (text-based analyses only, not PDFs) ──
    if (!hasPdf && textContent) {
      const cached = await getCachedAnalysis(textContent, domain);
      if (cached) {
        return NextResponse.json({ ...cached, _cached: true });
      }
    }

    // ── Build domain-specific system prompt ──
    const systemPrompt = buildSystemPrompt(domain as DomainId);

    // ── Build user content with sanitized input ──
    const userContent: Array<Record<string, unknown>> = [];

    if (hasPdf) {
      let cleanBase64 = fileBase64!;
      if (cleanBase64.includes(",")) {
        cleanBase64 = cleanBase64.split(",")[1];
      }
      userContent.push({
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: cleanBase64 },
      });
      userContent.push({
        type: "text",
        text: `<user_document>Analyse ce cahier des charges en ${domainLabel} et génère un plan personnalisé.</user_document> Retourne UNIQUEMENT le JSON.`,
      });
    } else {
      const sanitized = sanitizeForPrompt(textContent);
      userContent.push({
        type: "text",
        text: `<user_document>${sanitized.slice(0, 6000)}</user_document>\n\nSujet de mémoire en ${domainLabel}. Génère un plan personnalisé. Retourne UNIQUEMENT le JSON.`,
      });
    }

    // ── Call Anthropic API with retry ──
    const response = await fetchWithRetry("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8192,
        system: systemPrompt,
        messages: [{ role: "user", content: userContent }],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("[API] Anthropic API error:", response.status, errBody);
      return NextResponse.json({ error: "Erreur API: " + response.status }, { status: 502 });
    }

    const data = await response.json();
    const rawText: string = data.content?.[0]?.text || "";

    // ── Parse JSON with fallback ──
    let aiResult: unknown;
    try {
      aiResult = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        aiResult = JSON.parse(match[0]);
      } else {
        throw new Error("Impossible de parser la réponse IA");
      }
    }

    // ── Validate AI response with Zod ──
    const validated = aiResponseSchema.safeParse(aiResult);
    const result = validated.success ? validated.data : (aiResult as Record<string, unknown>);

    if (!validated.success) {
      console.error("[API] AI response validation failed:", validated.error.issues);
    }

    // ── Cache the result (text-based only) ──
    if (!hasPdf && textContent) {
      setCachedAnalysis(textContent, domain, result).catch(() => {});
    }

    // ── Save to analysis history ──
    try {
      const supabase = createServerClient();
      // Deactivate previous analyses
      await supabase.from("user_analysis_history").update({ is_active: false }).eq("user_id", user.id);
      // Insert new active analysis
      await supabase.from("user_analysis_history").insert({
        user_id: user.id,
        quests: (result as Record<string, unknown>).quests || null,
        analysis: (result as Record<string, unknown>).analysis || null,
        requirements_summary: (result as Record<string, unknown>).requirements_summary || null,
        domain,
        is_active: true,
      });
    } catch (e) {
      console.error("[API] History save error:", e);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Error:", (error as Error).message);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
