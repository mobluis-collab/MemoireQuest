# PROMPT — Bouton Focus animé + Mode Focus immersif

Ce prompt couvre 2 choses :
1. Le **bouton Focus** avec animations (halo, orbit, ripple)
2. Le **mode Focus** redesigné : focus sur une section + ambiance immersive

---

## PARTIE 1 : Bouton Focus animé

### Fichier : `src/components/dashboard/new/NewDashboard.tsx`

### Keyframes à ajouter (à côté des autres `@keyframes mq-*` du fichier)

```css
@keyframes mq-focus-breathe {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.15); }
}
@keyframes mq-focus-ripple {
  to { transform: scale(3); opacity: 0; }
}
@keyframes mq-orbit-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### Remplacer le bouton Focus actuel (lignes ~1174-1190) par :

Structure : un wrapper `<div>` relatif qui contient le halo + le bouton.

```tsx
<div style={{ position: 'relative', display: 'inline-flex' }}>
  <button
    onClick={(e) => {
      // Ripple effect
      const btn = e.currentTarget
      const rect = btn.getBoundingClientRect()
      const ripple = document.createElement('div')
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      ripple.style.cssText = `
        position:absolute; border-radius:50%; pointer-events:none;
        left:${x}px; top:${y}px; width:40px; height:40px;
        margin-left:-20px; margin-top:-20px;
        background:${isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.12)'};
        transform:scale(0);
        animation: mq-focus-ripple 0.5s ease-out forwards;
      `
      btn.appendChild(ripple)
      setTimeout(() => ripple.remove(), 500)
      setFocusMode(true)
    }}
    style={{
      position: 'relative',
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '6px 14px', borderRadius: 99,
      border: `1px solid ${bg(0.14, isDark)}`,
      background: bg(0.06, isDark),
      color: tw(0.55, textIntensity, isDark),
      fontSize: 11, fontWeight: 500, cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
      overflow: 'hidden',
      zIndex: 1,
    }}
    title="Mode focus (F)"
  >
    {/* Eye icon avec halo autour */}
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* HALO — centré autour de l'oeil uniquement */}
      <span style={{
        position: 'absolute',
        inset: -6,
        borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(0,0,0,0.08) 0%, transparent 70%)',
        animation: 'mq-focus-breathe 3s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      {/* Orbit ring — autour de l'oeil */}
      <span style={{
        position: 'absolute',
        inset: -4,
        borderRadius: '50%',
        border: `1px solid ${bg(0.08, isDark)}`,
        animation: 'mq-orbit-spin 4s linear infinite',
        pointerEvents: 'none',
      }}>
        <span style={{
          position: 'absolute',
          top: -1.5, left: '50%',
          width: 3, height: 3,
          marginLeft: -1.5,
          borderRadius: '50%',
          background: tw(0.35, textIntensity, isDark),
        }} />
      </span>
      {/* Eye SVG */}
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ position: 'relative', zIndex: 1 }}>
        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    </span>
    <span>Focus</span>
  </button>
