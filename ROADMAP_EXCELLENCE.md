# ROADMAP EXCELLENCE — MemoireQuest

> Audit réalisé le 11 février 2026 par une équipe d'élite (Lead Dev, UX Designer, Database Architect)
> Objectif : Transformer MemoireQuest en référence absolue de qualité

---

## TABLEAU DE BORD — SCORES ACTUELS

| Pilier | Score | État |
|--------|-------|------|
| 1. UI & Interface | **17/70 (24%)** | 🔴 CRITIQUE |
| 2. UX & Expérience | **28/70 (40%)** | 🟠 FAIBLE |
| 3. Data & Supabase | **15/70 (21%)** | 🔴 CRITIQUE |
| 4. Analyse IA | **18/70 (26%)** | 🔴 CRITIQUE |
| 5. Code Quality | **22/70 (31%)** | 🔴 CRITIQUE |
| **TOTAL** | **100/350 (29%)** | 🔴 **INSUFFISANT** |

---

## PILIER 1 — UI & INTERFACE

### État actuel

| Aspect | Score | Détail |
|--------|-------|--------|
| Design System | 2/10 | Aucun token, CSS inline ad-hoc |
| Composants | 1/10 | Monolithique (1083 lignes) |
| Responsive | 4/10 | Desktop-first, 1 seul breakpoint |
| Animations | 5/10 | Basiques, micro-interactions manquantes |
| Accessibilité | 1/10 | Aucun ARIA, contrastes insuffisants |

### Faiblesses critiques

#### F1.1 — Aucun Design System
**Fichier** : `Maimoirkouest.jsx:267-286, 418-600`

Couleurs définies dans un objet JS (`const c = {...}`) avec 880+ lignes de CSS inline dans une template string `<style>{css}</style>`. Aucune variable CSS, aucun token de spacing, aucun système typographique standardisé.

```javascript
// État actuel — Couleurs en objet JS, non réutilisables
const c = {
  bg: dk ? "#000000" : "#f5f5f7",
  bgGlass: dk ? "rgba(44,44,46,0.55)" : "rgba(255,255,255,0.65)",
  // ... 20 autres couleurs disséminées
};
```

**Impact** : Maintenance exponentielle. Si on change une couleur, il faut modifier 50+ occurrences.

#### F1.2 — Composant monolithique de 1083 lignes
**Fichier** : `Maimoirkouest.jsx:1-1083`

Tout est dans une seule fonction : navbar, hero, cards, modales, dashboard, sidebar, tasks. Aucun composant React extrait (Button, Card, Modal, TaskItem...).

#### F1.3 — Responsive Desktop-First avec 1 breakpoint
**Fichier** : `Maimoirkouest.jsx:589-599`

Une seule media query `@media(max-width:768px)`. Sidebar masquée brutalement avec `display:none`. Aucun breakpoint pour petits mobiles (320px), tablettes (1024px), ou safe-area iOS.

#### F1.4 — Accessibilité quasi-absente
- **0 aria-label** sur les boutons (thème, navigation, tasks)
- **0 aria-expanded** sur les task items expand/collapse
- **0 focus-visible** states
- Contraste tertiaire `rgba(255,255,255,0.3)` = **ratio 2.5:1** (WCAG AA exige 4.5:1)
- Input fichier `display:none` = inaccessible au clavier
- Aucune balise sémantique (`<nav>`, `<main>`, `<aside>`)

#### F1.5 — Footer détecte le thème par MutationObserver
**Fichier** : `Footer.jsx:9-26`

Le Footer observe la couleur de fond du `.root` via `getComputedStyle` + `MutationObserver` + `setInterval(1s)` au lieu d'utiliser un Context React.

### Solutions Gold Standard

