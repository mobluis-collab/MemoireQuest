# Hotfix — Bugs post-déploiement V3

> **IMPORTANT** : Tu es Claude Code. Tu codes directement. Lis `CLAUDE.md` à la racine pour le contexte projet. Design monochrome uniquement. Active des sous-agents parallèles pour les 4 fixes.

---

## FIX 1 — Bouton collapse sidebar tronqué/invisible

### Problème
Le bouton chevron `‹` pour collapse la sidebar (ligne ~856 de `NewDashboard.tsx`) est positionné `right: -12` (dépasse de la sidebar), mais la sidebar a `overflow: 'hidden'` (ligne ~851). Résultat : le bouton est coupé et invisible.

### Solution
Déplacer le bouton toggle **en dehors du `<aside>`** et le positionner en fixe par rapport au bord gauche du `<main>`.

Dans `NewDashboard.tsx` :

1. **Supprimer** le bouton `<button onClick={() => setSidebarCollapsed(...)}>` qui est à l'intérieur du `<aside>` (lignes ~856-871)

2. **Ajouter** un nouveau bouton JUSTE AVANT le `<main>` (entre la fermeture de `</aside>` et l'ouverture de `<main>`) :
```tsx
{/* Sidebar collapse toggle — outside aside to avoid overflow:hidden clipping */}
{!focusMode && (
  <button
    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
    aria-label={sidebarCollapsed ? 'Ouvrir le menu' : 'Fermer le menu'}
    style={{
      position: 'fixed',
      top: 28,
      left: sidebarCollapsed ? 44 : 204,
      zIndex: 20,
      width: 24,
      height: 24,
      borderRadius: '50%',
      background: 'var(--mq-card-bg)',
      border: '1px solid var(--mq-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: 10,
      color: tw(0.5, textIntensity, isDark),
      transition: 'left 0.35s cubic-bezier(.4,0,.2,1), transform 0.3s cubic-bezier(.4,0,.2,1)',
      transform: sidebarCollapsed ? 'rotate(180deg)' : 'none',
      boxShadow: `0 1px 4px ${bg(0.10, isDark)}`,
    }}
  >
    ‹
  </button>
)}
```

**Pourquoi `left: 204` ?** Sidebar width = 216px, bouton à 204 = 216 - 12 (mi-chemin sur le bord). En collapsed : 56 - 12 = 44.

---

## FIX 2 — Jauges oranges (dots actifs dans MemoireView)

### Problème
Les dots indicateurs dans `MemoireView.tsx` (ligne ~619) utilisent `accentColor` pour le dot actif :
```tsx
background: isActive ? accentColor : bg(0.15, isDark),
```
Et les dots ont aussi un `boxShadow` avec l'accent color (ligne ~622). L'accent color de l'utilisateur est probablement orange.

### Solution
Les dots de navigation ne sont PAS des barres XP. Ils doivent rester monochrome selon la DA. Modifier dans `MemoireView.tsx` :

Ligne ~619 : remplacer :
```tsx
background: isActive ? accentColor : bg(0.15, isDark),
```
par :
```tsx
background: isActive ? tw(0.70, textIntensity, isDark) : bg(0.15, isDark),
```

Ligne ~622 : remplacer :
```tsx
boxShadow: isActive ? `0 0 8px ${accentColor}44` : 'none',
```
par :
```tsx
boxShadow: isActive ? `0 0 8px ${bg(0.25, isDark)}` : 'none',
```

### Vérification supplémentaire
Chercher dans TOUT `MemoireView.tsx` les utilisations de `accentColor`. Les SEULES autorisées sont sur les progress bars de complétion (barres de progression des chapitres et sous-tâches). Tout le reste (dots, badges, texte) doit être monochrome via `tw()` ou `bg()`.

Occurrences à vérifier :
- Ligne ~280 : `background: accentColor` (chapter progress bar) → OK ✅
- Ligne ~479 : `background: accentColor` (task progress bar) → OK ✅
- Ligne ~619 : dot active → FIX ❌
- Ligne ~622 : dot boxShadow → FIX ❌

---

## FIX 3 — Sections pas toutes visibles dans MemoireView

### Problème
Chaque chapitre-slide a `height: '100%'` et `minHeight: '100%'` (lignes 205-206), mais si le contenu (header + objectif + tips + sections) dépasse cette hauteur, les sections en bas ne sont pas visibles. La zone des sections a bien `overflowY: 'auto'` mais le calcul de hauteur peut coincer.

### Solution
Modifier la structure de chaque slide-chapitre dans `MemoireView.tsx` (ligne ~199-211) :

Remplacer :
```tsx
style={{
  scrollSnapAlign: 'start',
  height: '100%',
  minHeight: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: '28px 32px 20px',
  boxSizing: 'border-box',
}}
```
par :
```tsx
style={{
  scrollSnapAlign: 'start',
  height: '100%',
  minHeight: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: '24px 32px 16px',
  boxSizing: 'border-box',
  overflow: 'hidden',
}}
```

Et s'assurer que la zone des sections (ligne ~366) a bien :
```tsx
style={{
  flex: '1 1 0',
  minHeight: 0,
  overflowY: 'auto',
  ...
}}
```

Le `flex: '1 1 0'` + `minHeight: 0` est critique pour que le flex child puisse shrink et activer le scroll interne. Sans `minHeight: 0`, un flex child ne shrink jamais en dessous de son contenu.

Aussi, réduire les tailles pour gagner de la place :
- Header chapitre : `fontSize: 22` → `fontSize: 20`
- Objectif bloc : `padding: '10px 14px'` → `padding: '8px 12px'`
- Tips bloc : `padding: '10px 14px'` → `padding: '8px 12px'`
- `marginBottom: 12` sur objectif et tips → `marginBottom: 8`

---

## FIX 4 — Bouton "Quitter focus" au mauvais endroit

### Problème
Le bouton "Focus" est positionné en haut à droite (`position: absolute, top: 14, right: 20`, lignes 1104-1106).
Le bouton "Quitter focus" est positionné en bas à droite (`position: fixed, bottom: 24, right: 24`, lignes 1454-1456).

L'utilisateur s'attend à cliquer au même endroit pour activer/désactiver le focus.

### Solution
Modifier le bouton "Quitter focus" (ligne ~1450-1480) pour qu'il soit au même endroit que le bouton "Focus" :

Remplacer :
```tsx
style={{
  position: 'fixed',
  bottom: 24,
  right: 24,
  ...
}}
```
par :
```tsx
style={{
  position: 'fixed',
  top: 14,
  right: 20,
  ...
}}
```

Le reste du style peut rester identique. Les deux boutons sont maintenant au même endroit : coin supérieur droit.

---

## Ordre d'exécution

**Parallèle (aucune dépendance entre les 4 fixes) :**
- Sous-agent A : FIX 1 (bouton sidebar)
- Sous-agent B : FIX 2 (dots monochrome)
- Sous-agent C : FIX 3 (sections visibles)
- Sous-agent D : FIX 4 (bouton focus)

**Vérification finale :**
- `npx tsc --noEmit`
- `npm run build`
- Vérifier visuellement en dark ET light mode :
  - [ ] Bouton collapse sidebar visible et fonctionnel
  - [ ] Dots de navigation chapitres monochrome (pas orange)
  - [ ] Toutes les sections de tous les chapitres sont scrollables
  - [ ] Bouton Quitter focus en haut à droite (même position que Focus)
