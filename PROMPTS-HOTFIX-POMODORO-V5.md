# PROMPT CLAUDE CODE — V5 : Pomodoro overlay + boutons Pomodoro/Focus

> **INSTRUCTION** : Exécute les 2 prompts ci-dessous EN PARALLÈLE avec des sous-agents.
> Après chaque prompt, lance `npx tsc --noEmit` puis `npm run build`.
> Ne modifie JAMAIS le design monochrome (`tw()`, `bg()`, inline styles uniquement).
> L'accent color ne sert QUE pour les barres XP et la DotGrid timeline.
> Toute l'interface est en français.

---

## PROMPT 1 — Refonte de l'overlay Pomodoro

### Fichier : `src/components/dashboard/new/PomodoroTimer.tsx`

Le composant actuel fonctionne mais est trop brut visuellement. Il faut le rendre immersif et soigné.

**RÉÉCRIRE LE COMPOSANT EN ENTIER** en gardant la même logique timer (qui est correcte), mais avec un overlay beaucoup plus travaillé.

**Ce qui change dans l'UI :**

#### 1. Structure de l'overlay
```
┌───────────────────────────────────────────────────────┐
│                                            [✕ Fermer] │
│                                                       │
│                                                       │
│                    CONCENTRATION                      │  ← ou "PAUSE" en mode break
│                   (sous-texte)                        │  ← "Reste concentré." ou "Prends un moment."
│                                                       │
│               ╭────────────────╮                      │
│               │                │                      │
│               │    24 : 58     │                      │  ← timer dans cercle SVG
│               │                │                      │
│               ╰────────────────╯                      │
│                                                       │
│           [ ▶ Play ]  [ ↺ ]  [ ⏭ ]                   │  ← boutons compacts
│                                                       │
│               ● ● ○ ○  2 pomodoros                    │
│                                                       │
│          ───────────────────────────                  │  ← barre de progression linéaire
│                                                       │
│     Session en cours · 50 min de concentration        │  ← stats de session
│                                                       │
└───────────────────────────────────────────────────────┘
```

#### 2. Cercle SVG — plus grand, plus élégant
- Taille : `width: 280, height: 280` (au lieu de 220)
- `viewBox="0 0 100 100"`, cercle `r=44`
- Track : `strokeWidth: 1.5`, `stroke: bg(0.04, isDark)` (plus subtil)
- Progress : `strokeWidth: 2`, `stroke: tw(0.30, textIntensity, isDark)` en mode work, `stroke: tw(0.15, textIntensity, isDark)` en mode break
- Ajouter un **second cercle de glow** derrière le progress : même position, `strokeWidth: 6`, `stroke: tw(0.06, textIntensity, isDark)`, `filter: 'blur(4px)'` — ça crée un halo subtil

#### 3. Timer — plus imposant
- `fontSize: 64` (au lieu de 72 — le cercle est plus grand donc proportion meilleure)
- `fontWeight: 100` (ultra-thin, au lieu de 200)
- `fontFamily: '-apple-system, "SF Pro Display", "Helvetica Neue", monospace'`
- `letterSpacing: '4px'` (au lieu de '-2px' — plus aéré)
- Format : `24:58` (sans espaces autour du `:`, juste le colon)

#### 4. Label de mode + sous-texte
- Label : `fontSize: 11`, `fontWeight: 600`, `letterSpacing: '3px'`, `textTransform: 'uppercase'`, `color: tw(0.30, textIntensity, isDark)`
- Sous-texte : `fontSize: 13`, `fontWeight: 400`, `color: tw(0.20, textIntensity, isDark)`, `marginTop: 6`
  - Mode work : `"Reste concentré."`
  - Mode break : `"Prends un moment."`
- `marginBottom: 40` entre le sous-texte et le cercle

#### 5. Boutons — plus compacts et alignés
- **Play/Pause** : seul bouton avec un label texte
  - `padding: '10px 28px'`, `borderRadius: 99`, `fontSize: 12`, `fontWeight: 600`
  - En play (pas running) : `background: bg(0.08, isDark)`, `color: tw(0.70, textIntensity, isDark)`, `border: 1px solid ${bg(0.12, isDark)}`
  - En pause (running) : `background: bg(0.04, isDark)`, `color: tw(0.45, textIntensity, isDark)`, `border: 1px solid ${bg(0.08, isDark)}`
