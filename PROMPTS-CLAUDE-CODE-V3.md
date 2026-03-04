# Prompts Claude Code — maimouarkwest Batch V3

> **IMPORTANT** : Tu es Claude Code. Tu codes directement. Lis `CLAUDE.md` à la racine pour le contexte projet. Design monochrome : `rgba(255,255,255,X)` en dark, `rgba(0,0,0,X)` en light. Accent color UNIQUEMENT sur XP bars + DotGrid. Inline styles dans le dashboard, Tailwind sur la landing. Interface 100% en français. Active des sous-agents parallèles quand c'est possible.

---

## PROMPT 1 — Renommage global : maimouarkwest (anciennement MemoireQuest)

### Contexte
Le nom du projet affiché doit être **maimouarkwest** partout (UI, titres, metadata, footer, docs). Le nom du repo GitHub reste inchangé (pas de rename repo), mais tout le texte visible par l'utilisateur doit changer.

### Sous-agent A — Code source (UI visible)
Fichiers à modifier :
1. **`app/layout.tsx`** ligne ~10 : `title: "maimouarkwest — Ton mémoire, structuré par l'IA"` ✅ FAIT
2. **`app/page.tsx`** ligne ~19 : `maimouarkwest · Thesis OS v1.0` ✅ FAIT
3. **`src/components/dashboard/new/NewDashboard.tsx`** ligne ~800 : dans le logo sidebar → `maimouarkwest` ✅ FAIT
4. **`preview-landing.html`** : titre + footer → `maimouarkwest` ✅ FAIT
5. **`preview-tips.html`** et **`preview-subtasks.html`** et **`preview-apple-animations.html`** : div `.logo` → `maimouarkwest` ✅ FAIT
6. **`dashboard-mockup.jsx`** ligne ~433

### Sous-agent B — Fichiers de documentation
Remplacer dans : `CLAUDE.md`, `README.md`, `BRIEFING-CLAUDE-CHAT.md`, `SPECS.md`, `DESIGN_SYSTEM.md`, `ROADMAP_EXCELLENCE.md`, `DEPLOYMENT.md`, `DEPLOYMENT_LOCK.md`, `SESSION_CHECKPOINT.md`

**Règle** : remplacer vers `maimouarkwest` dans le texte. Les chemins filesystem (`cd ~/Desktop/MemoireQuest`) et URLs GitHub restent inchangés car le repo s'appelle encore MemoireQuest.

### Sous-agent C — Fichiers légaux + config
1. **`app/cgu/page.js`**, **`app/privacy/page.js`**, **`app/mentions-legales/page.js`** : vérifier que le texte affiche "maimouarkwest" ✅ FAIT
2. **`package.json`** ligne 2 : `"name": "maimouarkwest"` ✅ FAIT
3. **`app/api/user/export/route.ts`** : → "maimouarkwest" ✅ FAIT
4. **`app/api/user/save/route.ts`** : commentaire → maimouarkwest ✅ FAIT
5. **`supabase/migrations_v2_production.sql`** : commentaire → maimouarkwest

### Vérification
Après tous les changements, lance : `grep -ri "memoirequest\|maimoirkouest" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" --include="*.md" --include="*.html" --include="*.json" --include="*.sql" . | grep -v node_modules | grep -v .next | grep -v ".git/"`

Le résultat doit contenir UNIQUEMENT des chemins filesystem (ex: `cd ~/Desktop/MemoireQuest`) et des URLs GitHub — jamais du texte UI.

---

## PROMPT 2 — Renommer la page Achievements + différencier de Progression

### Contexte
La page Achievements affiche "Progression" comme titre (ligne 141 de `AchievementsView.tsx`), ce qui est identique à la page Progression. Il faut différencier clairement les deux.

### Changements
1. **`src/components/dashboard/new/AchievementsView.tsx`** ligne ~141 : `>Progression</h1>` → `>Trophées</h1>`
2. **`src/components/dashboard/new/NewDashboard.tsx`** ligne ~585 dans le tableau `NAV` : `{ icon: '◇', label: 'Achievements', view: 'achievements' }` → `{ icon: '◇', label: 'Trophées', view: 'achievements' }`

---

## PROMPT 3 — Sidebar rétractable (style Claude / ChatGPT)

### Contexte
La sidebar fait 216px fixe. On veut pouvoir la rétracter pour gagner de la place, comme sur Claude.ai ou ChatGPT.

### Changements dans `NewDashboard.tsx`

1. **Ajouter un state** :
```tsx
const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
```

