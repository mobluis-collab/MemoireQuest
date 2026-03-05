# PROMPT — Fix des dots de navigation dans MemoireView

## Problème

Les dots de navigation verticaux (petits ronds à droite de l'écran en mode detail) ne fonctionnent plus quand un plan a beaucoup de sections par chapitre. Le dot actif ne se met pas à jour au scroll.

**Cause racine** : L'`IntersectionObserver` utilise `threshold: 0.7` (70% du slide doit être visible). Mais quand un chapitre a 5-8 sections avec 3 tasks chacune, le slide fait 2-3x la hauteur du viewport → 70% ne sera JAMAIS visible → le dot ne s'active jamais.

**Problème secondaire** : `scrollSnapType: 'y mandatory'` empêche le scroll libre dans un chapitre long. Le snap force le retour au début du slide.

## Fichier à modifier : `src/components/dashboard/new/MemoireView.tsx`

### Fix 1 : Remplacer l'IntersectionObserver par un scroll listener

Le problème de l'IntersectionObserver c'est qu'avec threshold 0.7, les grands chapitres ne déclenchent jamais l'observation. Remplacer par un scroll listener qui détecte quel chapitre est le plus proche du haut du conteneur.

Remplacer le useEffect de l'IntersectionObserver (lignes 85-105) :

```tsx
// IntersectionObserver for active chapter tracking
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
    { root: container, threshold: 0.7 }
  )

  slides.forEach((s) => observer.observe(s))
  return () => observer.disconnect()
}, [viewMode, chapters.length])
```

Par :

```tsx
// Scroll-based active chapter tracking (fonctionne avec toutes les tailles de chapitre)
useEffect(() => {
  if (viewMode !== 'detail') return
  const container = snapRef.current
  if (!container) return

  const handleScroll = () => {
    const slides = container.querySelectorAll<HTMLElement>('[data-idx]')
    const containerTop = container.scrollTop
    const containerHeight = container.clientHeight
    const midPoint = containerTop + containerHeight * 0.3 // point de détection à 30% du haut

    let closestIdx = 0
    let closestDist = Infinity

    slides.forEach((slide) => {
      const slideTop = slide.offsetTop
      const slideBottom = slideTop + slide.offsetHeight
      // Le chapitre est "actif" s'il contient le point de détection
      if (slideTop <= midPoint && slideBottom > midPoint) {
        closestIdx = parseInt(slide.getAttribute('data-idx') || '0')
        closestDist = 0
      } else {
        const dist = Math.abs(slideTop - midPoint)
        if (dist < closestDist) {
          closestDist = dist
          closestIdx = parseInt(slide.getAttribute('data-idx') || '0')
        }
      }
    })

    setActiveChapterIdx(closestIdx)
  }

  container.addEventListener('scroll', handleScroll, { passive: true })
  // Trigger initial detection
  handleScroll()

  return () => container.removeEventListener('scroll', handleScroll)
}, [viewMode, chapters.length])
```

### Fix 2 : Changer `scrollSnapType` de `mandatory` à `proximity`

`mandatory` force le snap à chaque scroll, ce qui piège l'utilisateur dans les longs chapitres. `proximity` permet le scroll libre mais snappe quand on est proche d'une bordure.

Ligne 301, remplacer :

```tsx
scrollSnapType: 'y mandatory',
```

Par :

```tsx
scrollSnapType: 'y proximity',
```

### Fix 3 : Limiter la taille des dots quand il y a beaucoup de chapitres

Avec 7+ chapitres, les dots peuvent déborder verticalement. Ajouter un `maxHeight` et réduire le `gap`.

Remplacer le style du conteneur des dots (lignes 565-574) :

```tsx
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
```

Par :

```tsx
<div style={{
  position: 'absolute',
  right: 12,
  top: '50%',
  transform: 'translateY(-50%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: chapters.length > 8 ? 4 : 6,
  zIndex: 10,
  maxHeight: '60%',
  overflowY: 'hidden',
}}>
```

Et réduire la taille des dots actifs quand il y a beaucoup de chapitres. Remplacer le style de chaque dot (lignes 580-589) :

```tsx
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
```

Par :

```tsx
style={{
  width: activeChapterIdx === idx ? 6 : 5,
  height: activeChapterIdx === idx ? (chapters.length > 8 ? 12 : 18) : 5,
  borderRadius: 99,
  background: activeChapterIdx === idx
    ? tw(0.6, textIntensity, isDark)
    : tw(0.12, textIntensity, isDark),
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
}}
```

## Résumé

| Changement | Avant | Après | Pourquoi |
|-----------|-------|-------|----------|
| Détection du chapitre actif | `IntersectionObserver` threshold 0.7 | Scroll listener position-based | Fonctionne quelle que soit la taille du chapitre |
| Scroll snap | `mandatory` | `proximity` | Permet le scroll libre dans les longs chapitres |
| Dots overflow | Pas de max height | `maxHeight: 60%`, gap adaptatif | Gère les plans avec 8+ chapitres |
| Dots taille | 18px quand actif | 12px si >8 chapitres | Évite le débordement |
