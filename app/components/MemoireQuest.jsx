"use client";

import { useState, useEffect, useRef } from "react";

const DOMAINS = [
  { id: "info", label: "Informatique", icon: "⌘", desc: "Dev, IA, Réseaux, Cybersécurité" },
  { id: "marketing", label: "Marketing", icon: "◈", desc: "Digital, Stratégie, Communication" },
  { id: "rh", label: "Ressources Humaines", icon: "◉", desc: "Management, Formation, GPEC" },
  { id: "finance", label: "Finance", icon: "◆", desc: "Audit, Contrôle, Marchés" },
  { id: "droit", label: "Droit", icon: "§", desc: "Juridique, Compliance, Contrats" },
  { id: "other", label: "Autre", icon: "✦", desc: "Tout autre champ d'études" },
];

const PHASES = [
  { id: 1, title: "Cadrage", desc: "Définir la problématique et les objectifs", tasks: 4, emoji: "🎯" },
  { id: 2, title: "Recherche", desc: "Revue de littérature et état de l'art", tasks: 5, emoji: "📚" },
  { id: 3, title: "Méthodologie", desc: "Choix et justification de l'approche", tasks: 3, emoji: "🔬" },
  { id: 4, title: "Terrain", desc: "Collecte et analyse des données", tasks: 4, emoji: "📊" },
  { id: 5, title: "Rédaction", desc: "Structure et écriture du mémoire", tasks: 6, emoji: "✍️" },
  { id: 6, title: "Finalisation", desc: "Relecture, soutenance, livrables", tasks: 3, emoji: "🎓" },
];

const phaseTasks = {
  1: [
    { title: "Analyser le sujet", desc: "Décortiquer le cahier des charges et identifier les mots-clés essentiels." },
    { title: "Formuler la problématique", desc: "Transformer le sujet en une question de recherche précise." },
    { title: "Définir les objectifs", desc: "Lister les objectifs principaux et secondaires du mémoire." },
    { title: "Poser les hypothèses", desc: "Formuler 2-3 hypothèses de travail vérifiables." },
  ],
  2: [
    { title: "Identifier les sources clés", desc: "Constituer une bibliographie de 15-20 sources académiques." },
    { title: "Cartographier les concepts", desc: "Mind-map des concepts théoriques liés au sujet." },
    { title: "Analyser l'état de l'art", desc: "Synthétiser les travaux existants et identifier les lacunes." },
    { title: "Cadre théorique", desc: "Choisir et justifier les théories structurantes." },
    { title: "Revue critique", desc: "Rédiger une analyse critique de la littérature." },
  ],
  3: [
    { title: "Choisir l'approche", desc: "Qualitative, quantitative ou mixte — justifier le choix." },
    { title: "Définir l'échantillon", desc: "Population étudiée et critères de sélection." },
    { title: "Concevoir les outils", desc: "Questionnaires, guides d'entretien ou grilles d'analyse." },
  ],
  4: [
    { title: "Collecter les données", desc: "Mener les entretiens ou enquêtes selon le protocole." },
    { title: "Organiser les données", desc: "Trier, coder et structurer les données collectées." },
    { title: "Analyser les résultats", desc: "Appliquer la méthode d'analyse et interpréter." },
    { title: "Confronter aux hypothèses", desc: "Vérifier confirmation ou infirmation des hypothèses." },
  ],
  5: [
    { title: "Construire le plan détaillé", desc: "Parties, chapitres, sous-parties et transitions." },
    { title: "Rédiger l'introduction", desc: "Contexte, problématique, annonce du plan." },
    { title: "Rédiger le corps", desc: "Développer chaque partie selon la logique argumentaire." },
    { title: "Rédiger la conclusion", desc: "Synthèse, réponse à la problématique, ouverture." },
    { title: "Soigner les transitions", desc: "Fluidité entre chaque partie du mémoire." },
    { title: "Bibliographie aux normes", desc: "Formater les références selon les normes requises." },
  ],
  6: [
    { title: "Relecture complète", desc: "Orthographe, grammaire, syntaxe et cohérence." },
    { title: "Mise en page finale", desc: "Template, marges, polices, pagination, sommaire." },
    { title: "Préparer la soutenance", desc: "Support de présentation et réponses au jury." },
  ],
};

