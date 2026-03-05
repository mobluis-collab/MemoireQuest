# PROMPT — Fix curseur I-beam sur le dashboard

## Problème

Quand l'utilisateur navigue sur le dashboard, le curseur se transforme en I-beam (curseur texte) au lieu de rester en flèche par défaut. C'est parce que les conteneurs principaux n'ont pas de `cursor: default` et le texte est sélectionnable.

## Fichier : `src/components/dashboard/new/NewDashboard.tsx`

### Fix 1 : Ajouter `cursor: 'default'` sur le conteneur principal du dashboard

Trouver le `<div>` racine du dashboard (le premier `<div>` retourné par le composant, qui contient la sidebar + le main). Ajouter :

```tsx
cursor: 'default',
```

### Fix 2 : Ajouter `cursor: 'default'` sur le `<main>`

Sur le `<main className="mq-dashboard-scroll"` (ligne ~1142), ajouter dans le style :

```tsx
cursor: 'default',
```

### Fix 3 : Ajouter `cursor: 'default'` sur la sidebar

Sur le conteneur de la sidebar (ligne ~880), ajouter dans le style :

```tsx
cursor: 'default',
```

### Fix 4 : Ajouter `cursor: 'default'` sur les cards de la vue Dashboard

Les cards de statistiques (Soutenance, Avancement, Niveau, Points, Régularité, Chapitres) ne sont pas des éléments cliquables mais affichent le I-beam sur le texte. Sur chaque card non-cliquable du dashboard, vérifier que le style inclut `cursor: 'default'`.

Les cards de chapitres sont cliquables → elles ont déjà `cursor: 'pointer'` ou `cursor: isClickable ? 'pointer' : 'default'`, c'est OK.

### Fix 5 (optionnel mais recommandé) : `userSelect: 'none'` sur les éléments d'UI

Sur les éléments qui ne sont pas du contenu textuel (sidebar, headers, labels de stats, badges) mais qui sont de l'UI pure, ajouter :

```tsx
userSelect: 'none',
```

Cela empêche la sélection accidentelle de texte d'UI. NE PAS l'ajouter sur le contenu réel (titres de chapitres, hints de rédaction, etc.) car l'utilisateur pourrait vouloir copier ce texte.

Zones où ajouter `userSelect: 'none'` :
- La sidebar entière
- La barre d'outils (Pomodoro / Focus)
- Les labels "SOUTENANCE DANS", "AVANCEMENT", "NIVEAU", "POINTS", "RÉGULARITÉ", "CHAPITRES"
- Le header "Bonjour, Louis."
- Le streak badge "X jour(s) de suite"

### Résumé

Le fix principal est simplement `cursor: 'default'` sur le conteneur racine du dashboard. Ça se propage à tous les enfants qui n'ont pas leur propre `cursor`. Les boutons/liens qui ont déjà `cursor: 'pointer'` ne seront pas affectés.
