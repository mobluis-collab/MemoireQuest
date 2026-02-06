import { useState, useEffect, useRef } from "react";

const DOMAINS = [
  { id: "info", label: "Informatique", icon: "⌘", desc: "Dev, IA, Réseaux, Cybersécurité" },
  { id: "marketing", label: "Marketing", icon: "◈", desc: "Digital, Stratégie, Communication" },
  { id: "rh", label: "Ressources Humaines", icon: "◉", desc: "Management, Formation, GPEC" },
  { id: "finance", label: "Finance", icon: "◆", desc: "Audit, Contrôle, Marchés" },
  { id: "droit", label: "Droit", icon: "§", desc: "Juridique, Compliance, Contrats" },
  { id: "other", label: "Autre domaine", icon: "✦", desc: "Tout autre champ d'études" },
];

const PHASES = [
  { id: 1, title: "Cadrage", desc: "Définir la problématique et les objectifs", tasks: 4, color: "#6366f1" },
  { id: 2, title: "Recherche", desc: "Revue de littérature et état de l'art", tasks: 5, color: "#8b5cf6" },
  { id: 3, title: "Méthodologie", desc: "Choix et justification de l'approche", tasks: 3, color: "#a78bfa" },
  { id: 4, title: "Terrain", desc: "Collecte et analyse des données", tasks: 4, color: "#c4b5fd" },
  { id: 5, title: "Rédaction", desc: "Structure et écriture du mémoire", tasks: 6, color: "#7c3aed" },
  { id: 6, title: "Finalisation", desc: "Relecture, soutenance, livrables", tasks: 3, color: "#5b21b6" },
];

// ─── Theme Context ───
const themes = {
  dark: {
    bg: "#09090b",
    bgSub: "#0f0f12",
    bgCard: "rgba(255,255,255,0.03)",
    bgCardHover: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.06)",
    borderHover: "rgba(255,255,255,0.12)",
    text: "#fafafa",
    textSub: "rgba(255,255,255,0.5)",
    textMuted: "rgba(255,255,255,0.3)",
    accent: "#7c3aed",
    accentSoft: "rgba(124,58,237,0.12)",
    accentGlow: "rgba(124,58,237,0.3)",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #818cf8 100%)",
    glassBg: "rgba(15,15,18,0.8)",
  },
  light: {
    bg: "#fafafa",
    bgSub: "#f4f4f5",
    bgCard: "rgba(0,0,0,0.02)",
    bgCardHover: "rgba(0,0,0,0.04)",
    border: "rgba(0,0,0,0.06)",
    borderHover: "rgba(0,0,0,0.12)",
    text: "#09090b",
    textSub: "rgba(0,0,0,0.5)",
    textMuted: "rgba(0,0,0,0.25)",
    accent: "#7c3aed",
    accentSoft: "rgba(124,58,237,0.08)",
    accentGlow: "rgba(124,58,237,0.15)",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #818cf8 100%)",
    glassBg: "rgba(250,250,250,0.8)",
  },
};

// ─── Animated Number ───
function AnimNum({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setDisplay(Math.floor(p * value));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, duration]);
  return display;
}

