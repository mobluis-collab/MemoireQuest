# PROMPT — Fix raccourcis clavier vs contentEditable

## Problème
Dans `NewDashboard.tsx`, le handler `handleKeyDown` (ligne ~681) vérifie si le focus est sur un `INPUT`, `TEXTAREA` ou `SELECT` pour ignorer les raccourcis. Mais il ne vérifie PAS les éléments `contentEditable` (utilisés par l'éditeur de notes). Résultat : taper "f" dans une note lance le Focus mode, "p" ouvre le Pomodoro, etc.

## Fix

**Fichier** : `src/components/dashboard/new/NewDashboard.tsx`

Ligne ~681-683, remplacer :

```ts
const handleKeyDown = (e: KeyboardEvent) => {
  const tag = document.activeElement?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
```

Par :

```ts
const handleKeyDown = (e: KeyboardEvent) => {
  const el = document.activeElement
  const tag = el?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
  if (el instanceof HTMLElement && el.isContentEditable) return
```

C'est tout. Une seule ligne ajoutée. Ça couvre l'éditeur de notes et tout futur élément contentEditable.