const tips = {
  "1-0": "Surlignez les **verbes d'action** dans votre sujet : analyser, comparer, évaluer… Ils définissent les attentes.",
  "1-1": "Commencez par **\"En quoi...\"** ou **\"Dans quelle mesure...\"** — créez un espace de débat.",
  "1-2": "Méthode **SMART** : Spécifique, Mesurable, Atteignable, Réaliste, Temporel.",
  "1-3": "Formulez avec **\"Si… alors…\"** pour tester la cohérence de chaque hypothèse.",
  "2-0": "**Google Scholar** + **CAIRN** pour les sources francophones. Mix articles, ouvrages, thèses.",
  "2-1": "Utilisez **Miro** ou une feuille A3 pour visualiser les connexions entre concepts.",
  "2-2": "L'état de l'art = une **conversation entre auteurs** que vous orchestrez, pas un résumé.",
  "2-3": "Le cadre théorique = vos **lunettes**. Il détermine comment regarder votre objet d'étude.",
  "2-4": "Structure en **entonnoir** : du général au spécifique, terminez par le gap que votre mémoire comble.",
  "3-0": "**Explorer** → qualitatif · **Mesurer** → quantitatif · **Les deux** → mixte.",
  "3-1": "Un petit échantillon **bien choisi** vaut mieux qu'un grand échantillon aléatoire.",
  "3-2": "Testez vos outils sur **2-3 personnes** avant le terrain réel.",
  "4-0": "Tenez un **journal de bord** pendant la collecte — précieux pour justifier vos choix.",
  "4-1": "**Code couleur** ou NVivo pour les données qualitatives.",
  "4-2": "Résultats **bruts** d'abord, puis interprétation. Séparez faits et analyse.",
  "4-3": "Une hypothèse infirmée est aussi intéressante. **Expliquez pourquoi.**",
  "5-0": "Votre plan doit raconter une **histoire logique** — chaque partie découle de la précédente.",
  "5-1": "Rédigez l'intro **en dernier** quand vous maîtrisez l'ensemble.",
  "5-2": "Commencez par la partie où vous êtes le plus **à l'aise** — l'élan facilite le reste.",
  "5-3": "La conclusion ne doit **jamais** introduire de nouvelles idées.",
  "5-4": "Chaque transition = **bilan** de ce qui précède + **annonce** de ce qui suit.",
  "5-5": "**APA, Chicago ou Harvard** — choisissez et restez cohérent.",
  "6-0": "Lisez **à voix haute**. Votre oreille repérera ce que vos yeux ont raté.",
  "6-1": "Vérifiez le **sommaire automatique** et la pagination.",
  "6-2": "Préparez les réponses aux **3 questions les plus difficiles** du jury.",
};

