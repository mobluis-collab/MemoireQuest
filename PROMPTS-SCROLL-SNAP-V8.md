# PROMPT — Scroll Snap TikTok pour MemoireView

## Contexte

Le mode "detail" de `MemoireView.tsx` affiche actuellement UN chapitre à la fois avec des boutons prev/next (flèches + compteur "1/11") dans la top bar. On veut remplacer ça par un scroll vertical snap style TikTok : chaque chapitre = un écran, on scrolle pour passer au suivant.

## Fichier à modifier

`src/components/dashboard/new/MemoireView.tsx`

## Ce qui CHANGE (mode detail uniquement)

### 1. Supprimer la navigation par boutons

Supprimer les boutons prev/next (‹ ›) et le compteur "X / Y" de la top bar. Garder UNIQUEMENT le bouton "‹ Vue d'ensemble" à gauche de la top bar.

### 2. Scroll snap container

Remplacer le rendu actuel du mode detail (qui affiche `chapters[selectedChapterIdx]`) par un container qui affiche **TOUS les chapitres** empilés verticalement avec scroll snap :

```tsx
<div
  ref={snapRef}
  style={{
    flex: '1 1 0',
    minHeight: 0,
    overflowY: 'auto',
    scrollSnapType: 'y mandatory',
    scrollBehavior: 'smooth',
  }}
>
  {chapters.map((ch, idx) => (
    <div
      key={ch.num}
      data-idx={idx}
      style={{
        scrollSnapAlign: 'start',
        minHeight: '100%',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto', // scroll interne si contenu dépasse
      }}
    >
      {/* Contenu du chapitre — IDENTIQUE au rendu actuel */}
      {/* ch-number, ch-title, progress bar, stats, objective, tips, sections avec subtasks */}
    </div>
  ))}
</div>
```

### 3. Dots de navigation — COLONNE VERTICALE À DROITE

Ajouter une colonne de dots **positionnée à droite** du contenu, centrée verticalement. Style TikTok.

```tsx
{/* Dots — colonne verticale à droite */}
<div style={{
  position: 'absolute',
  right: 12,
  top: '50%',
  transform: 'translateY(-50%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 6,
  zIndex: 10,
}}>
  {chapters.map((_, idx) => (
    <div
      key={idx}
      onClick={() => scrollToChapter(idx)}
      style={{
        width: activeChapterIdx === idx ? 6 : 5,
        height: activeChapterIdx === idx ? 18 : 5,
        borderRadius: 99,
        background: activeChapterIdx === idx
          ? tw(0.6, textIntensity, isDark)
          : tw(0.12, textIntensity, isDark),
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
      }}
    />
  ))}
</div>
```

**IMPORTANT** : le wrapper du mode detail doit avoir `position: 'relative'` pour que les dots soient positionnés correctement.

### 4. Tracking du chapitre actif avec IntersectionObserver

Ajouter un state `activeChapterIdx` et un IntersectionObserver pour détecter quel chapitre est visible :

```tsx
const [activeChapterIdx, setActiveChapterIdx] = useState(0)
const snapRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  if (viewMode !== 'detail') return
  const container = snapRef.current
  if (!container) return

  const slides = container.querySelectorAll<HTMLElement>('[data-idx]')
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = parseInt(entry.target.getAttribute('data-idx') || '0')
          setActiveChapterIdx(idx)
        }
      })
    },
    { root: container, threshold: 0.6 }
  )

  slides.forEach((s) => observer.observe(s))
  return () => observer.disconnect()
}, [viewMode, chapters.length])
```

### 5. Fonction scrollToChapter

Pour les dots cliquables et la navigation clavier :

```tsx
const scrollToChapter = useCallback((idx: number) => {
  const container = snapRef.current
  if (!container) return
  const slide = container.querySelector(`[data-idx="${idx}"]`) as HTMLElement
  if (slide) slide.scrollIntoView({ behavior: 'smooth' })
}, [])
```

