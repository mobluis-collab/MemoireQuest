import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { text, domain, fileType } = await request.json();

    if (!text || !domain) {
      return NextResponse.json({ error: "Texte et domaine requis" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Clé API non configurée" }, { status: 500 });
    }

    const domainLabels = {
      info: "Informatique",
      marketing: "Marketing",
      rh: "Ressources Humaines",
      finance: "Finance",
      droit: "Droit",
      other: "Autre domaine",
    };

    const domainLabel = domainLabels[domain] || domain;

    const systemPrompt = `Tu es un expert en méthodologie de mémoire universitaire, spécialisé dans le domaine "${domainLabel}".

Tu dois analyser le sujet/cahier des charges d'un étudiant et générer un plan de travail PERSONNALISÉ structuré en quêtes, missions et sous-étapes.

RÈGLES IMPORTANTES :
- Tu guides l'étudiant, tu ne fais PAS le travail à sa place
- Chaque sous-étape doit être une ACTION CONCRÈTE que l'étudiant doit faire lui-même
- Les conseils doivent être spécifiques au sujet, pas génériques
- Adapte le vocabulaire et les exemples au domaine "${domainLabel}"
- Sois précis et actionnable

Tu dois retourner UNIQUEMENT un JSON valide (pas de markdown, pas de backticks, pas de texte autour) avec cette structure exacte :

{
  "analysis": {
    "subject": "résumé court du sujet en 1-2 phrases",
    "keywords": ["mot-clé 1", "mot-clé 2", "mot-clé 3", "mot-clé 4", "mot-clé 5"],
    "domain_specific": "ce qui est spécifique à ce sujet dans le domaine ${domainLabel}",
    "difficulty": "facile | moyen | avancé",
    "estimated_weeks": 12
  },
  "quests": [
    {
      "id": 1,
      "phase": "Phase 1",
      "title": "titre de la quête",
      "emoji": "🎯",
      "desc": "description courte de la quête adaptée au sujet",
      "tasks": [
        {
          "id": "1-1",
          "title": "titre de la mission",
          "steps": [
            { "label": "action concrète 1 spécifique au sujet" },
            { "label": "action concrète 2 spécifique au sujet" }
          ],
          "tip": "conseil personnalisé pour cette mission en rapport avec le sujet"
        }
      ]
    }
  ]
}

STRUCTURE ATTENDUE : 6 quêtes (phases), 3-4 missions par quête, 2-3 sous-étapes par mission.
Les 6 quêtes doivent suivre cette progression : Cadrage → Recherche → Méthodologie → Terrain → Rédaction → Finalisation.
Chaque conseil (tip) doit être SPÉCIFIQUE au sujet de l'étudiant, pas générique.

IMPORTANT: Génère un JSON valide et compact. Évite les caractères spéciaux dans les textes. Utilise uniquement des guillemets doubles.`;

    // Determine content type and prepare message
    const isImage = fileType?.startsWith("image/");
    const isPdf = fileType === "application/pdf";
    const isBase64 = text.startsWith("data:");

    let userContent;

    if (isImage && isBase64) {
      // Handle image with Claude Vision
      const base64Data = text.split(",")[1];
      const mediaType = text.split(";")[0].split(":")[1];

      userContent = [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: mediaType,
            data: base64Data,
          },
        },
        {
          type: "text",
          text: `Voici une image du cahier des charges / sujet de mémoire de l'étudiant en ${domainLabel}. Lis attentivement tout le texte visible dans l'image, puis analyse ce sujet en profondeur et génère un plan de travail PERSONNALISÉ. Retourne UNIQUEMENT le JSON, rien d'autre.`,
        },
      ];
    } else if (isPdf && isBase64) {
      // Handle PDF - extract text server-side
      const base64Data = text.split(",")[1];
      const pdfBuffer = Buffer.from(base64Data, "base64");

      let pdfText = "";
      try {
        const pdfParse = (await import("pdf-parse")).default;
        const pdfData = await pdfParse(pdfBuffer);
        pdfText = pdfData.text;
      } catch (pdfError) {
        console.error("PDF parsing error:", pdfError);
        return NextResponse.json(
          { error: "Erreur lors de la lecture du PDF. Essayez de copier-coller le texte." },
          { status: 400 }
        );
      }

      if (!pdfText.trim()) {
        return NextResponse.json(
          { error: "Le PDF semble vide ou contient uniquement des images. Essayez de copier-coller le texte." },
          { status: 400 }
        );
      }

      userContent = `Voici le cahier des charges / sujet de mémoire de l'étudiant en ${domainLabel} :\n\n${pdfText.slice(0, 15000)}\n\nAnalyse ce sujet en profondeur et génère un plan de travail PERSONNALISÉ. Retourne UNIQUEMENT le JSON, rien d'autre.`;
    } else {
      // Handle plain text
      userContent = `Voici le cahier des charges / sujet de mémoire de l'étudiant en ${domainLabel} :\n\n${text.slice(0, 15000)}\n\nAnalyse ce sujet en profondeur et génère un plan de travail PERSONNALISÉ. Retourne UNIQUEMENT le JSON, rien d'autre.`;
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
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
        messages: [
          {
            role: "user",
            content: userContent,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic API error:", err);
      return NextResponse.json({ error: "Erreur API Anthropic" }, { status: 500 });
    }

    const data = await response.json();
    const raw = data.content?.[0]?.text || "";

    // Parse JSON from response
    let parsed;
    try {
      // Try direct parse first
      parsed = JSON.parse(raw);
    } catch {
      // Try to extract JSON from possible markdown
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        // Clean up common JSON issues from LLM output
        let cleanJson = match[0]
          .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
          .replace(/,\s*}/g, '}') // Remove trailing commas in objects
          .replace(/[\x00-\x1F\x7F]/g, (char) => {
            // Keep newlines and tabs, escape others
            if (char === '\n' || char === '\r' || char === '\t') return char;
            return '';
          });
        parsed = JSON.parse(cleanJson);
      } else {
        throw new Error("Impossible de parser la réponse IA");
      }
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'analyse : " + error.message },
      { status: 500 }
    );
  }
}
