# maimouarkwest — Contexte projet pour Claude Code

## Qu'est-ce que c'est ?

maimouarkwest est un dashboard gamifié qui aide les étudiants en alternance à rédiger leur mémoire. L'utilisateur dépose son cahier des charges (PDF), l'IA génère un plan de rédaction structuré avec des conseils (hints), puis l'étudiant complète les sections comme des quêtes avec un système de XP, niveaux, streaks, combos et prestige.

## Stack technique

- **Framework** : Next.js 14 (App Router), TypeScript strict
- **Auth** : Supabase Auth avec Google OAuth
- **Base de données** : Supabase (PostgreSQL)
- **IA** : Anthropic Claude API (streaming SSE)
- **Hébergement** : Vercel (plan Hobby — timeout 10s sur les serverless functions)
- **Style** : Design monochrome — UNIQUEMENT `rgba(255,255,255, X)` sur fond `#04030e`, inline styles (pas de Tailwind dans le dashboard)

## Commandes utiles

```bash
npm run dev          # Dev server
npm run build        # Production build
npx tsc --noEmit     # Type check sans build
npm test             # Jest tests
```

## Architecture des fichiers clés

### Pages & Routes
- `app/page.tsx` — Landing page
- `app/dashboard/page.tsx` — Dashboard (protégé par auth)
- `app/dashboard/error.tsx` — Error boundary du dashboard
- `app/auth/callback/route.ts` — Callback OAuth Google

### API Routes (`app/api/`)
- `plan/route.ts` — **Génération du plan via Claude API (SSE streaming)**. Convertit le PDF en base64, stream la réponse pour éviter le timeout Vercel 10s. Validation Zod avec `hint: z.string().min(1)` (obligatoire).
- `quests/complete/route.ts` — Validation d'une quête (XP, streak, combo)
- `prestige/route.ts` — Reset prestige (3 opérations DB non-atomiques — bug connu)
- `chat/route.ts` — Chat IA contextuel
- `journal/route.ts` — Journal de bord
- `motivation/route.ts` — Messages de motivation
- `streak/route.ts` — Données de streak
- `analyze/route.ts` — Analyse de contenu

### Composants principaux
- `src/components/dashboard/DashboardContent.tsx` — State management central, gère upload SSE, quêtes, prestige
- `src/components/dashboard/new/NewDashboard.tsx` — UI du dashboard (sidebar + content), bouton ré-import PDF, overlay de chargement avec progression %
- `src/components/dashboard/new/MemoireView.tsx` — Affiche le plan + hints par section
- `src/components/dashboard/new/ProgressionView.tsx` — XP, niveaux, streaks
- `src/components/dashboard/new/AchievementsView.tsx` — Badges et achievements
- `src/components/landing/HeroSection.tsx` — Hero avec bouton Google login + affichage erreurs auth
- `src/components/dashboard/UploadZone.tsx` — Zone de drop PDF (premier upload)

### Logique métier
- `src/lib/auth/actions.ts` — signInWithGoogle (avec `prompt: 'select_account'`) + signOut
- `src/lib/rate-limit.ts` — Rate limiting via table `usage_tracking` (PLAN_LIMIT = 10, temporaire pour tests, à remettre à 3)
- `src/lib/combo/index.ts` — Système de combo (timestamps client — bug connu)
- `src/types/memoir.ts` — Types TypeScript (Section a `hint?: string`)

### Auth & Middleware
- `middleware.ts` — Protège `/dashboard`, redirige vers `/` si non authentifié
- `src/lib/supabase/client.ts` — Client Supabase navigateur
- `src/lib/supabase/server.ts` — Client Supabase serveur

## Supabase

- **Project ID** : `cbmkoxdkblirjaapwkub`
- **Tables principales** :
  - `memoir_plans` — Plans générés (contient `quest_progress` JSON, `prestige_count`, sections avec hints)
  - `usage_tracking` — Rate limiting (user_id, endpoint, date, count)
  - `journal_entries` — Entrées du journal de bord
  - `user_streaks` — Données de streak

## Vercel

- **Projet** : `maimouarkwest-prod-alternance`
- **Team** : `mobluis-projects`
- **Plan Hobby** : timeout 10s sur les serverless functions. C'est pourquoi `/api/plan` utilise du SSE streaming au lieu d'un simple `await`.

## Contraintes de design IMPORTANTES

1. **Monochrome uniquement** : le dashboard utilise EXCLUSIVEMENT `rgba(255,255,255, X)` pour le texte/bordures sur fond `#04030e`. Pas de couleurs vives, pas de Tailwind dans les composants dashboard. Tout en inline styles.
2. **Landing page** : Tailwind est utilisé uniquement sur la landing page.
3. **Langue** : Toute l'interface est en français.

## Bugs connus (non résolus)

1. **Race condition rate-limit** : Le check-then-increment dans `rate-limit.ts` n'est pas atomique. Deux requêtes simultanées peuvent passer le check.
2. **Prestige non-atomique** : 3 opérations DB séparées dans `/api/prestige`. Si l'une échoue après les autres, état incohérent.
3. **Combo timestamps client** : `combo/index.ts` utilise `Date.now()` côté client, manipulable.
4. **Pas de validation serveur pour prestige** : Le endpoint `/api/prestige` ne vérifie pas que l'utilisateur est réellement level 10 + 100% completion.
5. **PLAN_LIMIT à 10** : Temporairement augmenté pour tests, doit être remis à 3 en production.
6. **Hints pas encore testés** : Le champ `hint` est maintenant `z.string().min(1)` dans le Zod schema de `/api/plan`, mais l'utilisateur n'a pas encore re-uploadé un PDF pour confirmer que ça fonctionne.

## Git workflow

- Branche principale : `main`
- Push direct sur `main` → auto-deploy Vercel
- L'utilisateur (Luis) push manuellement depuis son Mac : `cd ~/Desktop/MemoireQuest && git pull && git push`
