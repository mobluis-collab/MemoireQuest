# PROMPT — Système de Pense-bêtes (Notes)

## Contexte
On ajoute une nouvelle vue "Pense-bêtes" au dashboard. C'est un éditeur de notes simple inspiré d'Apple Notes. L'étudiant peut y écrire ses idées annexes, questions pour le tuteur, sources à vérifier, etc.

## 1. Nouvelle table Supabase

Créer une migration pour la table `notes` :

```sql
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own notes"
  ON notes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_updated_at ON notes(updated_at DESC);
```

## 2. API Route — `app/api/notes/route.ts`

### GET `/api/notes`
- Récupère toutes les notes de l'utilisateur connecté
- Triées par `updated_at DESC`
- Retourne `{ notes: Note[] }`

### POST `/api/notes`
- Body : `{ title?: string, content?: string }`
- Crée une nouvelle note (titre et contenu vides par défaut)
- Retourne `{ note: Note }`

### PUT `/api/notes`
- Body : `{ id: string, title?: string, content?: string }`
- Met à jour la note. Set `updated_at = NOW()`
- Retourne `{ note: Note }`

### DELETE `/api/notes`
- Body : `{ id: string }`
- Supprime la note
- Retourne `{ success: true }`

Chaque handler doit :
- Vérifier l'auth via `createServerClient`
- Wrapper `request.json()` dans un try/catch → 400 si invalide
- Retourner des erreurs propres (401, 400, 500)

## 3. Type TypeScript — `src/types/notes.ts`

```ts
export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string; // HTML string from contentEditable
  created_at: string;
  updated_at: string;
}
```

## 4. Entrée sidebar — dans `NewDashboard.tsx`

Ajouter un item "Pense-bêtes" dans la sidebar, **après** "Succès" et **avant** "Réglages".

Icône SVG (document avec lignes) :
```jsx
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
  <path d="M15.5 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V8.5L15.5 3z"/>
  <polyline points="14 2 14 8 20 8"/>
  <line x1="16" y1="13" x2="8" y2="13"/>
  <line x1="16" y1="17" x2="8" y2="17"/>
  <line x1="10" y1="9" x2="8" y2="9"/>
</svg>
```

Label : `Pense-bêtes`

Badge : afficher le nombre de notes (ex: `3`) dans un petit badge arrondi à droite, style :
```ts
{
  marginLeft: 'auto',
  fontSize: 11,
  background: bg(0.08),
  color: tw(0.45),
  padding: '1px 7px',
  borderRadius: 8,
}
```

Ajouter `'notes'` comme nouvelle valeur possible dans le state `activeView`.

## 5. Composant principal — `src/components/dashboard/new/NotesView.tsx`

### Layout

Le layout se compose de deux panneaux côte à côte :
- **Panneau gauche** (280px, rétractable) : liste des notes
- **Panneau droit** (flex 1) : éditeur

State : `const [isListCollapsed, setIsListCollapsed] = useState(false)`

Quand rétracté, le panneau gauche passe à `width: 0, overflow: hidden` avec une transition `width 0.2s ease`. L'éditeur prend toute la largeur.

### Panneau gauche — Liste des notes

**Header** :
- Titre "Pense-bêtes" (fontSize 20, fontWeight 600, color `tw(0.9)`)
- Deux boutons à droite, gap 6px :
  - Bouton "+" pour nouvelle note (32×32px, borderRadius 8, border `1px solid ${bg(0.12)}`, background `bg(0.04)`)
  - Bouton rétracter (même style 32×32) avec icône chevron gauche `«` — clic → `setIsListCollapsed(true)`

**Sous-titre** :
- Texte : `"Écris toutes tes idées ici pour ne plus les perdre."`
- Style : fontSize 13, color `tw(0.35)`, lineHeight 1.5

**Barre de recherche** :
- Input avec placeholder "Rechercher..."
- Filtre côté client sur `title` et `content` (strip HTML pour le content)

**Liste des notes** :
- Chaque note affiche :
  - **Titre** (fontSize 14, fontWeight 500, color `tw(0.85)`) — tronqué avec ellipsis
  - **Aperçu** du contenu (fontSize 12, color `tw(0.35)`) — texte brut tronqué, max 1 ligne
  - **Date** (fontSize 11, color `tw(0.2)`) — format relatif : "Il y a X min", "Aujourd'hui, 14h30", "Hier", "3 mars"
- Note active : background `bg(0.07)`
- Hover : background `bg(0.04)`
- Clic : sélectionne la note et l'affiche dans l'éditeur

### Panneau droit — Éditeur

**Toolbar** (en haut, border-bottom `1px solid ${bg(0.06)}`) :