| Faiblesse | Solution | Effort |
|-----------|----------|--------|
| F1.1 | **Tailwind CSS** + design tokens centralisés (`theme.ts`) | 3j |
| F1.2 | Extraire 10+ composants : Button, Card, Modal, TaskItem, Sidebar, Hero, NavBar... | 3j |
| F1.3 | Approche **Mobile-First** avec breakpoints `sm:640px md:768px lg:1024px xl:1280px` | 2j |
| F1.4 | Audit WCAG AA complet : ARIA labels, focus states, contrastes ≥4.5:1, sémantique HTML | 2j |
| F1.5 | `ThemeContext` partagé entre tous les composants | 0.5j |

---

## PILIER 2 — UX & EXPÉRIENCE

### État actuel

| Aspect | Score | Détail |
|--------|-------|--------|
| Parcours utilisateur | 5/10 | Flow OK mais auth bloque |
| Performance perçue | 3/10 | Fake progress bar, pas de skeleton |
| Gestion erreurs | 3/10 | Messages génériques, pas de retry |
| Feedback utilisateur | 5/10 | Progress OK mais pas de célébration |
| Gestion état | 3/10 | 27 useState, risque perte données |

### Faiblesses critiques

#### F2.1 — Race condition Auth → Onboarding
**Fichier** : `Maimoirkouest.jsx:708, 318-321`

```javascript
onClick={()=>{
  if(!user){
    signInWithGoogle();  // Lance OAuth mais ne redirige pas
    return;              // L'utilisateur doit re-cliquer après login
  }
  setPage("onboard");
}}
```

Après le redirect OAuth, l'utilisateur revient sur la landing page et doit re-cliquer.

#### F2.2 — Fausse barre de progression
**Fichier** : `Maimoirkouest.jsx:334-339`

```javascript
prog += Math.random() * 3 + 0.5;  // Incréments aléatoires
if (prog > 90) prog = 90;          // Plafond à 90%
```

Si l'API prend 5 min, la barre reste à 90% pendant 4min40. Aucun timeout client.

#### F2.3 — Pas de distinction Plan IA vs Fallback
**Fichier** : `Maimoirkouest.jsx:387-391, 653-654`

Si l'analyse IA échoue, le fallback générique est utilisé sans que l'utilisateur sache qu'il n'a pas un plan personnalisé. Le badge "✦ IA" disparaît silencieusement.

#### F2.4 — Perte de données sur fermeture
**Fichier** : `Maimoirkouest.jsx:234-236`

Auto-save débounced à 800ms. Si l'utilisateur ferme l'onglet pendant le timeout → **données perdues**. Aucun `beforeunload` flush.

#### F2.5 — Cookie consent irréversible
**Fichier** : `Maimoirkouest.jsx:129-133, 248`

Si l'utilisateur refuse les cookies, il ne peut plus jamais se connecter. Aucune UI pour changer d'avis. Le message dit "Rechargez la page" mais les données locales sont perdues.

#### F2.6 — Aucune célébration de progression
Pas de micro-interaction au clic des checkboxes. Pas de message à 100%. Les steps apparaissent/disparaissent sans animation.

#### F2.7 — Écran de chargement = noir avec spinner
**Fichier** : `Maimoirkouest.jsx:612-636`

Aucun skeleton screen. L'utilisateur voit un écran noir pendant le chargement des données.

### Solutions Gold Standard

| Faiblesse | Solution | Effort |
|-----------|----------|--------|
| F2.1 | Montrer onboarding AVANT l'auth. Auth au moment de l'analyse seulement | 1j |
| F2.2 | **Server-Sent Events (SSE)** pour progress réel + timeout client 120s | 2j |
| F2.3 | State `analysisSource: "ai" \| "fallback"` avec badges distincts | 0.5j |
| F2.4 | `window.beforeunload` + flush synchrone de la sauvegarde | 0.5j |
| F2.5 | Bouton permanent "Préférences cookies" dans le footer/nav | 0.5j |
| F2.6 | CSS `@keyframes checkBounce` + confetti micro-animation | 1j |
| F2.7 | **Skeleton screens** du layout (sidebar + main content) | 1j |

---

## PILIER 3 — DATA & SUPABASE

### État actuel

