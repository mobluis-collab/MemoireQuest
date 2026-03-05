import { createClient } from "@/lib/supabase/server";
import { checkAndIncrement } from "@/lib/rate-limit";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PLAN_LIMIT = 3;

const EXTRACT_PROMPT = `Tu es un expert en méthodologie de mémoire académique. Ton UNIQUE rôle est d'analyser le cahier des charges / document PDF fourni et d'en EXTRAIRE les métadonnées structurées.

RÈGLES STRICTES :
- NE PAS inventer d'informations. Si une information n'est pas dans le document, mets null.
- NE PAS générer de plan. Tu extrais UNIQUEMENT les métadonnées.
- Lis le document ENTIÈREMENT et ATTENTIVEMENT avant de répondre.

Extrais les informations suivantes :

1. **type_memoire** : Le type de mémoire (exemples : "Mémoire professionnel", "Mémoire de recherche", "Rapport de stage", "Mémoire de fin d'études", "Projet de fin d'études", "Thèse professionnelle"). Si pas clair, mets ta meilleure estimation basée sur le contenu.

2. **niveau** : Le niveau d'études (exemples : "BTS", "Licence 3", "Bachelor", "Master 1", "Master 2", "MBA", "Ingénieur 5A"). Si pas explicite, déduis du contexte (vocabulaire, exigences).

3. **discipline** : La discipline ou le domaine (exemples : "Marketing digital", "Informatique", "Droit des affaires", "Communication", "Ressources humaines", "Finance"). Identifie-la depuis le sujet ou le contexte du document.

4. **etablissement** : Le nom de l'établissement si mentionné. Sinon null.

5. **deadline** : La date de rendu/soutenance si mentionnée. Format "YYYY-MM-DD". Cherche : "date de rendu", "deadline", "date limite", "soutenance", "à remettre avant le", "échéance". Si rien trouvé → null.

6. **nombre_pages** : Le nombre de pages attendu si mentionné (ex: "entre 40 et 60 pages" → "40-60"). Si pas mentionné → null.

7. **structure_imposee** : Si le document impose une structure spécifique (nombre de parties, chapitres obligatoires, plan imposé), décris-la ici en texte libre. Exemples :
   - "3 parties imposées : Contexte, Analyse, Préconisations"
   - "Plan libre, mais introduction et conclusion obligatoires"
   - "5 chapitres : Intro, Revue de littérature, Méthodologie, Résultats, Conclusion"
   Si aucune structure imposée → null.

8. **competences_a_valider** : Liste des compétences, blocs de compétences, ou critères d'évaluation mentionnés dans le document. Tableau de strings. Si rien → tableau vide [].

9. **contraintes_formelles** : Contraintes de mise en forme (police, interligne, bibliographie, format de citation, etc.). Texte libre résumant les contraintes. Si rien → null.

10. **sujet_ou_theme** : Le sujet ou thème principal du mémoire si identifiable. Si c'est un cahier des charges générique sans sujet précis → null.

11. **resume_contenu** : Un résumé en 2-3 phrases de ce que le document contient (pour que l'utilisateur puisse vérifier que l'IA a bien compris le document).

Réponds UNIQUEMENT en JSON valide selon ce schéma :
{
  "type_memoire": "string",
  "niveau": "string | null",
  "discipline": "string | null",
  "etablissement": "string | null",
  "deadline": "YYYY-MM-DD | null",
  "nombre_pages": "string | null",
  "structure_imposee": "string | null",
  "competences_a_valider": ["string"],
  "contraintes_formelles": "string | null",
  "sujet_ou_theme": "string | null",
  "resume_contenu": "string"
}`;

const MAX_FILE_SIZE = 25 * 1024 * 1024;

