import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { text, domain, fileBase64, fileType } = body;
    console.log("[API] Request received - domain:", domain, "hasText:", !!text, "hasFileBase64:", !!fileBase64, "fileType:", fileType);

    if (!domain) {
      return NextResponse.json({ error: "Domaine requis" }, { status: 400 });
    }
    if (!text && !fileBase64) {
      return NextResponse.json({ error: "Texte ou fichier requis" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    console.log("[API] ANTHROPIC_API_KEY exists:", !!apiKey, "length:", apiKey?.length || 0);
    if (!apiKey) {
      console.error("[API] ERROR: ANTHROPIC_API_KEY is undefined or empty");
      return NextResponse.json({ error: "Clé API non configurée" }, { status: 500 });
    }

    const domainLabels = { info: "Informatique", marketing: "Marketing", rh: "Ressources Humaines", finance: "Finance", droit: "Droit", other: "Autre domaine" };
    const domainLabel = domainLabels[domain] || domain;

    const systemPrompt = `Tu es un expert en méthodologie de mémoire universitaire, spécialisé dans le domaine "${domainLabel}". Tu dois analyser le sujet d'un étudiant et générer un plan structuré en quêtes. Retourne UNIQUEMENT un JSON valide (pas de markdown, pas de backticks) avec cette structure : { "analysis": { "subject": "résumé", "keywords": ["k1","k2","k3","k4","k5"], "domain_specific": "spécificité", "difficulty": "moyen", "estimated_weeks": 12 }, "quests": [{ "id": 1, "phase": "Phase 1", "title": "titre", "emoji": "🎯", "desc": "description", "tasks": [{ "id": "1-1", "title": "mission", "steps": [{"label": "action"}], "tip": "conseil" }] }] }. 6 quêtes : Cadrage → Recherche → Méthodologie → Terrain → Rédaction → Finalisation. 3-5 missions par quête, 3-5 sous-étapes par mission. Tout doit être spécifique au sujet.`;

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
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 4096, system: systemPrompt, messages: [{ role: "user", content: userContent }] }),
    });

    console.log("[API] Anthropic response status:", response.status);
    if (!response.ok) {
      const errBody = await response.text();
      console.error("[API] ERROR: Anthropic API failed");
      console.error("[API] Status:", response.status);
      console.error("[API] Status Text:", response.statusText);
      console.error("[API] Response Body:", errBody);
      return NextResponse.json({ error: "Erreur API: " + response.status + " - " + errBody.slice(0, 200) }, { status: 500 });
    }

    const data = await response.json();
    const raw = data.content?.[0]?.text || "";
    let parsed;
    try { parsed = JSON.parse(raw); } catch { const match = raw.match(/\{[\s\S]*\}/); if (match) { parsed = JSON.parse(match[0]); } else { throw new Error("Parse error"); } }
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