| Aspect | Score | Détail |
|--------|-------|--------|
| Sécurité (RLS) | 1/10 | **AUCUNE RLS** — accès non autorisé possible |
| Architecture données | 2/10 | Schema implicite, tout en JSONB |
| Authentification | 4/10 | OAuth OK mais pas de refresh JWT |
| Intégrité données | 2/10 | Aucune validation serveur |
| RGPD | 5/10 | Pages légales OK mais portabilité absente |

### Faiblesses critiques

#### F3.1 — 🔴 AUCUNE Row Level Security (RLS)
**Fichier** : `supabase.js:1-6`

```javascript
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
// Clé ANON publique dans le bundle JS
// AUCUNE politique RLS sur user_progress
```

**Tout utilisateur authentifié peut potentiellement lire les données d'autres utilisateurs** via l'API Supabase directe. C'est la faille de sécurité la plus critique du projet.

#### F3.2 — Lost Updates (conflits multi-onglets)
**Fichier** : `Maimoirkouest.jsx:215`

```javascript
.upsert(dataToSave, { onConflict: 'user_id' });
// Dernière écriture gagne → données de l'autre onglet perdues
```

#### F3.3 — Pas de validation serveur des données
Aucune validation Zod/Joi lors de la sauvegarde. Un attaquant peut écrire n'importe quoi dans `user_progress`.

#### F3.4 — Tokens JWT sans refresh automatique
**Fichier** : `Maimoirkouest.jsx:136-159`

Le client Supabase n'a pas `autoRefreshToken: true`. Après 1h, le token expire silencieusement.

#### F3.5 — Pas de versioning des analyses
Chaque nouvelle analyse écrase l'ancienne. Impossible de revenir à un plan précédent.

#### F3.6 — Suppression hard delete uniquement
**Fichier** : `Maimoirkouest.jsx:672, 877`

```javascript
await supabase.from('user_progress').delete().eq('user_id', user.id);
// Irréversible, pas d'audit trail
```

#### F3.7 — Droit à la portabilité non implémenté
La politique de confidentialité promet l'export de données (art. 20 RGPD) mais aucun endpoint `/api/export` n'existe.

### Solutions Gold Standard

| Faiblesse | Solution | Effort |
|-----------|----------|--------|
| F3.1 | **RLS immédiate** : `ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY` + policy `auth.uid() = user_id` | 1j |
| F3.2 | Colonne `version INT` + Compare-And-Set (CAS) sur chaque update | 2j |
| F3.3 | Validation **Zod** côté serveur (schema strict pour `user_progress`) | 2j |
| F3.4 | `createClient(url, key, { auth: { autoRefreshToken: true } })` | 0.5j |
| F3.5 | Table `user_analysis_history` avec `is_active BOOLEAN` | 2j |
| F3.6 | Soft delete (`deleted_at TIMESTAMP`) + CRON hard delete après 30j | 1j |
| F3.7 | Endpoint `GET /api/user/export` retournant JSON structuré | 1j |

### SQL urgente à exécuter

```sql
-- PRIORITÉ P0 : Activer RLS maintenant
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own data"
ON user_progress FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- PRIORITÉ P0 : Index sur user_id
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id
ON user_progress(user_id);
```

---

## PILIER 4 — ANALYSE IA

### État actuel

| Aspect | Score | Détail |
|--------|-------|--------|
| Prompt Engineering | 2/10 | Prompt générique, pas de spécialisation domaine |
| Qualité analyse | 3/10 | Pas de validation JSON, pas de schema |
| Rate Limiting | 3/10 | In-memory Map, contournable |
| Résilience | 4/10 | Pas de retry, fallback basique |
| Coûts | 2/10 | ~15c/req, pas de caching, budget illimité |

### Faiblesses critiques

#### F4.1 — Prompt identique pour tous les domaines
**Fichier** : `route.js:73-106`

Le system prompt est le même pour IT, Marketing, RH, Finance, Droit. Il mentionne le domaine mais ne fournit aucune méthodologie spécifique (pas de PESTEL pour marketing, pas de SOLID pour IT, etc.).

