# Spécifications techniques — MemoireQuest

**Version** : 1.0
**Date** : 2026-02-23
**Décideur** : team-lead (Claude Code)

---

## 🎯 SYSTÈME DE QUÊTES & PROGRESSION

### 1. Accordion
**Décision** : Plusieurs chapitres peuvent être ouverts simultanément.
**Raison** : Meilleure UX, moins de clics, permet la comparaison.

### 2. Système de points → Niveaux
**Décision** : Remplacer le système de points par un système de niveaux.
**Formule** : `niveau = floor(points / 20) + 1`
**Exemples** :
- 0-19 pts → Niveau 1
- 20-39 pts → Niveau 2
- 40-59 pts → Niveau 3
- 80-99 pts → Niveau 5
- 100-119 pts → Niveau 6
**Raison** : 100 points atteints trop rapidement (25 sections × 4 pts). Les niveaux donnent une progression plus longue et satisfaisante.
**Affichage** : "Niveau X" + barre de progression vers niveau suivant (points % 20).

### 3. Décochage quête
**Décision** : Une quête validée PEUT être décochée (toggle).
**Raison** : Évite les clics accidentels, donne plus de flexibilité à l'utilisateur.
**Comportement** : Cliquer sur une case cochée la décoche et retire les points (-4 pts).

### 4. Ordre des quêtes
**Décision** : Les sections peuvent être complétées dans n'importe quel ordre (pas de blocage).
**Raison** : Flexibilité pour l'étudiant.

### 5. Barème points
**Décision** : 4 points par quête, fixe.
**Raison** : Simplicité, cohérence.

### 6. Plafond niveaux
**Décision** : Pas de plafond. Les niveaux augmentent indéfiniment.
**Raison** : Valorise la progression continue.

### 7. Célébration niveau up
**Décision** : Animation subtile + toast "Niveau X atteint ! 🎉" (2s).
**Raison** : Feedback positif sans être intrusif.

---

## 💬 HELPPANEL & CONSEILS IA

### 8. HelpPanel → Chatbot flottant
**Décision** : Bouton flottant bottom-right (style Intercom/Drift) qui ouvre un drawer/modal de chat.
**Raison** : Plus familier pour les utilisateurs, meilleure UX mobile, moins intrusif.
**Implémentation** :
- Bouton fixe `fixed bottom-4 right-4 md:bottom-6 md:right-6`
- Clic → ouvre drawer (mobile) ou modal (desktop)
- Drawer contient : titre chapitre actif + bouton "Obtenir un conseil" + réponse Claude
- Fermeture via bouton X ou clic backdrop

### 9. Questions libres
**Décision** : Question fixe pour l'instant ("Donne-moi des conseils pratiques..."). Évolution possible en v2.
**Raison** : Limite les abus, économise le rate limit.

### 10. Erreur API chat
**Décision** : Afficher un toast d'erreur "Impossible d'obtenir un conseil. Réessaie plus tard."
**Raison** : Feedback utilisateur essentiel.

---

## 🔥 STREAK & JOKERS

### 11. Message streak 0
**Décision** : Afficher "Commence aujourd'hui ! 🔥" au lieu de "0 jour de suite".
**Raison** : Plus motivant, moins décourageant.

### 12. Système de jokers
**Décision** : ❌ SUPPRIMÉ — Le système de jokers est retiré complètement du MVP.
**Raison** : Complexité inutile, pas assez intuitif pour les utilisateurs.
**Impact** :
- Retirer le bouton joker de StreakCounter
- Supprimer /api/streak/joker
- Garder uniquement le streak counter (jours consécutifs)

---

## 📊 DONNÉES & PERSISTANCE

### 16. Chargement initial
**Décision** : DashboardContent charge `quest_progress`, `total_points`, `streak_data` depuis Supabase au mount.
**Implémentation** : Passer ces données depuis `app/dashboard/page.tsx` (Server Component) via props `initialPlan`.

### 17. Erreur API quête
**Décision** : Afficher un toast d'erreur "Impossible d'enregistrer ta progression. Vérifie ta connexion."
**Raison** : Feedback clair, l'utilisateur sait que ça n'a pas fonctionné.

### 18. Multiple plans
**Décision** : Un seul plan actif par utilisateur. POST /api/plan écrase l'ancien (DELETE puis INSERT).
**Raison** : Simplicité. Évolution possible en v2 avec historique.

