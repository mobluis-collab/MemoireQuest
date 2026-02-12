import type { Quest } from "@/types";

export const FALLBACK_QUESTS: Quest[] = [
  {
    id: 1,
    phase: "Phase 1",
    title: "Cadrage",
    emoji: "🎯",
    desc: "Poser les fondations de votre mémoire",
    tasks: [
      {
        id: "1-1",
        title: "Analyser le sujet",
        steps: [
          { label: "Lire le cahier des charges en entier" },
          { label: "Surligner les verbes d'action" },
          { label: "Lister les mots-clés principaux" },
          { label: "Identifier le périmètre du sujet" },
        ],
        tip: "Les verbes d'action définissent les attentes.",
      },
      {
        id: "1-2",
        title: "Formuler la problématique",
        steps: [
          { label: "Transformer le sujet en 3 questions possibles" },
          { label: "Choisir la question la plus précise" },
          { label: "Vérifier qu'elle crée un espace de débat" },
        ],
        tip: 'Une bonne problématique commence par "En quoi" ou "Dans quelle mesure".',
      },
      {
        id: "1-3",
        title: "Définir les objectifs",
        steps: [
          { label: "Écrire l'objectif principal en une phrase" },
          { label: "Lister 2-3 objectifs secondaires" },
          { label: "Vérifier avec la méthode SMART" },
        ],
        tip: "Vos objectifs sont votre boussole.",
      },
      {
        id: "1-4",
        title: "Poser les hypothèses",
        steps: [
          { label: 'Formuler 2-3 hypothèses avec "Si… alors…"' },
          { label: "Vérifier que chaque hypothèse est testable" },
        ],
        tip: "Une hypothèse infirmée est aussi intéressante qu'une confirmée.",
      },
    ],
  },
  {
    id: 2,
    phase: "Phase 2",
    title: "Recherche",
    emoji: "📚",
    desc: "Explorer et comprendre l'existant",
    tasks: [
      {
        id: "2-1",
        title: "Identifier les sources clés",
        steps: [
          { label: "Chercher 5 articles sur Google Scholar" },
          { label: "Chercher 5 sources sur CAIRN" },
          { label: "Trouver 3-5 ouvrages de référence" },
          { label: "Organiser dans un tableau" },
        ],
        tip: "Visez un mix : articles récents + ouvrages fondateurs.",
      },
      {
        id: "2-2",
        title: "Cartographier les concepts",
        steps: [
          { label: "Lister les concepts théoriques" },
          { label: "Créer une mind-map" },
          { label: "Identifier les 3-4 concepts centraux" },
        ],
        tip: "Les connexions entre concepts = votre valeur ajoutée.",
      },
      {
        id: "2-3",
        title: "Rédiger l'état de l'art",
        steps: [
          { label: "Regrouper les sources par thème" },
          { label: "Résumer les positions des auteurs" },
          { label: "Identifier consensus et débats" },
          { label: "Montrer le gap que votre mémoire comble" },
        ],
        tip: "L'état de l'art = une conversation entre auteurs que VOUS orchestrez.",
      },
      {
        id: "2-4",
        title: "Cadre théorique",
        steps: [
          { label: "Sélectionner 1-2 théories structurantes" },
          { label: "Expliquer leur pertinence" },
          { label: "Articuler avec la problématique" },
        ],
        tip: "Le cadre théorique = vos lunettes pour regarder votre objet d'étude.",
      },
    ],
  },
  {
    id: 3,
    phase: "Phase 3",
    title: "Méthodologie",
    emoji: "🔬",
    desc: "Définir l'approche",
    tasks: [
      {
        id: "3-1",
        title: "Choisir l'approche",
        steps: [
          { label: "Qualitatif, quantitatif ou mixte ?" },
          { label: "Justifier par rapport à la problématique" },
          { label: "Rédiger la justification" },
        ],
        tip: "Explorer → qualitatif · Mesurer → quantitatif.",
      },
      {
        id: "3-2",
        title: "Définir l'échantillon",
        steps: [
          { label: "Décrire la population cible" },
          { label: "Fixer la taille et justifier" },
          { label: "Critères d'inclusion/exclusion" },
        ],
        tip: "Un petit échantillon bien choisi > un grand aléatoire.",
      },
      {
        id: "3-3",
        title: "Concevoir les outils",
        steps: [
          { label: "Créer questionnaire ou guide d'entretien" },
          { label: "Pré-tester sur 2-3 personnes" },
          { label: "Ajuster après le pré-test" },
        ],
        tip: "Le pré-test révèle les questions ambiguës.",
      },
    ],
  },
  {
    id: 4,
    phase: "Phase 4",
    title: "Terrain",
    emoji: "📊",
    desc: "Collecter et analyser les données",
    tasks: [
      {
        id: "4-1",
        title: "Collecter les données",
        steps: [
          { label: "Planifier le calendrier" },
          { label: "Mener les entretiens/enquêtes" },
          { label: "Tenir un journal de bord" },
        ],
        tip: "Le journal de bord sera précieux pour justifier vos choix.",
      },
      {
        id: "4-2",
        title: "Organiser les données",
        steps: [
          { label: "Retranscrire ou compiler" },
          { label: "Coder les données" },
          { label: "Créer un tableau de synthèse" },
        ],
        tip: "Code couleur pour le qualitatif, Excel pour le quantitatif.",
      },
      {
        id: "4-3",
        title: "Analyser",
        steps: [
          { label: "Présenter les résultats bruts" },
          { label: "Interpréter chaque résultat" },
          { label: "Confronter aux hypothèses" },
        ],
        tip: "Séparez toujours faits et interprétation.",
      },
    ],
  },
  {
    id: 5,
    phase: "Phase 5",
    title: "Rédaction",
    emoji: "✍️",
    desc: "Écrire le mémoire",
    tasks: [
      {
        id: "5-1",
        title: "Plan détaillé",
        steps: [
          { label: "Définir les grandes parties" },
          { label: "Détailler les chapitres" },
          { label: "Écrire les transitions" },
          { label: "Vérifier la logique d'ensemble" },
        ],
        tip: "Votre plan doit raconter une histoire logique.",
      },
      {
        id: "5-2",
        title: "Rédiger le corps",
        steps: [
          { label: "Commencer par la partie la plus facile" },
          { label: "Citer les sources au fur et à mesure" },
          { label: "Relire chaque chapitre" },
        ],
        tip: "L'élan créé par votre point fort facilite le reste.",
      },
      {
        id: "5-3",
        title: "Introduction",
        steps: [
          { label: "Écrire l'accroche" },
          { label: "Présenter le contexte" },
          { label: "Énoncer la problématique" },
          { label: "Annoncer le plan" },
        ],
        tip: "Rédigez l'intro EN DERNIER.",
      },
      {
        id: "5-4",
        title: "Conclusion",
        steps: [
          { label: "Synthétiser les apports" },
          { label: "Répondre à la problématique" },
          { label: "Proposer une ouverture" },
        ],
        tip: "Jamais de nouvelles idées dans la conclusion.",
      },
      {
        id: "5-5",
        title: "Bibliographie",
        steps: [
          { label: "Choisir le format (APA/Chicago/Harvard)" },
          { label: "Formater chaque référence" },
          { label: "Vérifier chaque citation" },
        ],
        tip: "UN format, de la cohérence.",
      },
    ],
  },
  {
    id: 6,
    phase: "Phase 6",
    title: "Finalisation",
    emoji: "🎓",
    desc: "Dernière ligne droite",
    tasks: [
      {
        id: "6-1",
        title: "Relecture",
        steps: [
          { label: "Relire à voix haute" },
          { label: "Vérifier orthographe et grammaire" },
          { label: "Vérifier la cohérence" },
          { label: "Faire relire par quelqu'un" },
        ],
        tip: "La lecture à voix haute est votre meilleur outil.",
      },
      {
        id: "6-2",
        title: "Mise en page",
        steps: [
          { label: "Appliquer le template de l'école" },
          { label: "Générer le sommaire" },
          { label: "Vérifier la pagination" },
          { label: "Page de garde, remerciements, annexes" },
        ],
        tip: "Sommaire auto APRÈS toutes les modifs.",
      },
      {
        id: "6-3",
        title: "Soutenance",
        steps: [
          { label: "Créer 10-15 slides" },
          { label: "Préparer un pitch de 10-15 min" },
          { label: "Anticiper les 5 questions dures" },
          { label: "Répéter 2 fois minimum" },
        ],
        tip: "Préparez les 3 questions les plus dures. Le reste sera facile.",
      },
    ],
  },
];
