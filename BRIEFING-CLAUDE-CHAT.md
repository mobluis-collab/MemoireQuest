# Briefing maimouarkwest — Pour Claude Chat

## Le projet en bref

maimouarkwest est un dashboard gamifié (Next.js 14, TypeScript, Supabase, Vercel) qui aide les étudiants en alternance à rédiger leur mémoire. L'utilisateur uploade un PDF (cahier des charges), l'IA génère un plan structuré, et l'étudiant progresse section par section avec un système de quêtes/XP/streaks.

## Stack : Next.js 14 (App Router), TypeScript strict, Supabase Auth + PostgreSQL, Anthropic Claude API (SSE streaming), Vercel Hobby plan, design monochrome (blanc/gris sur #04030e).

---

## BUG CRITIQUE EN COURS — Timeout Vercel sur /api/plan

### Symptôme
Quand l'utilisateur uploade un PDF, l'overlay de chargement s'affiche puis disparaît sans résultat. Aucun plan n'est sauvegardé dans la DB. L'usage_tracking montre 2 appels (le rate-limit passe) mais memoir_plans est vide.

### Cause racine identifiée
**4 x Vercel Runtime Timeout** sur `/api/plan` dans les logs Vercel. Le plan Hobby a un timeout de 10 secondes sur les serverless functions. Le SSE streaming maintient la connexion ouverte, mais Vercel tue quand même le process avant que Claude ait fini de générer le JSON complet.

### Pourquoi c'est pire maintenant
Le prompt système de `/api/plan/route.ts` demande maintenant des `tasks[]` (2 à 4 sous-tâches par section) en plus des chapitres, sections, tips et difficulty. Ça augmente significativement la taille de la réponse et le temps de génération.

### Ce qui a déjà été fixé (commits récents)
1. **savePlan passait par un nouveau client Supabase** — dans le callback SSE streaming, `savePlan()` créait un nouveau `createClient()` qui ne pouvait plus accéder aux cookies de la requête originale. Fix : on passe maintenant le client existant en paramètre. (fichiers : `src/lib/plans/queries.ts` + `app/api/plan/route.ts`)
2. **Erreur silencieuse côté client** — si le stream SSE se fermait sans `type: 'done'`, l'overlay disparaissait sans message. Fix : ajout de `planReceived` flag + throw si false dans `DashboardContent.tsx`.
3. **Landing page redesign monochrome** — terminé et déployé (HeroSection, HowItWorks, FeaturesSection, FooterCTA).

### Ce qu'il reste à résoudre : LE TIMEOUT

Trois options possibles :

**Option A — Edge Runtime (recommandée)** : Passer `/api/plan` en Edge Runtime (`export const runtime = 'edge'`). Les Edge Functions ont un timeout de 30s avec streaming sur le plan Hobby. Il faudra remplacer `Buffer.from()` par `btoa()` ou les APIs Web natives, et vérifier que le SDK Anthropic est compatible Edge.

**Option B — Réduire la taille du prompt** : Simplifier le system prompt pour que Claude réponde plus vite. Par exemple limiter à 2 sous-tâches max par section, réduire les instructions, ou générer les tasks dans un second appel API séparé.

**Option C — Vercel Pro** : Upgrade le plan Vercel pour débloquer `maxDuration` jusqu'à 300s. Coûte 20$/mois.

---

## Architecture clé

### Fichier principal du bug : `app/api/plan/route.ts`
- Reçoit un PDF en FormData
- Le convertit en base64
- L'envoie à Claude API (claude-sonnet-4-5-20250929) via SSE streaming
- Accumule la réponse, valide avec Zod, sauvegarde dans Supabase
- Renvoie le plan au client via SSE

### Schéma Zod actuel (ce que Claude doit retourner) :
```typescript
const SectionSchema = z.object({
  text: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tasks: z.array(z.string().min(1)).min(2).max(4),  // ← NOUVEAU, peut être la cause du timeout
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
```

### Client SSE : `src/components/dashboard/DashboardContent.tsx`
La fonction `handleUpload` gère le SSE côté client. Si `planReceived` est false à la fin du stream, affiche une erreur.

### Supabase
- Project ID : `cbmkoxdkblirjaapwkub`
- RLS activée sur toutes les tables
- Policy `memoir_plans` : `auth.uid() = user_id` (ALL commands)
- Le serveur utilise l'anon key (pas service role), donc RLS s'applique

### Vercel
- Projet : `maimouarkwest-prod-alternance`
- Team : `mobluis-projects`
- Plan Hobby (timeout 10s serverless, ~30s streaming Edge)

---

## Contraintes de design

- Dashboard : UNIQUEMENT `rgba(255,255,255, X)` sur fond `#04030e`, inline styles, PAS de Tailwind, PAS de couleurs
- Landing page : Tailwind OK, mais uniquement monochrome (white/XX sur bg-[#04030e])
- Interface entièrement en français
- Pas d'emoji dans le code

---

## Fichiers modifiés récemment (ne pas écraser)

- `src/lib/plans/queries.ts` — savePlan prend maintenant un `client: SupabaseClient` en premier paramètre
- `app/api/plan/route.ts` — passe `supabase` à `savePlan()`, contient le system prompt avec tasks[]
- `src/components/dashboard/DashboardContent.tsx` — flag `planReceived` + erreur si stream vide
- `src/components/dashboard/new/MemoireView.tsx` — imports `isSectionDone`, `SectionProgress` pour le système de sous-tâches
- `src/components/landing/*` — tout refait en monochrome (HeroSection, HowItWorks, FeaturesSection, FooterCTA)
- `app/page.tsx` — assemblage landing page avec les 4 sections

---

## Git workflow

Branche principale : `main`, push direct → auto-deploy Vercel.
Commande de push depuis le Mac de Luis :
```bash
cd ~/Desktop/MemoireQuest && git add -A && git commit -m "message" && git push
```