### 19. Suppression compte
**Décision** : `memoir_plans` CASCADE DELETE.
**Implémentation** : `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE`.

### 20. chapter_progress vs quest_progress
**Décision** : `quest_progress` est la seule source de vérité. `chapter_progress` peut être supprimé s'il existe.
**Raison** : Pas besoin de deux systèmes de suivi.

---

## ⚙️ RATE LIMITING & API

### 21. Rate limit /api/chat
**Décision** : 20 requêtes par jour calendaire UTC (reset à minuit UTC).
**Implémentation** : Utiliser `usage_tracking` avec `DATE(created_at AT TIME ZONE 'UTC')`.

### 22. Liste routes API
**Décision** : Routes existantes :
- POST /api/plan
- POST /api/chat
- POST /api/quests/complete
- POST /api/journal/entry (deprecated, retiré)
- POST /api/streak/joker

### 23. Upload multi-PDF
**Décision** : Un seul PDF par upload.
**Raison** : Simplicité, limite les abus.

### 24. Points négatifs
**Décision** : Les points sont toujours >= 0 (pas de pénalité).
**Raison** : Gamification positive.

---

## 🔄 COMPORTEMENT API

### 25. Idempotence quête
**Décision** : Cocher 2× la même quête retourne 200 OK (idempotent).
**Implémentation** : Utiliser `ON CONFLICT DO NOTHING` ou vérifier avant insertion.

### 26. Rate limit reset
**Décision** : Minuit UTC.
**Raison** : Simplicité serveur, cohérence internationale.

### 27. Jokers départ
**Décision** : 1 joker au démarrage.
**Implémentation** : `DEFAULT 1` dans la colonne `streak_data->jokers`.

### 28. Joker même jour
**Décision** : Oui, peut utiliser un joker même si déjà complété une quête ce jour-là.
**Raison** : Flexibilité.

