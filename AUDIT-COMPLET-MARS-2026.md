# Audit complet — maimouarkwest
**Date** : 5 mars 2026
**Scope** : Code/Securite, UI/UX, Performance, Flows fonctionnels

---

## Legende

| Tag | Signification |
|-----|---------------|
| BLOQUER | A corriger AVANT publication |
| APRES | Peut attendre apres la publication |
| CONNU | Bug deja documente dans CLAUDE.md |

---

## BLOQUER PUBLICATION (a corriger avant de publier)

### 1. Pas de validation serveur sur /api/prestige [CONNU]
**Fichier** : `app/api/prestige/route.ts`
**Risque** : Un utilisateur peut prestige sans etre level 10 ni avoir 100% completion. Il suffit d'appeler l'endpoint directement.
**Fix** : Ajouter une verification server-side : lire le plan depuis Supabase, verifier que le level est 10 ET que toutes les quetes sont completees avant d'executer le prestige.

### 2. Prestige non-atomique [CONNU]
**Fichier** : `app/api/prestige/route.ts`
**Risque** : 3 operations DB separees (update plan, update usage, insert journal). Si la 2e ou 3e echoue, l'etat est incoherent (ex: plan reset mais XP pas reset).
**Fix** : Utiliser une transaction Supabase RPC (`BEGIN; ... COMMIT;`) ou a defaut un rollback manuel.

### 3. Suppression du plan avant creation du nouveau
**Fichier** : `src/lib/plans/queries.ts`
**Risque** : Lors du re-import PDF, l'ancien plan est DELETE avant que le nouveau soit cree. Si la generation echoue (timeout, erreur IA), l'utilisateur perd tout.
**Fix** : Creer le nouveau plan d'abord, puis supprimer l'ancien. Ou faire un soft-delete (flag `archived`).

### 4. Pas de confirmation avant re-import PDF
**Fichier** : `NewDashboard.tsx` (bouton re-import)
**Risque** : Un clic accidentel supprime tout le progres (quest_progress, XP, streaks).
**Fix** : Ajouter un dialogue de confirmation : "Attention : re-importer un PDF va reinitialiser ton plan et ta progression. Continuer ?"

### 5. PLAN_LIMIT a 10 [CONNU]
**Fichier** : `src/lib/rate-limit.ts`
**Risque** : Un utilisateur peut generer 10 plans/jour au lieu de 3. Cout API Claude eleve.
**Fix** : Remettre `PLAN_LIMIT = 3` avant publication.

### 6. maxDuration: 300 sur plan Hobby Vercel
**Fichier** : `app/api/plan/route.ts`
**Risque** : `export const maxDuration = 300` (5 min) mais le plan Hobby Vercel a un timeout de 10 secondes. Cette config est ignoree, ce qui peut induire en erreur.
**Fix** : Retirer ou mettre `maxDuration = 10`. Le SSE streaming gere deja le timeout.

### 7. JSON.parse sans try/catch dans les API routes
**Fichiers** : `app/api/quests/complete/route.ts`, `app/api/prestige/route.ts`, `app/api/chat/route.ts`
**Risque** : Si le body de la requete n'est pas du JSON valide, le serveur crash avec une erreur 500 non attrapee.
**Fix** : Wrapper les `await request.json()` dans un try/catch qui retourne une 400 propre.

---

## APRES PUBLICATION (corriger dans les semaines suivantes)

### Securite

**8. Race condition rate-limit** [CONNU]
Le check-then-increment n'est pas atomique. Deux requetes simultanees peuvent depasser la limite. Fix: utiliser `INSERT ... ON CONFLICT` avec un compteur atomique ou une function RPC PostgreSQL.

**9. Combo timestamps client** [CONNU]
`combo/index.ts` utilise `Date.now()` cote client, manipulable via la console. Fix: deplacer la logique de combo cote serveur.

**10. Prestige title concatenation**
Le titre du plan apres prestige est construit avec `[P${count}] ${title}`. Apres 5 prestiges: `[P5] [P4] [P3] [P2] [P1] Mon titre`. Fix: stocker le titre original et formatter a l'affichage.

### UI/UX

**11. Tailwind dans des composants dashboard**
Certains composants du dashboard utilisent des classes Tailwind au lieu d'inline styles monochrome. Violer cette regle cree des incohérences visuelles.
Fichiers concernes : verifier `ProgressionView.tsx`, `AchievementsView.tsx`, composants enfants.

**12. Texte a faible contraste**
Plusieurs elements utilisent `tw(0.15)` ou `tw(0.20)` qui donnent un contraste insuffisant (ratio < 3:1). Notamment les labels discrets, les sous-titres de sections.
Fix : Remonter a minimum `tw(0.35)` pour les textes informatifs.

**13. Pas d'etats de chargement pour les actions**
Quand on toggle une sous-tache ou qu'on genere un plan, il n'y a pas d'indicateur de loading sur le bouton. L'utilisateur peut cliquer plusieurs fois.
Fix : Ajouter un `isLoading` state + `disabled` sur les boutons d'action.

