# 🚀 maimouarkwest v2.0 — Guide de Déploiement Vercel

## Prérequis

✅ Compte GitHub avec le repo maimouarkwest
✅ Compte Vercel (gratuit)
✅ Projet Supabase configuré
✅ Clé API Anthropic valide

---

## 📋 Étapes de Déploiement

### 1. Préparer les Variables d'Environnement

Récupérez ces informations :

**Supabase** (https://supabase.com/dashboard/project/_/settings/api) :
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Anthropic** (https://console.anthropic.com/settings/keys) :
```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### 2. Déployer sur Vercel

1. Allez sur https://vercel.com/new
2. Sélectionnez "Import Git Repository"
3. Choisissez votre repo GitHub `maimouarkwest`
4. Vercel détecte automatiquement Next.js ✅

### 3. Configurer les Variables d'Environnement

Dans **Project Settings** > **Environment Variables**, ajoutez :

| Nom de la Variable | Valeur | Environnements |
|-------------------|--------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` | Production uniquement ⚠️ |
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` | Production uniquement ⚠️ |

**Important** : Les clés sensibles (`SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`) ne doivent être ajoutées QUE pour Production, jamais pour Preview ou Development.

### 4. Migrations Supabase

Avant le premier déploiement, exécutez les migrations SQL dans votre projet Supabase :

```bash
# Localement
supabase db push

# Ou manuellement dans le SQL Editor Supabase :
# 1. 005_quest_tracking.sql
# 2. 006_rate_limiting.sql
# 3. 007_sections_difficulty.sql
# 4. 008_achievements.sql
# 5. 009_combo_system.sql
# 6. 010_prestige_mode.sql
```

### 5. Vérifications Post-Déploiement

Une fois déployé, testez ces endpoints :

✅ **Homepage** : `https://your-app.vercel.app/` → Doit afficher la landing page
✅ **Login Google** : Cliquez sur "Connexion avec Google" → OAuth doit fonctionner
✅ **Dashboard** : Après login → Dashboard doit charger sans erreur 500
✅ **Upload PDF** : Testez l'upload d'un cahier des charges → Plan doit être généré
✅ **Quêtes** : Cochez une quête → Points doivent s'incrémenter avec animation
✅ **Level Up** : Atteignez un nouveau niveau → Confettis doivent s'afficher

### 6. Monitoring Errors

Dans Vercel Dashboard > Runtime Logs, surveillez :
- Erreurs 500 (souvent liées aux variables d'environnement manquantes)
- Rate limit Claude API (429)
- Timeouts Supabase

---

## 🔧 Configuration Avancée

### Custom Domain

1. **Project Settings** > **Domains**
2. Ajoutez votre domaine (ex: `maimouarkwest.com`)
3. Configurez les DNS selon les instructions Vercel
4. Vercel génère automatiquement un certificat SSL ✅

### Régions Serverless

Le fichier `vercel.json` configure la région `cdg1` (Paris) par défaut.
Pour changer : modifiez `"regions": ["cdg1"]` dans `vercel.json`.

Régions disponibles : https://vercel.com/docs/edge-network/regions

### Limites Vercel (Plan Hobby)

- ⚠️ **Function Timeout** : 10s (suffisant pour appels Claude)
- ⚠️ **Edge Requests** : 100GB/mois
- ⚠️ **Serverless Function Size** : 50MB (largement suffisant)

Si vous dépassez ces limites, passez au plan Pro.

---

## 🐛 Troubleshooting

### Erreur : "Module not found: @supabase/ssr"

**Solution** : Vercel n'a pas installé les dépendances. Vérifiez que `package.json` contient `@supabase/ssr`.

### Erreur : "Unauthorized" sur /api/plan

**Cause** : Variables d'environnement Supabase mal configurées.
**Solution** : Vérifiez `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` dans Vercel.

### Erreur : "Invalid API Key" (Claude)

**Cause** : `ANTHROPIC_API_KEY` incorrecte ou expirée.
**Solution** : Régénérez une clé sur https://console.anthropic.com/settings/keys

### Build Failed : TypeScript Errors

**Solution** : Lancez `npm run build` localement pour identifier les erreurs TypeScript avant de redéployer.

---

## 📊 Performance Tips

✅ **Utilisez Edge Functions** pour les routes API légères (future optimisation)
✅ **Activez ISR** pour les pages statiques (future optimisation)
✅ **Optimisez les images** avec `next/image` (déjà fait ✅)
✅ **Minification SWC** activée via `swcMinify: true` (déjà configuré ✅)

---

## ✅ Checklist de Déploiement

Avant de déployer :

- [ ] Migrations SQL appliquées dans Supabase Production
- [ ] Variables d'environnement ajoutées dans Vercel
- [ ] Build local réussi (`npm run build`)
- [ ] Tests manuels sur localhost:3000 (login, upload, quêtes)
- [ ] Crédit Anthropic API suffisant (vérifier solde)
- [ ] Google OAuth configuré avec `https://your-app.vercel.app/auth/callback` dans la whitelist

Après déploiement :

- [ ] Test login Google sur production
- [ ] Test upload PDF + génération plan
- [ ] Test complétion quête + level up
- [ ] Vérifier Runtime Logs Vercel (pas d'erreurs 500)
- [ ] Test responsive mobile (Safari iOS + Chrome Android)

---

## 🎉 C'est Déployé !

**URL Production** : https://your-app.vercel.app
**Dashboard Vercel** : https://vercel.com/dashboard

Félicitations ! maimouarkwest v2.0 est maintenant en production. 🚀

---

**Besoin d'aide ?**
- Documentation Vercel : https://vercel.com/docs
- Documentation Next.js : https://nextjs.org/docs
- Support Supabase : https://supabase.com/docs