#### F4.2 — Aucune validation du JSON retourné
**Fichier** : `route.js:138`

```javascript
try { parsed = JSON.parse(raw); }
catch {
  const match = raw.match(/\{[\s\S]*\}/);  // Regex loose
  if (match) parsed = JSON.parse(match[0]);
}
```

Aucune validation de schema. Si l'IA retourne un JSON syntaxiquement valide mais structurellement incorrect → crash runtime côté client.

#### F4.3 — Rate limiting in-memory contournable
**Fichier** : `route.js:4-19`

```javascript
const rateLimit = new Map();  // Reset au redémarrage serveur
// Contournable avec VPN (par IP)
// Pas de rate limit par utilisateur
```

#### F4.4 — `/api/analyze` sans authentification
**Fichier** : `route.js:35`

N'importe qui peut appeler l'endpoint → **coûts API Anthropic illimités**. À 5 req/min = **$1080/jour** potentiel.

#### F4.5 — Injection de prompt possible
Le texte utilisateur est envoyé directement au modèle sans sanitization. Un utilisateur peut inclure "Ignore all previous instructions..." dans son document.

#### F4.6 — Pas de retry sur erreurs API
Si l'API Claude retourne 429 ou 500, l'erreur est immédiatement propagée au client. Aucun backoff exponentiel.

#### F4.7 — Images acceptées mais jamais traitées
Le formulaire accepte PNG/JPG mais le backend ne traite que les PDF et le texte. UX confuse.

### Solutions Gold Standard

| Faiblesse | Solution | Effort |
|-----------|----------|--------|
| F4.1 | **6 prompts spécialisés** avec méthodologies par domaine + chain-of-thought | 2j |
| F4.2 | Validation **Zod** du JSON retourné + merge fallback si partiel | 1j |
| F4.3 | **Redis** pour rate limiting distribué + rate limit par user_id | 2j |
| F4.4 | **Auth obligatoire** sur `/api/analyze` (vérifier JWT serveur) | 1j |
| F4.5 | Sanitization input + structured prompting (`<user_document>...</user_document>`) | 1j |
| F4.6 | Retry avec **backoff exponentiel** (3 tentatives, respect `Retry-After`) | 1j |
| F4.7 | Soit rejeter les images (message clair), soit utiliser Claude Vision | 0.5j |

### Optimisations coûts

```
Avant : ~15c/requête (Sonnet, 8K tokens, pas de cache)
Après : ~3-5c/requête avec :
  - Haiku pour textes courts (<2000 chars)
  - max_tokens réduit à 4096
  - Cache Redis (TTL 7j, ~50-70% hit rate estimé)
  - Budget cap par utilisateur (10 analyses/jour)
→ Économie estimée : 66-80%
```

---

## PILIER 5 — CODE QUALITY

### État actuel

| Aspect | Score | Détail |
|--------|-------|--------|
| Architecture Next.js | 5/10 | App Router OK mais Client Component monolithique |
| Séparation responsabilités | 2/10 | 1 fichier = 1083 lignes |
| TypeScript | 0/10 | **Absent** |
| Tests | 0/10 | **Aucun** |
| Linting/Formatting | 0/10 | Ni ESLint, ni Prettier |
| Sécurité OWASP | 4/10 | `/api/analyze` non protégé |
| Performance | 5/10 | Pas de code splitting, pas de memoization |
| DX | 3/10 | Pas de docs, pas de CI/CD |

### Faiblesses critiques

#### F5.1 — Fichier monolithique de 1083 lignes
**Fichier** : `Maimoirkouest.jsx`

27 `useState` dans une seule fonction. Impossible à tester, difficile à maintenir.

#### F5.2 — Zéro TypeScript
Aucun typage. Les props, les réponses API, le state — tout est `any` implicite. Erreurs découvertes uniquement en production.

#### F5.3 — Zéro test
Aucun test unitaire, d'intégration, ou E2E. Toute refactorisation est un risque de régression.