const ExtractionSchema = z.object({
  type_memoire: z.string(),
  niveau: z.string().nullable(),
  discipline: z.string().nullable(),
  etablissement: z.string().nullable(),
  deadline: z.string().nullable(),
  nombre_pages: z.string().nullable(),
  structure_imposee: z.string().nullable(),
  competences_a_valider: z.array(z.string()),
  contraintes_formelles: z.string().nullable(),
  sujet_ou_theme: z.string().nullable(),
  resume_contenu: z.string(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const rateLimit = await checkAndIncrement(supabase, user.id, "/api/plan", PLAN_LIMIT);
  if (!rateLimit.allowed) {
    return new Response(JSON.stringify({ error: "Limite atteinte pour aujourd'hui.", remaining: 0 }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return new Response(JSON.stringify({ error: "Missing file", remaining: rateLimit.remaining }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (file.type !== "application/pdf") {
    return new Response(JSON.stringify({ error: "Invalid file type (PDF only)", remaining: rateLimit.remaining }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (file.size > MAX_FILE_SIZE) {
    return new Response(JSON.stringify({ error: "File too large (max 25MB)", remaining: rateLimit.remaining }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  // SSE streaming pour éviter le timeout Vercel Hobby (10s)
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        send("status", { message: "Analyse du document en cours..." });

        // Appel Claude en streaming
        const streamResponse = anthropic.messages.stream({
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 4096,
          system: EXTRACT_PROMPT,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "document",
                  source: { type: "base64", media_type: "application/pdf", data: base64 },
                },
                {
                  type: "text",
                  text: "Analyse ce document et extrais les métadonnées structurées en JSON. Ne génère PAS de plan, uniquement les métadonnées.",
                },
              ],
            },
          ],
        });

        // Collecter le texte complet en streamant des heartbeats
        let fullText = "";
        let chunkCount = 0;

        streamResponse.on("text", (text) => {
          fullText += text;
          chunkCount++;
          if (chunkCount % 5 === 0) {
            send("progress", { chunks: chunkCount });
          }
        });

        await streamResponse.finalMessage();

        send("status", { message: "Validation des métadonnées..." });

        // Extraire le JSON
        const jsonMatch = fullText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error("[extract] No JSON found. Start:", fullText.slice(0, 200));
          send("error", { error: "Impossible d'extraire les métadonnées." });
          controller.close();
          return;
        }

        let parsed;
        try {
          parsed = ExtractionSchema.safeParse(JSON.parse(jsonMatch[0]));
        } catch {
          console.error("[extract] JSON parse error:", fullText.slice(0, 200));
          send("error", { error: "Réponse IA invalide." });
          controller.close();
          return;
        }

        if (!parsed.success) {
          console.error("[extract] Zod error:", JSON.stringify(parsed.error.flatten()));
          send("error", { error: "Structure des métadonnées invalide." });
          controller.close();
          return;
        }

        // Succès — envoyer le résultat final
        send("result", {
          extraction: parsed.data,
          pdfBase64: base64,
          remaining: rateLimit.remaining,
        });
      } catch (err: unknown) {
        console.error("[extract] Error:", err);

        let userMessage = "Erreur lors de l'analyse du document.";

        if (err instanceof Anthropic.APIError) {
          console.error("[extract] Anthropic status:", err.status, "type:", err.error);
          if (err.status === 401) {
            userMessage = "Clé API Anthropic invalide. Contacte l'administrateur.";
          } else if (err.status === 429) {
            userMessage = "L'API Anthropic est surchargée. Réessaie dans quelques minutes.";
          } else if (err.status === 529) {
            userMessage = "L'API Anthropic est temporairement indisponible. Réessaie dans quelques minutes.";
          } else if (err.status === 400) {
            userMessage = "Requête invalide vers l'API. Le document est peut-être trop volumineux.";
          } else {
            userMessage = `Erreur API (${err.status}). Réessaie dans quelques instants.`;
          }
        } else if (err instanceof Error) {
          if (err.message === "TIMEOUT") {
            userMessage = "L'analyse a pris trop de temps. Essaie avec un document plus court.";
          } else {
            userMessage = `Erreur : ${err.message}`;
          }
        }

        send("error", { error: userMessage });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
