# PROMPT — Scroll snap plus aimanté dans MemoireView (détail des sections)

## Problème

Dans la vue "Mon mémoire" en mode détail, le scroll snap entre les chapitres est trop "mou". L'utilisateur veut un effet aimanté plus fort, plus satisfaisant, tout en préservant le scroll interne de chaque section (quand le contenu dépasse la hauteur visible).

## Fichier : `src/components/dashboard/new/MemoireView.tsx`

## Approche

Le CSS `scroll-snap-type: y mandatory` est déjà en place mais le résultat est mou car :
1. Chaque section enfant a `overflowY: 'auto'` qui crée un scroll interne concurrent
2. Le `scrollBehavior: 'smooth'` natif est lent et peu satisfaisant
3. Pas de `scroll-snap-stop: always` pour forcer l'arrêt sur chaque section

On va renforcer le snap avec du CSS + un gestionnaire JS de scroll par "page" (wheel event), tout en s'assurant que le scroll interne des sections longues fonctionne normalement.

## Modifications

### 1. CSS du conteneur snap (ligne ~297-303)

Remplacer le style du conteneur snap :

```tsx
<div
  ref={snapRef}
  style={{
    flex: '1 1 0',
    minHeight: 0,
    overflowY: 'auto',
    scrollSnapType: 'y mandatory',
    // Retirer scrollBehavior: 'smooth' — on gère le smooth en JS
  }}
>
```

Retirer `scrollBehavior: 'smooth'` du conteneur. Le smooth sera géré par le JS quand on scroll programmatiquement.

### 2. CSS de chaque section enfant (ligne ~315-322)

Ajouter `scrollSnapStop: 'always'` pour forcer l'arrêt sur chaque section :

```tsx
<div
  key={ch.num}
  data-idx={idx}
  style={{
    scrollSnapAlign: 'start',
    scrollSnapStop: 'always',   // <-- AJOUTER : force l'arrêt sur chaque section
    minHeight: '100%',
    padding: '24px 24px 24px 24px',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',          // <-- GARDER : le scroll interne doit fonctionner
  }}
>
```

### 3. Gestionnaire wheel intelligent (NOUVEAU)

Ajouter un `useEffect` qui intercepte le wheel event sur le conteneur snap pour implémenter un scroll "page par page" plus aimanté. La logique clé :

- Si la section active a du scroll interne ET qu'on n'est pas au bout (top ou bottom), laisser le scroll interne se faire normalement
- Si la section est au bout de son scroll interne (ou n'a pas de scroll interne), snapper vers la section suivante/précédente

```tsx
// Enhanced scroll-snap: wheel handler for stronger magnetic effect
useEffect(() => {
  if (viewMode !== 'detail') return
  const container = snapRef.current
  if (!container) return

  let isSnapping = false
  let snapTimeout: ReturnType<typeof setTimeout> | null = null

  const handleWheel = (e: WheelEvent) => {
    // Trouver la section active
    const activeSlide = container.querySelector(`[data-idx="${activeChapterIdx}"]`) as HTMLElement
    if (!activeSlide) return

    // Vérifier si la section active a du scroll interne
    const hasInternalScroll = activeSlide.scrollHeight > activeSlide.clientHeight + 2

    if (hasInternalScroll) {
      const atTop = activeSlide.scrollTop <= 1
      const atBottom = activeSlide.scrollTop + activeSlide.clientHeight >= activeSlide.scrollHeight - 2

      // Si on scroll vers le haut et qu'on est pas en haut → laisser le scroll interne
      if (e.deltaY < 0 && !atTop) return
      // Si on scroll vers le bas et qu'on est pas en bas → laisser le scroll interne
      if (e.deltaY > 0 && !atBottom) return
    }

    // On est au bout du scroll interne (ou pas de scroll interne) → snap vers section suivante/précédente
    e.preventDefault()

    if (isSnapping) return
    isSnapping = true

    const direction = e.deltaY > 0 ? 1 : -1
    const nextIdx = activeChapterIdx + direction

    if (nextIdx >= 0 && nextIdx < chapters.length) {
      scrollToChapter(nextIdx)
    }

    // Cooldown pour éviter le multi-snap
    snapTimeout = setTimeout(() => {
      isSnapping = false
    }, 600)
  }

  container.addEventListener('wheel', handleWheel, { passive: false })
  return () => {
    container.removeEventListener('wheel', handleWheel)
    if (snapTimeout) clearTimeout(snapTimeout)
  }
}, [viewMode, activeChapterIdx, chapters.length, scrollToChapter])
```

### 4. Améliorer scrollToChapter (ligne 77-82)

Remplacer `scrollIntoView` par `scrollTo` avec un timing plus précis :

```tsx
const scrollToChapter = useCallback((idx: number) => {
  const container = snapRef.current
  if (!container) return
  const slide = container.querySelector(`[data-idx="${idx}"]`) as HTMLElement
  if (!slide) return

  // Reset le scroll interne de la section qu'on quitte
  const currentSlide = container.querySelector(`[data-idx="${activeChapterIdx}"]`) as HTMLElement
  if (currentSlide) currentSlide.scrollTop = 0

  // Scroll vers la nouvelle section
  container.scrollTo({
    top: slide.offsetTop,
    behavior: 'smooth',
  })
}, [activeChapterIdx])
```

Note : `activeChapterIdx` est maintenant une dépendance du callback. Vérifier que ça ne crée pas de boucle.

### 5. Ajuster l'IntersectionObserver (ligne 91-104)

Monter le `threshold` de 0.6 à 0.7 pour que la détection de section active soit plus stricte (la section doit être plus visible avant d'être considérée "active") :

```tsx
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const idx = parseInt(entry.target.getAttribute('data-idx') || '0')
        setActiveChapterIdx(idx)
      }
    })
  },
  { root: container, threshold: 0.7 }  // <-- 0.6 → 0.7
)
```

## Résumé

| Aspect | Avant | Après |
|---|---|---|
| `scrollSnapStop` | absent | `always` sur chaque section |
| `scrollBehavior` | `smooth` en CSS | retiré (géré en JS) |
| Wheel event | natif (lent, mou) | intercepté avec cooldown 600ms |
| Scroll interne | fonctionne mais interfère | détection top/bottom avant snap |
| `scrollIntoView` | utilisé | remplacé par `scrollTo` |
| `threshold` IntersectionObserver | 0.6 | 0.7 |

## IMPORTANT

- Le scroll interne des sections longues (quand le contenu dépasse) doit CONTINUER à fonctionner normalement
- Le snap amélioré ne se déclenche QUE quand on est au bout du scroll interne (atTop/atBottom)
- Le cooldown de 600ms empêche le multi-snap (scroller trop vite et sauter 2 sections)
- Les flèches clavier (ArrowUp/ArrowDown) continuent de fonctionner normalement via le handler existant