### 6. Scroll au chapitre sélectionné à l'ouverture

Quand l'utilisateur clique sur un chapitre dans la vue d'ensemble, le mode detail doit s'ouvrir ET scroller au bon chapitre :

```tsx
useEffect(() => {
  if (viewMode === 'detail') {
    // Petit délai pour laisser le DOM se rendre
    setTimeout(() => scrollToChapter(selectedChapterIdx), 50)
  }
}, [viewMode, selectedChapterIdx, scrollToChapter])
```

### 7. Hint "scroll" sur le premier chapitre

Ajouter un indicateur de scroll en bas du container, visible uniquement quand on est sur le premier chapitre :

```tsx
{activeChapterIdx === 0 && (
  <div style={{
    position: 'absolute',
    bottom: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    opacity: 0.25,
    pointerEvents: 'none',
    animation: 'none', // on utilise une animation CSS inline
  }}>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={tw(0.4, textIntensity, isDark)} strokeWidth="1.5" strokeLinecap="round">
      <path d="M4 6l4 4 4-4" />
    </svg>
    <span style={{ fontSize: 9, color: tw(0.3, textIntensity, isDark) }}>scroll</span>
  </div>
)}
```

### 8. Adapter la navigation clavier

Remplacer ArrowLeft/ArrowRight par ArrowUp/ArrowDown (ET garder ArrowLeft/ArrowRight pour rétrocompatibilité) :

```tsx
useEffect(() => {
  if (viewMode !== 'detail') return
  const handleKeyDown = (e: KeyboardEvent) => {
    const tag = document.activeElement?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
    if (e.key === 'Escape') {
      e.preventDefault()
      goBack()
    } else if ((e.key === 'ArrowUp' || e.key === 'ArrowLeft') && activeChapterIdx > 0) {
      e.preventDefault()
      scrollToChapter(activeChapterIdx - 1)
    } else if ((e.key === 'ArrowDown' || e.key === 'ArrowRight') && activeChapterIdx < chapters.length - 1) {
      e.preventDefault()
      scrollToChapter(activeChapterIdx + 1)
    }
  }
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [viewMode, activeChapterIdx, chapters.length, scrollToChapter])
```

### 9. Supprimer les states/fonctions obsolètes

- Supprimer `goPrev` et `goNext` (remplacés par scrollToChapter)
- Garder `selectedChapterIdx` (utilisé pour l'ouverture initiale depuis la vue d'ensemble)
- Garder `openChapter` (met selectedChapterIdx + passe en mode detail)

## Ce qui NE CHANGE PAS

- **Vue d'ensemble** : inchangée, la liste des chapitres reste identique
- **Contenu de chaque chapitre** : objectif, tips, sections, subtasks, checkboxes — tout reste identique
- **onSubtaskToggle** : le toggle des sous-tâches fonctionne pareil
- **Animations checkbox bounce** : inchangées
- **Styles** : monochrome uniquement, `tw()` et `bg()`, inline styles, pas de Tailwind
- **Props du composant** : inchangées

## Résumé des changements

| Avant | Après |
|-------|-------|
| Affiche 1 chapitre, boutons prev/next | Affiche tous les chapitres, scroll snap vertical |
| Compteur "X / Y" dans la top bar | Dots verticaux à droite |
| ArrowLeft/Right pour naviguer | ArrowUp/Down (+ Left/Right) pour naviguer |
| Pas de scroll entre chapitres | Scroll snap `y mandatory` |

## Vérifications

1. Ouvrir "Mon mémoire" > cliquer sur un chapitre au milieu (ex: chapitre 5) → doit s'ouvrir directement au bon chapitre
2. Scroller vers le bas → doit snapper au chapitre suivant
3. Cliquer sur un dot → doit scroller au chapitre correspondant
4. Le dot actif doit être allongé (height 18px) et plus lumineux
5. Les sous-tâches restent cochables dans chaque chapitre
6. Escape → retour à la vue d'ensemble
7. `npm run build` doit passer sans erreur
