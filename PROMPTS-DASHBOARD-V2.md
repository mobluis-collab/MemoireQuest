# PROMPT — Dashboard : Runner scolaire + Boutons Pomodoro/Focus + Texte plus gros

## Contexte
On travaille sur `ProgressionView.tsx` (grille 2x2 dans la vue Progression) et `NewDashboard.tsx` (boutons Pomodoro/Focus). Trois corrections à faire.

---

## 1. Remplacer "Prédiction de rythme" par un mini-jeu runner scolaire

### Fichier : `src/components/dashboard/new/ProgressionView.tsx`

### Ce qu'il faut faire
Remplacer le bloc **TOP-RIGHT** (lignes 110-158, "Prédiction de rythme") par un mini-jeu runner intégré dans un `<canvas>`. Le jeu est un runner infini thème scolaire, toujours accessible (pas de système de déblocage).

### Spécifications du jeu

**Personnage — Étudiant pixel art :**
- Toque de diplômé (mortarboard) : rectangle large 18×3 en haut, base 10×3 en dessous, pompon avec ligne + carré 2×2
- Tête : carré 8×8 sous la toque
- Oeil : carré 2×2 en `#04030e` (couleur du fond)
- Corps : rectangle 10×8
- Sac à dos : petit rectangle 4×6 sur le dos, opacité 0.55
- Jambes animées : alternent toutes les 4 frames, fixes quand il saute
- Couleur : `rgba(255,255,255,0.82)`

**Obstacles (3 types aléatoires) :**

1. **Piles de livres** : N rectangles empilés (5px de haut chacun), largeurs légèrement différentes, opacités variées (0.35 à 0.60), avec strokeRect pour le contour
2. **Crayons debout** : rectangle fin 4px de large, pointe triangulaire en haut (opacité 0.70), gomme en bas (opacité 0.30)
3. **Tasses de café** : rectangle pour le corps, rectangle plus large pour le bord, arc pour l'anse, 2 courbes de fumée animées avec `Math.sin(frame * 0.1)` — la fumée s'arrête en game over

**Sol — Règle graduée :**
- Ligne horizontale à `H * 0.80`, opacité 0.15
- Tirets qui défilent : tous les 10px, grands tirets tous les 50px (6px vs 3px)
- Texte "cm" très faded (opacité 0.04) sous les grands tirets
- Offset de défilement : `(frame * speed * 0.8) % 20`

**Décor — Avions en papier :**
- 2 avions en papier (stroke only, opacité 0.08) qui défilent lentement (`speed * 0.3`)
- Forme : triangle avec pli central (4 lignes : pointe → droite → bas → milieu)

**Physique :**
- `GRAVITY = 0.55`, `JUMP_FORCE = -8.5`
- Sol : `H * 0.80 - personnage.h`
- Collision AABB avec marge de 3px

**Vitesse & Score :**
- Vitesse initiale : 3, augmente de `score * 0.008`, cap à 10
- Score +1 toutes les 5 frames
- Affichage : 4 chiffres avec padding zéro ("0042")

**Spawn obstacles :**
- Gap minimum : 110px + random 70px + `180 / speed`
- Types aléatoires parmi les 3

**Game over :**
- Overlay semi-transparent `rgba(4,3,14,0.50)`
- Texte "Raté !" en fontSize 13, fontWeight 600, opacité 0.55
- "Score : X" en dessous, fontSize 10, opacité 0.30
- Met à jour le meilleur score

**Input :**
- Espace, ArrowUp, clic sur le canvas, touchstart
- Si pas en jeu ou game over → reset et lance le jeu
- Sinon → saut

### Structure JSX du bloc

```tsx
{/* ═══ TOP-RIGHT: Mini-jeu Récréation ═══ */}
<div style={{
  padding: 14, borderRadius: 12,
  background: 'var(--mq-card-bg)',
  border: '1px solid var(--mq-border)',
  display: 'flex', flexDirection: 'column',
  overflow: 'hidden', cursor: 'pointer',
}}>
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontSize: 10, color: 'var(--mq-text-muted)', fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8, flexShrink: 0,
  }}>
    <span>Récréation</span>
    <span style={{ fontSize: 11, fontWeight: 700, color: tw(0.60, textIntensity, isDark), fontVariantNumeric: 'tabular-nums', letterSpacing: '1px' }}>
      {scoreDisplay}
    </span>
  </div>
  <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
    <canvas ref={canvasRef} style={{ width: '100%', height: '100%', borderRadius: 6 }} />
    {!gameActive && (
      <div style={{
        position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center',
        fontSize: 10, color: tw(0.25, textIntensity, isDark), letterSpacing: '0.5px',
      }}>
        {gameOver ? 'Espace pour rejouer' : 'Espace pour jouer'}
      </div>
    )}
  </div>
  <div style={{ fontSize: 9, color: tw(0.25, textIntensity, isDark), marginTop: 4, flexShrink: 0 }}>
    Meilleur : {bestScore}
  </div>
</div>
```

