# 🔒 MemoireQuest — Configuration de Production VERROUILLÉE

**Date de freeze** : 2026-02-25
**Statut** : ✅ PRODUCTION STABLE — NE PLUS TOUCHER

---

## ⚠️ RÈGLE ABSOLUE

**Ce fichier documente la configuration de production fonctionnelle.**
**Toute modification du déploiement doit passer par une revue complète.**

---

## 🌐 URLs de Production

| Service | URL | Statut |
|---------|-----|--------|
| **Site production** | https://maimouarkwest-prod-alternance.vercel.app | ✅ Actif |
| **Dashboard Vercel** | https://vercel.com/mobluis-collab/memoirequest | Accès propriétaire |
| **Supabase Dashboard** | https://supabase.com/dashboard/project/[PROJECT_ID] | Accès propriétaire |
| **Anthropic Console** | https://console.anthropic.com | Clé API active |

---

## 🔑 Variables d'Environnement (Configuration Vercel)

### Variables PUBLIQUES (Production + Preview + Development)

```
NEXT_PUBLIC_SUPABASE_URL=https://[votre-projet].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Variables SECRÈTES (Production UNIQUEMENT ⚠️)

```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ANTHROPIC_API_KEY=sk-ant-api03-...
```

**IMPORTANT** : Ces clés ne doivent JAMAIS être sur Preview ou Development.

---

## 🔧 Configuration Supabase

### Authentication → URL Configuration

| Paramètre | Valeur |
|-----------|--------|
| **Site URL** | `https://maimouarkwest-prod-alternance.vercel.app` |
| **Redirect URLs** | `https://maimouarkwest-prod-alternance.vercel.app/auth/callback` |

**Format critique** :
- ❌ Pas de trailing slash (`/`)
- ❌ Pas d'espaces
- ✅ HTTPS uniquement

### OAuth Providers

- **Google OAuth** : ✅ Activé
- **Provider** : Google
- **Callback URL** : `https://maimouarkwest-prod-alternance.vercel.app/auth/callback`

---

## 📊 Migrations SQL Appliquées

Toutes les migrations v2.0 ont été appliquées via le fichier consolidé :

```sql
-- Fichier : /supabase/migrations_v2_production.sql
-- Contenu :
  - Migration 007 : sections avec difficulty (easy/medium/hard)
  - Migration 008 : achievements JSONB
  - Migration 009 : combo_state JSONB
  - Migration 010 : prestige_count INT
```

**Statut** : ✅ Appliquées le 2026-02-25
**Vérification** : `SELECT * FROM memoir_plans LIMIT 1;` retourne plan_data avec structure v2.0

---

## 🚀 Configuration Vercel

### Framework Detection

- **Framework** : Next.js 14
- **Build Command** : `npm run build` (auto-détecté)
- **Output Directory** : `.next` (auto-détecté)
- **Install Command** : `npm install` (auto-détecté)

### Settings Critiques

| Paramètre | Valeur |
|-----------|--------|
| **Node Version** | 18.x (auto) |
| **Root Directory** : `.` |
| **Production Branch** | `main` |
| **Auto-deploy** | ✅ Activé sur push main |

---

## 📁 Structure Git

### Branches

- **main** : Production (déployée sur Vercel)
- **feat/landing-v1** : Feature branch (mergée dans main le 2026-02-25)

### Derniers commits

```bash
# Dernier état stable
git log --oneline -5
```

**Merge critique** : feat/landing-v1 → main pour aligner Vercel avec v2.0

---

## ✅ Checklist de Vérification (Post-Freeze)

### Tests de Non-Régression

Avant toute modification de déploiement, vérifier :

- [ ] **OAuth Google** : Connexion fonctionne sans double login
- [ ] **Upload PDF** : Génération de plan sans erreur 500
- [ ] **API /api/plan** : Retourne JSON valide avec difficulty
- [ ] **API /api/quests/complete** : Toggle quêtes + XP dynamique
- [ ] **Middleware** : Routes /auth/* exclues du check
- [ ] **Migrations SQL** : memoir_plans.plan_data structure v2.0
- [ ] **Variables env** : Aucune erreur "Secret does not exist"

### Logs à Surveiller (Vercel Dashboard)

- **Runtime Logs** : Aucune erreur 500 récurrente
- **Build Logs** : Build time < 2min
- **Function Invocations** : Aucun timeout (>10s)

---

## 🐛 Erreurs Résolues (À NE PLUS REPRODUIRE)

### 1. Caractère Invisible dans ANTHROPIC_API_KEY

**Erreur** : `Cannot convert argument to a ByteString (character 8232)`
**Cause** : Caractère Unicode invisible copié depuis Anthropic Console
**Fix** : Utiliser le bouton "Copy" officiel, jamais sélection manuelle

### 2. Boucle OAuth Redirect

**Erreur** : Redirection infinie vers page de connexion
**Cause** : Middleware vérifiait auth PENDANT que callback établissait session
**Fix** : Exclure `/auth/*` du matcher middleware

### 3. Site URL Improperly Formatted

**Erreur** : `site url is improperly formatted`
**Cause** : Trailing slash ou espaces dans Supabase Site URL
**Fix** : URL exacte sans `/` final

### 4. Mélange V1/V2 sur Site

**Erreur** : Contenu v1 et v2 mixé sur production
**Cause** : Vercel déployait `main` au lieu de `feat/landing-v1`
**Fix** : Merge feat/landing-v1 → main

---

## 📞 Contacts & Accès

### Comptes Requis

- **GitHub** : mobluis-collab/MemoireQuest
- **Vercel** : [Compte propriétaire]
- **Supabase** : [Compte propriétaire]
- **Anthropic** : [Compte propriétaire]

### Crédits API

- **Anthropic API** : Dernière recharge 5€ le 2026-02-25
- **Supabase** : Plan gratuit (suffisant pour MVP)
- **Vercel** : Plan Hobby gratuit

---

## 🔐 Sécurité

### Clés Secrètes

❌ **NE JAMAIS COMMITER** :
- `.env.local`
- Clés API en clair dans le code
- Screenshots avec variables visibles

✅ **Toujours utiliser** :
- Variables d'environnement Vercel
- Secrets GitHub Actions (si CI/CD future)
- `.env.example` pour documentation (sans valeurs réelles)

---

## 🎯 Prochaine Modification de Déploiement

**SI** tu dois modifier le déploiement (changement de domaine, nouvelle feature backend, migration SQL) :

1. **Créer une branche** : `git checkout -b deploy/[nom-modif]`
2. **Tester localement** : `npm run build` sans erreurs
3. **Documenter** : Mettre à jour ce fichier DEPLOYMENT_LOCK.md
4. **Backup Supabase** : Export SQL avant migrations
5. **Deploy en Preview** : Tester sur URL Vercel Preview
6. **Merge dans main** : Seulement si Preview validé

---

## ✅ Statut Final

**Déploiement verrouillé le 2026-02-25**
**Dernière vérification** : Tous les tests passent ✅
**Prochaine étape** : Focus UI/UX uniquement

---

**🔒 Configuration gelée — Toute modification doit être justifiée et documentée.**