2. **Modifier le `<aside>`** (ligne ~780) :
```tsx
<aside style={{
  width: sidebarCollapsed ? 56 : 216,
  flexShrink: 0, height: '100vh',
  position: 'relative', zIndex: 10,
  display: 'flex', flexDirection: 'column',
  background: 'var(--mq-sidebar-bg)',
  backdropFilter: 'blur(32px) saturate(180%)',
  WebkitBackdropFilter: 'blur(32px) saturate(180%)',
  borderRight: '1px solid var(--mq-border)',
  transition: 'width 0.3s cubic-bezier(.4,0,.2,1)',
  overflow: 'hidden',
}}>
```

3. **Bouton toggle** : Ajouter juste après le `<div>` du logo (après ligne ~805) un bouton chevron :
```tsx
<button
  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
  style={{
    position: 'absolute', top: 28, right: -12, zIndex: 20,
    width: 24, height: 24, borderRadius: '50%',
    background: 'var(--mq-card-bg)',
    border: '1px solid var(--mq-border)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', fontSize: 10,
    color: tw(0.5, textIntensity, isDark),
    transition: 'transform 0.3s cubic-bezier(.4,0,.2,1)',
    transform: sidebarCollapsed ? 'rotate(180deg)' : 'none',
  }}
>
  ‹
</button>
```

4. **Conditionner le texte** : Quand `sidebarCollapsed` est true, n'afficher que les icônes (pas les labels). Dans le bloc logo, masquer le texte. Dans le bloc avatar, masquer le nom et la barre XP. Dans la nav, masquer `{item.label}`.

**Style collapsed** : icônes centrées, 56px de large, tooltip on hover avec le label.

5. **Persistance** : Sauvegarder `sidebarCollapsed` dans localStorage :
```tsx
useEffect(() => {
  const saved = localStorage.getItem('mq-sidebar-collapsed')
  if (saved === 'true') setSidebarCollapsed(true)
}, [])
useEffect(() => {
  localStorage.setItem('mq-sidebar-collapsed', String(sidebarCollapsed))
}, [sidebarCollapsed])
```

### Contraintes
- Transition fluide width 216 → 56px avec `cubic-bezier(.4,0,.2,1)`
- En collapsed : pas de texte, juste les icônes centrées + bouton toggle
- Le contenu principal doit s'étendre automatiquement (il est en `flex: 1`)
- Monochrome : pas de couleur sur le bouton toggle

---

## PROMPT 4 — MemoireView redesign : scroll TikTok par section

### Contexte
La page "Mon mémoire" (`MemoireView.tsx`) est trop chargée. L'utilisateur veut un système où cliquer sur une section l'affiche en plein écran, et on navigue entre sections avec un scroll vertical (style TikTok/Instagram stories).

### Architecture
Remplacer le contenu actuel de `MemoireView.tsx` par deux modes :

**Mode 1 — Vue d'ensemble (par défaut)** :
- Liste compacte des chapitres avec leur progression
- Chaque chapitre est cliquable → ouvre le Mode 2
- Design : cards minimalistes, une ligne par chapitre

**Mode 2 — Vue immersive (scroll TikTok)** :
- Quand on clique sur un chapitre, on entre dans la vue immersive
- Chaque **section** du chapitre occupe 100% de la hauteur visible (`height: 100vh` du conteneur)
- Scroll vertical avec `scroll-snap-type: y mandatory` + `scroll-snap-align: start`
- Navigation : scroll molette OU flèches haut/bas OU boutons Précédent/Suivant
- Indicateur de position : petits dots sur le côté droit (comme les stories Instagram)
- Bouton "retour" en haut à gauche pour revenir au Mode 1

**Contenu de chaque "slide" section** :
- Numéro de section + titre en grand
- Difficulté (badge)
- Hint/conseil du chapitre (si présent dans `tips`)
- Liste des sous-tâches avec checkboxes
- Bouton "Valider cette section" (appelle `onQuestComplete`)
- Si section déjà complétée : état "done" avec checkmark

### Code structure
```tsx
const [immersiveChapter, setImmersiveChapter] = useState<string | null>(null)

// Si immersiveChapter est null → afficher la vue d'ensemble
// Sinon → afficher le scroll TikTok pour ce chapitre
```

### Scroll snap CSS (inline dans le composant)
```tsx
// Conteneur
style={{
  height: '100%',
  overflowY: 'auto',
  scrollSnapType: 'y mandatory',
  scrollBehavior: 'smooth',
}}

// Chaque section-slide
style={{
  height: '100%',
  scrollSnapAlign: 'start',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: '40px',
}}
```

