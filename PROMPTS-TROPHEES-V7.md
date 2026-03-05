# PROMPT CLAUDE CODE — V7 : Refonte visuelle Trophées (AchievementsView)

> **INSTRUCTION** : Exécute ce prompt en UN SEUL sub-agent.
> Après, lance `npx tsc --noEmit` puis `npm run build`.
> Ne modifie AUCUN autre fichier que `AchievementsView.tsx`.
> Design monochrome UNIQUEMENT : `tw()`, `bg()`, inline styles. AUCUNE couleur vive, AUCUN emoji.

---

## CONTEXTE

Le composant `src/components/dashboard/new/AchievementsView.tsx` affiche les trophées (achievements) de l'utilisateur. Actuellement c'est une pyramide de petits carrés 56px avec des `✓` et `○` — beaucoup trop fade et cheap. On veut une refonte complète en **cartes avec icônes SVG monochrome**, hexagones en fond, et un vrai design premium.

## FICHIER À MODIFIER

`src/components/dashboard/new/AchievementsView.tsx` — **RÉÉCRITURE COMPLÈTE** du rendu, en gardant la même logique métier (`buildAchievements`, props, types).

---

## STRUCTURE CIBLE

On abandonne la pyramide. Le nouveau layout est une **grille par tier** (du bas vers le haut) :

```
┌─ HEADER ──────────────────────────────────────────────┐
│  Trophées                                    4 / 12   │
└───────────────────────────────────────────────────────┘

┌─ TIER : PREMIERS PAS ────────────────────────────────┐
│  label: "PREMIERS PAS" (10px, uppercase, 0.20 opacity)│
│                                                       │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│  │  ⬡ SVG  │  │  ⬡ SVG  │  │  ⬡ SVG  │  │  ⬡ SVG  │ │
│  │  icon   │  │  icon   │  │  icon   │  │  icon   │ │
│  │ titre   │  │ titre   │  │ titre   │  │ titre   │ │
│  │ desc    │  │ desc    │  │ desc    │  │ desc    │ │
│  │ ███░░░  │  │ ███░░░  │  │ ✓ déblo │  │ ✓ déblo │ │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘ │
└───────────────────────────────────────────────────────┘
  (séparateur fin dégradé)

┌─ TIER : JALONS ──────────────────────────────────────┐
│  4 cartes en grid-4                                   │
└───────────────────────────────────────────────────────┘
  (séparateur)

┌─ TIER : DÉFIS ───────────────────────────────────────┐
│  3 cartes en grid-3                                   │
└───────────────────────────────────────────────────────┘
  (séparateur)

┌─ TIER : ABOUTISSEMENT ───────────────────────────────┐
│  1 carte plus large (max-width: 220px)                │
└───────────────────────────────────────────────────────┘
```

---

## ICÔNES SVG PAR ACHIEVEMENT

Chaque achievement a une icône SVG **stroke-only** (pas de fill, style Lucide/Feather). Voici les icônes EXACTES à utiliser pour chaque `id` :

### Tier 0 — Premiers pas

**`first_section`** — Flèche diagonale (lancement) :
```tsx
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  <line x1="7" y1="17" x2="17" y2="7"/>
  <polyline points="7 7 17 7 17 17"/>
</svg>
```

**`sections_5`** — Plume/stylo (écriture) :
```tsx
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  <path d="M12 20h9"/>
  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
</svg>
```

**`streak_3`** — Flamme (régularité) :
```tsx
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
</svg>
```

**`first_chapter`** — Livre fermé (chapitre) :
```tsx
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  <line x1="9" y1="7" x2="15" y2="7"/>
</svg>
```

### Tier 1 — Jalons

**`sections_10`** — Livre ouvert :
```tsx
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
</svg>
```

**`streak_7`** — Calendrier :
```tsx
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  <rect x="3" y="4" width="18" height="18" rx="2"/>
  <line x1="16" y1="2" x2="16" y2="6"/>
  <line x1="8" y1="2" x2="8" y2="6"/>
  <line x1="3" y1="10" x2="21" y2="10"/>
</svg>
```

**`half_way`** — Cible (mi-chemin) :
```tsx
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  <circle cx="12" cy="12" r="10"/>
  <circle cx="12" cy="12" r="6"/>
  <circle cx="12" cy="12" r="2"/>
</svg>
```

**`chapters_3`** — Médaille :
```tsx
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  <circle cx="12" cy="8" r="6"/>
  <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
</svg>
```

### Tier 2 — Défis

