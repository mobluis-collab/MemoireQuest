<h1 align="center">
  maimouarkwest
</h1>

<p align="center">
  <strong>L'assistant IA qui transforme ton cahier des charges en plan de mémoire actionnable.</strong>
</p>

<p align="center">
  <a href="https://maimouarkwest.com">Site</a> &middot;
  <a href="#architecture">Architecture</a> &middot;
  <a href="#demarrage-rapide">Démarrage rapide</a> &middot;
  <a href="#deploiement">Déploiement</a>
</p>

---

## Présentation

maimouarkwest est un dashboard gamifié conçu pour les étudiants en alternance qui rédigent un mémoire. L'étudiant dépose son cahier des charges au format PDF, l'IA analyse le document, extrait les métadonnées (niveau d'études, discipline, structure imposée, deadline) puis génère un plan de rédaction complet et personnalisé. La rédaction se transforme ensuite en une série de quêtes à compléter avec un système de progression : XP, niveaux, streaks, combos et prestige.

### Fonctionnalités principales

- **Analyse IA en deux phases** — Extraction des métadonnées avec validation utilisateur, puis génération du plan en streaming SSE pour éviter les timeouts
- **Plan de rédaction structuré** — Chapitres, sections avec difficulté graduée (easy / medium / hard), sous-tâches actionnables et conseils ciblés par section
- **Gamification** — XP par tâche, 10 niveaux de progression, streaks quotidiens, combos (bonus XP pour les sessions intensives), système de prestige au niveau max
- **Outils de productivité** — Pomodoro intégré, mode Focus immersif, pense-bêtes, journal de bord avec assistant IA contextuel
- **Thème personnalisable** — Couleur d'accent, intensité du texte, mode sombre/clair

---

## Stack technique

| Couche | Technologie | Détail |
|--------|-------------|--------|
| Framework | **Next.js 14** | App Router, React Server Components, TypeScript strict |
| Auth | **Supabase Auth** | Google OAuth (`prompt: 'select_account'`), session via cookies |
| Base de données | **Supabase (PostgreSQL)** | Row Level Security, tables `memoir_plans`, `usage_tracking`, `journal_entries`, `user_streaks` |
| IA | **Anthropic Claude API** | `claude-sonnet-4-5-20250929`, streaming SSE pour la génération de plan, appels classiques pour l'extraction |
| Hébergement | **Vercel** | Auto-deploy depuis `main`, serverless functions avec `maxDuration: 120` |
| Style | **Design system monochrome** | `rgba(255,255,255, X)` sur fond `#04030e`, inline styles dans le dashboard, Tailwind uniquement sur la landing page |

---

## Architecture

```
maimouarkwest/
├── app/
│   ├── page.tsx                      # Landing page
│   ├── dashboard/
│   │   └── page.tsx                  # Dashboard (protégé par middleware auth)
│   ├── auth/
│   │   └── callback/route.ts         # Callback OAuth Google
│   └── api/
│       ├── plan/
│       │   ├── extract/route.ts      # Phase 1 : extraction métadonnées PDF via Claude
│       │   ├── route.ts              # Phase 2 : génération plan SSE streaming
│       │   └── progress/route.ts     # Lecture progression
│       ├── quests/
│       │   ├── complete/route.ts     # Validation quête (legacy)
│       │   └── sync/route.ts         # Sync état client → Supabase (debounced)
│       ├── chat/route.ts             # Chat IA contextuel
│       ├── journal/entry/route.ts    # Journal de bord
│       ├── notes/route.ts            # Pense-bêtes CRUD
│       ├── analyze/route.ts          # Analyse de contenu
│       ├── motivation/route.ts       # Messages de motivation IA
│       ├── streak/                   # Streak data + jokers
│       ├── prestige/route.ts         # Reset prestige
│       ├── preferences/route.ts      # Couleur d'accent, intensité texte
│       └── user/
│           ├── save/route.ts         # Sauvegarde deadline
│           └── export/route.ts       # Export données utilisateur
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── DashboardContent.tsx  # State management central
│   │   │   ├── UploadZone.tsx        # Zone de drop PDF (premier upload)
│   │   │   └── new/
│   │   │       ├── NewDashboard.tsx   # UI principale (sidebar + content)
│   │   │       ├── MemoireView.tsx    # Plan + hints + sous-tâches
│   │   │       ├── ProgressionView.tsx# XP, niveaux, streaks, graphiques
│   │   │       ├── AchievementsView.tsx # Badges et achievements
│   │   │       ├── NotesView.tsx      # Pense-bêtes
│   │   │       ├── PomodoroTimer.tsx  # Timer Pomodoro
│   │   │       ├── ExtractionConfirm.tsx # Validation métadonnées extraites
│   │   │       └── ColorPicker.tsx    # Personnalisation couleur
│   │   ├── landing/                   # Composants landing page
│   │   └── prestige/                  # Modal prestige
│   ├── lib/
│   │   ├── supabase/                  # Clients Supabase (browser + server)
│   │   ├── auth/actions.ts            # signIn / signOut
│   │   ├── xp/levels.ts              # Seuils XP, calcul de niveau
│   │   ├── combo/index.ts            # Logique de combo (timeout 2h)
│   │   ├── rate-limit.ts             # Rate limiting via DB
│   │   └── plans/queries.ts          # Requêtes Supabase pour les plans
│   ├── hooks/                         # useToast, usePrestigeMode
│   ├── context/                       # ThemeProvider (dark/light)
│   └── types/                         # Types TypeScript
├── middleware.ts                       # Protection routes /dashboard
├── CLAUDE.md                          # Instructions pour Claude Code
└── package.json
```

### Flux de données

```
┌─────────────┐     PDF      ┌──────────────────┐    métadonnées    ┌───────────────────┐
│  UploadZone  │ ──────────→ │ /api/plan/extract │ ──────────────→  │ ExtractionConfirm │
└─────────────┘              │  (Claude API)     │                  │  (validation user) │
                             └──────────────────┘                  └────────┬──────────┘
                                                                            │ confirmé
                                                                            ▼
┌─────────────┐   plan JSON   ┌──────────────────┐    SSE stream    ┌──────────────────┐
│  Dashboard   │ ←──────────  │   /api/plan       │ ←──────────── │  Claude API       │
│  (client)    │              │  (streaming SSE)  │                │  (16K tokens max) │
└──────┬──────┘              └──────────────────┘                └──────────────────┘
       │
       │  toggle tâche (client-side)
       │  calcul XP/streak/combo local
       │  debounce 2s
       ▼
┌──────────────────┐
│ /api/quests/sync  │ ──→ Supabase (memoir_plans)
│  (persist state)  │
└──────────────────┘
```

---

## <a id="demarrage-rapide"></a>Démarrage rapide

### Prérequis

- Node.js 18+
- Un projet [Supabase](https://supabase.com) avec Google OAuth configuré
- Une clé API [Anthropic](https://console.anthropic.com)

### Installation

```bash
git clone https://github.com/<your-username>/maimouarkwest.git
cd maimouarkwest
npm install
```

### Configuration

```bash
cp .env.example .env.local
```

Renseigner les variables dans `.env.local` :

| Variable | Description | Où la trouver |
|----------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service (server-side) | Supabase Dashboard → Settings → API |
| `ANTHROPIC_API_KEY` | Clé API Anthropic | [console.anthropic.com](https://console.anthropic.com/settings/keys) |

### Lancer le serveur de développement

```bash
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

### Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement (hot reload) |
| `npm run build` | Build de production |
| `npm start` | Serveur de production |
| `npm run type-check` | Vérification TypeScript sans build |
| `npm run lint` | Lint ESLint |
| `npm run format` | Formatage Prettier |
| `npm test` | Tests Jest |
| `npm run test:ci` | Tests avec couverture (CI) |

---

## Base de données

### Tables Supabase

| Table | Description |
|-------|-------------|
| `memoir_plans` | Plans générés : `plan_data` (JSON), `quest_progress`, `total_points`, `streak_data`, `combo_state`, `prestige_count` |
| `usage_tracking` | Rate limiting par endpoint : `user_id`, `endpoint`, `date`, `count` |
| `journal_entries` | Entrées du journal de bord |
| `user_streaks` | Données de streak persistées |

### Sécurité

- Row Level Security (RLS) activé sur toutes les tables
- Chaque utilisateur ne peut accéder qu'à ses propres données
- Les clés API Anthropic et Supabase service role restent côté serveur uniquement

---

## <a id="deploiement"></a>Déploiement

### Vercel (production)

Le projet se déploie automatiquement sur Vercel à chaque push sur `main`.

1. Importer le repo GitHub dans [Vercel](https://vercel.com/new)
2. Ajouter les variables d'environnement dans Project Settings → Environment Variables
3. Push sur `main` → déploiement automatique

**Configuration Vercel importante :**
- `maxDuration: 120` sur les routes API d'IA pour éviter les timeouts pendant la génération
- SSE streaming sur `/api/plan` pour maintenir la connexion active pendant la génération du plan

### Supabase

- Configurer Google OAuth dans Authentication → Providers → Google
- Ajouter les redirect URLs : `https://votre-domaine.com/auth/callback` et `http://localhost:3000/auth/callback`
- Site URL dans Authentication → URL Configuration : `https://votre-domaine.com`

---

## Système de gamification

### XP et niveaux

| Difficulté | XP par section |
|------------|----------------|
| Easy | 10 XP |
| Medium | 20 XP |
| Hard | 30 XP |

10 niveaux de progression avec des seuils croissants (niveau 1 = 0 XP → niveau 10 = 1170 XP).

### Mécaniques

- **Streaks** — Travailler chaque jour consécutif augmente le streak. Les jokers permettent de protéger le streak en cas d'absence.
- **Combos** — Compléter des sections en moins de 2h d'intervalle : ×3 = +5 XP bonus, ×5 = +10 XP bonus.
- **Prestige** — Au niveau 10 avec 100% de complétion, possibilité de reset pour recommencer avec un badge prestige.

---

## Conventions de code

- **TypeScript strict** — Pas de `any`, types explicites partout
- **Dashboard** — Inline styles uniquement, palette monochrome `rgba(255,255,255, X)` sur fond `#04030e`
- **Landing page** — Tailwind CSS autorisé
- **Interface** — Intégralement en français
- **Composants** — Functional components avec hooks, pas de class components

---

## Licence

Projet propriétaire — Tous droits réservés.