### Dots indicateur (côté droit)
```tsx
// Position fixed dans le conteneur, côté droit
<div style={{
  position: 'absolute', right: 16, top: '50%',
  transform: 'translateY(-50%)',
  display: 'flex', flexDirection: 'column', gap: 8,
}}>
  {sections.map((_, i) => (
    <div key={i} style={{
      width: 6, height: 6, borderRadius: '50%',
      background: i === currentIndex ? tw(0.8, textIntensity, isDark) : tw(0.15, textIntensity, isDark),
      transition: 'all 0.3s ease',
    }} />
  ))}
</div>
```

### Contraintes
- Monochrome uniquement (pas de couleurs sauf accent sur les barres XP)
- `tw()` et `bg()` avec `isDark` partout
- Smooth scroll + snap obligatoire
- Keyboard navigation : ArrowUp/ArrowDown pour changer de section
- Animation de transition fluide entre Mode 1 et Mode 2
- Le bouton "Valider" doit appeler `onQuestComplete(chapterNumber, sectionIndex)`
- Les sous-tâches doivent appeler `onSubtaskToggle(chapterNumber, sectionIndex, taskIndex)`

---

## PROMPT 5 — Fix CRITIQUE : Deadline dans le prompt IA

### Contexte URGENT
J'ai découvert un problème GRAVE. Dans `NewDashboard.tsx` (lignes ~627-631), la deadline est **inventée** :
```tsx
const deadlineDate = useMemo(() => {
  const d = new Date(startDate)
  d.setMonth(d.getMonth() + 9)
  return d
}, [startDate])
```
Ça crée une deadline fictive de startDate + 9 mois. L'utilisateur a raison : **l'IA ne doit jamais inventer de deadline**.

### Solution en 3 étapes

#### Étape 1 — Modifier le Zod schema dans `/api/plan/route.ts`
Ajouter un champ `deadline` optionnel au schema :
```tsx
const MemoirePlanSchema = z.object({
  title: z.string(),
  deadline: z.string().nullable().optional(), // format "YYYY-MM-DD" ou null si pas trouvé
  chapters: z.array(ChapterSchema).min(2).max(15),
})
```

#### Étape 2 — Modifier le SYSTEM_PROMPT dans `/api/plan/route.ts`
Ajouter dans les instructions :
```
DEADLINE / DATE DE RENDU :
- Cherche ATTENTIVEMENT dans le document toute mention de date de rendu, deadline, date limite, date de soutenance, date de remise.
- Si une date est trouvée, inclus-la dans le champ "deadline" au format "YYYY-MM-DD".
- Si AUCUNE date n'est mentionnée dans le document, mets "deadline": null.
- NE JAMAIS inventer une date. Si tu n'es pas sûr, mets null.
- Vérifie DEUX FOIS avant de répondre : la date que tu mets vient-elle EXACTEMENT du document ?
```

Mettre à jour le schema JSON dans le prompt pour inclure `"deadline": "YYYY-MM-DD" | null`.

#### Étape 3 — Modifier le frontend
Dans `NewDashboard.tsx` :
```tsx
const deadlineDate = useMemo(() => {
  // Priorité 1 : deadline du plan (extraite du PDF)
  if (plan?.deadline) {
    const d = new Date(plan.deadline)
    if (!isNaN(d.getTime())) return d
  }
  // Priorité 2 : pas de deadline trouvée → ne pas en afficher
  return null
}, [plan])
```

Partout où `deadlineDate` est utilisé, gérer le cas `null` :
- `ProgressionView` : si `deadlineDate` est null, ne pas afficher la section "Temps" et la prédiction de rythme. Afficher à la place : "Aucune deadline détectée dans ton cahier des charges."
- `DotGrid` : ne pas afficher si `deadlineDate` est null
- `StatPill "Temps"` : remplacer par "Temps : —" si pas de deadline

#### Étape 4 — Mettre à jour les types
Dans `src/types/memoir.ts`, ajouter `deadline?: string | null` au type `MemoirePlan`.

#### Étape 5 — Migration Supabase
La colonne `memoir_plans` stocke le plan en JSON, donc pas de migration nécessaire. Le champ `deadline` sera simplement inclus dans le JSON.

### Vérification
1. `npx tsc --noEmit` doit passer
2. Le mot "deadline" ne doit apparaître nulle part dans le code avec une valeur inventée/hardcodée
3. Si `plan.deadline` est null, aucune date fictive ne doit être affichée

---

## PROMPT 6 — Page Progression : tout sur un écran + overlays

### Contexte
La page `ProgressionView.tsx` déborde de l'écran. L'objectif : tout faire tenir en une page, ou utiliser des overlays interactifs pour les détails.

### Solution proposée : layout compact + overlays