**`sections_20`** — Couches/stack (volume) :
```tsx
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  <polygon points="12,2 22,8.5 12,15 2,8.5"/>
  <polyline points="2,15.5 12,22 22,15.5"/>
  <polyline points="2,12 12,18.5 22,12"/>
</svg>
```

**`streak_14`** — Bouclier (endurance) :
```tsx
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  <path d="M12 2l8 4v6c0 5.25-3.5 10.74-8 12-4.5-1.26-8-6.75-8-12V6l8-4z"/>
</svg>
```

**`points_1000`** — Éclair (XP) :
```tsx
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/>
</svg>
```

### Tier 3 — Aboutissement

**`all_done`** — Couronne :
```tsx
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  <path d="M2 8l4 12h12l4-12-5 4-5-8-5 8-5-4z"/>
  <line x1="4" y1="20" x2="20" y2="20"/>
</svg>
```

---

## MAP D'ICÔNES

Créer une constante `TROPHY_ICONS` qui mappe chaque `id` à son JSX SVG. Utiliser une fonction helper :

```typescript
function TrophyIcon({ id, size = 24, color }: { id: string; size?: number; color: string }) {
  // Switch/map sur l'id, retourne le SVG correspondant
  // Tous les SVGs ont : fill="none", stroke={color}, strokeWidth="1.5", strokeLinecap="round", strokeLinejoin="round"
  // width={size}, height={size}
}
```

---

## HEXAGONE EN FOND

Chaque carte a un hexagone SVG semi-transparent derrière l'icône :

```tsx
<svg viewBox="0 0 48 48" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
  <polygon
    points="24,3 44,14 44,34 24,45 4,34 4,14"
    fill={unlocked ? bg(0.06, isDark) : bg(0.03, isDark)}
    stroke={unlocked ? bg(0.12, isDark) : bg(0.06, isDark)}
    strokeWidth="0.8"
  />
</svg>
```

Le conteneur de l'icône (`icon-wrap`) fait 48×48px (56×56 pour le sommet).

---

## STYLES DES CARTES

### Carte trophée (commune)

```typescript
{
  position: 'relative',
  borderRadius: 14,
  padding: '20px 14px 16px',
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  textAlign: 'center' as const,
  gap: 10,
  transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
  cursor: 'default',
}
```

### Carte verrouillée

```typescript
{
  background: bg(0.015, isDark),
  border: `1px solid ${bg(0.05, isDark)}`,
}
// Hover :
{
  background: bg(0.03, isDark),
  borderColor: bg(0.08, isDark),
  transform: 'translateY(-3px)',
}
```

### Carte débloquée

```typescript
{
  background: bg(0.04, isDark),
  border: `1px solid ${bg(0.10, isDark)}`,
}
// Hover :
{
  background: bg(0.06, isDark),
  boxShadow: `0 4px 30px ${bg(0.04, isDark)}`,
  transform: 'translateY(-3px)',
}
```

### Carte sommet (tier 3)

```typescript
{
  padding: '24px 16px 18px',
  maxWidth: 220,
}
// Si unlocked :
{
  background: bg(0.05, isDark),
  border: `1px solid ${bg(0.14, isDark)}`,
}
```

---

## ÉLÉMENTS INTERNES DES CARTES

### Conteneur icône

```typescript
{
  position: 'relative',
  width: 48, // 56 pour summit
  height: 48, // 56 pour summit
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}
```

### Icône SVG

- Taille : 24px (28px pour summit)
- `stroke` : `tw(0.70, textIntensity, isDark)` si unlocked, `tw(0.15, textIntensity, isDark)` si locked
- `position: 'relative'`, `zIndex: 1`

### Cadenas (locked only)

Petit SVG cadenas 14×14px en `position: absolute`, `bottom: 0`, `right: 0`, `zIndex: 2` :

```tsx
<svg width="14" height="14" viewBox="0 0 24 24" fill="none"
  stroke={tw(0.12, textIntensity, isDark)} strokeWidth="1.5"
  strokeLinecap="round" strokeLinejoin="round">
  <rect x="5" y="11" width="14" height="11" rx="2"/>
  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
</svg>
```

### Titre

```typescript
{
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '-0.1px',
  color: unlocked ? tw(0.70, textIntensity, isDark) : tw(0.22, textIntensity, isDark),
  lineHeight: '1.3',
}
```

### Description

```typescript
{
  fontSize: 11,
  color: unlocked ? tw(0.30, textIntensity, isDark) : tw(0.13, textIntensity, isDark),
  lineHeight: '1.4',
}
```

