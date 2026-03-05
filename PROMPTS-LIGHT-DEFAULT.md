# PROMPT — Light mode par défaut + Intensité 120%

## Objectif

1. Le **light mode** doit être le mode natif de l'application. Les nouveaux utilisateurs arrivent TOUJOURS en light mode, même si leur OS est en dark mode. Ils peuvent basculer en dark mode manuellement via le toggle dans la sidebar.
2. Le **curseur d'intensité** du texte doit être par défaut à **120%** (1.2) au lieu de 100% (1.0).

---

## Fichier 1 : `app/context/ThemeProvider.tsx`

### Supprimer le fallback `prefers-color-scheme`

Remplacer le useEffect d'initialisation (lignes 17-26) :

```tsx
// Init depuis localStorage ou prefers-color-scheme au mount
useEffect(() => {
  const stored = localStorage.getItem("theme") as ThemeMode | null;
  if (stored === "light" || stored === "dark") {
    setMode(stored);
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setMode(prefersDark ? "dark" : "light");
  }
}, []);
```

Par :

```tsx
// Init depuis localStorage — light mode par défaut si aucune préférence sauvegardée
useEffect(() => {
  const stored = localStorage.getItem("theme") as ThemeMode | null;
  if (stored === "light" || stored === "dark") {
    setMode(stored);
  }
  // Pas de fallback prefers-color-scheme : light mode est le mode natif
}, []);
```

Le `useState("light")` en ligne 15 reste inchangé — c'est déjà correct.

---

## Fichier 2 : `app/layout.tsx`

### Supprimer le fallback `prefers-color-scheme` dans le script inline

Remplacer le script inline (lignes 19-31) :

```tsx
<script
  dangerouslySetInnerHTML={{
    __html: `
      (function() {
        const theme = localStorage.getItem('theme') ||
          (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      })();
    `,
  }}
/>
```

Par :

```tsx
<script
  dangerouslySetInnerHTML={{
    __html: `
      (function() {
        var theme = localStorage.getItem('theme');
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      })();
    `,
  }}
/>
```

Logique : si pas de localStorage, on ne fait rien → la page reste en light mode (pas de classe `.dark`).

---

## Fichier 3 : `src/components/dashboard/DashboardContent.tsx`

### Changer l'intensité par défaut à 1.2

Ligne 58, remplacer :

```tsx
const [textIntensity, setTextIntensity] = useState(1.0)
```

Par :

```tsx
const [textIntensity, setTextIntensity] = useState(1.2)
```

---

## Fichier 4 : `app/api/preferences/route.ts`

### Changer la constante DEFAULT_TEXT_INTENSITY

Ligne 5, remplacer :

```ts
const DEFAULT_TEXT_INTENSITY = 1.0
```

Par :

```ts
const DEFAULT_TEXT_INTENSITY = 1.2
```

---

## Résumé des changements

| Fichier | Ce qui change | Avant | Après |
|---------|--------------|-------|-------|
| `ThemeProvider.tsx` | Suppression fallback `prefers-color-scheme` | Détecte le dark mode OS | Toujours light si pas de localStorage |
| `layout.tsx` | Suppression fallback dans script inline | Idem | Idem |
| `DashboardContent.tsx` | Intensité par défaut | `useState(1.0)` | `useState(1.2)` |
| `preferences/route.ts` | Constante serveur | `DEFAULT_TEXT_INTENSITY = 1.0` | `DEFAULT_TEXT_INTENSITY = 1.2` |

## Important

- Les utilisateurs existants qui ont déjà choisi dark mode via le toggle ne sont PAS affectés (leur préférence est dans localStorage).
- Les utilisateurs existants qui ont déjà une intensité sauvegardée en base ne sont PAS affectés (leur préférence est dans `user_preferences`).
- Seuls les **nouveaux** utilisateurs verront le light mode + 120% par défaut.