### Implémentation React

- Utiliser `useRef` pour le canvas + `useEffect` pour le game loop avec `requestAnimationFrame`
- `useState` pour `scoreDisplay`, `bestScore`, `gameOver`, `gameActive`
- Gérer le resize avec `ResizeObserver` sur le parent du canvas
- DPR scaling : `window.devicePixelRatio`
- **Cleanup** : annuler le `requestAnimationFrame` et retirer les event listeners dans le return du `useEffect`
- Les event listeners keyboard doivent être sur `document`, le clic/touch sur le canvas

### IMPORTANT
- Tout le code du jeu (dessin, physique, spawn) va DANS le composant `ProgressionView.tsx`, pas dans un fichier séparé
- Supprimer TOUT le code de "Prédiction de rythme" (lignes 110-158)
- Supprimer les variables devenues inutiles : `estimatedDate`, `willFinishBeforeDeadline`, `daysToFinish`, `remaining_sec`, `ratePerDay`, `daysElapsed` (si plus utilisées nulle part)
- Le jeu doit être jouable directement, pas de système de déblocage

---

## 2. Boutons Pomodoro/Focus — les sortir du flux absolu

### Fichier : `src/components/dashboard/new/NewDashboard.tsx`

### Problème
Les boutons Pomodoro (ligne ~1148) et Focus (ligne ~1179) sont en `position: absolute` avec `top: 14` dans le `<main>`. Ils se superposent avec le contenu en dessous.

### Solution
Remplacer le positionnement absolu par une **barre horizontale en haut du contenu**, dans le flux normal, AVANT le contenu du dashboard.

```tsx
{/* Barre d'outils — dans le flux, plus d'absolute */}
{!focusMode && plan && (
  <div style={{
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
    flexShrink: 0,
    marginBottom: 4,
  }}>
    <button
      onClick={() => setPomodoroOpen(true)}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '5px 12px', borderRadius: 99,
        border: `1px solid ${bg(0.10, isDark)}`,
        background: bg(0.05, isDark),
        color: tw(0.45, textIntensity, isDark),
        fontSize: 11, fontWeight: 500, cursor: 'pointer',
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
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '5px 12px', borderRadius: 99,
        border: `1px solid ${bg(0.10, isDark)}`,
        background: bg(0.05, isDark),
        color: tw(0.45, textIntensity, isDark),
        fontSize: 11, fontWeight: 500, cursor: 'pointer',
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

### Placement
Cette div doit être le **premier enfant** du `<main>`, AVANT le `{error && ...}` et le `{plan ? ... }`. Supprimer les deux anciens boutons en `position: absolute`.

---

## 3. Texte plus gros dans les stats (TOP-LEFT)

### Fichier : `src/components/dashboard/new/ProgressionView.tsx`

### Changements dans le bloc TOP-LEFT (lignes 74-108)

Augmenter les tailles :

| Élément | Avant | Après |
|---------|-------|-------|
| Label (ex: "Complété", "Temps") | `fontSize: 10` | `fontSize: 12` |
| Valeur (ex: "34%", "1 240") | `fontSize: 20` | `fontSize: 26` |
| Sous-texte (ex: "8/23 sections") | `fontSize: 9` | `fontSize: 10` |

Appliquer ces changements aux 4 pills : Complété, Temps, Points, Régularité.

---

## Contraintes design (rappel)

- **Monochrome UNIQUEMENT** : `rgba(255,255,255, X)` pour texte/bordures, `#04030e` pour fond
- **Pas de couleurs vives** sauf `accentColor` sur les barres de progression
- **Inline styles** uniquement, pas de Tailwind dans les composants dashboard
- **Pas d'emojis**
- Utiliser `tw()` et `bg()` de `@/lib/color-utils`
- Utiliser les CSS variables : `var(--mq-card-bg)`, `var(--mq-border)`, `var(--mq-text-muted)`, `var(--mq-text-primary)`

## Fichiers à modifier

1. `src/components/dashboard/new/ProgressionView.tsx` — runner scolaire + texte plus gros
2. `src/components/dashboard/new/NewDashboard.tsx` — boutons Pomodoro/Focus

## Vérification

Après les modifications :
- `npx tsc --noEmit` doit passer sans erreurs
- `npm run build` doit réussir
- Le jeu doit être jouable dans le bloc top-right de la vue Progression
- Les boutons Pomodoro/Focus ne doivent plus chevaucher le contenu
- Les stats du bloc top-left doivent être visiblement plus grosses
