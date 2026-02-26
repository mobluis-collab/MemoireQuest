# Design System — MemoireQuest

**Version** : 1.0
**Date** : 2026-02-23

---

## 🎨 PALETTE DE COULEURS

### Background
- **Primary** : `bg-zinc-950` (#09090b)
- **Secondary** : `bg-zinc-900/60` (rgba(24, 24, 27, 0.6))
- **Tertiary** : `bg-zinc-800/60` (rgba(39, 39, 42, 0.6))

### Text
- **Primary** : `text-zinc-100` (#f4f4f5)
- **Secondary** : `text-zinc-300` (#d4d4d8)
- **Tertiary** : `text-zinc-500` (#71717a)
- **Disabled** : `text-zinc-600` (#52525b)

### Accent
- **Primary** : `indigo-500` (#6366f1)
- **Light** : `indigo-400` (#818cf8)
- **Soft** : `bg-indigo-500/15` (rgba(99, 102, 241, 0.15))
- **Border** : `border-indigo-500/30` (rgba(99, 102, 241, 0.3))

### States
- **Success** : `emerald-500` (#10b981) / `emerald-400` (#34d399)
- **Error** : `red-500` (#ef4444) / `red-400` (#f87171)
- **Warning** : `amber-500` (#f59e0b) / `amber-400` (#fbbf24)

### Borders
- **Primary** : `border-zinc-800` (#27272a)
- **Secondary** : `border-zinc-700` (#3f3f46)

---

## 📐 SPACING

Tous les espacements utilisent l'échelle Tailwind (multiples de 0.25rem = 4px) :

- **gap-1** : 4px
- **gap-2** : 8px
- **gap-3** : 12px
- **gap-4** : 16px
- **gap-6** : 24px
- **gap-8** : 32px

**Règle** : Utiliser des multiples de 4 uniquement (px-3, px-4, px-5, px-6, etc.).

---

## 🔤 TYPOGRAPHIE

### Police
```css
font-family: -apple-system, "SF Pro Display", "Helvetica Neue", "Inter", sans-serif;
```

### Tailles
- **xs** : `text-xs` (12px / 0.75rem)
- **sm** : `text-sm` (14px / 0.875rem)
- **base** : `text-base` (16px / 1rem)
- **lg** : `text-lg` (18px / 1.125rem)
- **xl** : `text-xl` (20px / 1.25rem)

### Poids
- **normal** : `font-normal` (400)
- **medium** : `font-medium` (500)
- **semibold** : `font-semibold` (600)
- **bold** : `font-bold` (700)

---

## ⏱️ ANIMATIONS

### Durées
- **Fast** : `duration-200` (200ms) — hover states
- **Normal** : `duration-300` (300ms) — transitions standards
- **Slow** : `duration-500` (500ms) — animations complexes

### Easing
- **Default** : `ease-out` (transitions naturelles)
- **Bounce** : `ease-in-out` (accordions, sliders)

### Keyframes customs
```css
@keyframes fade-in {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.35s ease-out both;
}
```

### Accessibilité
Toujours respecter `prefers-reduced-motion` :
```css
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in {
    animation: none;
  }
}
```

---

## 🎯 COMPOSANTS RÉUTILISABLES

### Buttons

**Primary button** :
```tsx
className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 transition-colors duration-200"
```

**Secondary button** :
```tsx
className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-800/60 transition-colors duration-200"
```

**Soft button** :
```tsx
className="rounded-lg bg-indigo-500/15 border border-indigo-500/30 px-4 py-2 text-sm font-medium text-indigo-400 hover:bg-indigo-500/25 transition-colors duration-200"
```

**Disabled state** :
```tsx
disabled:opacity-50 disabled:cursor-not-allowed
```

---

### Cards

**Standard card** :
```tsx
className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4"
```

**Hover card** :
```tsx
className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 hover:bg-zinc-800/40 transition-colors duration-200"
```

---

### Badges

**Info badge** :
```tsx
className="rounded-md bg-indigo-500/15 px-2 py-0.5 text-xs font-bold text-indigo-400 ring-1 ring-indigo-500/30"
```

**Success badge** :
```tsx
className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/30"
```

---

### Loading States

**Skeleton** :
```tsx
className="h-2.5 w-full rounded bg-zinc-700 animate-pulse"
```

**Spinner (3 dots)** :
```tsx
<div className="flex gap-1">
  <div className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-pulse" />
  <div className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-pulse animation-delay-150" />
  <div className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-pulse animation-delay-300" />
</div>
```

---

## 📱 RESPONSIVE

### Breakpoints
```css
/* Mobile-first approach */
sm: 640px   /* @media (min-width: 640px) */
md: 768px   /* @media (min-width: 768px) */
lg: 1024px  /* @media (min-width: 1024px) */
xl: 1280px  /* @media (min-width: 1280px) */
```

### Grid Layout
- **Mobile** : Single column
- **Tablet** : 1-2 columns
- **Desktop** : 2+ columns

Exemple :
```tsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
```

---

## ♿ ACCESSIBILITÉ

### Contraste
- Tous les textes doivent respecter WCAG AA (4.5:1 pour texte normal, 3:1 pour texte large)
- Actuel : `text-zinc-100` sur `bg-zinc-950` = 18.34:1 ✅

### Focus States
```tsx
focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500
```

### ARIA
- Toujours inclure `role`, `aria-label`, `aria-checked`, etc.
- Exemple checkbox :
```tsx
<button
  role="checkbox"
  aria-checked={isDone}
  aria-label={`Marquer "${section}" comme complété`}
>
```

### Keyboard Navigation
- `Space` : activer checkbox / bouton
- `Enter` : submit / activer bouton
- `Escape` : fermer modal / drawer
- `Tab` : navigation focus

---

## 🎭 ÉMOJIS vs ICÔNES

### Émojis acceptés (MVP)
- 💡 (aide)
- 🔥 (streak)
- ⚡ (rapide)
- 🎯 (objectif)
- 📓 (journal)
- ✨ (succès)

### SVG pour v2
- Convertir tous les émojis en SVG pour cohérence graphique
- Utiliser Heroicons ou Lucide React

---

## 📏 CONVENTIONS DE CODE

### Ordre des classes Tailwind
1. Layout (flex, grid, display)
2. Position (absolute, relative, sticky)
3. Spacing (p, m, gap)
4. Sizing (w, h, max-w)
5. Typography (text, font)
6. Visual (bg, border, rounded, shadow)
7. Interactivity (hover, focus, disabled)
8. Transitions (transition, duration)

Exemple :
```tsx
className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-zinc-100 bg-zinc-900/60 border border-zinc-800 rounded-xl hover:bg-zinc-800/40 transition-colors duration-200"
```

---

**FIN DESIGN_SYSTEM v1.0**