</div>
```

Le halo et l'orbit sont **autour de l'oeil** (dans le `<span>` wrapper de l'icone), PAS autour du bouton entier.

---

## PARTIE 2 : Mode Focus immersif (A + C)

### Concept

Quand l'utilisateur active le Focus :
1. Il voit d'abord un **écran de sélection** : la liste de ses sections/chapitres. Il clique sur celle qu'il veut travailler.
2. Le dashboard bascule en **mode immersif** : tout disparaît (sidebar, toolbar, stats, jeu) sauf la section choisie affichée en grand, le hint de rédaction bien visible, et le Pomodoro compact qui démarre automatiquement en haut à droite.
3. Un **compteur de temps de session** discret s'affiche (temps écoulé depuis le début du focus).
4. L'ambiance change : le fond s'assombrit très légèrement (ou s'éclaircit en light mode) pour marquer visuellement qu'on est "dans la zone".

### Nouveau state nécessaire

```tsx
const [focusSection, setFocusSection] = useState<{ chapterIdx: number; sectionIdx: number } | null>(null)
const [focusStartTime, setFocusStartTime] = useState<number | null>(null)
```

### Flow

1. `setFocusMode(true)` → affiche l'écran de sélection de section
2. L'utilisateur clique sur une section → `setFocusSection({ chapterIdx, sectionIdx })` + `setFocusStartTime(Date.now())` + `setPomodoroOpen(true)` (le pomodoro se lance)
3. Le mode focus affiche maintenant :
   - Un fond très légèrement modifié : `background: isDark ? '#030210' : '#fafafa'` (plus sombre/clair que normal)
   - En haut : un header fin avec le nom de la section + bouton "Quitter focus" + temps écoulé
   - Au centre : le contenu de la section en grand (titre, hint, sous-tâches)
   - Le Pomodoro compact en position fixed top-right (il est déjà géré par `pomodoroOpen`)
4. Escape ou clic "Quitter" → `setFocusMode(false)` + `setFocusSection(null)` + `setFocusStartTime(null)`

### Écran de sélection de section

Quand `focusMode === true && focusSection === null` :

```tsx
<div style={{
  position: 'fixed', inset: 0, zIndex: 9990,
  background: isDark ? 'rgba(4,3,14,0.85)' : 'rgba(255,255,255,0.85)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexDirection: 'column',
  animation: 'mq-overlay-in 0.25s ease both',
}}>
  {/* Titre */}
  <div style={{
    fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: '2px', color: tw(0.30, textIntensity, isDark),
    marginBottom: 24,
  }}>
    Sur quoi veux-tu te concentrer ?
  </div>

  {/* Liste des sections */}
  <div style={{
    display: 'flex', flexDirection: 'column', gap: 6,
    maxHeight: '60vh', overflowY: 'auto',
    width: 400, maxWidth: '90vw',
  }}>
    {chapters.map((chapter, ci) =>
      chapter.sections.map((section, si) => (
        <button
          key={`${ci}-${si}`}
          onClick={() => {
            setFocusSection({ chapterIdx: ci, sectionIdx: si })
            setFocusStartTime(Date.now())
            setPomodoroOpen(true)
          }}
          style={{
            textAlign: 'left',
            padding: '12px 16px', borderRadius: 10,
            border: `1px solid ${bg(0.08, isDark)}`,
            background: bg(0.04, isDark),
            color: tw(0.65, textIntensity, isDark),
            fontSize: 13, cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <div style={{ fontSize: 10, color: tw(0.30, textIntensity, isDark), marginBottom: 4 }}>
            {chapter.title}
          </div>
          <div style={{ fontWeight: 500 }}>
            {section.title}
          </div>
        </button>
      ))
    )}
  </div>

  {/* Bouton annuler */}
  <button
    onClick={() => setFocusMode(false)}
    style={{
      marginTop: 20,
      padding: '6px 16px', borderRadius: 99,
      border: `1px solid ${bg(0.08, isDark)}`,
      background: 'transparent',
      color: tw(0.35, textIntensity, isDark),
      fontSize: 11, cursor: 'pointer',
    }}
  >
    Annuler
  </button>
</div>
```

### Vue Focus immersive

Quand `focusMode === true && focusSection !== null` :

La section sélectionnée est accessible via :
```tsx
const focusChapter = chapters[focusSection.chapterIdx]
const focusSectionData = focusChapter?.sections[focusSection.sectionIdx]
```

Afficher un layout plein écran :

```tsx
<div style={{
  position: 'fixed', inset: 0, zIndex: 9990,
  background: isDark ? '#030210' : '#fafafa',
  display: 'flex', flexDirection: 'column',
  animation: 'mq-overlay-in 0.25s ease both',
}}>
  {/* Header bar */}
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 20px',
    borderBottom: `1px solid ${bg(0.06, isDark)}`,
  }}>
    {/* Gauche : chapitre > section */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 10, color: tw(0.25, textIntensity, isDark), textTransform: 'uppercase', letterSpacing: '1px' }}>
        Focus
      </span>
      <span style={{ fontSize: 12, color: tw(0.50, textIntensity, isDark) }}>
        {focusChapter.title} — {focusSectionData.title}
      </span>
    </div>
    {/* Droite : timer de session + quitter */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {/* Compteur temps écoulé — utiliser un useEffect avec setInterval pour incrémenter */}
      <FocusTimer startTime={focusStartTime} isDark={isDark} textIntensity={textIntensity} />
      <button
        onClick={() => {
          setFocusMode(false)
          setFocusSection(null)
          setFocusStartTime(null)
        }}
        style={{
          padding: '5px 12px', borderRadius: 99,
          border: `1px solid ${bg(0.10, isDark)}`,
          background: bg(0.06, isDark),
          color: tw(0.45, textIntensity, isDark),
          fontSize: 11, fontWeight: 500, cursor: 'pointer',
        }}
      >
        Quitter focus
      </button>
    </div>
  </div>

  {/* Contenu central — section en grand */}
  <div style={{
    flex: 1, overflow: 'auto',
    display: 'flex', justifyContent: 'center',
    padding: '40px 20px',
  }}>
    <div style={{ maxWidth: 640, width: '100%' }}>
      {/* Titre de la section */}
      <h2 style={{
        fontSize: 22, fontWeight: 600,
        color: tw(0.85, textIntensity, isDark),
        marginBottom: 16,
      }}>
        {focusSectionData.title}
      </h2>

      {/* Hint de rédaction — bien visible */}
      {focusSectionData.hint && (
        <div style={{
          padding: '14px 18px', borderRadius: 10,
          border: `1px solid ${bg(0.08, isDark)}`,
          background: bg(0.04, isDark),
          color: tw(0.55, textIntensity, isDark),
          fontSize: 13, lineHeight: '1.6',
          marginBottom: 24,
        }}>
          <div style={{
            fontSize: 9, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '1.5px', color: tw(0.25, textIntensity, isDark),
            marginBottom: 8,
          }}>
            Conseil de r&eacute;daction
          </div>
          {focusSectionData.hint}
        </div>
      )}

      {/* Sous-tâches de la section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {focusSectionData.subtasks?.map((subtask, idx) => {
          const qp = questProgress?.[focusSection.chapterIdx]?.[focusSection.sectionIdx]
          const isComplete = qp?.[idx] === true
          return (
            <button
              key={idx}
              onClick={() => handleSubtaskToggle(focusSection.chapterIdx, focusSection.sectionIdx, idx)}
              style={{
                textAlign: 'left',
                padding: '10px 14px', borderRadius: 8,
                border: `1px solid ${bg(isComplete ? 0.12 : 0.06, isDark)}`,
                background: bg(isComplete ? 0.06 : 0.02, isDark),
                color: tw(isComplete ? 0.35 : 0.65, textIntensity, isDark),
                fontSize: 13, cursor: 'pointer',
                textDecoration: isComplete ? 'line-through' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {subtask}
            </button>
          )
        })}
      </div>
    </div>
  </div>
</div>
```

### Composant FocusTimer (petit compteur temps écoulé)

Créer un petit composant inline ou extrait :

```tsx
function FocusTimer({ startTime, isDark, textIntensity }: { startTime: number | null; isDark: boolean; textIntensity: number }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!startTime) return
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60

  return (
    <span style={{
      fontSize: 11, fontFamily: 'inherit',
      color: tw(0.30, textIntensity, isDark),
      letterSpacing: '0.5px',
    }}>
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')} de focus
    </span>
  )
}
```

### Adaptation du bouton "Quitter focus" existant (lignes ~1599-1630)

Supprimer l'ancien bouton flottant "Quitter focus" (lignes ~1599-1630). Le nouveau mode Focus a son propre header avec un bouton quitter intégré.

### Comportement de la sidebar quand focusMode est actif

Garder le comportement actuel : `width: focusMode ? 0 : ...` et `opacity: focusMode ? 0 : 1`. La vue focus se superpose en position fixed de toute façon, donc la sidebar est masquée.

### Contraintes

- Inline styles, PAS de Tailwind
- Monochrome : `tw()` et `bg()` de `@/lib/color-utils`
- Pas d'emojis
- Le Pomodoro compact est rendu indépendamment via `<PomodoroTimer>`, il suffit de faire `setPomodoroOpen(true)` pour l'afficher
- L'accès aux sous-tâches et `handleSubtaskToggle` existe déjà dans le composant

### Résumé du flow utilisateur

1. Clic sur le bouton Focus (avec ripple + halo autour de l'oeil)
2. Overlay de sélection : "Sur quoi veux-tu te concentrer ?" → liste des sections
3. Clic sur une section → mode immersif : fond assombri, section en grand avec hint, sous-tâches cliquables, Pomodoro auto-lancé en haut à droite, compteur de temps de focus
4. L'étudiant travaille, coche ses sous-tâches, le Pomodoro rythme ses sessions
5. Clic "Quitter focus" ou Escape → retour au dashboard normal
