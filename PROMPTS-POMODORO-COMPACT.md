# PROMPT — Pomodoro : Bloc compact + Mode plein écran

## Contexte

Le composant `PomodoroTimer.tsx` affiche actuellement un overlay plein écran en permanence. L'utilisateur veut **deux modes** :

1. **Mode compact (défaut)** — un petit bloc flottant en haut à droite du dashboard (260px de large). Le dashboard reste visible et utilisable derrière.
2. **Mode plein écran (optionnel)** — l'utilisateur clique sur un bouton pour passer en overlay fullscreen avec blur. Un bouton × ramène au mode compact.

## Fichier à modifier

`src/components/dashboard/new/PomodoroTimer.tsx`

## Spec détaillée

### 1. Nouveau state : `isFullscreen`

Ajouter un state `isFullscreen` (défaut `false`). Le composant rend soit le bloc compact, soit l'overlay fullscreen, selon ce state.

```tsx
const [isFullscreen, setIsFullscreen] = useState(false)
```

### 2. Mode compact (isFullscreen === false)

Container :
```tsx
{
  position: 'fixed',
  top: 16,
  right: 16,
  zIndex: 9998,
  width: 260,
  borderRadius: 14,
  border: `1px solid ${bg(0.10, isDark)}`,
  background: isDark ? 'rgba(4,3,14,0.70)' : 'rgba(255,255,255,0.70)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  padding: '16px 18px 14px',
  boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.08)',
  animation: 'mq-overlay-in 0.25s ease both',
}
```

Structure interne du bloc compact :

**A. Header** — flex row, space-between :
- Gauche : label mode (`CONCENTRATION` ou `PAUSE`), fontSize 10, fontWeight 600, textTransform uppercase, letterSpacing 1.5, color `tw(0.30, ...)`
- Droite : deux petits boutons icon (24x24, borderRadius 6) :
  - Bouton expand (plein écran) : SVG expand icon → `setIsFullscreen(true)`
  - Bouton fermer (×) → `onClose()`

**B. Timer row** — flex row, alignItems center, gap 14 :
- Mini cercle SVG de progression (52x52, radius 23)
- Temps sur UNE SEULE LIGNE : format `"25:00"` (PAS `"25 : 00"`)
  - IMPORTANT : `fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'` (même font que le reste de l'app, PAS monospace)
  - fontSize 32, fontWeight 300, letterSpacing '-1px'
  - color `tw(0.85, textIntensity, isDark)`

**C. Texte explicatif** — Juste en dessous du timer row, un petit paragraphe :
```
fontSize: 10,
lineHeight: '1.4',
color: tw(0.25, textIntensity, isDark),
marginBottom: 10,
```
Texte : `"La méthode Pomodoro alterne 25 min de travail concentré et 5 min de pause pour améliorer ta productivité et réduire la fatigue mentale."`

**D. Action buttons** — flex row, gap 6 :
- 3 boutons pill (borderRadius 99) : Play/Pause (primary), Reset, Skip
- padding '5px 12px', fontSize 11, fontWeight 500
- Bouton primary : background `bg(0.10, isDark)`, color `tw(0.75, ...)`
- Boutons normaux : background `bg(0.06, isDark)`, color `tw(0.50, ...)`

**E. Footer** — flex row, space-between, marginTop 10 :
- Gauche : 4 dots (6x6) + compteur cycles (fontSize 10, color `tw(0.25, ...)`)

### 3. Mode plein écran (isFullscreen === true)

Garder **exactement** le code actuel de l'overlay fullscreen (position fixed, inset 0, blur 40px), avec ces modifications :

- Remplacer le bouton fermer (×) en haut à droite par un bouton qui fait `setIsFullscreen(false)` (retour au compact), PAS `onClose()`. Icône : flèches qui se contractent (reduce/minimize).
- Le format du timer est aussi `"25:00"` (PAS `"25 : 00"`)
- La fontFamily est la même que le compact : la font système de l'app (PAS monospace)
- fontSize 72, fontWeight 200
- Ajouter le même texte explicatif Pomodoro en dessous des boutons actions, avant les dots :
  - fontSize 11, color `tw(0.25, ...)`, textAlign center, maxWidth 320
  - Même texte que dans le compact

- Ajouter un 2ème bouton en haut à droite, à gauche du bouton minimize : un vrai bouton fermer (×) qui fait `onClose()`

### 4. Format du temps — CRITIQUE

Le format actuel `${minutes} : ${seconds}` avec des espaces doit devenir :

```tsx
const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
```

Pas d'espaces autour du `:`. Affichage sur UNE SEULE LIGNE.

### 5. Police — CRITIQUE

La police du timer (compact ET fullscreen) doit être la **même police système** que le reste de l'application. Retirer toute référence à `fontFamily: 'monospace'` ou `'SF Mono'` ou `'Fira Code'`. Utiliser la font héritée du parent (donc simplement ne pas mettre de fontFamily, ou mettre `fontFamily: 'inherit'`).

### 6. SVG pour le bouton expand (plein écran)

```tsx
<svg width="10" height="10" viewBox="0 0 10 10" fill="none">
  <path d="M1 3.5V1H3.5M6.5 1H9V3.5M9 6.5V9H6.5M3.5 9H1V6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
```

### 7. SVG pour le bouton minimize (quitter plein écran)

```tsx
<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
  <path d="M4 1V3.5H1M8 1V3.5H11M11 8.5H8V11M1 8.5H4V11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
```

### 8. Keyboard shortcuts

- `Escape` en mode fullscreen → `setIsFullscreen(false)` (retour compact)
- `Escape` en mode compact → `onClose()` (fermer le pomodoro)

### 9. Contraintes de style

- Monochrome uniquement : `tw()` et `bg()` de `@/lib/color-utils`
- Inline styles, PAS de Tailwind
- Le composant reçoit déjà `isDark` — l'utiliser partout
- Pas d'emojis dans le code

## Résumé des changements par rapport au code actuel

| Aspect | Avant | Après |
|---|---|---|
| Layout | Overlay fullscreen uniquement | Bloc compact 260px (défaut) + fullscreen optionnel |
| Position compact | — | fixed, top 16, right 16 |
| Format temps | `"25 : 00"` | `"25:00"` |
| Font timer | monospace | font système (inherit) |
| Bouton expand | — | Nouveau, dans le header compact |
| Bouton minimize | — | Nouveau, dans le fullscreen |
| Texte explicatif | — | Court paragraphe sur la méthode Pomodoro |
| Escape | ferme tout | compact: ferme, fullscreen: retour compact |