Quand `isListCollapsed === true`, ajouter un bouton en premier dans la toolbar :
- Icône chevron droit `»` (ou icône sidebar) — clic → `setIsListCollapsed(false)`
- Même style que les toolbar-btn (34×34, borderRadius 6)
- Suivi d'un séparateur vertical

Boutons de formatage :
| Bouton | Label | Action `document.execCommand` |
|--------|-------|-------------------------------|
| **G** | Gras | `bold` |
| *I* | Italique | `italic` |
| S̲ | Souligné | `underline` |
| Icône surligneur | Surligner | Wrapper la sélection dans `<mark>` |
| ~~B~~ | Barré | `strikethrough` |

Séparateur vertical (1px × 20px, `bg(0.08)`) entre souligné et surligner, et entre surligner et barré.

Bouton supprimer (icône poubelle) aligné à droite :
- Color `tw(0.25)` par défaut
- Hover : color `rgba(255,100,100,0.7)`, background `rgba(255,100,100,0.08)`
- Clic : supprime la note avec confirmation (`window.confirm`)

**Zone d'édition** :

- **Titre** : `<input>` plein largeur, fontSize 24, fontWeight 600, color `tw(0.9)`, pas de bordure, background transparent, placeholder "Titre de la note"
- **Date** : fontSize 12, color `tw(0.25)`, format complet "5 mars 2026 à 14h30"
- **Contenu** : `<div contentEditable>`, min-height 300px, fontSize 15, lineHeight 1.75, color `tw(0.75)`
  - Placeholder (quand vide, via CSS `::before`) : "Commence à écrire..." en `tw(0.2)`
  - Styles pour le contenu formaté :
    - `b` : fontWeight 600, color `tw(0.9)`
    - `i` : fontStyle italic
    - `u` : textDecoration underline
    - `mark` : background `bg(0.12)`, color `tw(0.9)`, padding "1px 3px", borderRadius 2
    - `s` : textDecoration line-through

**État vide** (aucune note sélectionnée) :
- Centré verticalement et horizontalement
- Icône document SVG (48×48, opacity 0.3)
- Texte "Sélectionne ou crée une note" (fontSize 14, color `tw(0.25)`)

### Raccourcis clavier
- `Ctrl/Cmd + B` : Gras
- `Ctrl/Cmd + I` : Italique
- `Ctrl/Cmd + U` : Souligné
- `Ctrl/Cmd + H` : Surligner
- `Ctrl/Cmd + N` : Nouvelle note

## 6. Sauvegarde automatique (auto-save)

Implémenter un **debounce de 800ms** sur les modifications :
- À chaque frappe dans le titre ou le contenu, un timer de 800ms démarre
- Si l'utilisateur continue de taper, le timer se reset
- Quand le timer expire, envoyer un PUT `/api/notes` avec le titre et contenu actuels
- Afficher discrètement "Sauvegardé" (tw(0.25), fontSize 11) à côté de la date pendant 2 secondes après chaque sauvegarde réussie

Le composant doit charger les notes au mount via GET `/api/notes`.

## 7. State management — dans `DashboardContent.tsx`

Ajouter :
```ts
// Dans le state
const [notes, setNotes] = useState<Note[]>([]);

// Fetch au mount (dans le useEffect existant)
const fetchNotes = async () => {
  const res = await fetch('/api/notes');
  if (res.ok) {
    const data = await res.json();
    setNotes(data.notes);
  }
};
```

Passer `notes` et `setNotes` comme props à `NotesView`.

OU BIEN (au choix de l'implémenteur) : garder tout le state local dans `NotesView` lui-même avec son propre fetch. C'est plus simple et plus découplé.

## 8. Styles — rappel monochrome

Tout en inline styles. Utiliser les fonctions `tw()` et `bg()` existantes pour les couleurs. Aucun Tailwind dans ce composant. Fond implicite `#04030e`.

Scrollbar custom (si CSS est nécessaire, ajouter dans globals.css) :
```css
.mq-notes-scroll::-webkit-scrollbar { width: 4px; }
.mq-notes-scroll::-webkit-scrollbar-track { background: transparent; }
.mq-notes-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
```

## Résumé des fichiers à créer/modifier

| Fichier | Action |
|---------|--------|
| Migration SQL (table `notes`) | CRÉER |
| `app/api/notes/route.ts` | CRÉER |
| `src/types/notes.ts` | CRÉER |
| `src/components/dashboard/new/NotesView.tsx` | CRÉER |
| `src/components/dashboard/new/NewDashboard.tsx` | MODIFIER (ajouter item sidebar + vue) |
| `src/components/dashboard/DashboardContent.tsx` | MODIFIER (ajouter activeView 'notes') |
| `app/globals.css` | MODIFIER (ajouter scrollbar .mq-notes-scroll) |