#### F5.4 — 27 useState non structurés
```javascript
const [mode, setMode] = useState("dark");
const [page, setPage] = useState("landing");
// ... 25 autres useState
```

États liés mais indépendants (ex: `analyzing`, `analyzeStatus`, `progress`, `aiError`). Race conditions possibles.

#### F5.5 — `/api/analyze` non authentifié
Faille de sécurité la plus critique côté code : **n'importe qui peut déclencher des appels API Anthropic** sans être connecté.

#### F5.6 — Hydration fragile (écran noir)
**Fichier** : `Maimoirkouest.jsx:605-609`

```javascript
if (!mounted) {
  return <div style={{ minHeight: "100vh", background: "#000" }} />;
}
```

Écran noir le temps de l'hydration. Pas de Suspense boundary ni streaming SSR.

### Solutions Gold Standard

#### Architecture cible

```
app/
├── components/
│   ├── Maimoirkouest.tsx     (wrapper ~100 lignes)
│   ├── Landing.tsx
│   ├── Onboarding.tsx
│   ├── Dashboard.tsx
│   ├── dialogs/
│   │   ├── AnalysisOverlay.tsx
│   │   └── SignInPrompt.tsx
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   └── Stats.tsx
│   ├── sidebar/
│   │   ├── QuestList.tsx
│   │   └── ProgressRing.tsx
│   └── tasks/
│       ├── TaskCard.tsx
│       └── StepChecker.tsx
├── context/
│   ├── ThemeContext.tsx
│   └── AppContext.tsx          (useReducer central)
├── hooks/
│   ├── useTheme.ts
│   ├── useUserData.ts
│   └── useAnalysis.ts
├── lib/
│   ├── supabase.ts
│   ├── validation.ts          (schemas Zod)
│   └── logger.ts              (Sentry)
├── styles/
│   └── design-tokens.ts
├── types/
│   └── index.ts               (Quest, Task, Step, UserProgress...)
└── api/
    ├── analyze/route.ts
    └── user/
        ├── progress/route.ts   (CRUD via server middleware)
        └── export/route.ts     (RGPD art. 20)
```

#### Tooling à installer

```bash
# TypeScript
npx tsc --init --strict

# Linting
npm install -D eslint eslint-config-next prettier eslint-config-prettier

# Tests
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D playwright  # E2E

# Validation
npm install zod

# Monitoring
npm install @sentry/nextjs

# CSS
npm install -D tailwindcss postcss autoprefixer
```

#### CI/CD pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '18' }
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test -- --coverage
      - run: npm run build