### Barre de progression (locked avec progress)

```typescript
// Container
{
  width: '100%',
  height: 2,
  borderRadius: 99,
  background: bg(0.05, isDark),
  overflow: 'hidden',
  marginTop: 2,
}
// Fill
{
  height: '100%',
  borderRadius: 99,
  background: tw(0.20, textIntensity, isDark),
  width: `${pct}%`,
  transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
}
```

### Texte progression

```typescript
{
  fontSize: 10,
  fontWeight: 500,
  color: tw(0.18, textIntensity, isDark),
  fontVariantNumeric: 'tabular-nums',
}
```

### Badge débloqué (unlocked)

Un petit check SVG + texte "débloqué" :

```tsx
<div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke={tw(0.40, textIntensity, isDark)} strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
  <span style={{
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: '0.6px',
    textTransform: 'uppercase',
    color: tw(0.30, textIntensity, isDark),
  }}>
    débloqué
  </span>
</div>
```

---

## LAYOUT GLOBAL

### Grid par tier

```typescript
// Tier 0 et 1 : 4 colonnes
{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }

// Tier 2 : 3 colonnes
{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }

// Tier 3 : 1 colonne, centré
{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, maxWidth: 220 }
```

### Séparateur entre tiers

```typescript
{
  height: 1,
  background: `linear-gradient(90deg, transparent, ${bg(0.05, isDark)} 30%, ${bg(0.05, isDark)} 70%, transparent)`,
  margin: '4px 0 24px 0',
}
```

### Label de tier

```typescript
{
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '1.2px',
  textTransform: 'uppercase' as const,
  color: tw(0.20, textIntensity, isDark),
  marginBottom: 12,
  paddingLeft: 2,
}
```

### Ordre d'affichage (du haut vers le bas)

```
1. Premiers pas (tier 0) — 4 cols
2. Séparateur
3. Jalons (tier 1) — 4 cols
4. Séparateur
5. Défis (tier 2) — 3 cols
6. Séparateur
7. Aboutissement (tier 3) — 1 col, centré
```

**IMPORTANT** : L'ordre est inversé par rapport à l'ancien code (avant c'était sommet en haut, base en bas). Maintenant c'est base en haut, sommet en bas. L'utilisateur débloque d'abord les trophées du haut et progresse vers le bas — plus intuitif.

### Container principal

```typescript
{
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'auto',
  padding: '0 0 40px 0',
}
```

Le header "Trophées" + "4 / 12" reste identique à l'actuel (flexShrink: 0, marginBottom: 24).

---

## CE QUI NE CHANGE PAS

- La fonction `buildAchievements()` → GARDER TELLE QUELLE (même logique, mêmes IDs, mêmes conditions)
- Les props du composant `AchievementsViewProps` → GARDER IDENTIQUES
- L'import de `tw`, `bg` depuis `@/lib/color-utils`
- L'import de `SectionProgress` depuis `@/types/memoir`
- Le `useState` pour le hover

## CE QUI CHANGE

- **SUPPRIMER** : `PyramidBlock` (ancien composant avec carrés 56px)
- **SUPPRIMER** : L'ancien layout pyramide (rows top→bottom avec labels à gauche)
- **AJOUTER** : `TrophyIcon` — fonction qui retourne le SVG correspondant à un ID
- **AJOUTER** : `TrophyCard` — composant de carte avec hexagone, icône, titre, desc, progress/badge
- **AJOUTER** : Layout en grille par tier avec séparateurs

## CE QU'IL NE FAUT SURTOUT PAS FAIRE

- ❌ Utiliser des emojis
- ❌ Utiliser des couleurs autres que `rgba(255,255,255,X)` en dark / `rgba(0,0,0,X)` en light
- ❌ Utiliser Tailwind CSS
- ❌ Utiliser l'accent color (réservé aux barres XP et DotGrid timeline)
- ❌ Ajouter des dépendances externes (lucide-react, etc.)
- ❌ Modifier les autres fichiers

---

## VÉRIFICATION

Après implémentation :

1. `npx tsc --noEmit` — 0 erreurs
2. `npm run build` — OK
3. Vérifier que le fichier contient :
   - `TrophyIcon` avec les 12 SVGs
   - `TrophyCard` avec hexagone + icône + cadenas/badge
   - Layout en grille 4→4→3→1
   - Séparateurs entre tiers
   - `buildAchievements` inchangé
   - Hover state avec `translateY(-3px)`
   - Barre de progression pour les locked avec progress
   - Badge check + "débloqué" pour les unlocked
