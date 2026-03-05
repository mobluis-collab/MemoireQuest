# PROMPT — Fix Pomodoro overlay + Bouton Play pour le runner

Deux corrections à faire.

---

## 1. Fix Pomodoro : overlay avec fond flou intense

### Fichier : `src/components/dashboard/new/PomodoroTimer.tsx`

### Problème actuel
Le Pomodoro s'affiche en plein écran mais le fond est trop opaque (`rgba(4,3,14,0.92)` en dark / `rgba(255,255,255,0.95)` en light), ce qui masque totalement le blur et donne un rendu "page blanche" en light mode. On ne voit pas du tout l'arrière-plan flouté.

### Ce qu'on veut
Un overlay qui laisse VOIR l'arrière-plan à travers un **blur très intense**. L'arrière-plan doit être complètement flou mais visible, pas un aplat opaque.

### Changements à faire

**Ligne 114** — Remplacer le background du container overlay :

```tsx
// AVANT
background: isDark ? 'rgba(4,3,14,0.92)' : 'rgba(255,255,255,0.95)',
backdropFilter: 'blur(20px)',

// APRÈS
background: isDark ? 'rgba(4,3,14,0.55)' : 'rgba(255,255,255,0.45)',
backdropFilter: 'blur(40px)',
WebkitBackdropFilter: 'blur(40px)',
```

L'opacité est baissée de ~0.92 à ~0.55 (dark) et ~0.95 à ~0.45 (light) pour laisser transparaître le contenu flouté. Le blur est doublé (20 → 40px) pour un effet glass intense.

**IMPORTANT** : Ajouter `WebkitBackdropFilter` pour Safari.

### Adaptation au thème
Le Pomodoro reçoit déjà `isDark` en prop et utilise `tw()` / `bg()` partout — c'est correct. Il faut simplement s'assurer que TOUT le styling utilise ces fonctions et respecte les deux modes. Vérifier que :
- Les boutons Play/Reset/Skip utilisent `bg()` et `tw()` (c'est déjà le cas)
- Le cercle SVG utilise les bonnes couleurs (déjà le cas)
- Le texte "CONCENTRATION" / "PAUSE" s'adapte (déjà le cas)

Le seul vrai changement est le background + blur du container.

---

## 2. Bouton Play discret pour le runner scolaire

### Fichier : `src/components/dashboard/new/ProgressionView.tsx`

### Problème actuel
Le jeu démarre automatiquement dès le mount du composant (ligne ~414-436 : `useEffect` qui appelle `startGameLoop()` au mount). L'étudiant court immédiatement et le joueur doit sauter direct.

### Ce qu'on veut
Le jeu doit afficher un écran d'attente avec le personnage immobile sur la ligne de sol, et un **petit bouton play discret et design** au centre du canvas. Le jeu ne démarre que quand on clique sur ce bouton (ou qu'on appuie sur Espace).

### Changements à faire

#### A. Ajouter un état `waitingToStart`

```tsx
const [waitingToStart, setWaitingToStart] = useState(true)
```

#### B. Modifier le useEffect de mount (lignes ~414-436)

Au lieu de démarrer `startGameLoop()` au mount, on dessine juste l'écran d'attente (idle screen) :

```tsx
useEffect(() => {
  if (!waitingToStart) return // Game already started, handled by startGameLoop

  const canvas = canvasRef.current
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const parent = canvas.parentElement
  if (!parent) return

  const rect = parent.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  const W = Math.round(rect.width)
  const H = Math.round(rect.height)
  canvas.width = W * dpr
  canvas.height = H * dpr
  canvas.style.width = `${W}px`
  canvas.style.height = `${H}px`
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  // Draw idle screen: ground + standing student
  const groundY = H * 0.80
  const c = isDark ? '255,255,255' : '0,0,0'
  const bgColor = isDark ? '#04030e' : '#ffffff'

  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, W, H)

  // Ground line
  ctx.strokeStyle = `rgba(${c},0.15)`
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, groundY)
  ctx.lineTo(W, groundY)
  ctx.stroke()

  // Ruler ticks (static)
  for (let x = 0; x < W; x += 10) {
    const isBig = x % 50 < 5
    ctx.strokeStyle = `rgba(${c},0.12)`
    ctx.beginPath()
    ctx.moveTo(x, groundY)
    ctx.lineTo(x, groundY + (isBig ? 6 : 3))
    ctx.stroke()
  }

  // Draw student standing still
  const px = 40
  const py = groundY - 28
  const pc = `rgba(${c},0.82)`

  // Mortarboard
  ctx.fillStyle = pc
  ctx.fillRect(px - 4, py, 18, 3)
  ctx.fillRect(px, py + 3, 10, 3)
  ctx.strokeStyle = pc
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(px + 12, py)
  ctx.lineTo(px + 16, py - 4)
  ctx.stroke()
  ctx.fillRect(px + 15, py - 5, 2, 2)
  // Head
  ctx.fillStyle = pc
  ctx.fillRect(px + 1, py + 6, 8, 8)
  ctx.fillStyle = bgColor
  ctx.fillRect(px + 6, py + 8, 2, 2)
  // Body
  ctx.fillStyle = pc
  ctx.fillRect(px, py + 14, 10, 8)
  // Backpack
  ctx.fillStyle = `rgba(${c},0.55)`
  ctx.fillRect(px - 3, py + 14, 4, 6)
  // Legs (standing)
  ctx.fillStyle = pc
  ctx.fillRect(px + 1, py + 22, 3, 6)
  ctx.fillRect(px + 6, py + 22, 3, 6)

}, [waitingToStart, isDark])
```