function AnimNum({ value, dur = 1200 }) {
  const [d, setD] = useState(0);
  useEffect(() => {
    let s = 0;
    const step = (ts) => {
      if (!s) s = ts;
      const p = Math.min((ts - s) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setD(Math.floor(ease * value));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, dur]);
  return d;
}

export default function MemoireQuest() {
  const [mode, setMode] = useState("dark");
  const [page, setPage] = useState("landing");
  const [domain, setDomain] = useState(null);
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activePhase, setActivePhase] = useState(1);
  const [completed, setCompleted] = useState({});
  const [showTip, setShowTip] = useState(null);
  const [mounted, setMounted] = useState(false);
  const fileRef = useRef();

  useEffect(() => { setMounted(true); }, []);

  const dk = mode === "dark";

  // Apple-inspired palette
  const c = {
    // Backgrounds
    bg: dk ? "#000000" : "#f5f5f7",
    bgElevated: dk ? "rgba(28,28,30,0.72)" : "rgba(255,255,255,0.72)",
    bgCard: dk ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.6)",
    bgCardHover: dk ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.8)",
    bgGlass: dk ? "rgba(44,44,46,0.55)" : "rgba(255,255,255,0.65)",
    bgGlassStrong: dk ? "rgba(44,44,46,0.8)" : "rgba(255,255,255,0.85)",
    // Borders
    border: dk ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    borderLight: dk ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
    borderHover: dk ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)",
    // Text
    text: dk ? "#f5f5f7" : "#1d1d1f",
    textSecondary: dk ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)",
    textTertiary: dk ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)",
    // Accent — Apple blue
    accent: "#0071e3",
    accentHover: "#0077ED",
    accentSoft: dk ? "rgba(0,113,227,0.15)" : "rgba(0,113,227,0.08)",
    accentGlow: dk ? "rgba(0,113,227,0.25)" : "rgba(0,113,227,0.12)",
    // Success
    green: "#30d158",
    greenSoft: dk ? "rgba(48,209,88,0.15)" : "rgba(48,209,88,0.1)",
  };

  const startAnalysis = () => {
    if (!file || !domain) return;
    setAnalyzing(true);
    setProgress(0);
    const iv = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(iv); setTimeout(() => { setAnalyzing(false); setPage("dashboard"); }, 500); return 100; }
        return p + Math.random() * 6 + 2;
      });
    }, 120);
  };

  const toggle = (pid, idx) => {
    const k = `${pid}-${idx}`;
    setCompleted((prev) => ({ ...prev, [k]: !prev[k] }));
  };

  const totalTasks = PHASES.reduce((s, p) => s + p.tasks, 0);
  const doneCount = Object.values(completed).filter(Boolean).length;
  const overallPct = Math.round((doneCount / totalTasks) * 100);
  const phase = PHASES.find((p) => p.id === activePhase);

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    .root {
      min-height: 100vh;
      background: ${c.bg};
      color: ${c.text};
      font-family: -apple-system, 'SF Pro Display', 'SF Pro Text', 'Inter', 'Helvetica Neue', sans-serif;
      -webkit-font-smoothing: antialiased;
      transition: background 0.6s cubic-bezier(0.4, 0, 0.2, 1), color 0.4s;
      overflow-x: hidden;
      position: relative;
    }

    /* ── Ambient Orbs (Apple style mesh gradient) ── */
    .orb {
      position: fixed;
      border-radius: 50%;
      filter: blur(100px);
      pointer-events: none;
      z-index: 0;
      opacity: ${dk ? 0.35 : 0.25};
      transition: opacity 0.6s;
    }
    .orb-1 {
      width: 600px; height: 600px;
      background: radial-gradient(circle, #0071e3 0%, transparent 70%);
      top: -200px; right: -150px;
    }
    .orb-2 {
      width: 500px; height: 500px;
      background: radial-gradient(circle, #bf5af2 0%, transparent 70%);
      bottom: -150px; left: -100px;
    }
    .orb-3 {
      width: 400px; height: 400px;
      background: radial-gradient(circle, #30d158 0%, transparent 70%);
      top: 40%; left: 50%;
      transform: translate(-50%, -50%);
      opacity: ${dk ? 0.12 : 0.08};
    }

    /* ── Frosted Nav ── */
    .nav {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 100;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      background: ${c.bgGlassStrong};
      backdrop-filter: blur(40px) saturate(1.8);
      -webkit-backdrop-filter: blur(40px) saturate(1.8);
      border-bottom: 0.5px solid ${c.border};
      transition: all 0.4s;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: -0.02em;
      cursor: pointer;
      user-select: none;
    }

    .nav-logo {
      width: 26px; height: 26px;
      border-radius: 7px;
      background: ${c.accent};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      color: white;
      font-weight: 700;
    }

    .nav-right {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .nav-pill {
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 100px;
      background: ${c.bgCard};
      border: 0.5px solid ${c.border};
      color: ${c.textSecondary};
      font-weight: 500;
      letter-spacing: -0.01em;
    }

    .icon-btn {
      width: 32px; height: 32px;
      border-radius: 8px;
      border: 0.5px solid ${c.border};
      background: ${c.bgCard};
      color: ${c.textSecondary};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .icon-btn:hover {
      background: ${c.bgCardHover};
      color: ${c.text};
      border-color: ${c.borderHover};
    }

    .btn-blue {
      padding: 7px 18px;
      border-radius: 980px;
      border: none;
      background: ${c.accent};
      color: white;
      font-family: inherit;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      letter-spacing: -0.01em;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .btn-blue:hover {
      background: ${c.accentHover};
      transform: scale(1.02);
      box-shadow: 0 4px 20px ${c.accentGlow};
    }
    .btn-blue:active { transform: scale(0.98); }

    .btn-secondary {
      padding: 7px 18px;
      border-radius: 980px;
      border: 0.5px solid ${c.border};
      background: ${c.bgGlass};
      backdrop-filter: blur(20px);
      color: ${c.text};
      font-family: inherit;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.25s;
    }
    .btn-secondary:hover {
      background: ${c.bgGlassStrong};
      border-color: ${c.borderHover};
    }

    /* ── LANDING ── */
    .landing {
      position: relative;
      z-index: 1;
      padding-top: 52px;
    }

    .hero {
      max-width: 680px;
      margin: 0 auto;
      text-align: center;
      padding: 100px 24px 60px;
    }

    .hero-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 14px;
      border-radius: 980px;
      background: ${c.bgGlass};
      backdrop-filter: blur(20px);
      border: 0.5px solid ${c.border};
      font-size: 12px;
      color: ${c.textSecondary};
      font-weight: 500;
      margin-bottom: 28px;
      animation: rise 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    .pulse-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: ${c.green};
      animation: pulse 2.5s ease infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.8); }
    }

    @keyframes rise {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .hero h1 {
      font-size: clamp(42px, 6.5vw, 60px);
      font-weight: 700;
      letter-spacing: -0.04em;
      line-height: 1.05;
      margin-bottom: 18px;
      animation: rise 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.08s both;
    }

    .hero h1 .gradient-text {
      background: linear-gradient(135deg, #0071e3 0%, #bf5af2 50%, #ff375f 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-sub {
      font-size: 18px;
      line-height: 1.55;
      color: ${c.textSecondary};
      font-weight: 400;
      max-width: 440px;
      margin: 0 auto 36px;
      letter-spacing: -0.01em;
      animation: rise 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.16s both;
    }

    .hero-actions {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      animation: rise 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.24s both;
    }
    .hero-actions .btn-blue {
      padding: 10px 28px;
      font-size: 14px;
    }
    .hero-actions .btn-secondary {
      padding: 10px 24px;
      font-size: 14px;
    }

    /* Glass feature cards */
    .features-section {
      max-width: 880px;
      margin: 40px auto 0;
      padding: 0 24px;
      animation: rise 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.32s both;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    .glass-card {
      padding: 28px 24px;
      border-radius: 20px;
      background: ${c.bgGlass};
      backdrop-filter: blur(40px) saturate(1.5);
      -webkit-backdrop-filter: blur(40px) saturate(1.5);
      border: 0.5px solid ${c.border};
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }
    .glass-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, ${dk ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.8)'}, transparent);
    }
    .glass-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 60px ${dk ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.08)'};
      border-color: ${c.borderHover};
    }

    .glass-card-icon {
      width: 40px; height: 40px;
      border-radius: 12px;
      background: ${c.accentSoft};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      margin-bottom: 16px;
    }

    .glass-card h3 {
      font-size: 15px;
      font-weight: 600;
      letter-spacing: -0.02em;
      margin-bottom: 6px;
    }
    .glass-card p {
      font-size: 13px;
      line-height: 1.5;
      color: ${c.textSecondary};
    }

    /* Stats row */
    .stats-row {
      max-width: 880px;
      margin: 64px auto;
      padding: 0 24px;
      display: flex;
      justify-content: center;
      gap: 1px;
      animation: rise 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
    }

    .stat-glass {
      flex: 1;
      text-align: center;
      padding: 28px 20px;
      background: ${c.bgGlass};
      backdrop-filter: blur(30px);
      border: 0.5px solid ${c.border};
    }
    .stat-glass:first-child { border-radius: 16px 0 0 16px; }
    .stat-glass:last-child { border-radius: 0 16px 16px 0; }

    .stat-num {
      font-size: 32px;
      font-weight: 700;
      letter-spacing: -0.04em;
      font-feature-settings: 'tnum';
      background: linear-gradient(135deg, ${c.accent}, #bf5af2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .stat-label {
      font-size: 12px;
      color: ${c.textTertiary};
      margin-top: 4px;
      font-weight: 500;
    }

    .footer {
      text-align: center;
      padding: 32px 24px;
      font-size: 12px;
      color: ${c.textTertiary};
      border-top: 0.5px solid ${c.borderLight};
    }

    /* ── ONBOARDING ── */
    .onboard {
      position: relative;
      z-index: 1;
      padding: 100px 24px 60px;
      max-width: 560px;
      margin: 0 auto;
    }

    .onboard-step {
      animation: rise 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    .step-num {
      font-size: 11px;
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
      color: ${c.accent};
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 6px;
    }

    .step-title {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.035em;
      margin-bottom: 6px;
    }

    .step-desc {
      font-size: 15px;
      color: ${c.textSecondary};
      margin-bottom: 28px;
    }

    .domain-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    .domain-card {
      padding: 18px;
      border-radius: 16px;
      background: ${c.bgGlass};
      backdrop-filter: blur(30px);
      border: 0.5px solid ${c.border};
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .domain-card:hover {
      background: ${c.bgCardHover};
      border-color: ${c.borderHover};
      transform: translateY(-2px);
      box-shadow: 0 8px 30px ${dk ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.06)'};
    }
    .domain-card.active {
      border-color: ${c.accent};
      background: ${c.accentSoft};
      box-shadow: 0 0 0 1px ${c.accent}, 0 8px 30px ${c.accentGlow};
    }

    .domain-icon {
      width: 36px; height: 36px;
      border-radius: 10px;
      background: ${c.accentSoft};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      flex-shrink: 0;
    }

    .domain-info h4 {
      font-size: 14px;
      font-weight: 600;
      letter-spacing: -0.01em;
    }
    .domain-info span {
      font-size: 12px;
      color: ${c.textSecondary};
    }

    /* Upload */
    .upload-area {
      border: 1.5px dashed ${c.border};
      border-radius: 20px;
      padding: 52px 24px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      background: ${c.bgCard};
      backdrop-filter: blur(20px);
    }
    .upload-area:hover {
      border-color: ${c.accent};
      background: ${c.accentSoft};
    }
    .upload-area.filled {
      border-style: solid;
      border-color: ${c.accent};
      background: ${c.accentSoft};
    }

    .upload-icon-wrap {
      width: 52px; height: 52px;
      border-radius: 16px;
      background: ${c.bgGlass};
      backdrop-filter: blur(20px);
      border: 0.5px solid ${c.border};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      margin: 0 auto 16px;
    }

    .upload-label {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 4px;
    }
    .upload-hint {
      font-size: 12px;
      color: ${c.textTertiary};
    }
    .upload-fname {
      font-size: 14px;
      font-weight: 600;
      color: ${c.accent};
    }

    .step-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 32px;
    }

    /* ── ANALYZING OVERLAY ── */
    .analyze-overlay {
      position: fixed;
      inset: 0;
      z-index: 200;
      background: ${dk ? 'rgba(0,0,0,0.85)' : 'rgba(245,245,247,0.9)'};
      backdrop-filter: blur(60px) saturate(1.4);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.5s;
    }
    @keyframes fadeIn { from { opacity: 0; } }

    .analyze-glass {
      text-align: center;
      padding: 48px;
      border-radius: 28px;
      background: ${c.bgGlass};
      backdrop-filter: blur(40px);
      border: 0.5px solid ${c.border};
      min-width: 320px;
      box-shadow: 0 24px 80px ${dk ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.08)'};
    }

    .spinner-ring {
      width: 44px; height: 44px;
      border-radius: 50%;
      border: 2.5px solid ${c.border};
      border-top-color: ${c.accent};
      animation: spin 0.7s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .progress-track {
      width: 200px;
      height: 3px;
      border-radius: 4px;
      background: ${c.border};
      margin: 14px auto 0;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      border-radius: 4px;
      background: linear-gradient(90deg, ${c.accent}, #bf5af2);
      transition: width 0.12s linear;
    }

    /* ── DASHBOARD ── */
    .dash {
      position: relative;
      z-index: 1;
      padding-top: 52px;
      display: grid;
      grid-template-columns: 240px 1fr;
      min-height: 100vh;
    }

    .side {
      border-right: 0.5px solid ${c.border};
      padding: 24px 16px;
      position: sticky;
      top: 52px;
      height: calc(100vh - 52px);
      overflow-y: auto;
      background: ${dk ? 'rgba(0,0,0,0.3)' : 'rgba(245,245,247,0.5)'};
      backdrop-filter: blur(20px);
    }

    /* Progress ring */
    .progress-ring-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px 0 24px;
      margin-bottom: 20px;
    }

    .ring-container {
      position: relative;
      width: 80px; height: 80px;
      margin-bottom: 10px;
    }
    .ring-container svg {
      transform: rotate(-90deg);
    }
    .ring-bg {
      fill: none;
      stroke: ${c.border};
      stroke-width: 4;
    }
    .ring-fill {
      fill: none;
      stroke: url(#ringGrad);
      stroke-width: 4;
      stroke-linecap: round;
      transition: stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .ring-pct {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: -0.03em;
      font-feature-settings: 'tnum';
    }
    .ring-label {
      font-size: 11px;
      color: ${c.textTertiary};
      font-weight: 500;
    }

    .side-label {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: ${c.textTertiary};
      padding: 0 8px;
      margin-bottom: 8px;
      font-family: 'JetBrains Mono', monospace;
    }

    .phase-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 10px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 1px;
      font-size: 13px;
      font-weight: 500;
      color: ${c.textSecondary};
    }
    .phase-item:hover {
      background: ${c.bgCardHover};
      color: ${c.text};
    }
    .phase-item.active {
      background: ${c.accentSoft};
      color: ${c.text};
    }

    .phase-emoji {
      font-size: 16px;
      width: 24px;
      text-align: center;
      flex-shrink: 0;
    }

    .phase-count {
      margin-left: auto;
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
      color: ${c.textTertiary};
    }

    /* Main */
    .main {
      padding: 36px 48px 80px;
      max-width: 680px;
    }

    .phase-header {
      margin-bottom: 28px;
      animation: rise 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    .phase-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-family: 'JetBrains Mono', monospace;
      padding: 4px 12px;
      border-radius: 8px;
      background: ${c.accentSoft};
      color: ${c.accent};
      margin-bottom: 10px;
    }

    .phase-title {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.035em;
      margin-bottom: 4px;
    }

    .phase-desc {
      font-size: 14px;
      color: ${c.textSecondary};
    }

    /* Task cards — glass */
    .tasks {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .task {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 18px 20px;
      border-radius: 16px;
      background: ${c.bgGlass};
      backdrop-filter: blur(30px) saturate(1.3);
      border: 0.5px solid ${c.border};
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      animation: rise 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
      position: relative;
      overflow: hidden;
    }
    .task::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 0.5px;
      background: linear-gradient(90deg, transparent, ${dk ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.5)'}, transparent);
    }
    .task:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px ${dk ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.06)'};
      border-color: ${c.borderHover};
    }
    .task.done { opacity: 0.45; }

    .check {
      width: 22px; height: 22px;
      border-radius: 7px;
      border: 1.5px solid ${c.border};
      flex-shrink: 0;
      margin-top: 1px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      transition: all 0.25s;
      color: transparent;
    }
    .check:hover { border-color: ${c.accent}; }
    .check.on {
      background: ${c.accent};
      border-color: ${c.accent};
      color: white;
    }

    .task-body { flex: 1; }
    .task-name {
      font-size: 14px;
      font-weight: 600;
      letter-spacing: -0.015em;
      margin-bottom: 3px;
    }
    .task-desc {
      font-size: 12.5px;
      color: ${c.textSecondary};
      line-height: 1.45;
    }

    .tip-btn {
      padding: 4px 10px;
      border-radius: 8px;
      border: 0.5px solid ${c.border};
      background: ${c.bgCard};
      color: ${c.textTertiary};
      font-size: 11px;
      font-family: inherit;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
      margin-top: 2px;
      backdrop-filter: blur(10px);
    }
    .tip-btn:hover {
      border-color: ${c.accent};
      color: ${c.accent};
      background: ${c.accentSoft};
    }

    .tip-glass {
      margin-top: 8px;
      padding: 16px 20px;
      border-radius: 14px;
      background: ${c.bgGlass};
      backdrop-filter: blur(30px);
      border: 0.5px solid ${dk ? 'rgba(0,113,227,0.2)' : 'rgba(0,113,227,0.15)'};
      font-size: 13px;
      line-height: 1.6;
      color: ${c.textSecondary};
      animation: rise 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
      box-shadow: 0 8px 24px ${dk ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.04)'};
    }
    .tip-glass strong {
      color: ${c.accent};
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .features-grid { grid-template-columns: 1fr; }
      .stats-row { flex-direction: column; }
      .stat-glass { border-radius: 0 !important; }
      .stat-glass:first-child { border-radius: 16px 16px 0 0 !important; }
      .stat-glass:last-child { border-radius: 0 0 16px 16px !important; }
      .dash { grid-template-columns: 1fr; }
      .side { display: none; }
      .main { padding: 24px 20px 60px; }
      .domain-grid { grid-template-columns: 1fr; }
    }
  `;

  const circumference = 2 * Math.PI * 35;
  const dashOffset = circumference - (overallPct / 100) * circumference;

  return (
    <div className="root">
      <style>{css}</style>
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* SVG gradient def */}
      <svg width="0" height="0"><defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0071e3" />
          <stop offset="100%" stopColor="#bf5af2" />
        </linearGradient>
      </defs></svg>

      {/* ── NAV ── */}
      <nav className="nav">
        <div className="nav-brand" onClick={() => { setPage("landing"); setDomain(null); setFile(null); }}>
          <div className="nav-logo">M</div>
          MémoireQuest
        </div>
        <div className="nav-right">
          {page === "dashboard" && domain && (
            <span className="nav-pill">{DOMAINS.find(d => d.id === domain)?.label}</span>
          )}
          <button className="icon-btn" onClick={() => setMode(dk ? "light" : "dark")}>
            {dk ? "☀︎" : "☾"}
          </button>
          {page === "landing" && (
            <button className="btn-blue" onClick={() => setPage("onboard")}>Commencer</button>
          )}
        </div>
      </nav>

      {/* ── LANDING ── */}
      {page === "landing" && mounted && (
        <div className="landing">
          <section className="hero">
            <div className="hero-chip">
              <span className="pulse-dot" />
              Open Source · Gratuit
            </div>
            <h1>
              Structurez votre<br />
              mémoire, <span className="gradient-text">simplement.</span>
            </h1>
            <p className="hero-sub">
              L'assistant IA qui analyse votre sujet et vous guide étape par étape jusqu'à la soutenance.
            </p>
            <div className="hero-actions">
              <button className="btn-blue" onClick={() => setPage("onboard")}>Démarrer →</button>
              <button className="btn-secondary">Voir sur GitHub ↗</button>
            </div>
          </section>

          <section className="features-section">
            <div className="features-grid">
              <div className="glass-card">
                <div className="glass-card-icon">⚡</div>
                <h3>Analyse IA</h3>
                <p>Uploadez votre cahier des charges, l'IA génère un plan structuré en quelques secondes.</p>
              </div>
              <div className="glass-card">
                <div className="glass-card-icon">◎</div>
                <h3>Suivi visuel</h3>
                <p>Dashboard intuitif avec progression par phase pour rester motivé et organisé.</p>
              </div>
              <div className="glass-card">
                <div className="glass-card-icon">✧</div>
                <h3>Conseils ciblés</h3>
                <p>Recommandations personnalisées pour chaque étape de votre rédaction.</p>
              </div>
            </div>
          </section>

          <section className="stats-row">
            <div className="stat-glass">
              <div className="stat-num"><AnimNum value={6} dur={900} /></div>
              <div className="stat-label">Phases structurées</div>
            </div>
            <div className="stat-glass">
              <div className="stat-num"><AnimNum value={25} dur={1100} /></div>
              <div className="stat-label">Tâches guidées</div>
            </div>
            <div className="stat-glass">
              <div className="stat-num"><AnimNum value={6} dur={900} /></div>
              <div className="stat-label">Domaines couverts</div>
            </div>
          </section>

          <footer className="footer">MémoireQuest · Open Source · Fait avec soin pour les étudiants</footer>
        </div>
      )}

      {/* ── ONBOARDING ── */}
      {page === "onboard" && (
        <div className="onboard">
          <div className="onboard-step">
            <div className="step-num">Étape 01</div>
            <h2 className="step-title">Votre domaine</h2>
            <p className="step-desc">Pour adapter les conseils à votre cursus.</p>
            <div className="domain-grid">
              {DOMAINS.map((d) => (
                <div key={d.id} className={`domain-card ${domain === d.id ? "active" : ""}`} onClick={() => setDomain(d.id)}>
                  <div className="domain-icon">{d.icon}</div>
                  <div className="domain-info">
                    <h4>{d.label}</h4>
                    <span>{d.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {domain && (
            <div className="onboard-step" style={{ marginTop: 40, animationDelay: "0.08s" }}>
              <div className="step-num">Étape 02</div>
              <h2 className="step-title">Votre sujet</h2>
              <p className="step-desc">Cahier des charges, brief ou consignes.</p>
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" style={{ display: "none" }}
                onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <div className={`upload-area ${file ? "filled" : ""}`} onClick={() => fileRef.current?.click()}>
                {file ? (
                  <>
                    <div className="upload-icon-wrap">✓</div>
                    <div className="upload-fname">{file.name}</div>
                    <div className="upload-hint" style={{ marginTop: 6 }}>Cliquez pour changer</div>
                  </>
                ) : (
                  <>
                    <div className="upload-icon-wrap">↑</div>
                    <div className="upload-label">Glissez ou cliquez pour uploader</div>
                    <div className="upload-hint">PDF, DOC, DOCX ou TXT · 10 Mo max</div>
                  </>
                )}
              </div>
              <div className="step-actions">
                <button className="btn-secondary" onClick={() => setDomain(null)}>Retour</button>
                <button className="btn-blue" style={{ opacity: file ? 1 : 0.4, pointerEvents: file ? "auto" : "none" }}
                  onClick={startAnalysis}>
                  Analyser →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ANALYZING ── */}
      {analyzing && (
        <div className="analyze-overlay">
          <div className="analyze-glass">
            <div className="spinner-ring" />
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Analyse en cours</div>
            <div style={{ fontSize: 13, color: c.textSecondary }}>Structuration de votre plan personnalisé…</div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
            <div style={{ fontSize: 12, color: c.textTertiary, marginTop: 8, fontFamily: "'JetBrains Mono', monospace" }}>
              {Math.min(Math.round(progress), 100)}%
            </div>
          </div>
        </div>
      )}

      {/* ── DASHBOARD ── */}
      {page === "dashboard" && (
        <div className="dash">
          <aside className="side">
            <div className="progress-ring-wrap">
              <div className="ring-container">
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle className="ring-bg" cx="40" cy="40" r="35" />
                  <circle className="ring-fill" cx="40" cy="40" r="35"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset} />
                </svg>
                <div className="ring-pct">{overallPct}%</div>
              </div>
              <span className="ring-label">Progression globale</span>
            </div>

            <div className="side-label">Phases</div>
            {PHASES.map((p) => {
              const pd = Array.from({ length: p.tasks }, (_, i) => completed[`${p.id}-${i}`]).filter(Boolean).length;
              return (
                <div key={p.id} className={`phase-item ${activePhase === p.id ? "active" : ""}`}
                  onClick={() => setActivePhase(p.id)}>
                  <span className="phase-emoji">{p.emoji}</span>
                  <span style={{ flex: 1 }}>{p.title}</span>
                  <span className="phase-count">{pd}/{p.tasks}</span>
                </div>
              );
            })}
          </aside>

          <main className="main">
            {phase && (
              <>
                <div className="phase-header" key={phase.id}>
                  <div className="phase-badge">{phase.emoji} Phase {phase.id}</div>
                  <h2 className="phase-title">{phase.title}</h2>
                  <p className="phase-desc">{phase.desc}</p>
                </div>

                <div className="tasks">
                  {phaseTasks[phase.id]?.map((task, idx) => {
                    const k = `${phase.id}-${idx}`;
                    const isDone = !!completed[k];
                    return (
                      <div key={k}>
                        <div className={`task ${isDone ? "done" : ""}`} style={{ animationDelay: `${idx * 0.05}s` }}>
                          <div className={`check ${isDone ? "on" : ""}`} onClick={() => toggle(phase.id, idx)}>
                            {isDone && "✓"}
                          </div>
                          <div className="task-body">
                            <div className="task-name">{task.title}</div>
                            <div className="task-desc">{task.desc}</div>
                          </div>
                          <button className="tip-btn"
                            onClick={() => setShowTip(showTip === k ? null : k)}>
                            {showTip === k ? "Masquer" : "Conseil IA"}
                          </button>
                        </div>
                        {showTip === k && tips[k] && (
                          <div className="tip-glass" dangerouslySetInnerHTML={{
                            __html: `💡 ${tips[k].replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}`
                          }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
