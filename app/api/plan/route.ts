import { createClient } from '@/lib/supabase/server'
import { savePlan } from '@/lib/plans/queries'
import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export const maxDuration = 300

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `CONTEXTE VÉRIFIÉ PAR L'UTILISATEUR :
Les métadonnées ci-dessous ont été extraites du document puis VALIDÉES/CORRIGÉES par l'utilisateur. Tu DOIS les respecter comme source de vérité absolue. Ne les contredis JAMAIS.

Tu es un expert en méthodologie de mémoire académique et professionnel. Tu analyses le cahier des charges fourni par l'étudiant et tu génères un plan de rédaction personnalisé, structuré et actionnable, adapté au type de mémoire décrit dans le document.

RÈGLES STRICTES ANTI-HALLUCINATION :
- NE PAS inventer de contenu ou d'informations qui ne sont pas dans le document PDF
- Lire UNIQUEMENT le PDF fourni et baser ton plan uniquement sur son contenu
- Si le document manque d'information, proposer un plan générique cohérent avec les éléments présents
- Ne jamais inventer de contraintes, deadlines, ou exigences qui ne sont pas explicitement mentionnées

DEADLINE / DATE DE RENDU :
- Utilise la deadline fournie dans les métadonnées vérifiées par l'utilisateur.
- Si la deadline est null dans les métadonnées, mets "deadline": null.
- NE JAMAIS inventer une date.

INSTRUCTIONS :
- Lis attentivement le document pour identifier : le type de mémoire (professionnel, académique, recherche, stage, projet, etc.), le niveau d'études (BTS, Licence, Bachelor, Master, Ingénieur, etc.), la discipline ou domaine (communication, droit, gestion, informatique, marketing, sciences, etc.), les objectifs pédagogiques ou compétences à valider, la structure et le nombre de pages attendus, les deadlines et contraintes formelles (police, interligne, bibliographie, etc.), et les critères d'évaluation si mentionnés.
- Génère un plan de rédaction couvrant l'ensemble du mémoire, du début à la fin, adapté au contexte spécifique identifié.
- Chaque chapitre doit avoir un objectif clair, des sous-sections concrètes et des conseils pratiques (tips) directement actionnables pour l'étudiant.
- Respecte la structure attendue par l'établissement si elle est précisée dans le document ou dans les métadonnées. Sinon, propose une structure académique standard adaptée au type de mémoire.
- Les tips doivent être concrets et utiles (ex: "Commence par une revue de littérature sur 3-4 sources clés avant de rédiger ta problématique").

SOUS-TACHES PAR SECTION (tasks) :
- Chaque section doit contenir un champ "tasks" : un tableau de 2 à 4 sous-tâches concrètes et actionnables.
- Chaque sous-tâche est une action courte à la voix active (ex: "Réaliser le SWOT", "Identifier les 3 concurrents principaux", "Rédiger l'introduction du chapitre").
- Les tasks doivent être STRICTEMENT basées sur le contenu du cahier des charges. NE JAMAIS inventer de méthodologies ou exigences non mentionnées dans le document.
- Si le cahier des charges précise des attentes pour une section, les tasks DOIVENT les reprendre directement.
- Si aucune précision dans le document, formuler des tasks génériques cohérentes avec le titre de la section.
- Les tasks doivent être des étapes de travail réelles et distinctes, pas de simples paraphrases du titre de section.

ATTRIBUTION DE DIFFICULTÉ ET XP :
- Chaque section doit avoir une difficulté : "easy", "medium", ou "hard"
- Équilibre cible : ~40% easy, 40% medium, 20% hard
- XP associée : easy = 10 XP, medium = 20 XP, hard = 30 XP
- Critères de difficulté :
  * easy : sections descriptives, revues simples, synthèse de documents existants
  * medium : analyses comparatives, méthodologie, études de cas
  * hard : problématiques complexes, recherches originales, développements théoriques avancés

Réponds UNIQUEMENT en JSON valide selon ce schéma exact :
{
  "title": "string",
  "deadline": "YYYY-MM-DD or null",
  "chapters": [
    {
      "number": "string",
      "title": "string",
      "objective": "string",
      "sections": [
        {
          "text": "string",
          "difficulty": "easy" | "medium" | "hard",
          "tasks": ["string (sous-tâche 1)", "string (sous-tâche 2)", "string (sous-tâche 3)"]
        }
      ],
      "tips": "string"
    }
  ]
}

NOMBRE DE CHAPITRES :
- Si les métadonnées indiquent une structure imposée, respecte-la EXACTEMENT.
- Si le document précise un nombre de pages ou un volume (ex: "60 pages" → généralement 4-5 chapitres, "100 pages" → 5-7 chapitres), adapte le nombre de chapitres en conséquence.
- Si aucune structure n'est précisée, génère un plan académique standard cohérent avec le niveau et le type de mémoire (généralement 4 à 6 chapitres).
- Dans tous les cas : minimum 2 chapitres, maximum 15 chapitres. Chaque chapitre : minimum 2 sections, maximum 10 sections. Pas de texte en dehors du JSON.`