### 29. Quête sans plan
**Décision** : Retourner 400 Bad Request avec message "Aucun plan actif trouvé."
**Raison** : Erreur client (doit uploader un plan d'abord).

### 30. `remaining` en erreur
**Décision** : Oui, inclure `remaining` même en cas d'erreur 400/429.
**Format** : `{ error: "...", remaining: 0 }`.

### 31. Historique conversation
**Décision** : POST /api/chat accepte uniquement une question isolée (pas d'historique).
**Raison** : Simplicité, économie de tokens.

### 32. Format date streak
**Décision** : ISO 8601 complet `YYYY-MM-DDTHH:mm:ss.sssZ`.
**Raison** : Standard, compatible avec `new Date()` JavaScript.

### 33. Plan historique
**Décision** : POST /api/plan écrase le plan existant (DELETE + INSERT).
**Raison** : Un seul plan actif (voir spec #18).

---

## 🎨 UI & ACCESSIBILITÉ

### 34. Mémoire accordion
**Décision** : Toujours ouvrir le chapitre 1 par défaut (pas de localStorage).
**Raison** : Cohérence, simplicité.

### 35. Message erreur /api/chat
**Décision** : Toast notification en haut à droite, 4 secondes, dismiss automatique.
**Implémentation** : Utiliser `react-hot-toast` ou créer un composant Toast custom.

### 36. ARIA checkbox
**Décision** : Oui, gérer la touche `Space` pour cocher/décocher.
**Implémentation** : `onKeyDown={(e) => { if (e.key === ' ') handleComplete() }}`.

### 37. Gap motivation → badge
**Décision** : Afficher un mini-spinner (3 points pulsants) pendant le temps entre la fin du timeout 2s et l'arrivée de l'API.
**Raison** : Feedback visuel continu.

### 38. Breakpoints responsive
**Décision** :
- Mobile : `< 768px`
- Tablet : `768px - 1024px`
- Desktop : `> 1024px`

### 39. Test navigateurs
**Décision** : Desktop Chrome/Firefox + iOS Safari + Android Chrome.
**Raison** : Couverture ~95% des utilisateurs.

### 40. prefers-reduced-motion
**Décision** : Oui, respecter ce paramètre.
**Implémentation** : Ajouter `@media (prefers-reduced-motion: reduce)` avec `animation: none`.

### 41. Émojis vs SVG
**Décision** : Émojis OK pour le MVP.
**Raison** : Rapidité de développement. Conversion SVG en v2 si nécessaire.

### 42. Opacité disabled
**Décision** : `opacity-50` (défaut Tailwind).
**Raison** : Cohérence avec le framework.

### 43. Messages validation
**Décision** : Dans le scope de ux-tester (tests de formulaires).
**Raison** : C'est de l'UX, pas de l'UI pure.

---

## 🧑‍🎓 PROFIL UTILISATEUR

### 44. Niveau études
**Décision** : Tous niveaux (Licence, Master, Doctorat).
**Raison** : Élargir le marché.

### 45. Domaines cibles
**Décision** : Tous domaines (sciences humaines, sciences dures, médecine, droit, etc.).
**Raison** : App généraliste.

### 46. Nb sous-sections
**Décision** : Variable, dépend du plan généré par l'IA (moyenne observée : 4-6 sections/chapitre).
**Raison** : Flexibilité de l'IA.

### 47. Tips obligatoires
**Décision** : Optionnels (dépend de la réponse de l'IA).
**Raison** : L'IA peut ou non générer des tips.

### 48. Durée/Difficulté IA
**Décision** : L'IA ne retourne PAS de durée ou difficulté actuellement.
**Raison** : Hors scope du prompt actuel. Peut être ajouté en v2.

### 49. Nb chapitres
**Décision** : Variable entre 4 et 8 (contrainte dans le SYSTEM_PROMPT).
**Raison** : Flexibilité selon la complexité du mémoire.

---

## 🎨 DESIGN SYSTEM

### 50. Couleurs marque
**Décision** : Palette dark définie :
- Background : `zinc-950`
- Cards : `zinc-900/60`
- Accent : `indigo-500`
- Success : `emerald-500`
- Error : `red-500`

### 51. Police
**Décision** : `SF Pro Display` (macOS) / `Inter` (fallback) / `sans-serif`.
**Raison** : Déjà configuré dans `globals.css`.

### 52. Framer Motion
**Décision** : Non, CSS Transitions uniquement pour le MVP.
**Raison** : Simplicité, moins de dépendances.

### 53. Effets sonores
**Décision** : Non, hors scope pour le MVP.
**Raison** : Peut être intrusif, complexe à implémenter.

### 54. Plateforme cible
**Décision** : Desktop et mobile en priorité égale (responsive-first).
**Raison** : Les étudiants utilisent les deux.

### 55. Durée phrase motivation
**Décision** : 2 secondes.
**Raison** : Suffisant pour lire, pas trop long.

---

## 🛠️ PROCESS & AUTORITÉ

### 56. Autorité quality-director
**Décision** : Peut signaler un bug comme "bloquant" (flag critique), mais team-lead décide de bloquer ou non la livraison.
**Raison** : Checks & balances.

### 57. Périmètre testeurs
**Décision** : Peuvent corriger directement les bugs < 5 lignes (typos CSS, props manquantes), sinon rapport au spécialiste.
**Raison** : Accélère les corrections mineures.

### 58. Migrations Supabase
**Décision** : Appliquées manuellement via SQL Editor pour l'instant.
**Raison** : Pas de CI/CD configuré. Auto-déploiement en v2.

### 59. Design System
**Décision** : Créer `DESIGN_SYSTEM.md` avec :
- Palette couleurs exacte (hex + Tailwind classes)
- Échelle de timing animations (200ms, 300ms, 500ms)
- Règles d'espacement (multiples de 4)
- Composants réutilisables

---

## 📋 ACTIONS IMMÉDIATES

**À implémenter par backend-engineer :**
1. Charger `quest_progress`, `total_points`, `streak_data` dans `app/dashboard/page.tsx`
2. Passer ces données comme props `initialQuestProgress`, `initialTotalPoints`, `initialStreak` à `DashboardContent`
3. Ajouter idempotence dans POST /api/quests/complete
4. Ajouter `remaining` dans toutes les réponses d'erreur

**À implémenter par ui-specialist :**
1. Créer composant `Toast` pour les erreurs API
2. Ajouter `onKeyDown` Space sur QuestItem checkbox
3. Modifier message streak 0 → "Commence aujourd'hui ! 🔥"
4. Ajouter mini-spinner entre motivation et badge
5. Ajouter `@media (prefers-reduced-motion: reduce)`

**À créer par team-lead :**
1. `DESIGN_SYSTEM.md` avec palette complète

---

**FIN DES SPECS v1.0**