#### C. Ajouter le bouton Play en overlay JSX

Dans le JSX du bloc top-right "Récréation", à l'intérieur de la div qui contient le canvas (la div avec `flex: 1, minHeight: 0, position: 'relative'`), ajouter un bouton play **par-dessus le canvas** quand `waitingToStart` est true :

```tsx
<div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
  <canvas ref={canvasRef} style={{ width: '100%', height: '100%', borderRadius: 6 }} />

  {/* Bouton play — écran d'attente */}
  {waitingToStart && (
    <button
      onClick={() => {
        setWaitingToStart(false)
      }}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 36,
        height: 36,
        borderRadius: '50%',
        border: `1px solid ${bg(0.15, isDark)}`,
        background: bg(0.08, isDark),
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        backdropFilter: 'blur(4px)',
      }}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLButtonElement).style.background = bg(0.15, isDark)
        ;(e.currentTarget as HTMLButtonElement).style.transform = 'translate(-50%, -50%) scale(1.1)'
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLButtonElement).style.background = bg(0.08, isDark)
        ;(e.currentTarget as HTMLButtonElement).style.transform = 'translate(-50%, -50%) scale(1)'
      }}
      title="Jouer"
    >
      {/* Triangle play en SVG */}
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M3 1.5L12 7L3 12.5V1.5Z"
          fill={tw(0.50, textIntensity, isDark)}
        />
      </svg>
    </button>
  )}

  {/* Hint quand game over */}
  {!waitingToStart && !gameActive && (
    <div style={{
      position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center',
      fontSize: 10, color: tw(0.25, textIntensity, isDark), letterSpacing: '0.5px',
    }}>
      Espace pour rejouer
    </div>
  )}
</div>
```

#### D. Lancer le game loop SEULEMENT quand `waitingToStart` passe à false

Modifier le useEffect du game loop pour dépendre de `waitingToStart` :

```tsx
useEffect(() => {
  if (waitingToStart) return // Don't start until play button clicked

  let cleanup: (() => void) | undefined
  const startTimeout = setTimeout(() => {
    cleanup = startGameLoop()
  }, 100)

  const canvas = canvasRef.current
  const parent = canvas?.parentElement
  if (!parent) return

  const ro = new ResizeObserver(() => {
    if (cleanup) cleanup()
    cleanup = startGameLoop()
  })
  ro.observe(parent)

  return () => {
    clearTimeout(startTimeout)
    if (cleanup) cleanup()
    ro.disconnect()
  }
}, [startGameLoop, waitingToStart])
```

#### E. Après game over, rejouer remet waitingToStart à false

Dans la fonction `handleJump` à l'intérieur de `startGameLoop`, quand le jeu est over et qu'on rejumpe, le jeu doit directement redémarrer (pas besoin de repasser par le bouton play). C'est déjà le cas car `handleJump` fait un `Object.assign(g, initGame(W, H))` quand `g.over` est true. Ça reste correct.

#### F. Retirer l'ancien hint "Espace pour jouer"

L'ancien `{!gameActive && (...)}` qui affichait "Espace pour jouer" / "Espace pour rejouer" est remplacé par le bouton play (pour le premier lancement) et le hint "Espace pour rejouer" (après game over).

---

## Contraintes design (rappel)

- **Monochrome** : `rgba(255,255,255, X)` en dark, `rgba(0,0,0, X)` en light
- **Pas de couleurs vives**
- **Inline styles**, pas de Tailwind
- **Pas d'emojis**
- Utiliser `tw()` et `bg()` de `@/lib/color-utils`
- Le bouton play doit être **discret** : petit cercle semi-transparent, triangle play en SVG, hover subtil

## Fichiers à modifier

1. `src/components/dashboard/new/PomodoroTimer.tsx` — overlay blur fix
2. `src/components/dashboard/new/ProgressionView.tsx` — bouton play pour le runner

## Vérification

- `npx tsc --noEmit` doit passer
- `npm run build` doit réussir
- Pomodoro : l'overlay doit montrer le contenu flouté derrière (pas un aplat opaque)
- Pomodoro : doit s'adapter au dark/light mode
- Runner : doit afficher l'étudiant immobile + bouton play au premier affichage
- Runner : le jeu ne démarre que quand on clique le bouton play ou Espace
- Runner : après game over, Espace/clic relance directement sans repasser par le bouton play
