# PROMPT — Augmenter la limite d'upload PDF à 25 MB

## Problème
La limite d'upload PDF est hardcodée à 10 MB. Les cahiers des charges académiques peuvent facilement dépasser cette taille (annexes, grilles de compétences scannées, etc.). Il faut augmenter à 25 MB.

## Fichiers à modifier

### 1. `src/components/dashboard/UploadZone.tsx`

Ligne 10, remplacer :

```ts
const MAX_MB = 10
```

Par :

```ts
const MAX_MB = 25
```

C'est tout pour ce fichier. Le message d'erreur et le texte UI utilisent déjà `MAX_MB` dynamiquement.

### 2. `app/api/plan/extract/route.ts`

Ligne 63, remplacer :

```ts
const MAX_FILE_SIZE = 10 * 1024 * 1024
```

Par :

```ts
const MAX_FILE_SIZE = 25 * 1024 * 1024
```

Et ligne 102, remplacer le message d'erreur :

```ts
return NextResponse.json({ error: 'File too large (max 10MB)', remaining: rateLimit.remaining }, { status: 400 })
```

Par :

```ts
return NextResponse.json({ error: 'File too large (max 25MB)', remaining: rateLimit.remaining }, { status: 400 })
```

### 3. `next.config.js` — Ajouter la config bodyParser

Après `compress: true,` ajouter :

```js
// Allow larger file uploads (PDF cahiers des charges)
serverExternalPackages: [],
```

Et dans `vercel.json`, remplacer tout le contenu par :

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "functions": {
    "app/api/plan/extract/route.ts": {
      "maxDuration": 120
    }
  }
}
```

## Note importante — Limite Vercel

Vercel impose ses propres limites de body size sur les serverless functions :
- **Plan Hobby** : 4.5 MB max (donc les PDF > 4.5 MB échoueront côté Vercel, pas côté code)
- **Plan Pro** : 4.5 MB par défaut, configurable jusqu'à **100 MB**

Si le projet est sur le plan Hobby, il faudra passer au plan Pro pour que les uploads > 4.5 MB fonctionnent réellement. La route `extract` a déjà `maxDuration = 120` qui nécessite le plan Pro, donc normalement c'est déjà le cas.

## Résumé

| Fichier | Ligne | Avant | Après |
|---------|-------|-------|-------|
| `UploadZone.tsx` | 10 | `MAX_MB = 10` | `MAX_MB = 25` |
| `extract/route.ts` | 63 | `10 * 1024 * 1024` | `25 * 1024 * 1024` |
| `extract/route.ts` | 102 | `'max 10MB'` | `'max 25MB'` |