// ─── Main App ───
export default function MemoireQuest() {
  const [theme, setTheme] = useState("dark");
  const [page, setPage] = useState("landing"); // landing | onboard | dashboard
  const [domain, setDomain] = useState(null);
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activePhase, setActivePhase] = useState(1);
  const [completedTasks, setCompletedTasks] = useState({});
  const [showTip, setShowTip] = useState(null);
  const [mounted, setMounted] = useState(false);
  const fileRef = useRef();

  const t = themes[theme];
  const isDark = theme === "dark";

  useEffect(() => { setMounted(true); }, []);

  // Simulate analysis
  const startAnalysis = () => {
    if (!file || !domain) return;
    setAnalyzing(true);
    setProgress(0);
    const iv = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(iv); setTimeout(() => { setAnalyzing(false); setPage("dashboard"); }, 400); return 100; }
        return p + Math.random() * 8 + 2;
      });
    }, 150);
  };

  const toggleTask = (phaseId, taskIdx) => {
    const key = `${phaseId}-${taskIdx}`;
    setCompletedTasks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const totalTasks = PHASES.reduce((s, p) => s + p.tasks, 0);
  const doneCount = Object.values(completedTasks).filter(Boolean).length;
  const overallProgress = Math.round((doneCount / totalTasks) * 100);

  const phase = PHASES.find((p) => p.id === activePhase);

  // ─── Styles ───
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&family=JetBrains+Mono:wght@400;500&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    :root {
      --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
      --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
    }

    body, html { font-family: 'DM Sans', sans-serif; }

    .mq-root {
      min-height: 100vh;
      background: ${t.bg};
      color: ${t.text};
      transition: background 0.5s var(--ease-out-expo), color 0.4s;
      overflow-x: hidden;
      position: relative;
    }

    /* Subtle grid background */
    .mq-root::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image: 
        linear-gradient(${isDark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.015)'} 1px, transparent 1px),
        linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.015)'} 1px, transparent 1px);
      background-size: 64px 64px;
      pointer-events: none;
      z-index: 0;
    }

    /* Ambient glow */
    .ambient-glow {
      position: fixed;
      width: 600px;
      height: 600px;
      border-radius: 50%;
      background: ${t.accentGlow};
      filter: blur(180px);
      opacity: 0.4;
      pointer-events: none;
      z-index: 0;
      top: -200px;
      right: -200px;
      transition: opacity 0.5s;
    }

    .ambient-glow-2 {
      position: fixed;
      width: 400px;
      height: 400px;
      border-radius: 50%;
      background: rgba(99, 102, 241, 0.15);
      filter: blur(150px);
      opacity: 0.3;
      pointer-events: none;
      z-index: 0;
      bottom: -100px;
      left: -100px;
    }

    /* ─── NAV ─── */
    .nav {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 100;
      padding: 16px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: ${t.glassBg};
      backdrop-filter: blur(20px) saturate(1.2);
      border-bottom: 1px solid ${t.border};
      transition: all 0.4s var(--ease-out-expo);
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
      font-size: 15px;
      letter-spacing: -0.02em;
      cursor: pointer;
    }

    .nav-logo {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: ${t.gradient};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: white;
      font-weight: 700;
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .theme-toggle {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: 1px solid ${t.border};
      background: ${t.bgCard};
      color: ${t.textSub};
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      transition: all 0.3s;
    }
    .theme-toggle:hover {
      border-color: ${t.borderHover};
      background: ${t.bgCardHover};
      color: ${t.text};
    }

    .btn-primary {
      padding: 8px 20px;
      border-radius: 10px;
      border: none;
      background: ${t.gradient};
      color: white;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      letter-spacing: -0.01em;
      transition: all 0.3s var(--ease-out-expo);
      position: relative;
      overflow: hidden;
    }
    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 32px ${t.accentGlow};
    }
    .btn-primary:active { transform: translateY(0); }

    .btn-ghost {
      padding: 8px 16px;
      border-radius: 10px;
      border: 1px solid ${t.border};
      background: transparent;
      color: ${t.textSub};
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s;
    }
    .btn-ghost:hover {
      border-color: ${t.borderHover};
      color: ${t.text};
      background: ${t.bgCard};
    }

    /* ─── LANDING ─── */
    .landing {
      position: relative;
      z-index: 1;
      padding-top: 120px;
    }

    .hero {
      max-width: 720px;
      margin: 0 auto;
      text-align: center;
      padding: 60px 24px 40px;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 100px;
      border: 1px solid ${t.border};
      background: ${t.bgCard};
      font-size: 12px;
      color: ${t.textSub};
      font-weight: 500;
      margin-bottom: 32px;
      letter-spacing: 0.02em;
      animation: fadeUp 0.8s var(--ease-out-expo) both;
    }
    .hero-badge span {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #22c55e;
      animation: pulse-dot 2s infinite;
    }

    @keyframes pulse-dot {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    .hero h1 {
      font-size: clamp(40px, 6vw, 64px);
      font-weight: 700;
      letter-spacing: -0.04em;
      line-height: 1.05;
      margin-bottom: 20px;
      animation: fadeUp 0.8s var(--ease-out-expo) 0.1s both;
    }

    .hero h1 em {
      font-style: normal;
      background: ${t.gradient};
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero p {
      font-size: 17px;
      line-height: 1.6;
      color: ${t.textSub};
      max-width: 480px;
      margin: 0 auto 40px;
      animation: fadeUp 0.8s var(--ease-out-expo) 0.2s both;
    }

    .hero-cta {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      animation: fadeUp 0.8s var(--ease-out-expo) 0.3s both;
    }
    .hero-cta .btn-primary {
      padding: 12px 28px;
      font-size: 14px;
      border-radius: 12px;
    }
    .hero-cta .btn-ghost {
      padding: 12px 24px;
      font-size: 14px;
      border-radius: 12px;
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Features */
    .features {
      max-width: 960px;
      margin: 80px auto;
      padding: 0 24px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1px;
      background: ${t.border};
      border-radius: 20px;
      overflow: hidden;
      border: 1px solid ${t.border};
      animation: fadeUp 0.8s var(--ease-out-expo) 0.4s both;
    }

    .feature-card {
      padding: 36px 28px;
      background: ${t.bgSub};
      transition: background 0.3s;
    }
    .feature-card:hover {
      background: ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)'};
    }

    .feature-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: ${t.accentSoft};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      margin-bottom: 16px;
    }

    .feature-card h3 {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 8px;
      letter-spacing: -0.02em;
    }

    .feature-card p {
      font-size: 13px;
      line-height: 1.5;
      color: ${t.textSub};
    }

    /* Stats */
    .stats {
      max-width: 960px;
      margin: 0 auto 80px;
      padding: 0 24px;
      display: flex;
      justify-content: center;
      gap: 80px;
      animation: fadeUp 0.8s var(--ease-out-expo) 0.5s both;
    }

    .stat {
      text-align: center;
    }
    .stat-num {
      font-size: 36px;
      font-weight: 700;
      letter-spacing: -0.04em;
      font-family: 'JetBrains Mono', monospace;
      background: ${t.gradient};
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .stat-label {
      font-size: 13px;
      color: ${t.textMuted};
      margin-top: 4px;
    }

    /* Footer */
    .footer {
      text-align: center;
      padding: 40px 24px;
      border-top: 1px solid ${t.border};
      font-size: 12px;
      color: ${t.textMuted};
    }

    /* ─── ONBOARDING ─── */
    .onboard {
      position: relative;
      z-index: 1;
      padding-top: 100px;
      max-width: 640px;
      margin: 0 auto;
      padding-left: 24px;
      padding-right: 24px;
    }

    .onboard-step {
      padding: 40px 0;
      animation: fadeUp 0.6s var(--ease-out-expo) both;
    }

    .step-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: ${t.accent};
      margin-bottom: 8px;
      font-family: 'JetBrains Mono', monospace;
    }

    .step-title {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.03em;
      margin-bottom: 8px;
    }

    .step-desc {
      font-size: 15px;
      color: ${t.textSub};
      margin-bottom: 32px;
    }

    /* Domain Grid */
    .domain-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    .domain-card {
      padding: 20px;
      border-radius: 14px;
      border: 1px solid ${t.border};
      background: ${t.bgCard};
      cursor: pointer;
      transition: all 0.3s var(--ease-out-expo);
      display: flex;
      align-items: flex-start;
      gap: 14px;
    }
    .domain-card:hover {
      border-color: ${t.borderHover};
      background: ${t.bgCardHover};
      transform: translateY(-2px);
    }
    .domain-card.selected {
      border-color: ${t.accent};
      background: ${t.accentSoft};
      box-shadow: 0 0 0 1px ${t.accent};
    }

    .domain-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: ${t.accentSoft};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
    }

    .domain-label {
      font-size: 14px;
      font-weight: 600;
      letter-spacing: -0.01em;
    }
    .domain-desc {
      font-size: 12px;
      color: ${t.textSub};
      margin-top: 2px;
    }

    /* Upload */
    .upload-zone {
      border: 1.5px dashed ${t.border};
      border-radius: 16px;
      padding: 48px 24px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s var(--ease-out-expo);
      background: ${t.bgCard};
    }
    .upload-zone:hover {
      border-color: ${t.accent};
      background: ${t.accentSoft};
    }
    .upload-zone.has-file {
      border-color: ${t.accent};
      border-style: solid;
      background: ${t.accentSoft};
    }

    .upload-icon {
      font-size: 32px;
      margin-bottom: 12px;
      opacity: 0.5;
    }
    .upload-text {
      font-size: 14px;
      color: ${t.textSub};
      margin-bottom: 4px;
    }
    .upload-hint {
      font-size: 12px;
      color: ${t.textMuted};
    }
    .upload-file-name {
      font-size: 14px;
      font-weight: 600;
      color: ${t.accent};
    }

    .onboard-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 40px;
    }

    /* Analyzing */
    .analyzing-overlay {
      position: fixed;
      inset: 0;
      z-index: 200;
      background: ${t.glassBg};
      backdrop-filter: blur(40px);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.4s var(--ease-out-expo);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .analyzing-card {
      text-align: center;
      max-width: 360px;
    }

    .analyzing-spinner {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 2px solid ${t.border};
      border-top-color: ${t.accent};
      animation: spin 0.8s linear infinite;
      margin: 0 auto 24px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .progress-bar-bg {
      width: 240px;
      height: 3px;
      border-radius: 4px;
      background: ${t.border};
      margin: 16px auto 0;
      overflow: hidden;
    }
    .progress-bar-fill {
      height: 100%;
      border-radius: 4px;
      background: ${t.gradient};
      transition: width 0.15s linear;
    }

    /* ─── DASHBOARD ─── */
    .dashboard {
      position: relative;
      z-index: 1;
      padding-top: 80px;
      display: grid;
      grid-template-columns: 260px 1fr;
      min-height: 100vh;
    }

    /* Sidebar */
    .sidebar {
      border-right: 1px solid ${t.border};
      padding: 32px 20px;
      position: sticky;
      top: 64px;
      height: calc(100vh - 64px);
      overflow-y: auto;
    }

    .sidebar-section {
      margin-bottom: 28px;
    }

    .sidebar-label {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: ${t.textMuted};
      margin-bottom: 12px;
      padding: 0 8px;
      font-family: 'JetBrains Mono', monospace;
    }

    .overall-progress {
      padding: 16px;
      border-radius: 12px;
      background: ${t.bgCard};
      border: 1px solid ${t.border};
      margin-bottom: 24px;
    }

    .overall-progress-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 10px;
    }
    .overall-progress-label {
      font-size: 12px;
      font-weight: 600;
    }
    .overall-progress-pct {
      font-size: 20px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      letter-spacing: -0.03em;
      background: ${t.gradient};
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .overall-bar-bg {
      width: 100%;
      height: 4px;
      border-radius: 4px;
      background: ${t.border};
      overflow: hidden;
    }
    .overall-bar-fill {
      height: 100%;
      border-radius: 4px;
      background: ${t.gradient};
      transition: width 0.5s var(--ease-out-expo);
    }

    .phase-nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 2px;
      font-size: 13px;
      font-weight: 500;
      color: ${t.textSub};
    }
    .phase-nav-item:hover {
      background: ${t.bgCardHover};
      color: ${t.text};
    }
    .phase-nav-item.active {
      background: ${t.accentSoft};
      color: ${t.text};
    }

    .phase-nav-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
      transition: all 0.3s;
    }

    .phase-nav-num {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: ${t.textMuted};
      min-width: 20px;
    }

    /* Main Content */
    .main-content {
      padding: 32px 40px 80px;
      max-width: 720px;
    }

    .phase-header {
      margin-bottom: 32px;
      animation: fadeUp 0.5s var(--ease-out-expo) both;
    }

    .phase-tag {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-family: 'JetBrains Mono', monospace;
      margin-bottom: 8px;
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      background: ${t.accentSoft};
      color: ${t.accent};
    }

    .phase-title {
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.03em;
      margin-bottom: 6px;
    }

    .phase-desc {
      font-size: 14px;
      color: ${t.textSub};
    }

    /* Task Cards */
    .task-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .task-card {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 18px 20px;
      border-radius: 14px;
      border: 1px solid ${t.border};
      background: ${t.bgCard};
      transition: all 0.3s var(--ease-out-expo);
      cursor: pointer;
      animation: fadeUp 0.5s var(--ease-out-expo) both;
    }
    .task-card:hover {
      border-color: ${t.borderHover};
      background: ${t.bgCardHover};
      transform: translateX(4px);
    }
    .task-card.done {
      opacity: 0.5;
    }

    .task-check {
      width: 20px;
      height: 20px;
      border-radius: 6px;
      border: 1.5px solid ${t.border};
      flex-shrink: 0;
      margin-top: 1px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      transition: all 0.3s;
    }
    .task-check.checked {
      background: ${t.gradient};
      border-color: transparent;
      color: white;
    }

    .task-info {
      flex: 1;
    }
    .task-title {
      font-size: 14px;
      font-weight: 600;
      letter-spacing: -0.01em;
      margin-bottom: 4px;
    }
    .task-desc {
      font-size: 12.5px;
      color: ${t.textSub};
      line-height: 1.5;
    }

    .task-tip-btn {
      padding: 4px 10px;
      border-radius: 8px;
      border: 1px solid ${t.border};
      background: transparent;
      color: ${t.textMuted};
      font-size: 11px;
      font-family: 'DM Sans', sans-serif;
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .task-tip-btn:hover {
      border-color: ${t.accent};
      color: ${t.accent};
      background: ${t.accentSoft};
    }

    /* Tip Panel */
    .tip-panel {
      margin-top: 12px;
      padding: 16px 20px;
      border-radius: 12px;
      background: ${t.accentSoft};
      border: 1px solid ${isDark ? 'rgba(124,58,237,0.2)' : 'rgba(124,58,237,0.15)'};
      font-size: 13px;
      line-height: 1.6;
      color: ${t.textSub};
      animation: fadeUp 0.4s var(--ease-out-expo) both;
    }
    .tip-panel strong {
      color: ${t.accent};
      font-weight: 600;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .features { grid-template-columns: 1fr; }
      .stats { flex-direction: column; gap: 24px; }
      .dashboard { grid-template-columns: 1fr; }
      .sidebar { display: none; }
      .domain-grid { grid-template-columns: 1fr; }
    }
  `;

  // ─── Task Definitions ───
  const phaseTasks = {
    1: [
      { title: "Analyser le sujet", desc: "Décortiquer le cahier des charges et identifier les mots-clés essentiels du sujet." },
      { title: "Formuler la problématique", desc: "Transformer le sujet en une question de recherche précise et pertinente." },
      { title: "Définir les objectifs", desc: "Lister les objectifs principaux et secondaires de votre mémoire." },
      { title: "Poser les hypothèses", desc: "Formuler 2-3 hypothèses de travail vérifiables." },
    ],
    2: [
      { title: "Identifier les sources clés", desc: "Constituer une bibliographie de 15-20 sources académiques de référence." },
      { title: "Cartographier les concepts", desc: "Créer une mind-map des concepts théoriques liés à votre sujet." },
      { title: "Analyser l'état de l'art", desc: "Synthétiser les travaux existants et identifier les lacunes." },
      { title: "Cadre théorique", desc: "Choisir et justifier les théories qui structureront votre analyse." },
      { title: "Revue critique", desc: "Rédiger une analyse critique de la littérature existante." },
    ],
    3: [
      { title: "Choisir l'approche", desc: "Qualitative, quantitative ou mixte — justifier votre choix méthodologique." },
      { title: "Définir l'échantillon", desc: "Préciser la population étudiée et les critères de sélection." },
      { title: "Concevoir les outils", desc: "Créer les questionnaires, guides d'entretien ou grilles d'analyse." },
    ],
    4: [
      { title: "Collecter les données", desc: "Mener les entretiens, enquêtes ou observations selon le protocole défini." },
      { title: "Organiser les données", desc: "Trier, coder et structurer les données collectées." },
      { title: "Analyser les résultats", desc: "Appliquer la méthode d'analyse choisie et interpréter les résultats." },
      { title: "Confronter aux hypothèses", desc: "Vérifier si les résultats confirment ou infirment vos hypothèses." },
    ],
    5: [
      { title: "Construire le plan détaillé", desc: "Structurer les parties, chapitres et sous-parties avec transitions." },
      { title: "Rédiger l'introduction", desc: "Contexte, problématique, annonce du plan — une introduction percutante." },
      { title: "Rédiger le corps", desc: "Développer chaque partie en respectant la logique argumentaire." },
      { title: "Rédiger la conclusion", desc: "Synthèse, réponse à la problématique, ouverture." },
      { title: "Soigner les transitions", desc: "Assurer la fluidité entre chaque partie du mémoire." },
      { title: "Bibliographie aux normes", desc: "Formater toutes les références selon les normes académiques requises." },
    ],
    6: [
      { title: "Relecture complète", desc: "Vérifier l'orthographe, la grammaire, la syntaxe et la cohérence." },
      { title: "Mise en page finale", desc: "Appliquer le template requis : marges, polices, pagination, sommaire." },
      { title: "Préparer la soutenance", desc: "Créer le support de présentation et préparer les réponses au jury." },
    ],
  };

  const tips = {
    "1-0": "Commencez par surligner les **verbes d'action** dans votre sujet. Ils définissent ce qu'on attend de vous : analyser, comparer, évaluer…",
    "1-1": "Une bonne problématique commence souvent par **\"En quoi...\"** ou **\"Dans quelle mesure...\"** — elle doit créer un espace de débat.",
    "1-2": "Utilisez la méthode **SMART** : Spécifique, Mesurable, Atteignable, Réaliste, Temporel.",
    "1-3": "Chaque hypothèse doit être **testable**. Formulez-les avec \"Si... alors...\" pour vérifier leur cohérence.",
    "2-0": "Privilégiez **Google Scholar** et **CAIRN** pour les sources francophones. Visez un mix : articles, ouvrages, thèses.",
    "2-1": "Utilisez un outil comme **Miro** ou une simple feuille A3 pour visualiser les connexions entre concepts.",
    "2-2": "L'état de l'art n'est pas un résumé. C'est une **conversation entre auteurs** que vous orchestrez.",
    "2-3": "Le cadre théorique est votre **paire de lunettes**. Il détermine comment vous allez regarder votre objet d'étude.",
    "2-4": "Structurez votre revue en **entonnoir** : du plus général au plus spécifique, en terminant par le gap que votre mémoire comble.",
    "3-0": "Le choix dépend de votre question : **explorer** → qualitatif, **mesurer** → quantitatif, **les deux** → mixte.",
    "3-1": "Justifiez la **taille** et les **critères** de votre échantillon. Un petit échantillon bien choisi > un grand échantillon aléatoire.",
    "3-2": "Testez vos outils sur **2-3 personnes** avant le terrain réel. Vous repérerez les questions ambiguës.",
    "4-0": "Gardez un **journal de bord** pendant la collecte. Ces notes seront précieuses pour justifier vos choix dans le mémoire.",
    "4-1": "Utilisez un **code couleur** ou un logiciel comme NVivo pour les données qualitatives.",
    "4-2": "Présentez d'abord les résultats **bruts**, puis votre interprétation. Séparez les faits de l'analyse.",
    "4-3": "Une hypothèse infirmée est tout aussi intéressante qu'une hypothèse confirmée. **Expliquez pourquoi.**",
    "5-0": "Votre plan doit raconter une **histoire logique**. Chaque partie doit découler naturellement de la précédente.",
    "5-1": "L'intro se rédige **en dernier**, quand vous maîtrisez l'ensemble. Elle doit donner envie de lire la suite.",
    "5-2": "Une astuce : commencez par la partie où vous êtes le plus **à l'aise**. L'élan créé facilitera le reste.",
    "5-3": "La conclusion ne doit **jamais** introduire de nouvelles idées. C'est une synthèse, pas un nouveau chapitre.",
    "5-4": "Chaque transition doit faire le **bilan** de ce qui précède et **annoncer** ce qui suit.",
    "5-5": "Choisissez entre **APA, Chicago ou Harvard** selon votre école et restez cohérent du début à la fin.",
    "6-0": "Lisez votre mémoire **à voix haute**. Votre oreille repérera ce que vos yeux ont raté.",
    "6-1": "Vérifiez que votre **sommaire automatique** est bien à jour et que la pagination est correcte.",
    "6-2": "Préparez des réponses aux **3 questions les plus difficiles** que le jury pourrait poser.",
  };

  // ─── RENDER ───
  return (
    <div className="mq-root">
      <style>{css}</style>
      <div className="ambient-glow" />
      <div className="ambient-glow-2" />

      {/* Nav */}
      <nav className="nav">
        <div className="nav-brand" onClick={() => { setPage("landing"); setDomain(null); setFile(null); }}>
          <div className="nav-logo">M</div>
          MémoireQuest
        </div>
        <div className="nav-actions">
          {page === "dashboard" && (
            <span style={{ fontSize: 12, color: t.textMuted, marginRight: 8, fontFamily: "'JetBrains Mono', monospace" }}>
              {domain && DOMAINS.find(d => d.id === domain)?.label}
            </span>
          )}
          <button className="theme-toggle" onClick={() => setTheme(isDark ? "light" : "dark")}>
            {isDark ? "☀" : "☾"}
          </button>
          {page === "landing" && (
            <button className="btn-primary" onClick={() => setPage("onboard")}>
              Commencer
            </button>
          )}
        </div>
      </nav>

      {/* ─── LANDING ─── */}
      {page === "landing" && mounted && (
        <div className="landing">
          <section className="hero">
            <div className="hero-badge">
              <span />&nbsp;Open Source · Gratuit
            </div>
            <h1>
              Structurez votre mémoire,<br />
              <em>étape par étape.</em>
            </h1>
            <p>
              L'assistant IA qui analyse votre sujet et vous guide avec un plan d'action détaillé, des conseils personnalisés et un suivi de progression.
            </p>
            <div className="hero-cta">
              <button className="btn-primary" onClick={() => setPage("onboard")}>
                Démarrer gratuitement →
              </button>
              <button className="btn-ghost" onClick={() => window.open("#", "_blank")}>
                GitHub ↗
              </button>
            </div>
          </section>

          <section className="features">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Analyse IA</h3>
              <p>Uploadez votre cahier des charges. L'IA décompose votre sujet et génère un plan structuré.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">◎</div>
              <h3>Suivi visuel</h3>
              <p>Suivez votre avancement phase par phase avec un dashboard intuitif et motivant.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✧</div>
              <h3>Conseils ciblés</h3>
              <p>Des recommandations IA personnalisées pour chaque étape de votre rédaction.</p>
            </div>
          </section>

          <section className="stats">
            <div className="stat">
              <div className="stat-num"><AnimNum value={6} duration={800} /></div>
              <div className="stat-label">Phases structurées</div>
            </div>
            <div className="stat">
              <div className="stat-num"><AnimNum value={25} duration={1000} /></div>
              <div className="stat-label">Tâches guidées</div>
            </div>
            <div className="stat">
              <div className="stat-num"><AnimNum value={6} duration={800} /></div>
              <div className="stat-label">Domaines couverts</div>
            </div>
          </section>

          <footer className="footer">
            MémoireQuest · Open Source · Fait avec ♥ pour les étudiants
          </footer>
        </div>
      )}

      {/* ─── ONBOARDING ─── */}
      {page === "onboard" && (
        <div className="onboard">
          {/* Step 1: Domain */}
          <div className="onboard-step">
            <div className="step-label">Étape 01</div>
            <h2 className="step-title">Quel est votre domaine ?</h2>
            <p className="step-desc">Cela nous permet d'adapter les conseils à votre cursus.</p>
            <div className="domain-grid">
              {DOMAINS.map((d) => (
                <div
                  key={d.id}
                  className={`domain-card ${domain === d.id ? "selected" : ""}`}
                  onClick={() => setDomain(d.id)}
                >
                  <div className="domain-icon">{d.icon}</div>
                  <div>
                    <div className="domain-label">{d.label}</div>
                    <div className="domain-desc">{d.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Upload */}
          {domain && (
            <div className="onboard-step" style={{ animationDelay: "0.1s" }}>
              <div className="step-label">Étape 02</div>
              <h2 className="step-title">Uploadez votre sujet</h2>
              <p className="step-desc">Cahier des charges, brief ou consignes — l'IA fera le reste.</p>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                style={{ display: "none" }}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <div
                className={`upload-zone ${file ? "has-file" : ""}`}
                onClick={() => fileRef.current?.click()}
              >
                {file ? (
                  <>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
                    <div className="upload-file-name">{file.name}</div>
                    <div className="upload-hint" style={{ marginTop: 8 }}>Cliquez pour changer de fichier</div>
                  </>
                ) : (
                  <>
                    <div className="upload-icon">↑</div>
                    <div className="upload-text">Glissez votre fichier ici ou cliquez</div>
                    <div className="upload-hint">PDF, DOC, DOCX ou TXT · 10 Mo max</div>
                  </>
                )}
              </div>

              <div className="onboard-actions">
                <button className="btn-ghost" onClick={() => setDomain(null)}>
                  Retour
                </button>
                <button
                  className="btn-primary"
                  style={{ opacity: file ? 1 : 0.4, pointerEvents: file ? "auto" : "none" }}
                  onClick={startAnalysis}
                >
                  Analyser mon sujet →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── ANALYZING ─── */}
      {analyzing && (
        <div className="analyzing-overlay">
          <div className="analyzing-card">
            <div className="analyzing-spinner" />
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Analyse en cours…</div>
            <div style={{ fontSize: 13, color: t.textSub }}>L'IA structure votre plan personnalisé</div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
            <div style={{ fontSize: 12, color: t.textMuted, marginTop: 8, fontFamily: "'JetBrains Mono', monospace" }}>
              {Math.min(Math.round(progress), 100)}%
            </div>
          </div>
        </div>
      )}

      {/* ─── DASHBOARD ─── */}
      {page === "dashboard" && (
        <div className="dashboard">
          <aside className="sidebar">
            <div className="overall-progress">
              <div className="overall-progress-header">
                <span className="overall-progress-label">Progression</span>
                <span className="overall-progress-pct">{overallProgress}%</span>
              </div>
              <div className="overall-bar-bg">
                <div className="overall-bar-fill" style={{ width: `${overallProgress}%` }} />
              </div>
            </div>

            <div className="sidebar-section">
              <div className="sidebar-label">Phases</div>
              {PHASES.map((p) => {
                const pDone = Array.from({ length: p.tasks }, (_, i) => completedTasks[`${p.id}-${i}`]).filter(Boolean).length;
                return (
                  <div
                    key={p.id}
                    className={`phase-nav-item ${activePhase === p.id ? "active" : ""}`}
                    onClick={() => setActivePhase(p.id)}
                  >
                    <div className="phase-nav-dot" style={{ background: p.color }} />
                    <span style={{ flex: 1 }}>{p.title}</span>
                    <span className="phase-nav-num">{pDone}/{p.tasks}</span>
                  </div>
                );
              })}
            </div>
          </aside>

          <main className="main-content">
            {phase && (
              <>
                <div className="phase-header" key={phase.id}>
                  <div className="phase-tag">Phase {phase.id}</div>
                  <h2 className="phase-title">{phase.title}</h2>
                  <p className="phase-desc">{phase.desc}</p>
                </div>

                <div className="task-list">
                  {phaseTasks[phase.id]?.map((task, idx) => {
                    const key = `${phase.id}-${idx}`;
                    const isDone = !!completedTasks[key];
                    const tipKey = `${phase.id}-${idx}`;
                    return (
                      <div key={key}>
                        <div
                          className={`task-card ${isDone ? "done" : ""}`}
                          style={{ animationDelay: `${idx * 0.06}s` }}
                        >
                          <div
                            className={`task-check ${isDone ? "checked" : ""}`}
                            onClick={() => toggleTask(phase.id, idx)}
                          >
                            {isDone && "✓"}
                          </div>
                          <div className="task-info">
                            <div className="task-title">{task.title}</div>
                            <div className="task-desc">{task.desc}</div>
                          </div>
                          <button
                            className="task-tip-btn"
                            onClick={() => setShowTip(showTip === tipKey ? null : tipKey)}
                          >
                            {showTip === tipKey ? "Masquer" : "Conseil IA"}
                          </button>
                        </div>
                        {showTip === tipKey && tips[tipKey] && (
                          <div className="tip-panel" dangerouslySetInnerHTML={{
                            __html: `💡 ${tips[tipKey].replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}`
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
