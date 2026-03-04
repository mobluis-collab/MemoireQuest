import { createClient } from '@/lib/supabase/server'
import { savePlan } from '@/lib/plans/queries'
import { checkAndIncrement } from '@/lib/rate-limit'
import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { extractText } from 'unpdf'

export const maxDuration = 60

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const PLAN_LIMIT = 10

const SYSTEM_PROMPT = `Tu es un expert en méthodologie de mémoire académique et professionnel. Tu analyses le cahier des charges fourni par l'étudiant et tu génères un plan de rédaction personnalisé, structuré et actionnable, adapté au type de mémoire décrit dans le document.

RÈGLES STRICTES ANTI-HALLUCINATION :
- NE PAS inventer de contenu ou d'informations qui ne sont pas dans le document PDF
- Lire UNIQUEMENT le PDF fourni et baser ton plan uniquement sur son contenu
- Si le document manque d'information, proposer un plan générique cohérent avec les éléments présents
- Ne jamais inventer de contraintes, deadlines, ou exigences qui ne sont pas explicitement mentionnées

INSTRUCTIONS :
- Lis attentivement le document pour identifier : le type de mémoire (professionnel, académique, recherche, stage, projet, etc.), le niveau d'études (BTS, Licence, Bachelor, Master, Ingénieur, etc.), la discipline ou domaine (communication, droit, gestion, informatique, marketing, sciences, etc.), les objectifs pédagogiques ou compétences à valider, la structure et le nombre de pages attendus, les deadlines et contraintes formelles (police, interligne, bibliographie, etc.), et les critères d'évaluation si mentionnés.
- Génère un plan de rédaction couvrant l'ensemble du mémoire, du début à la fin, adapté au contexte spécifique identifié.
- Chaque chapitre doit avoir un objectif clair, des sous-sections concrètes et des conseils pratiques (tips) directement actionnables pour l'étudiant.
- Respecte la structure attendue par l'établissement si elle est précisée dans le document. Sinon, propose une structure académique standard adaptée au type de mémoire.
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
- Si le cahier des charges mentionne explicitement un nombre de chapitres, parties, ou une structure attendue (ex: "3 parties", "5 chapitres", "plan en 4 temps"), génère EXACTEMENT ce nombre de chapitres.
- Si le document précise un nombre de pages ou un volume (ex: "60 pages" → généralement 4-5 chapitres, "100 pages" → 5-7 chapitres), adapte le nombre de chapitres en conséquence.
- Si aucune structure n'est précisée, génère un plan académique standard cohérent avec le niveau et le type de mémoire (généralement 4 à 6 chapitres).
- Dans tous les cas : minimum 2 chapitres, maximum 15 chapitres. Chaque chapitre : minimum 2 sections, maximum 10 sections. Pas de texte en dehors du JSON.`

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

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
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rateLimit = await checkAndIncrement(supabase, user.id, '/api/plan', PLAN_LIMIT)
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Limite atteinte pour aujourd\'hui.', remaining: 0 }, { status: 429 })
  }

  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file', remaining: rateLimit.remaining }, { status: 400 })
  }

  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Invalid file type (PDF only)', remaining: rateLimit.remaining }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File too large (max 10MB)', remaining: rateLimit.remaining }, { status: 400 })
  }

  const buffer = await file.arrayBuffer()

  // Extract text from PDF server-side — sending plain text to Claude is
  // much faster than sending a base64 document (no PDF parsing on Claude's side).
  let pdfText: string
  try {
    const pdfData = await extractText(new Uint8Array(buffer))
    pdfText = (pdfData.text ?? []).join('\n').trim()
  } catch {
    return NextResponse.json({ error: 'Impossible de lire le PDF. Vérifie que le fichier n\'est pas protégé.' }, { status: 400 })
  }

  if (!pdfText || pdfText.length < 50) {
    return NextResponse.json({ error: 'Le PDF semble vide ou illisible. Réessaie avec un autre fichier.' }, { status: 400 })
  }

  // Truncate to ~30k chars to keep prompt fast (~8k tokens)
  const MAX_TEXT_CHARS = 30_000
  const truncatedText = pdfText.length > MAX_TEXT_CHARS
    ? pdfText.slice(0, MAX_TEXT_CHARS) + '\n\n[... document tronqué pour performance ...]'
    : pdfText
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))
      }

      try {
        // Start streaming from Anthropic
        let fullText = ''
        let stopReason = ''

        const anthropicStream = anthropic.messages.stream({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: `Voici le contenu du cahier des charges de l'étudiant :\n\n---\n${truncatedText}\n---\n\nGénère le plan de mémoire en JSON. IMPORTANT : chaque section DOIT obligatoirement inclure un champ "tasks" avec un tableau de 2 à 4 sous-tâches concrètes et actionnables. Ne jamais omettre le tableau tasks.`,
            },
          ],
        })

        // Send keepalive pings every few chunks so the connection stays open
        let chunkCount = 0
        anthropicStream.on('text', (text) => {
          fullText += text
          chunkCount++
          if (chunkCount % 20 === 0) {
            sendEvent(JSON.stringify({ type: 'progress', chars: fullText.length }))
          }
        })

        const SAFETY_TIMEOUT = 55_000 // 55s — close cleanly before Vercel's 60s kill
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
            console.error('[plan] Anthropic timeout after 55s. Chars received:', fullText.length)
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

        // Extract and validate JSON
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
        await savePlan(supabase, user.id, plan.title, plan)

        // Send the final result
        sendEvent(JSON.stringify({ type: 'done', plan, remaining: rateLimit.remaining }))
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
