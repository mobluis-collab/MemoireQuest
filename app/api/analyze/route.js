import { NextResponse } from "next/server";

// ─── Rate limiting (in-memory, per IP) ───
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 requests per window

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now - entry.start > RATE_LIMIT_WINDOW) {
    rateLimit.set(ip, { start: now, count: 1 });
    return true;
  }
  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) return false;
  return true;
}

// Clean old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimit) {
    if (now - entry.start > RATE_LIMIT_WINDOW) rateLimit.delete(ip);
  }
}, 60 * 1000);

// ─── Allowed domains ───
const ALLOWED_DOMAINS = ["info", "marketing", "rh", "finance", "droit", "other"];
const DOMAIN_LABELS = { info: "Informatique", marketing: "Marketing", rh: "Ressources Humaines", finance: "Finance", droit: "Droit", other: "Autre domaine" };

const MAX_TEXT_LENGTH = 10000;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // ~10MB in base64

export async function POST(request) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Trop de requêtes. Veuillez réessayer dans une minute." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { text, domain, fileBase64, fileType } = body;

    // Validate domain
    if (!domain || !ALLOWED_DOMAINS.includes(domain)) {
      return NextResponse.json({ error: "Domaine invalide" }, { status: 400 });
    }
    if (!text && !fileBase64) {
      return NextResponse.json({ error: "Texte ou fichier requis" }, { status: 400 });
    }

    // Validate input sizes
    if (text && text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json({ error: `Le texte ne doit pas dépasser ${MAX_TEXT_LENGTH} caractères.` }, { status: 400 });
    }
    if (fileBase64 && fileBase64.length > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Le fichier ne doit pas dépasser 10 Mo." }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("[API] ANTHROPIC_API_KEY is not configured");
      return NextResponse.json({ error: "Clé API non configurée" }, { status: 500 });
    }

    const domainLabel = DOMAIN_LABELS[domain] || domain;

    const systemPrompt = `Tu es un expert en méthodologie de mémoire universitaire, spécialisé dans le domaine "${domainLabel}". Tu dois analyser le cahier des charges/sujet d'un étudiant et générer un plan structuré.

IMPORTANT: Commence par analyser ce que le cahier des charges ATTEND concrètement de l'étudiant.

Retourne UNIQUEMENT un JSON valide (pas de markdown, pas de backticks) avec cette structure :
{
  "requirements_summary": {
    "title": "Ce que le cahier des charges attend de vous",
    "main_objective": "L'objectif principal du mémoire en 1-2 phrases",
    "deliverables": ["Livrable attendu 1", "Livrable attendu 2", "Livrable attendu 3"],
    "constraints": ["Contrainte ou exigence 1", "Contrainte ou exigence 2"],
    "evaluation_criteria": ["Critère d'évaluation 1", "Critère d'évaluation 2"]
  },
  "analysis": {
    "subject": "résumé du sujet",
    "keywords": ["k1","k2","k3","k4","k5"],
    "domain_specific": "spécificité du domaine",
    "difficulty": "moyen",
    "estimated_weeks": 12
  },
  "quests": [{
    "id": 1,
    "phase": "Phase 1",
    "title": "titre",
    "emoji": "🎯",
    "desc": "description",
    "tasks": [{
      "id": "1-1",
      "title": "mission",
      "steps": [{"label": "action"}],
      "tip": "conseil"
    }]
  }]
}

6 quêtes : Cadrage → Recherche → Méthodologie → Terrain → Rédaction → Finalisation. 3-5 missions par quête, 3-5 sous-étapes par mission. Tout doit être spécifique au sujet.`;

    let userContent = [];

    if (fileBase64 && fileType === "application/pdf") {
      let cleanBase64 = fileBase64;
      if (cleanBase64.includes(",")) {
        cleanBase64 = cleanBase64.split(",")[1];
      }
      userContent.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: cleanBase64 } });
      userContent.push({ type: "text", text: `Analyse ce cahier des charges en ${domainLabel} et génère un plan personnalisé. Retourne UNIQUEMENT le JSON.` });
    } else {
      userContent.push({ type: "text", text: `Sujet de mémoire en ${domainLabel} :\n\n${(text || "").slice(0, 6000)}\n\nGénère un plan personnalisé. Retourne UNIQUEMENT le JSON.` });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 8192, system: systemPrompt, messages: [{ role: "user", content: userContent }] }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("[API] Anthropic API error:", response.status);
      return NextResponse.json({ error: "Erreur API: " + response.status + " - " + errBody.slice(0, 200) }, { status: 500 });
    }

    const data = await response.json();
    const raw = data.content?.[0]?.text || "";
    let parsed;
    try { parsed = JSON.parse(raw); } catch { const match = raw.match(/\{[\s\S]*\}/); if (match) { parsed = JSON.parse(match[0]); } else { throw new Error("Parse error"); } }
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("[API] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
