<p align="center">
  <img src="public/icon-512.png" alt="maimouarkwest" width="80" />
</p>

<h1 align="center">maimouarkwest</h1>

<p align="center">
  <strong>Dashboard gamifié pour rédiger ton mémoire — propulsé par l'IA.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Claude_API-Anthropic-D97706?logo=anthropic&logoColor=white" alt="Claude API" />
  <img src="https://img.shields.io/badge/Deployed_on-Vercel-000?logo=vercel" alt="Vercel" />
</p>

<p align="center">
  <a href="https://maimouarkwest.com">Production</a> · <a href="#architecture">Architecture</a> · <a href="#démarrage-rapide">Setup</a> · <a href="#déploiement">Deploy</a>
</p>

---

## À propos

maimouarkwest transforme la rédaction d'un mémoire en une expérience gamifiée. L'étudiant dépose son cahier des charges (PDF), l'IA extrait les métadonnées puis génère un plan structuré et personnalisé. Chaque section devient une quête à compléter, avec un système de progression complet : XP, niveaux, streaks, combos et prestige.

**Fonctionnalités :**

- **Analyse IA en 2 phases** — Extraction des métadonnées avec validation utilisateur, puis génération du plan en SSE streaming
- **Plan structuré** — Chapitres, sections (easy/medium/hard), sous-tâches actionnables, conseils ciblés par section
- **Gamification complète** — XP, 10 niveaux, streaks quotidiens, combos de session, prestige au max
- **Outils intégrés** — Pomodoro, mode Focus, pense-bêtes avec éditeur riche, journal de bord IA, chat contextuel par chapitre
- **Thème personnalisable** — Couleur d'accent, intensité du texte, mode sombre/clair

---

## Stack

| Couche | Technologie | Détail |
|--------|-------------|--------|
| Framework | **Next.js 14** | App Router, RSC, TypeScript strict |
| Auth | **Supabase Auth** | Google OAuth, session cookies |
| Database | **Supabase (PostgreSQL)** | RLS, JSON columns, usage tracking |
| IA | **Anthropic Claude API** | Sonnet 4.5 (plan & chat), Haiku 4.5 (motivation) |
| Hosting | **Vercel** | Auto-deploy `main`, `maxDuration: 120` |
| Style | **Design system monochrome** | `rgba(255,255,255,X)` sur `#04030e`, inline styles |

---

## Architecture

```
maimouarkwest/
│
├── app/                                 # Next.js App Router
│   ├── page.tsx                         # Landing page (Tailwind)
│   ├── layout.tsx                       # Root layout + providers
│   ├── dashboard/
│   │   ├── page.tsx                     # Dashboard SSR (auth-protected)
│   │   └── error.tsx                    # Error boundary
│   ├── auth/callback/route.ts           # Google OAuth callback
│   │
│   └── api/                             # API Routes (serverless)
│       ├── plan/
│       │   ├── extract/route.ts         # Phase 1 — extraction métadonnées (Claude)
│       │   ├── route.ts                 # Phase 2 — génération plan (SSE streaming)
│       │   └── progress/route.ts        # CRUD progression chapitres
│       ├── quests/
│       │   ├── complete/route.ts        # Validation quête (legacy)
│       │   └── sync/route.ts            # Sync état client → DB (debounced)
│       ├── chat/route.ts                # Chat IA contextuel par chapitre
│       ├── journal/entry/route.ts       # Journal de bord IA
│       ├── notes/route.ts               # Pense-bêtes CRUD
│       ├── motivation/route.ts          # Message de motivation (Haiku, cached)
│       ├── analyze/route.ts             # Analyse de contenu
│       ├── prestige/route.ts            # Reset prestige (level 10 + 100%)
│       ├── preferences/route.ts         # Couleur d'accent, intensité
│       ├── streak/route.ts              # Données de streak
│       └── user/
│           ├── save/route.ts            # Sauvegarde deadline
│           └── export/route.ts          # Export données RGPD
│
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── DashboardContent.tsx     # State management central + sync
│   │   │   ├── UploadZone.tsx           # Drop zone PDF (premier upload)
│   │   │   └── new/
│   │   │       ├── NewDashboard.tsx      # Layout sidebar + content
│   │   │       ├── MemoireView.tsx       # Plan, hints, sous-tâches
│   │   │       ├── ProgressionView.tsx   # XP, niveaux, streaks, graphes
│   │   │       ├── AchievementsView.tsx  # Badges et achievements
│   │   │       ├── NotesView.tsx         # Éditeur de notes riche
│   │   │       ├── PomodoroTimer.tsx     # Timer Pomodoro
│   │   │       ├── ExtractionConfirm.tsx # Validation métadonnées
│   │   │       └── ColorPicker.tsx       # Personnalisation couleur
│   │   ├── landing/                      # Hero, Features, HowItWorks, Footer
│   │   ├── prestige/PrestigeModal.tsx    # Modal de prestige
│   │   └── ui/                           # Toast, RateLimitWarning, Avatar
│   │
│   ├── lib/
│   │   ├── supabase/                     # Clients browser + server
│   │   ├── auth/actions.ts               # signIn (Google) + signOut
│   │   ├── xp/levels.ts                  # Seuils XP, calcul niveau, MAX_LEVEL
│   │   ├── combo/index.ts               # Logique combo (timeout 2h)
│   │   ├── rate-limit.ts                # Rate limiting via usage_tracking
│   │   ├── color-utils.ts               # Helpers tw() / bg() monochrome
│   │   └── plans/queries.ts             # Requêtes Supabase plans
│   │
│   ├── hooks/                            # useToast, usePrestigeMode, useTheme
│   ├── context/                          # ThemeProvider (dark/light)
│   └── types/                            # memoir.ts, extraction.ts, notes.ts
│
├── middleware.ts                          # Auth guard sur /dashboard
├── __tests__/                            # Jest tests
├── CLAUDE.md                             # Instructions Claude Code
└── package.json
```

