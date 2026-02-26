#!/bin/bash
echo "🧹 Nettoyage du cache .next..."
kill $(lsof -ti :3000) 2>/dev/null
rm -rf .next
echo "🚀 Démarrage du serveur..."
npm run dev