**14. Panneau fixe non-responsive**
La sidebar (240px fixe) et certains panneaux ne s'adaptent pas aux petits ecrans. En dessous de 768px, la sidebar devrait se cacher.
Fix : Ajouter un breakpoint media query ou un mode mobile.

**15. Pas d'ARIA labels ni navigation clavier**
Les boutons de la sidebar, les chapitres cliquables et les sous-taches n'ont pas de `role`, `aria-label`, ni gestion du focus clavier (Tab, Enter, Escape).
Fix : Ajouter progressivement les attributs ARIA sur les elements interactifs principaux.

### Performance

**16. Pas de React.memo sur les composants lourds**
`MemoireView`, `ProgressionView`, `AchievementsView` se re-renderent a chaque changement de state dans `NewDashboard`. Avec le canvas du mini-jeu, ca peut causer du lag.
Fix : Wrapper les vues dans `React.memo` avec des comparateurs de props.

**17. Pas de lazy-loading**
Tous les composants sont importes statiquement. Le bundle initial inclut le mini-jeu canvas, le chat, le journal, meme si l'utilisateur n'y accede pas.
Fix : `React.lazy()` + `Suspense` pour les vues secondaires (chat, journal, achievements).

**18. Canvas mini-jeu et requestAnimationFrame**
Le mini-jeu dans `ProgressionView` utilise `requestAnimationFrame` qui tourne en continu, meme quand l'onglet n'est pas visible.
Fix : Ajouter un check `document.hidden` ou `useEffect` cleanup pour arreter l'animation quand l'onglet perd le focus.

**19. Pas d'optimistic updates sur les quetes**
Quand on toggle une sous-tache, l'UI attend la reponse du serveur. Si la latence est haute, l'utilisateur voit un delai.
Fix : Mettre a jour l'UI immediatement (optimistic) puis rollback si le serveur echoue.

### Fonctionnel

**20. Boss chapter bonus XP non-valide**
Le bonus XP du "boss chapter" (dernier chapitre) est calcule cote client sans validation serveur. Un utilisateur peut simuler la completion.
Fix : Verifier cote serveur que le chapitre est reellement complet avant d'accorder le bonus.

**21. Streak fragile**
Si l'utilisateur complete une quete a 23h59 puis une a 00h01, le streak ne se maintient peut-etre pas selon le fuseau horaire du serveur vs client.
Fix : Normaliser les dates en UTC cote serveur, calculer les streaks en UTC.

**22. Pas de gestion hors-ligne**
Si l'utilisateur perd sa connexion pendant une action, pas de retry ni de message d'erreur specifique.
Fix : Ajouter des toasts d'erreur reseau et un retry automatique pour les actions critiques.

---

## Prompts deja ecrits (a envoyer a Claude Code)

Ces fichiers sont dans le repo, prets a etre donnes a Claude Code :

| Fichier | Statut | Description |
|---------|--------|-------------|
| `PROMPTS-POMODORO-COMPACT.md` | FAIT | Pomodoro compact redesigne |
| `PROMPTS-FOCUS-BUTTON.md` | A FAIRE | Bouton Focus anime + mode Focus immersif |
| `PROMPTS-CURSOR-FIX-GLOBAL.md` | A FAIRE | Fix curseur I-beam global (CSS) |
| `PROMPTS-SCROLL-BUG-AND-LANDING-TEXT.md` | A FAIRE | Fix scroll MemoireView + texte landing |

---

## Ordre recommande pour la publication

**Etape 1 — Blockers (faire maintenant)**
1. Envoyer `PROMPTS-SCROLL-BUG-AND-LANDING-TEXT.md` a Claude Code (le scroll bug empeche d'utiliser "Mon memoire")
2. Envoyer `PROMPTS-CURSOR-FIX-GLOBAL.md` a Claude Code
3. Remettre `PLAN_LIMIT = 3` dans `rate-limit.ts`
4. Ajouter try/catch sur les `request.json()` des API routes
5. Ajouter confirmation avant re-import PDF
6. Fixer la suppression du plan (creer le nouveau avant de supprimer l'ancien)
7. Retirer `maxDuration: 300` de `/api/plan`

**Etape 2 — Features (faire maintenant ou juste apres)**
1. Envoyer `PROMPTS-FOCUS-BUTTON.md` a Claude Code
2. Verifier que le Pomodoro compact fonctionne bien (deja implemente)

**Etape 3 — Apres publication**
1. Validation serveur du prestige
2. Transaction atomique prestige
3. Rate-limit atomique
4. Combo cote serveur
5. React.memo + lazy loading
6. Accessibilite (ARIA)
7. Responsive mobile

---

## Verdict

L'app est fonctionnelle et le design est propre. Les 7 blockers listes sont des fixes rapides (quelques lignes chacun sauf la suppression de plan). Une fois ces 7 points regles, tu peux publier sereinement. Les items "apres publication" sont des ameliorations de robustesse qui peuvent attendre quelques semaines.