#### Layout principal (tout visible sans scroll)
Réorganiser en grille 2x2 :
```
┌──────────────┬──────────────┐
│  Stats pills │  Prédiction  │
│  (4 values)  │  de rythme   │
├──────────────┼──────────────┤
│  Chapitres   │  Streak +    │
│  (compact)   │  Difficulté  │
└──────────────┴──────────────┘
```

#### Changements
1. **Stats pills** : Réduire le padding (14px → 10px), font-size du value (28 → 22), et les mettre en grid 2x2 au lieu d'une ligne
2. **Prédiction de rythme** : Garder compact, même taille que les stats
3. **Chapitres** : Au lieu de la liste complète, afficher une mini progress-bar par chapitre en horizontal (barres empilées, style GitHub contribution graph). Cliquer sur un chapitre → overlay avec détails
4. **Streak + Difficulté** : Fusionner dans un seul bloc compact

#### Overlay (quand on clique sur un chapitre)
```tsx
// Overlay modal (comme le SidePanel existant)
// Apparaît au centre avec backdrop blur
// Contient : titre du chapitre, liste des sections, progression détaillée
// Bouton fermer ✕
```

#### Contraintes
- `height: '100%'` sur le conteneur principal, `overflow: 'hidden'` (PAS de scroll)
- Grid responsive qui tient en 100% de la hauteur
- Monochrome, `tw()` et `bg()` avec `isDark`
- Transitions fluides sur les overlays

---

## PROMPT 7 — Propositions d'interactivité (à implémenter)

### Contexte
L'app manque d'interactivité. Voici les features à ajouter :

### 7A — Raccourcis clavier
Dans `NewDashboard.tsx`, ajouter un `useEffect` avec un event listener `keydown` :
- `1` / `2` / `3` / `4` : switch entre les 4 vues (dashboard, mémoire, progression, trophées)
- `[` / `]` : collapse/expand sidebar
- `Escape` : fermer tout overlay/panel ouvert
- `?` : afficher un overlay "raccourcis clavier" (liste tous les raccourcis)

### 7B — Drag & drop pour réordonner les chapitres
Dans la vue Mémoire (Mode 1 — vue d'ensemble), permettre de réordonner les chapitres par drag & drop. Utiliser l'API native HTML5 Drag & Drop (pas de lib externe). L'ordre est sauvegardé dans `localStorage`.

### 7C — Animations micro-interactions
Ajouter des micro-animations :
- Quand une section est validée : le bouton pulse brièvement (`scale(1.05)` pendant 200ms)
- Quand un badge est débloqué : glow effect sur la carte du badge
- Quand le streak augmente : petit bounce sur le compteur

### 7D — Mode focus
Bouton "Mode focus" dans la sidebar (ou raccourci `F`) :
- Masque tout sauf la section en cours de travail
- Plein écran avec juste le contenu de la section + bouton valider
- Timer pomodoro optionnel (25min) en haut à droite
- Sortie avec `Escape`

### Contraintes pour tout le prompt 7
- Monochrome uniquement
- `tw()` et `bg()` avec `isDark` partout
- Pas de lib externe (vanilla JS/React seulement)
- Transitions fluides avec `cubic-bezier(.4,0,.2,1)`

---

## PROMPT 8 — Sous-agents : organisation d'exécution

### Ordre recommandé

**Phase 1 — Parallèle (pas de dépendances entre eux) :**
- Sous-agent A : PROMPT 1 (renommage maimouarkwest)
- Sous-agent B : PROMPT 2 (titre Trophées)
- Sous-agent C : PROMPT 5 (fix deadline — critique)

**Phase 2 — Parallèle (dépend du renommage fini) :**
- Sous-agent D : PROMPT 3 (sidebar rétractable)
- Sous-agent E : PROMPT 6 (progression compacte)

**Phase 3 — Séquentiel (dépend du redesign sidebar) :**
- Sous-agent F : PROMPT 4 (MemoireView TikTok scroll)

**Phase 4 — Parallèle (features additionnelles) :**
- Sous-agent G : PROMPT 7A + 7C (raccourcis + micro-animations)
- Sous-agent H : PROMPT 7B + 7D (drag & drop + mode focus)

**Phase finale — Vérification :**
- `npx tsc --noEmit` (zéro erreurs)
- `npm run build` (build OK)
- Vérifier visuellement : dark mode ET light mode
- Grep final : `grep -ri "memoirequest\|maimoirkouest" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" --include="*.md" --include="*.html" --include="*.json" --include="*.sql" . | grep -v node_modules | grep -v .next | grep -v ".git/"` — ne doit contenir que des chemins filesystem/URLs GitHub
- Tester les raccourcis clavier
- Tester le scroll TikTok sur la page mémoire
- Tester sidebar collapsed/expanded
- Vérifier qu'aucune deadline inventée n'apparaît