- **Reset** et **Skip** : boutons ICÔNE seulement (pas de texte)
  - `width: 36, height: 36`, `borderRadius: '50%'`
  - `border: 1px solid ${bg(0.08, isDark)}`, `background: bg(0.03, isDark)`
  - `color: tw(0.35, textIntensity, isDark)`, `fontSize: 14`
  - Reset : `↺` (U+21BA)
  - Skip : `⏭` (U+23ED) — si problème de rendu, utiliser `»` (U+00BB)
- Layout boutons : `display: 'flex', alignItems: 'center', gap: 10`
- Ordre : `[ ↺ ]  [ ▶ Play ]  [ ⏭ ]` (reset à gauche, play au centre, skip à droite)
- `marginBottom: 28`

#### 6. Dots de cycle — inchangés mais ajouter `marginBottom: 24`

#### 7. NOUVELLE — Barre de progression linéaire
Sous les dots, ajouter une barre de progression horizontale :
```tsx
<div style={{
  width: 200,
  height: 2,
  borderRadius: 99,
  background: bg(0.04, isDark),
  overflow: 'hidden',
  marginBottom: 16,
}}>
  <div style={{
    height: '100%',
    width: `${(1 - timeLeft / totalTime) * 100}%`,
    borderRadius: 99,
    background: tw(0.15, textIntensity, isDark),
    transition: 'width 1s linear',
  }} />
</div>
```

#### 8. NOUVELLE — Stats de session en bas
```tsx
<div style={{
  fontSize: 11,
  color: tw(0.18, textIntensity, isDark),
  letterSpacing: '0.3px',
}}>
  {completedCycles > 0
    ? `Session en cours \u00B7 ${completedCycles * 25} min de concentration`
    : 'Prêt à démarrer'
  }
</div>
```

#### 9. Bouton close — plus discret
- Position : `top: 24, right: 28`
- Style pill (pas carré) : `borderRadius: 99`, `padding: '6px 14px'`
- Contenu : `✕ Fermer` (icône + texte)
- `fontSize: 11`, `fontWeight: 500`
- `border: 1px solid ${bg(0.06, isDark)}`, `background: 'transparent'`
- `color: tw(0.25, textIntensity, isDark)`
- Hover : `background: bg(0.04, isDark)`, `color: tw(0.40, textIntensity, isDark)` — utiliser `onMouseEnter`/`onMouseLeave` avec un state `closeHover`

#### 10. Fond de l'overlay
Garder le fond actuel mais ajouter un gradient radial très subtil au centre :
```tsx
background: isDark
  ? 'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.015) 0%, rgba(4,3,14,0.92) 70%)'
  : 'radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0.01) 0%, rgba(255,255,255,0.95) 70%)',
```

**IMPORTANT :**
- Garder TOUTE la logique timer identique (useEffect, intervalRef, etc.)
- Garder le keyboard handler Escape
- AUCUNE couleur en dehors de `tw()` et `bg()`. Zéro accent color.
- `animation: 'mq-overlay-in 0.25s ease both'` — garder

---

## PROMPT 2 — Fix boutons Pomodoro/Focus qui débordent

### Fichier : `src/components/dashboard/new/NewDashboard.tsx`

**PROBLÈME** : Les boutons Pomodoro (`right: 100`) et Focus (`right: 20`) sont en `position: absolute` dans le `<main>`. Ils chevauchent la barre de navigation `< 1/8 >` de MemoireView, et potentiellement d'autres contenus.

**SOLUTION** : Fusionner les deux boutons dans UN SEUL conteneur fixe, positionné proprement.

**Étapes :**

### 1. Supprimer les deux boutons séparés

Supprimer le bloc Pomodoro (lignes ~1138-1166) :
```tsx
{/* Pomodoro button — next to Focus */}
{!focusMode && plan && (
  <button onClick={() => setPomodoroOpen(true)} ...>
```

Supprimer le bloc Focus (lignes ~1168-1196) :
```tsx
{/* Focus mode toggle — top-right pill */}
{!focusMode && plan && (
  <button onClick={() => setFocusMode(true)} ...>
```