const SectionSchema = z.object({
  text: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tasks: z.array(z.string().min(1)).min(2).max(4),
})

const ChapterSchema = z.object({
  number: z.string(),
  title: z.string(),
  objective: z.string(),
  sections: z.array(SectionSchema).min(2).max(10),
  tips: z.string(),
})

const MemoirePlanSchema = z.object({
  title: z.string(),
  chapters: z.array(ChapterSchema).min(2).max(15),
  deadline: z.string().nullable().optional(),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // No rate-limit here — already consumed in /api/plan/extract

  let body: { pdfBase64: string; extraction: Record<string, unknown> }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { pdfBase64, extraction } = body
  if (!pdfBase64 || !extraction) {
    return NextResponse.json({ error: 'Missing pdfBase64 or extraction' }, { status: 400 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))
      }

      try {
        let fullText = ''
        let stopReason = ''

        const anthropicStream = anthropic.messages.stream({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 16384,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'document',
                  source: {
                    type: 'base64',
                    media_type: 'application/pdf',
                    data: pdfBase64,
                  },
                },
                {
                  type: 'text',
                  text: `MÉTADONNÉES VÉRIFIÉES PAR L'UTILISATEUR :
${JSON.stringify(extraction, null, 2)}

En te basant sur ces métadonnées vérifiées ET le document PDF ci-dessus, génère le plan de mémoire en JSON.

INSTRUCTIONS CRITIQUES :
1. Chaque section DOIT inclure un champ "tasks" avec 2 à 4 sous-tâches concrètes.
2. Respecte OBLIGATOIREMENT la structure imposée si elle est renseignée dans les métadonnées.
3. Le nombre de chapitres doit être cohérent avec le nombre de pages indiqué.
4. La deadline dans le JSON DOIT correspondre à celle des métadonnées.
5. Les compétences à valider doivent être intégrées dans les objectifs des chapitres.
6. NE PAS inventer de contraintes ou exigences qui ne sont ni dans le PDF ni dans les métadonnées.`,
                },
              ],
            },
          ],
        })

        let chunkCount = 0
        anthropicStream.on('text', (text) => {
          fullText += text
          chunkCount++
          if (chunkCount % 20 === 0) {
            sendEvent(JSON.stringify({ type: 'progress', chars: fullText.length }))
          }
        })

        const SAFETY_TIMEOUT = 290_000
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('TIMEOUT')), SAFETY_TIMEOUT)
        )

        let finalMessage
        try {
          finalMessage = await Promise.race([
            anthropicStream.finalMessage(),
            timeoutPromise,
          ])
        } catch (raceErr) {
          if (raceErr instanceof Error && raceErr.message === 'TIMEOUT') {
            console.error('[plan] Anthropic timeout after 290s. Chars received:', fullText.length)
            sendEvent(JSON.stringify({ type: 'error', error: 'La génération a pris trop de temps. Réessaie avec un PDF plus court.' }))
            controller.close()
            return
          }
          throw raceErr
        }
        stopReason = finalMessage.stop_reason ?? ''

        if (stopReason === 'max_tokens') {
          console.error('[plan] Response truncated. Length:', fullText.length)
          sendEvent(JSON.stringify({ type: 'error', error: 'Le plan généré était trop long. Réessaie.' }))
          controller.close()
          return
        }

        const jsonMatch = fullText.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
          console.error('[plan] No JSON in response. Start:', fullText.slice(0, 200))
          sendEvent(JSON.stringify({ type: 'error', error: 'Impossible d\'extraire le plan. Réessaie.' }))
          controller.close()
          return
        }

        let parsed
        try {
          parsed = MemoirePlanSchema.safeParse(JSON.parse(jsonMatch[0]))
        } catch {
          console.error('[plan] JSON parse error')
          sendEvent(JSON.stringify({ type: 'error', error: 'Le plan généré contenait du JSON invalide. Réessaie.' }))
          controller.close()
          return
        }

        if (!parsed.success) {
          console.error('[plan] Zod error:', JSON.stringify(parsed.error.flatten()))
          sendEvent(JSON.stringify({ type: 'error', error: 'Structure du plan invalide. Réessaie.' }))
          controller.close()
          return
        }

        const plan = parsed.data
        console.log('[plan] Deadline detected:', plan.deadline ?? 'null (not found in PDF)')
        console.log('[plan] Plan title:', plan.title)
        await savePlan(supabase, user.id, plan.title, plan)

        sendEvent(JSON.stringify({ type: 'done', plan, remaining: null }))
        controller.close()
      } catch (err) {
        console.error('[plan] Stream error:', err)
        sendEvent(JSON.stringify({ type: 'error', error: 'Erreur lors de la génération du plan. Réessaie.' }))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
