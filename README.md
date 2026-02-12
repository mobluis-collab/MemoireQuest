# maimoirkouest

L'assistant IA qui analyse votre sujet de memoire et vous guide pas a pas jusqu'a la soutenance.

## Fonctionnalites

- **Analyse IA** -- Uploadez votre sujet ou cahier des charges, l'IA cree un plan personnalise
- **6 domaines** -- Informatique, Marketing, RH, Finance, Droit, Autre
- **Quetes guidees** -- 6 phases, ~25 missions, ~87 sous-etapes
- **Conseils cibles** -- Recommandations adaptees a votre domaine
- **Sauvegarde cloud** -- Connexion Google, progression synchronisee
- **Export RGPD** -- Exportez toutes vos donnees (art. 20)
- **Responsive** -- Mobile-first, iOS safe-area, 4 breakpoints
- **Dark/Light mode** -- Theme persistant
- **Accessibilite** -- WCAG AA, focus-visible, ARIA, semantique HTML

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 14 (App Router) |
| Langage | TypeScript (strict) |
| UI | Tailwind CSS 3, CSS custom properties |
| Auth | Supabase (Google OAuth) |
| Base de donnees | Supabase (PostgreSQL, RLS) |
| IA | Anthropic Claude API (Sonnet) |
| Rate limiting | Upstash Redis |
| Tests | Jest 30, Testing Library |
| CI/CD | GitHub Actions |
| Linting | ESLint (next/core-web-vitals), Prettier |

## Demarrage rapide

```bash
# Cloner le projet
git clone https://github.com/mobluis-collab/MemoireQuest.git
cd MemoireQuest

# Installer les dependances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Remplir les valeurs dans .env.local

# Lancer en dev
npm run dev
```

### Variables d'environnement

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Cle API Anthropic (Claude) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cle publique Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Cle service role (API routes) |
| `UPSTASH_REDIS_REST_URL` | URL Redis Upstash |
| `UPSTASH_REDIS_REST_TOKEN` | Token Redis Upstash |

## Scripts

```bash
npm run dev          # Serveur de developpement
npm run build        # Build production
npm run type-check   # Verification TypeScript
npm run lint         # ESLint
npm run format       # Prettier (ecriture)
npm run format:check # Prettier (verification)
npm run test         # Tests unitaires
npm run test:ci      # Tests + couverture (CI)
```

## Architecture

```
app/
  api/
    analyze/route.ts       # Analyse IA (POST, auth, rate limit, cache)
    user/
      save/route.ts        # Sauvegarde sendBeacon (POST)
      export/route.ts      # Export RGPD (GET, auth)
  components/
    Maimoirkouest.tsx       # Orchestrateur principal (~95 lignes)
    landing/                # Hero, Features, Stats
    onboarding/             # Selection domaine + saisie sujet
    dashboard/              # Sidebar, TaskCard, AnalysisCard, ProgressRing
    dialogs/                # AnalysisOverlay, SignInPrompt
    layout/                 # Navbar, MobileBar, CookieBanner
    ui/                     # Skeleton, AnimNum
  context/
    AppProvider.tsx          # useReducer centralisé (state global)
    ThemeProvider.tsx         # Dark/light mode
  hooks/
    useUserData.ts           # Auth, CRUD Supabase, auto-save
    useAnalysis.ts           # Appel API analyse + timeout
  lib/
    validation.ts            # Schemas Zod (input/output)
    domain-prompts.ts        # 6 prompts specialises par domaine
    redis.ts                 # Rate limiting + cache analyses
    supabase.ts              # Client Supabase (browser)
    supabase-server.ts       # Client Supabase (server, JWT verify)
    fallback-quests.ts       # Plan generique si IA echoue
  types/
    index.ts                 # Types Quest, Task, Step, Analysis, etc.
supabase/
  migrations/
    001_enable_rls.sql       # RLS + policies
    002_soft_delete_and_history.sql  # Soft delete + historique analyses
__tests__/                   # 6 suites, 79 tests
```

## API Endpoints

### `POST /api/analyze`
Analyse un sujet de memoire via Claude AI.

- **Auth** : Bearer token requis
- **Rate limit** : 5 req/min par utilisateur (Redis)
- **Cache** : 7 jours (analyses texte identiques)
- **Body** : `{ text, domain, fileBase64?, fileType? }`
- **Response** : `{ quests, analysis, requirements_summary }`

### `POST /api/user/save`
Sauvegarde via `navigator.sendBeacon` (beforeunload).

- **Auth** : Pas de header (sendBeacon), user_id dans le body
- **Body** : Progression complete (quests, completed_steps, etc.)

### `GET /api/user/export`
Export RGPD de toutes les donnees utilisateur.

- **Auth** : Bearer token requis
- **Response** : JSON telechargeant avec Content-Disposition

## Securite

- Row Level Security (RLS) sur toutes les tables
- Auth obligatoire sur `/api/analyze`
- Validation Zod en entree et sortie
- Sanitization des inputs IA (prompt injection)
- Rate limiting distribue (Redis)
- `autoRefreshToken` pour sessions stables
- Soft delete (retention 30 jours)

## Licence

Open Source -- Fait pour les etudiants.