### 2. Remplacer par un conteneur unique

À la même position (juste après l'ouverture du `<main>`, avant `{planRemaining ...}`), insérer :

```tsx
{/* Top-right action buttons — unified container */}
{!focusMode && plan && (
  <div style={{
    position: 'fixed',
    top: 14,
    right: 20,
    zIndex: 30,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  }}>
    <button
      onClick={() => setPomodoroOpen(true)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        padding: '5px 12px',
        borderRadius: 99,
        border: `1px solid ${bg(0.10, isDark)}`,
        background: bg(0.05, isDark),
        color: tw(0.45, textIntensity, isDark),
        fontSize: 11,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
        backdropFilter: 'blur(8px)',
      }}
      title="Pomodoro (P)"
    >
      <span style={{ fontSize: 12 }}>{'\u25D4'}</span>
      <span>Pomodoro</span>
    </button>
    <button
      onClick={() => setFocusMode(true)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        padding: '5px 12px',
        borderRadius: 99,
        border: `1px solid ${bg(0.10, isDark)}`,
        background: bg(0.05, isDark),
        color: tw(0.45, textIntensity, isDark),
        fontSize: 11,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
        backdropFilter: 'blur(8px)',
      }}
      title="Mode focus (F)"
    >
      <span style={{ fontSize: 12 }}>{'\u25C9'}</span>
      <span>Focus</span>
    </button>
  </div>
)}
```

**Points clés du changement :**
- `position: 'fixed'` au lieu de `'absolute'` — les boutons restent en place même si le main scroll
- `zIndex: 30` — au-dessus du contenu (le main est à `zIndex: 1`)
- `gap: 6` entre les deux boutons
- Les boutons individuels n'ont PLUS de `position: absolute/fixed` — ils sont dans le flow du conteneur flex
- Le conteneur est positionné `top: 14, right: 20` (la position du Focus actuel)

### 3. Vérifier le bouton "Quitter focus"

Le bouton `Quitter focus` (lignes ~1488-1519) est déjà en `position: 'fixed', top: 14, right: 20`. Il est correct et ne doit PAS être dans le conteneur ci-dessus (il s'affiche uniquement quand `focusMode === true`, alors que le conteneur s'affiche uniquement quand `focusMode === false`).

### 4. MemoireView — ajouter padding-right

Dans `src/components/dashboard/new/MemoireView.tsx`, la barre de navigation `< 1/8 >` (lignes 247-301) est dans un div avec `padding: '14px 24px'`.

Augmenter le `padding-right` pour laisser de la place aux boutons fixes :
```
padding: '14px 24px'  →  padding: '14px 180px 14px 24px'
```

Cela évite que le `< 1/8 >` chevauche les boutons Pomodoro/Focus.

**AUSSI** : Appliquer le même padding-right sur les autres vues qui pourraient se chevaucher. Dans les vues `ProgressionView` et `AchievementsView`, si les headers sont proches du bord droit, ajouter `paddingRight: 180` au conteneur principal.

---

## VÉRIFICATION FINALE

Après les 2 prompts, vérifier :
1. `npx tsc --noEmit` — 0 erreurs
2. `npm run build` — compilation OK
3. Vérifier que :
   - Il n'y a PLUS de `position: 'absolute'` sur les boutons Pomodoro ou Focus individuels dans `NewDashboard.tsx`
   - Les boutons sont dans UN SEUL conteneur `position: 'fixed'`
   - Le `PomodoroTimer.tsx` a le cercle SVG de taille 280
   - Le bouton close est un pill `✕ Fermer`
   - Le fond a le gradient radial subtil
   - La barre de progression linéaire existe sous les dots
   - Les stats de session existent en bas de l'overlay
   - MemoireView a `padding-right: 180px` sur sa top bar

---

## ORDRE D'EXÉCUTION

```
Phase 1 (parallèle) :
  ├── PROMPT 1 : Réécrire PomodoroTimer.tsx
  └── PROMPT 2 : Fix boutons dans NewDashboard.tsx + padding MemoireView

Phase 2 : npx tsc --noEmit && npm run build
```
