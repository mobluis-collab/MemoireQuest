# PROMPT — Fix curseur I-beam global (toutes les vues)

## Problème

Le fix `cursor: 'default'` a été appliqué sur le conteneur racine de `NewDashboard.tsx` mais le curseur I-beam persiste dans certaines sous-vues car les éléments internes ne l'héritent pas toujours (notamment les `<div>` avec du texte pur).

## Solution : ajouter une règle CSS globale

Dans `app/globals.css`, ajouter cette règle dans le bloc `@layer base` (ou après les `@tailwind` directives) :

```css
/* Fix I-beam cursor on non-editable text throughout the dashboard */
.mq-dashboard-scroll,
.mq-dashboard-scroll * {
  cursor: default;
}
.mq-dashboard-scroll button,
.mq-dashboard-scroll a,
.mq-dashboard-scroll [role="button"],
.mq-dashboard-scroll input,
.mq-dashboard-scroll textarea,
.mq-dashboard-scroll select {
  cursor: pointer;
}
.mq-dashboard-scroll input[type="text"],
.mq-dashboard-scroll input[type="search"],
.mq-dashboard-scroll input[type="email"],
.mq-dashboard-scroll input[type="number"],
.mq-dashboard-scroll textarea {
  cursor: text;
}
```

La classe `mq-dashboard-scroll` est déjà présente sur le `<main>` du dashboard (voir `NewDashboard.tsx` ligne ~1142 : `<main className="mq-dashboard-scroll"`).

Cette règle CSS :
1. Force `cursor: default` sur TOUS les éléments à l'intérieur du dashboard
2. Rétablit `cursor: pointer` sur les éléments interactifs (boutons, liens)
3. Rétablit `cursor: text` sur les vrais champs de saisie

C'est tout. Un seul fichier à modifier (`globals.css`), aucun composant à toucher.