```

---

## PLAN D'ACTION — SPRINTS PRIORITISÉS

### 🔴 Sprint 1 — SÉCURITÉ (Semaine 1) — 5 jours

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 1 | Activer RLS sur `user_progress` | 1j | Bloque accès non autorisé |
| 2 | Authentifier `/api/analyze` (vérifier JWT serveur) | 1j | Protège budget API |
| 3 | Ajouter validation Zod côté serveur | 1j | Empêche données corrompues |
| 4 | `autoRefreshToken: true` sur client Supabase | 0.5j | Sessions stables |
| 5 | Sanitization des inputs IA (prompt injection) | 1j | Sécurité prompt |
| 6 | `beforeunload` flush pour sauvegarde | 0.5j | Pas de perte données |

### 🟠 Sprint 2 — ARCHITECTURE (Semaine 2-3) — 8 jours

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 7 | Extraire composants React (10+ fichiers) | 3j | Maintenabilité |
| 8 | Implémenter `useReducer` + `AppContext` | 2j | État centralisé |
| 9 | Installer Tailwind CSS + design tokens | 2j | Design System |
| 10 | Créer `ThemeContext` (supprimer MutationObserver du Footer) | 0.5j | Architecture propre |
| 11 | Responsive Mobile-First (4 breakpoints) | 0.5j | UX mobile |

### 🟡 Sprint 3 — QUALITÉ IA (Semaine 3-4) — 6 jours

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 12 | 6 prompts spécialisés par domaine | 2j | Qualité analyse |
| 13 | Validation Zod du JSON retourné par l'IA | 1j | Fiabilité |
| 14 | Retry + backoff exponentiel | 1j | Résilience |
| 15 | Rate limiting Redis (par user_id) | 1j | Anti-abus |
| 16 | Cache analyses (Redis, TTL 7j) | 1j | Coûts -70% |

### 🔵 Sprint 4 — UX POLISH (Semaine 4-5) — 5 jours

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 17 | Skeleton screens au chargement | 1j | Performance perçue |
| 18 | Micro-animations (checkboxes, tasks expand) | 1j | Engagement |
| 19 | Distinction claire IA vs Fallback | 0.5j | Transparence |
| 20 | Fix flow Auth → Onboarding (auth lazy) | 1j | Zéro friction |
| 21 | SSE pour progression analyse réelle | 1.5j | Feedback honnête |

### 🟣 Sprint 5 — TYPESCRIPT & TESTS (Semaine 5-7) — 10 jours

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 22 | Migration TypeScript strict | 5j | Sécurité types |
| 23 | Tests unitaires (hooks, utils, validation) | 2j | Couverture base |
| 24 | Tests intégration (flows critiques) | 2j | Régression |
| 25 | CI/CD pipeline (GitHub Actions) | 1j | Automatisation |

### ⚪ Sprint 6 — CONFORMITÉ & DX (Semaine 7-8) — 5 jours

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 26 | Accessibilité WCAG AA complète | 2j | Inclusivité |
| 27 | Endpoint export RGPD (`/api/user/export`) | 1j | Conformité art. 20 |
| 28 | Soft delete + versioning analyses | 1j | Audit trail |
| 29 | ESLint + Prettier + Sentry | 0.5j | DX |
| 30 | Documentation (README, ARCHITECTURE, API) | 0.5j | Onboarding devs |

---

## ESTIMATION GLOBALE

| Phase | Durée | Résultat |
|-------|-------|----------|
| Sprint 1 (Sécurité) | 1 semaine | Score Data : 1/10 → 7/10 |
| Sprint 2 (Architecture) | 2 semaines | Score UI/Code : 2/10 → 6/10 |
| Sprint 3 (Qualité IA) | 1 semaine | Score IA : 2/10 → 7/10 |
| Sprint 4 (UX Polish) | 1 semaine | Score UX : 4/10 → 8/10 |
| Sprint 5 (TS & Tests) | 2 semaines | Score Code : 3/10 → 8/10 |
| Sprint 6 (Conformité) | 1 semaine | Score global → 9/10 |
| **TOTAL** | **~8 semaines** | **Score : 29% → 90%+** |

---

## RISQUES D'INACTION

| Risque | Probabilité | Impact |
|--------|-------------|--------|
| Accès données autres users (pas de RLS) | **Haute** | 🔴 Violation RGPD, amende CNIL |
| Facture API explosive (pas d'auth) | **Haute** | 🔴 $1000+/jour |
| Perte données utilisateur | **Moyenne** | 🟠 30-50% de perte sur fermeture |
| Injection de prompt | **Moyenne** | 🟠 Contenu inapproprié |
| Inaccessibilité (WCAG) | **Certaine** | 🟠 Exclusion utilisateurs |

---

## PRIORITÉS IMMÉDIATES (Cette semaine)

1. **🔴 JOUR 1** : Activer RLS Supabase (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)
2. **🔴 JOUR 1** : Authentifier `/api/analyze`
3. **🔴 JOUR 2** : `autoRefreshToken: true` + `beforeunload` flush
4. **🟠 JOUR 3** : Validation Zod entrées/sorties
5. **🟠 JOUR 4-5** : Sanitization prompt + rate limiting robuste

---

> **Ce document sert de référence pour la transformation de MemoireQuest.**
> Aucune modification de code n'a été effectuée. Ce plan attend validation avant implémentation.