---

## Flux de données

```
  ┌──────────────┐          ┌───────────────────┐         ┌───────────────────┐
  │  UploadZone   │── PDF ─→│ /api/plan/extract  │─ meta ─→│ ExtractionConfirm │
  │  (drop zone)  │         │  Claude API call   │         │  (user validates) │
  └──────────────┘          └───────────────────┘         └────────┬──────────┘
                                                                   │ confirmed
                                                                   ▼
  ┌──────────────┐  plan    ┌───────────────────┐   SSE    ┌──────────────────┐
  │  Dashboard    │←── JSON ─│    /api/plan       │←─stream─│  Claude API      │
  │  (client)     │          │  (SSE streaming)   │         │  (16K tokens)    │
  └───────┬──────┘          └───────────────────┘         └──────────────────┘
          │
          │  ✅ toggle tâche (client-side)
          │  📊 calcul XP / streak / combo local
          │  ⏱  debounce 2s
          ▼
  ┌───────────────────┐
  │  /api/quests/sync   │──→ Supabase (memoir_plans)
  │  (persist state)    │
  └───────────────────┘
```

La logique de jeu (XP, streaks, combos) tourne entièrement côté client pour une UX instantanée. L'état est synchronisé vers Supabase avec un debounce de 2 secondes et un flush automatique avant fermeture de l'onglet (`beforeunload`).

---

## Démarrage rapide

### Prérequis

- **Node.js** 18+
- Un projet **[Supabase](https://supabase.com)** avec Google OAuth configuré
- Une clé API **[Anthropic](https://console.anthropic.com)**

### Installation

```bash
git clone https://github.com/<your-username>/maimouarkwest.git
cd maimouarkwest
npm install
```

### Variables d'environnement

```bash
cp .env.example .env.local
```

| Variable | Description | Source |
|----------|-------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase | Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique | Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service (server-side) | Dashboard → Settings → API |
| `ANTHROPIC_API_KEY` | Clé API Anthropic | [console.anthropic.com](https://console.anthropic.com/settings/keys) |

### Développement

```bash
npm run dev          # Dev server → http://localhost:3000
npm run build        # Production build
npx tsc --noEmit     # Type check
npm test             # Jest tests
npm run lint         # ESLint
```

---

## Base de données

### Schéma Supabase

| Table | Colonnes clés | Rôle |
|-------|--------------|------|
| `memoir_plans` | `plan_data` (JSON), `quest_progress`, `total_points`, `streak_data`, `combo_state`, `prestige_count` | Plans générés et état de progression |
| `usage_tracking` | `user_id`, `endpoint`, `date`, `count` | Rate limiting par endpoint par jour |
| `journal_entries` | `user_id`, `content`, `chapter`, `section` | Entrées du journal de bord |
| `user_streaks` | `user_id`, `current`, `last_activity`, `jokers` | Données de streak persistées |
| `notes` | `user_id`, `title`, `content` | Pense-bêtes utilisateur |

**Sécurité :** Row Level Security (RLS) activé sur toutes les tables — chaque utilisateur n'accède qu'à ses propres données. Les clés service Supabase et API Anthropic restent exclusivement côté serveur.

---

## Déploiement

### Vercel

Le projet se déploie automatiquement à chaque push sur `main`.

1. Importer le repo sur [vercel.com/new](https://vercel.com/new)
2. Ajouter les variables d'environnement dans Project Settings
3. Push sur `main` → deploy automatique

**Points clés :**
- `maxDuration: 120` sur les routes IA (plan/extract, plan, chat, journal)
- SSE streaming sur `/api/plan` pour les générations longues

### Supabase

1. Activer Google OAuth : Authentication → Providers → Google
2. Redirect URLs : `https://votre-domaine.com/auth/callback` + `http://localhost:3000/auth/callback`
3. Site URL : `https://votre-domaine.com`

---

## Gamification

### XP et niveaux

| Difficulté | XP |
|------------|-----|
| Easy | 10 |
| Medium | 20 |
| Hard | 30 |

10 niveaux progressifs : niveau 1 (0 XP) → niveau 10 (1170 XP).

### Mécaniques

- **Streaks** — Travailler chaque jour augmente le streak. Des jokers protègent le streak en cas d'absence.
- **Combos** — Sections complétées en < 2h d'intervalle : ×3 = +5 XP, ×5 = +10 XP.
- **Prestige** — Niveau 10 + 100% complétion → reset complet avec badge prestige permanent.

---

## Conventions

- **TypeScript strict** — Pas de `any`, types explicites
- **Dashboard** — Inline styles, palette monochrome `rgba(255,255,255,X)` sur `#04030e`
- **Landing** — Tailwind CSS
- **Langue** — Interface intégralement en français
- **Composants** — Functional components + hooks

---

## Licence

Projet propriétaire — Tous droits réservés.
