# maimouarkwest

**L'assistant IA qui transforme ton cahier des charges en plan de mémoire actionnable.**

maimouarkwest analyse le cahier des charges PDF de l'étudiant en alternance, génère un plan de rédaction structuré avec des conseils méthodologiques, puis gamifie la rédaction avec un système de quêtes, XP, streaks et niveaux.

## Fonctionnalités

- **Analyse IA du cahier des charges** — Upload PDF, extraction intelligente des métadonnées (niveau, discipline, structure imposée), génération d'un plan personnalisé via Claude API en streaming SSE
- **Plan de rédaction structuré** — Chapitres, sections, sous-tâches actionnables avec difficulté graduée (easy/medium/hard) et conseils ciblés par section
- **Gamification complète** — XP par tâche, système de niveaux, streaks quotidiens, combos, prestige (reset au niveau max)
- **Outils de productivité** — Pomodoro intégré, mode Focus immersif, pense-bêtes, journal de bord
- **Authentification Google** — Connexion sécurisée via Supabase Auth, progression sauvegardée en cloud

## Stack

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 14 (App Router), TypeScript strict |
| Auth & DB | Supabase (PostgreSQL, Google OAuth, RLS) |
| IA | Anthropic Claude API (streaming SSE) |
| Hosting | Vercel |
| Style | Design system monochrome, inline styles |

## Démarrage

```bash
npm install
cp .env.example .env.local  # Configurer les clés
npm run dev                  # http://localhost:3000
```

### Variables d'environnement requises

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Clé API Anthropic |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase |

## Licence

Projet propriétaire — Tous droits réservés.
