# PROMPT — Fix bug scroll MemoireView + Correction texte landing

## BUG 1 : Impossible de scroller vers le bas dans "Mon mémoire"

### Fichier : `src/components/dashboard/new/MemoireView.tsx`

### Cause

Le wheel handler (lignes ~145-190) fait `e.preventDefault()` sur tous les wheel events quand la section n'a pas assez de contenu pour avoir du scroll interne (`hasInternalScroll` est false). Combiné avec `scrollSnapType: 'y mandatory'` et `scrollSnapStop: 'always'`, ça bloque complètement le scroll natif. Le `scrollToChapter()` est appelé mais le cooldown `isSnapping` empêche les appels suivants pendant 600ms, créant un blocage.

### Fix

**Supprimer entièrement le useEffect du wheel handler** (lignes ~145-190, le bloc qui commence par `// Enhanced scroll-snap: wheel handler for stronger magnetic effect`). Le supprimer en entier, de la ligne `useEffect(() => {` jusqu'au `}, [viewMode, activeChapterIdx, chapters.length, scrollToChapter])`.

Le CSS `scrollSnapType: 'y mandatory'` + `scrollSnapStop: 'always'` suffit à créer un effet aimanté. Le wheel handler JS créait un conflit avec le snap natif du navigateur.

**Aussi retirer `scrollSnapStop: 'always'`** de chaque section enfant (ligne ~373). `mandatory` seul est déjà assez aimanté. `scrollSnapStop: 'always'` empêche de scroller librement quand on a beaucoup de chapitres.

Résultat sur les sections enfant (ligne ~368-379) :

```tsx
<div
  key={ch.num}
  data-idx={idx}
  style={{
    scrollSnapAlign: 'start',
    // PAS de scrollSnapStop: 'always'
    minHeight: '100%',
    padding: '24px 24px 24px 24px',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  }}
>
```

Et remettre `scrollBehavior: 'smooth'` sur le conteneur snap (ligne ~352-359) :

```tsx
<div
  ref={snapRef}
  style={{
    flex: '1 1 0',
    minHeight: 0,
    overflowY: 'auto',
    scrollSnapType: 'y mandatory',
    scrollBehavior: 'smooth',       // <-- REMETTRE
  }}
>
```

### Aussi : restaurer le `scrollToChapter` original

Remplacer le `scrollToChapter` actuel (lignes ~77-92) par la version simple :

```tsx
const scrollToChapter = useCallback((idx: number) => {
  const container = snapRef.current
  if (!container) return
  const slide = container.querySelector(`[data-idx="${idx}"]`) as HTMLElement
  if (slide) slide.scrollIntoView({ behavior: 'smooth' })
}, [])
```

Sans dépendance à `activeChapterIdx`, sans reset de scrollTop.

### Résumé des changements MemoireView

1. Supprimer le `useEffect` wheel handler (lignes ~145-190) — EN ENTIER
2. Retirer `scrollSnapStop: 'always'` des sections enfant
3. Remettre `scrollBehavior: 'smooth'` sur le conteneur snap
4. Restaurer `scrollToChapter` simple avec `scrollIntoView`

---

## BUG 2 : Texte de la landing page à corriger

### Fichier : `src/components/landing/FeaturesSection.tsx`

### Ligne 30 : remplacer

```tsx
Tout ce qu&apos;il te faut
```

par :

```tsx
Tout ce qu&apos;il te faut pour finir ton m&eacute;moire.
```

### Ligne 33 : remplacer

```tsx
Un outil pensé pour les étudiants en alternance.
```

par :

```tsx
Un outil pensé pour les étudiants.
```
