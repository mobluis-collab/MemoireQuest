# Fix CI — Prettier format

## Problème

Le job CI "quality" échoue à l'étape `format:check`. Prettier trouve 15 fichiers mal formatés.

## Solution

Lance cette commande :

```bash
npm run format
```

Ça reformate automatiquement tous les fichiers. Ensuite commit + push :

```bash
git add -A
git commit -m "fix: prettier formatting for CI"
git push
```

C'est tout. Le CI devrait passer après ça.
