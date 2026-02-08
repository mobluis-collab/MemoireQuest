"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

// ─── FALLBACK QUESTS (used if AI fails) ───
const FALLBACK_QUESTS = [
  { id:1,phase:"Phase 1",title:"Cadrage",emoji:"🎯",desc:"Poser les fondations de votre mémoire",
    tasks:[
      {id:"1-1",title:"Analyser le sujet",steps:[{label:"Lire le cahier des charges en entier"},{label:"Surligner les verbes d'action"},{label:"Lister les mots-clés principaux"},{label:"Identifier le périmètre du sujet"}],tip:"Les verbes d'action définissent les attentes."},
      {id:"1-2",title:"Formuler la problématique",steps:[{label:"Transformer le sujet en 3 questions possibles"},{label:"Choisir la question la plus précise"},{label:"Vérifier qu'elle crée un espace de débat"}],tip:"Une bonne problématique commence par \"En quoi\" ou \"Dans quelle mesure\"."},
      {id:"1-3",title:"Définir les objectifs",steps:[{label:"Écrire l'objectif principal en une phrase"},{label:"Lister 2-3 objectifs secondaires"},{label:"Vérifier avec la méthode SMART"}],tip:"Vos objectifs sont votre boussole."},
      {id:"1-4",title:"Poser les hypothèses",steps:[{label:"Formuler 2-3 hypothèses avec \"Si… alors…\""},{label:"Vérifier que chaque hypothèse est testable"}],tip:"Une hypothèse infirmée est aussi intéressante qu'une confirmée."},
    ]},
  { id:2,phase:"Phase 2",title:"Recherche",emoji:"📚",desc:"Explorer et comprendre l'existant",
    tasks:[
      {id:"2-1",title:"Identifier les sources clés",steps:[{label:"Chercher 5 articles sur Google Scholar"},{label:"Chercher 5 sources sur CAIRN"},{label:"Trouver 3-5 ouvrages de référence"},{label:"Organiser dans un tableau"}],tip:"Visez un mix : articles récents + ouvrages fondateurs."},
      {id:"2-2",title:"Cartographier les concepts",steps:[{label:"Lister les concepts théoriques"},{label:"Créer une mind-map"},{label:"Identifier les 3-4 concepts centraux"}],tip:"Les connexions entre concepts = votre valeur ajoutée."},
      {id:"2-3",title:"Rédiger l'état de l'art",steps:[{label:"Regrouper les sources par thème"},{label:"Résumer les positions des auteurs"},{label:"Identifier consensus et débats"},{label:"Montrer le gap que votre mémoire comble"}],tip:"L'état de l'art = une conversation entre auteurs que VOUS orchestrez."},
      {id:"2-4",title:"Cadre théorique",steps:[{label:"Sélectionner 1-2 théories structurantes"},{label:"Expliquer leur pertinence"},{label:"Articuler avec la problématique"}],tip:"Le cadre théorique = vos lunettes pour regarder votre objet d'étude."},
    ]},
  { id:3,phase:"Phase 3",title:"Méthodologie",emoji:"🔬",desc:"Définir l'approche",
    tasks:[
      {id:"3-1",title:"Choisir l'approche",steps:[{label:"Qualitatif, quantitatif ou mixte ?"},{label:"Justifier par rapport à la problématique"},{label:"Rédiger la justification"}],tip:"Explorer → qualitatif · Mesurer → quantitatif."},
      {id:"3-2",title:"Définir l'échantillon",steps:[{label:"Décrire la population cible"},{label:"Fixer la taille et justifier"},{label:"Critères d'inclusion/exclusion"}],tip:"Un petit échantillon bien choisi > un grand aléatoire."},
      {id:"3-3",title:"Concevoir les outils",steps:[{label:"Créer questionnaire ou guide d'entretien"},{label:"Pré-tester sur 2-3 personnes"},{label:"Ajuster après le pré-test"}],tip:"Le pré-test révèle les questions ambiguës."},
    ]},
  { id:4,phase:"Phase 4",title:"Terrain",emoji:"📊",desc:"Collecter et analyser les données",
    tasks:[
      {id:"4-1",title:"Collecter les données",steps:[{label:"Planifier le calendrier"},{label:"Mener les entretiens/enquêtes"},{label:"Tenir un journal de bord"}],tip:"Le journal de bord sera précieux pour justifier vos choix."},
      {id:"4-2",title:"Organiser les données",steps:[{label:"Retranscrire ou compiler"},{label:"Coder les données"},{label:"Créer un tableau de synthèse"}],tip:"Code couleur pour le qualitatif, Excel pour le quantitatif."},
      {id:"4-3",title:"Analyser",steps:[{label:"Présenter les résultats bruts"},{label:"Interpréter chaque résultat"},{label:"Confronter aux hypothèses"}],tip:"Séparez toujours faits et interprétation."},
    ]},
  { id:5,phase:"Phase 5",title:"Rédaction",emoji:"✍️",desc:"Écrire le mémoire",
    tasks:[
      {id:"5-1",title:"Plan détaillé",steps:[{label:"Définir les grandes parties"},{label:"Détailler les chapitres"},{label:"Écrire les transitions"},{label:"Vérifier la logique d'ensemble"}],tip:"Votre plan doit raconter une histoire logique."},
      {id:"5-2",title:"Rédiger le corps",steps:[{label:"Commencer par la partie la plus facile"},{label:"Citer les sources au fur et à mesure"},{label:"Relire chaque chapitre"}],tip:"L'élan créé par votre point fort facilite le reste."},
      {id:"5-3",title:"Introduction",steps:[{label:"Écrire l'accroche"},{label:"Présenter le contexte"},{label:"Énoncer la problématique"},{label:"Annoncer le plan"}],tip:"Rédigez l'intro EN DERNIER."},
      {id:"5-4",title:"Conclusion",steps:[{label:"Synthétiser les apports"},{label:"Répondre à la problématique"},{label:"Proposer une ouverture"}],tip:"Jamais de nouvelles idées dans la conclusion."},
      {id:"5-5",title:"Bibliographie",steps:[{label:"Choisir le format (APA/Chicago/Harvard)"},{label:"Formater chaque référence"},{label:"Vérifier chaque citation"}],tip:"UN format, de la cohérence."},
    ]},
  { id:6,phase:"Phase 6",title:"Finalisation",emoji:"🎓",desc:"Dernière ligne droite",
    tasks:[
      {id:"6-1",title:"Relecture",steps:[{label:"Relire à voix haute"},{label:"Vérifier orthographe et grammaire"},{label:"Vérifier la cohérence"},{label:"Faire relire par quelqu'un"}],tip:"La lecture à voix haute est votre meilleur outil."},
      {id:"6-2",title:"Mise en page",steps:[{label:"Appliquer le template de l'école"},{label:"Générer le sommaire"},{label:"Vérifier la pagination"},{label:"Page de garde, remerciements, annexes"}],tip:"Sommaire auto APRÈS toutes les modifs."},
      {id:"6-3",title:"Soutenance",steps:[{label:"Créer 10-15 slides"},{label:"Préparer un pitch de 10-15 min"},{label:"Anticiper les 5 questions dures"},{label:"Répéter 2 fois minimum"}],tip:"Préparez les 3 questions les plus dures. Le reste sera facile."},
    ]},
];

const DOMAINS = [
  { id: "info", label: "Informatique", icon: "⌘", desc: "Dev, IA, Réseaux, Cybersécurité" },
  { id: "marketing", label: "Marketing", icon: "◈", desc: "Digital, Stratégie, Communication" },
  { id: "rh", label: "Ressources Humaines", icon: "◉", desc: "Management, Formation, GPEC" },
  { id: "finance", label: "Finance", icon: "◆", desc: "Audit, Contrôle, Marchés" },
  { id: "droit", label: "Droit", icon: "§", desc: "Juridique, Compliance, Contrats" },
  { id: "other", label: "Autre", icon: "✦", desc: "Tout autre champ d'études" },
];

function AnimNum({ value, dur = 1200 }) {
  const [d, setD] = useState(0);
  useEffect(() => {
    let s = 0;
    const fn = (ts) => {
      if (!s) s = ts;
      const p = Math.min((ts - s) / dur, 1);
      setD(Math.floor((1 - Math.pow(1 - p, 4)) * value));
      if (p < 1) requestAnimationFrame(fn);
    };
    requestAnimationFrame(fn);
  }, [value, dur]);
  return d;
}

export default function Maimoirkuest() {
  const [mode, setMode] = useState("dark");
  const [page, setPage] = useState("landing");
  const [domain, setDomain] = useState(null);
  const [file, setFile] = useState(null);
  const [textContent, setTextContent] = useState("");
  const [fileBase64, setFileBase64] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [useTextInput, setUseTextInput] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeStatus, setAnalyzeStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [quests, setQuests] = useState(FALLBACK_QUESTS);
  const [analysis, setAnalysis] = useState(null);
  const [requirementsSummary, setRequirementsSummary] = useState(null);
  const [showFullRequirements, setShowFullRequirements] = useState(false);
  const [activeQuest, setActiveQuest] = useState(1);
  const [activeTask, setActiveTask] = useState(null);
  const [completedSteps, setCompletedSteps] = useState({});
  const [showTip, setShowTip] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [hasSavedData, setHasSavedData] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(null);
  const fileRef = useRef();
  const saveTimeoutRef = useRef(null);
  const dataLoadedRef = useRef(false);

  // Initialize auth and load data
  useEffect(() => {
    setMounted(true);
    dataLoadedRef.current = false;

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user && !dataLoadedRef.current) {
        dataLoadedRef.current = true;
        loadUserData(session.user.id);
      }
      setAuthLoading(false);
    });

    // Listen for auth changes (only handle NEW sign-in/sign-out, not initial session)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') return;
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN' && session?.user && !dataLoadedRef.current) {
        dataLoadedRef.current = true;
        loadUserData(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        dataLoadedRef.current = false;
        setQuests(FALLBACK_QUESTS);
        setCompletedSteps({});
        setAnalysis(null);
        setRequirementsSummary(null);
        setDomain(null);
        setPage("landing");
        setHasSavedData(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load user data from Supabase
  const isLoadingDataRef = useRef(false);
  const loadUserData = async (userId) => {
    isLoadingDataRef.current = true;
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error loading data:", error);
        return;
      }

      if (data) {
        if (data.quests) setQuests(data.quests);
        if (data.completed_steps) setCompletedSteps(data.completed_steps);
        if (data.analysis) setAnalysis(data.analysis);
        if (data.requirements_summary) setRequirementsSummary(data.requirements_summary);
        if (data.domain) setDomain(data.domain);
        if (data.active_quest) setActiveQuest(data.active_quest);
        setPage("dashboard");
        setHasSavedData(true);
      }
    } catch (e) {
      console.error("Error loading user data:", e);
    } finally {
      // Small delay so auto-save effect doesn't fire for the initial load
      setTimeout(() => { isLoadingDataRef.current = false; }, 3000);
    }
  };

  // Save data to Supabase (debounced)
  const saveUserData = async () => {
    if (!user) return;

    setSaveStatus("saving");
    try {
      const dataToSave = {
        user_id: user.id,
        quests,
        completed_steps: completedSteps,
        analysis,
        requirements_summary: requirementsSummary,
        domain,
        active_quest: activeQuest,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_progress')
        .upsert(dataToSave, { onConflict: 'user_id' });

      if (error) throw error;
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (e) {
      console.error("Error saving data:", e);
      setSaveStatus("error");
    }
  };

  // Auto-save when data changes (debounced) — skip during initial data load
  useEffect(() => {
    if (!mounted || !user || page !== "dashboard" || isLoadingDataRef.current) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveUserData();
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [quests, completedSteps, analysis, requirementsSummary, domain, activeQuest, page, mounted, user]);

  // Google Sign In
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) console.error("Error signing in:", error);
  };

  // Sign Out
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const dk = mode === "dark";

  const c = {
    bg: dk ? "#000000" : "#f5f5f7",
    bgGlass: dk ? "rgba(44,44,46,0.55)" : "rgba(255,255,255,0.65)",
    bgGlassStrong: dk ? "rgba(44,44,46,0.8)" : "rgba(255,255,255,0.85)",
    bgCard: dk ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.6)",
    bgCardHover: dk ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.8)",
    border: dk ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    borderHover: dk ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)",
    text: dk ? "#f5f5f7" : "#1d1d1f",
    textSec: dk ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)",
    textTer: dk ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)",
    accent: "#0071e3",
    accentHover: "#0077ED",
    accentSoft: dk ? "rgba(0,113,227,0.15)" : "rgba(0,113,227,0.08)",
    accentGlow: dk ? "rgba(0,113,227,0.25)" : "rgba(0,113,227,0.12)",
    green: "#30d158",
    greenSoft: dk ? "rgba(48,209,88,0.15)" : "rgba(48,209,88,0.1)",
    red: "#ff453a",
    redSoft: dk ? "rgba(255,69,58,0.15)" : "rgba(255,69,58,0.08)",
  };

  // ─── Read file content ───
  const handleFile = (f) => {
    setFile(f);
    setFileBase64(null);
    setFileType(null);
    if (!f) return;

    const reader = new FileReader();
    const isPdf = f.type === "application/pdf" || f.name?.toLowerCase().endsWith(".pdf");

    if (isPdf) {
      // For PDFs, read as base64
      reader.onload = (e) => {
        setFileBase64(e.target.result);
        setFileType("application/pdf");
        setTextContent("");
      };
      reader.readAsDataURL(f);
    } else {
      // For text files, read as text
      reader.onload = (e) => {
        setTextContent(e.target.result);
        setFileBase64(null);
        setFileType(null);
      };
      reader.readAsText(f);
    }
  };

  // ─── Real AI Analysis ───
  const startAnalysis = async () => {
    const content = useTextInput ? textContent : textContent;
    const hasPdf = fileBase64 && fileType === "application/pdf";
    if (!hasPdf && !content?.trim()) return;
    if (!domain) return;

    setAnalyzing(true);
    setProgress(0);
    setAiError(null);
    setAnalyzeStatus("Envoi du document à l'IA…");

    // Smooth progress animation
    let prog = 0;
    const progInterval = setInterval(() => {
      prog += Math.random() * 3 + 0.5;
      if (prog > 90) prog = 90;
      setProgress(prog);
    }, 200);

    try {
      setAnalyzeStatus("Analyse du sujet en cours…");

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: hasPdf ? null : content,
          domain: domain,
          fileBase64: hasPdf ? fileBase64 : null,
          fileType: hasPdf ? fileType : null,
        }),
      });

      if (!res.ok) {
        throw new Error("Erreur API");
      }

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalyzeStatus("Structuration du plan personnalisé…");
      setProgress(95);

      // Use AI-generated quests
      if (data.quests && data.quests.length > 0) {
        setQuests(data.quests);
        setAnalysis(data.analysis || null);
        setRequirementsSummary(data.requirements_summary || null);
      }

      await new Promise(r => setTimeout(r, 600));
      setProgress(100);
      await new Promise(r => setTimeout(r, 400));

      clearInterval(progInterval);
      setAnalyzing(false);
      setActiveQuest(data.quests?.[0]?.id || 1);
      setPage("dashboard");

    } catch (err) {
      console.error("Analysis error:", err);
      clearInterval(progInterval);
      setAiError("L'analyse IA a rencontré une erreur. On utilise le plan standard.");
      setQuests(FALLBACK_QUESTS);
      setProgress(100);
      await new Promise(r => setTimeout(r, 800));
      setAnalyzing(false);
      setPage("dashboard");
    }
  };

  const toggleStep = (sk) => setCompletedSteps((prev) => ({ ...prev, [sk]: !prev[sk] }));

  const totalSteps = quests.reduce((s, q) => s + q.tasks.reduce((s2, t) => s2 + t.steps.length, 0), 0);
  const doneSteps = Object.values(completedSteps).filter(Boolean).length;
  const overallPct = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;
  const quest = quests.find((q) => q.id === activeQuest);

  const getTaskProg = (task) => {
    const done = task.steps.filter((_, i) => completedSteps[`${task.id}-${i}`]).length;
    return { done, total: task.steps.length, pct: Math.round((done / task.steps.length) * 100) };
  };
  const getQuestProg = (q) => {
    let done = 0, total = 0;
    q.tasks.forEach((t) => { t.steps.forEach((_, i) => { total++; if (completedSteps[`${t.id}-${i}`]) done++; }); });
    return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  };

  const circ = 2 * Math.PI * 35;
  const dashOff = circ - (overallPct / 100) * circ;

  const totalTaskCount = quests.reduce((s, q) => s + q.tasks.length, 0);

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}
    .root{min-height:100vh;min-height:100dvh;background:${c.bg};color:${c.text};font-family:-apple-system,'SF Pro Display','Helvetica Neue','Inter',sans-serif;-webkit-font-smoothing:antialiased;transition:background .5s ease,color .4s;overflow-x:hidden;position:relative}
    .orb{position:fixed;border-radius:50%;filter:blur(100px);pointer-events:none;z-index:0;opacity:${dk?.3:.2}}
    .orb-1{width:600px;height:600px;background:radial-gradient(circle,#0071e3,transparent 70%);top:-200px;right:-150px}
    .orb-2{width:500px;height:500px;background:radial-gradient(circle,#bf5af2,transparent 70%);bottom:-150px;left:-100px}

    .nav{position:fixed;top:0;left:0;right:0;z-index:100;height:52px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;background:${c.bgGlassStrong};backdrop-filter:blur(40px) saturate(1.8);border-bottom:.5px solid ${c.border}}
    .nav-brand{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600;letter-spacing:-.02em;cursor:pointer}
    .nav-logo{width:26px;height:26px;border-radius:7px;background:${c.accent};display:flex;align-items:center;justify-content:center;font-size:13px;color:white;font-weight:700}
    .nav-right{display:flex;align-items:center;gap:6px}
    .nav-pill{font-size:11px;padding:4px 10px;border-radius:100px;background:${c.bgCard};border:.5px solid ${c.border};color:${c.textSec};font-weight:500}
    .icon-btn{width:32px;height:32px;border-radius:8px;border:.5px solid ${c.border};background:${c.bgCard};color:${c.textSec};display:flex;align-items:center;justify-content:center;font-size:15px;cursor:pointer;transition:all .2s}
    .icon-btn:hover{background:${c.bgCardHover};color:${c.text}}

    .btn-blue{padding:7px 18px;border-radius:980px;border:none;background:${c.accent};color:white;font-family:inherit;font-size:13px;font-weight:500;cursor:pointer;transition:all .25s}
    .btn-blue:hover{background:${c.accentHover};transform:scale(1.02);box-shadow:0 4px 20px ${c.accentGlow}}
    .btn-blue:active{transform:scale(.98)}
    .btn-sec{padding:7px 18px;border-radius:980px;border:.5px solid ${c.border};background:${c.bgGlass};backdrop-filter:blur(20px);color:${c.text};font-family:inherit;font-size:13px;font-weight:500;cursor:pointer;transition:all .25s}
    .btn-sec:hover{background:${c.bgGlassStrong};border-color:${c.borderHover}}

    .landing{position:relative;z-index:1;padding-top:52px}
    .hero{max-width:680px;margin:0 auto;text-align:center;padding:80px 20px 50px}
    .hero-chip{display:inline-flex;align-items:center;gap:6px;padding:5px 14px;border-radius:980px;background:${c.bgGlass};backdrop-filter:blur(20px);border:.5px solid ${c.border};font-size:12px;color:${c.textSec};font-weight:500;margin-bottom:24px;animation:rise .8s cubic-bezier(.16,1,.3,1) both}
    .pulse-dot{width:6px;height:6px;border-radius:50%;background:#30d158;animation:pulse 2.5s ease infinite}
    @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
    @keyframes rise{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    .hero h1{font-size:clamp(34px,7vw,56px);font-weight:700;letter-spacing:-.04em;line-height:1.08;margin-bottom:16px;animation:rise .8s cubic-bezier(.16,1,.3,1) .08s both}
    .grad{background:linear-gradient(135deg,#0071e3,#bf5af2,#ff375f);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .hero-sub{font-size:17px;line-height:1.55;color:${c.textSec};max-width:440px;margin:0 auto 32px;animation:rise .8s cubic-bezier(.16,1,.3,1) .16s both}
    .hero-btns{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;animation:rise .8s cubic-bezier(.16,1,.3,1) .24s both}
    .hero-btns .btn-blue{padding:10px 28px;font-size:14px}
    .hero-btns .btn-sec{padding:10px 24px;font-size:14px}

    .features-grid{max-width:880px;margin:40px auto 0;padding:0 20px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;animation:rise .8s cubic-bezier(.16,1,.3,1) .32s both}
    .g-card{padding:24px 20px;border-radius:18px;background:${c.bgGlass};backdrop-filter:blur(40px) saturate(1.5);border:.5px solid ${c.border};transition:all .3s;position:relative;overflow:hidden}
    .g-card::before{content:'';position:absolute;top:0;left:0;right:0;height:.5px;background:linear-gradient(90deg,transparent,${dk?'rgba(255,255,255,.1)':'rgba(255,255,255,.6)'},transparent)}
    .g-card:hover{transform:translateY(-3px);box-shadow:0 16px 48px ${dk?'rgba(0,0,0,.3)':'rgba(0,0,0,.06)'}}
    .g-card-icon{width:36px;height:36px;border-radius:10px;background:${c.accentSoft};display:flex;align-items:center;justify-content:center;font-size:16px;margin-bottom:12px}
    .g-card h3{font-size:14px;font-weight:600;letter-spacing:-.02em;margin-bottom:4px}
    .g-card p{font-size:13px;line-height:1.5;color:${c.textSec}}

    .stats-row{max-width:880px;margin:56px auto 0;padding:0 20px;display:flex;gap:1px;animation:rise .8s cubic-bezier(.16,1,.3,1) .4s both}
    .stat-g{flex:1;text-align:center;padding:24px 16px;background:${c.bgGlass};backdrop-filter:blur(30px);border:.5px solid ${c.border}}
    .stat-g:first-child{border-radius:14px 0 0 14px}.stat-g:last-child{border-radius:0 14px 14px 0}
    .stat-n{font-size:28px;font-weight:700;letter-spacing:-.04em;background:linear-gradient(135deg,${c.accent},#bf5af2);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .stat-l{font-size:12px;color:${c.textTer};margin-top:2px;font-weight:500}
    .footer{text-align:center;padding:40px 20px;font-size:12px;color:${c.textTer};margin-top:60px}

    .onboard{position:relative;z-index:1;padding:84px 20px 40px;max-width:560px;margin:0 auto}
    .onboard-step{animation:rise .6s cubic-bezier(.16,1,.3,1) both}
    .step-num{font-size:11px;font-weight:600;font-family:'JetBrains Mono',monospace;color:${c.accent};text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px}
    .step-title{font-size:26px;font-weight:700;letter-spacing:-.035em;margin-bottom:6px}
    .step-desc{font-size:15px;color:${c.textSec};margin-bottom:24px}
    .domain-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
    .d-card{padding:16px;border-radius:14px;background:${c.bgGlass};backdrop-filter:blur(30px);border:.5px solid ${c.border};cursor:pointer;transition:all .3s;display:flex;align-items:center;gap:12px}
    .d-card:hover{background:${c.bgCardHover};border-color:${c.borderHover};transform:translateY(-1px)}
    .d-card.on{border-color:${c.accent};background:${c.accentSoft};box-shadow:0 0 0 1px ${c.accent}}
    .d-icon{width:34px;height:34px;border-radius:9px;background:${c.accentSoft};display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}
    .d-label{font-size:14px;font-weight:600}
    .d-desc{font-size:11px;color:${c.textSec}}

    .upload-area{border:1.5px dashed ${c.border};border-radius:18px;padding:44px 20px;text-align:center;cursor:pointer;transition:all .3s;background:${c.bgCard}}
    .upload-area:hover{border-color:${c.accent};background:${c.accentSoft}}
    .upload-area.filled{border-style:solid;border-color:${c.accent};background:${c.accentSoft}}
    .upload-icon-w{width:48px;height:48px;border-radius:14px;background:${c.bgGlass};border:.5px solid ${c.border};display:flex;align-items:center;justify-content:center;font-size:20px;margin:0 auto 14px}
    .upload-l{font-size:14px;font-weight:500;margin-bottom:4px}
    .upload-h{font-size:12px;color:${c.textTer}}
    .upload-f{font-size:14px;font-weight:600;color:${c.accent}}

    .text-area{width:100%;min-height:160px;padding:16px;border-radius:14px;border:.5px solid ${c.border};background:${c.bgCard};color:${c.text};font-family:inherit;font-size:13px;line-height:1.6;resize:vertical;outline:none;transition:border-color .2s}
    .text-area:focus{border-color:${c.accent}}
    .text-area::placeholder{color:${c.textTer}}

    .toggle-input{display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:16px;font-size:12px;color:${c.textSec}}
    .toggle-link{color:${c.accent};cursor:pointer;text-decoration:underline;font-weight:500}

    .step-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:28px}

    .analyze-ov{position:fixed;inset:0;z-index:200;background:${dk?'rgba(0,0,0,.85)':'rgba(245,245,247,.9)'};backdrop-filter:blur(60px);display:flex;align-items:center;justify-content:center;animation:fadeIn .5s}
    @keyframes fadeIn{from{opacity:0}}
    .analyze-box{text-align:center;padding:40px;border-radius:24px;background:${c.bgGlass};backdrop-filter:blur(40px);border:.5px solid ${c.border};min-width:300px;max-width:380px;box-shadow:0 20px 60px ${dk?'rgba(0,0,0,.5)':'rgba(0,0,0,.08)'}}
    .spinner{width:40px;height:40px;border-radius:50%;border:2.5px solid ${c.border};border-top-color:${c.accent};animation:spin .7s linear infinite;margin:0 auto 16px}
    @keyframes spin{to{transform:rotate(360deg)}}
    .prog-track{width:200px;height:3px;border-radius:4px;background:${c.border};margin:12px auto 0;overflow:hidden}
    .prog-fill{height:100%;border-radius:4px;background:linear-gradient(90deg,${c.accent},#bf5af2);transition:width .2s linear}

    .ai-badge{display:inline-flex;align-items:center;gap:4px;font-size:11px;padding:3px 8px;border-radius:6px;background:${c.greenSoft};color:${c.green};font-weight:600;margin-bottom:12px}
    .ai-error{padding:12px 16px;border-radius:12px;background:${c.redSoft};color:${c.red};font-size:13px;margin-bottom:16px;border:.5px solid ${dk?'rgba(255,69,58,.2)':'rgba(255,69,58,.15)'}}

    .analysis-card{padding:20px;border-radius:16px;background:${c.bgGlass};backdrop-filter:blur(30px);border:.5px solid ${c.border};margin-bottom:20px;animation:rise .4s cubic-bezier(.16,1,.3,1) both}
    .analysis-subject{font-size:14px;font-weight:600;margin-bottom:8px}
    .analysis-themes{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
    .analysis-theme{font-size:11px;padding:3px 10px;border-radius:100px;background:${c.accentSoft};color:${c.accent};font-weight:500}
    .analysis-meta{display:flex;gap:16px;margin-top:10px;font-size:12px;color:${c.textTer}}

    .dash{position:relative;z-index:1;padding-top:52px;display:flex;min-height:100vh;min-height:100dvh}
    .side{width:260px;flex-shrink:0;border-right:.5px solid ${c.border};padding:20px 14px;position:sticky;top:52px;height:calc(100vh - 52px);height:calc(100dvh - 52px);overflow-y:auto;background:${dk?'rgba(0,0,0,.3)':'rgba(245,245,247,.5)'};backdrop-filter:blur(20px)}
    .ring-wrap{display:flex;flex-direction:column;align-items:center;padding:16px 0 20px;margin-bottom:16px}
    .ring-c{position:relative;width:72px;height:72px;margin-bottom:8px}
    .ring-c svg{transform:rotate(-90deg)}
    .ring-bg{fill:none;stroke:${c.border};stroke-width:4}
    .ring-fg{fill:none;stroke:url(#rG);stroke-width:4;stroke-linecap:round;transition:stroke-dashoffset .6s cubic-bezier(.16,1,.3,1)}
    .ring-pct{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;letter-spacing:-.03em}
    .ring-lbl{font-size:11px;color:${c.textTer};font-weight:500}
    .side-lbl{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:${c.textTer};padding:0 8px;margin-bottom:6px;font-family:'JetBrains Mono',monospace}
    .q-item{display:flex;align-items:center;gap:8px;padding:9px 10px;border-radius:10px;cursor:pointer;transition:all .2s;margin-bottom:1px;font-size:13px;font-weight:500;color:${c.textSec}}
    .q-item:hover{background:${c.bgCardHover};color:${c.text}}
    .q-item.on{background:${c.accentSoft};color:${c.text}}
    .q-emoji{font-size:15px;width:22px;text-align:center;flex-shrink:0}
    .q-pct{margin-left:auto;font-size:10px;font-family:'JetBrains Mono',monospace;color:${c.textTer};padding:2px 6px;border-radius:6px;background:${c.bgCard}}
    .q-pct.ok{background:${c.greenSoft};color:${c.green}}

    .main{flex:1;padding:28px 32px 100px;max-width:900px;overflow-y:auto}
    .q-header{margin-bottom:20px;animation:rise .4s cubic-bezier(.16,1,.3,1) both}
    .q-badge{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;font-family:'JetBrains Mono',monospace;padding:4px 10px;border-radius:8px;background:${c.accentSoft};color:${c.accent};margin-bottom:8px}
    .q-title{font-size:22px;font-weight:700;letter-spacing:-.03em;margin-bottom:4px}
    .q-desc{font-size:14px;color:${c.textSec}}

    .q-prog{margin-bottom:20px;animation:rise .4s cubic-bezier(.16,1,.3,1) .05s both}
    .q-prog-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
    .q-prog-l{font-size:12px;color:${c.textSec};font-weight:500}
    .q-prog-p{font-size:12px;font-family:'JetBrains Mono',monospace;color:${c.accent};font-weight:600}
    .q-prog-bar{height:4px;border-radius:4px;background:${c.border};overflow:hidden}
    .q-prog-fill{height:100%;border-radius:4px;background:linear-gradient(90deg,${c.accent},#bf5af2);transition:width .5s cubic-bezier(.16,1,.3,1)}

    .task-list{display:flex;flex-direction:column;gap:6px}
    .task-item{border-radius:16px;background:${c.bgGlass};backdrop-filter:blur(30px) saturate(1.3);border:.5px solid ${c.border};overflow:hidden;transition:all .3s;animation:rise .4s cubic-bezier(.16,1,.3,1) both}
    .task-item:hover{border-color:${c.borderHover}}
    .task-item.active{border-color:${dk?'rgba(0,113,227,.3)':'rgba(0,113,227,.2)'};box-shadow:0 8px 32px ${dk?'rgba(0,0,0,.2)':'rgba(0,0,0,.04)'}}
    .task-header{display:flex;align-items:center;gap:12px;padding:16px 18px;cursor:pointer;transition:background .2s}
    .task-header:hover{background:${c.bgCardHover}}
    .task-status{width:28px;height:28px;border-radius:50%;border:2px solid ${c.border};display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;transition:all .3s;color:transparent}
    .task-status.partial{border-color:${c.accent};background:${c.accentSoft}}
    .task-status.done{border-color:${c.green};background:${c.green};color:white}
    .task-meta{flex:1;min-width:0}
    .task-name{font-size:14px;font-weight:600;letter-spacing:-.01em}
    .task-sub{font-size:12px;color:${c.textTer};margin-top:1px}
    .task-arrow{font-size:14px;color:${c.textTer};transition:transform .3s;flex-shrink:0}
    .task-arrow.open{transform:rotate(90deg)}

    .steps-panel{padding:0 18px 16px}
    .step-row{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:.5px solid ${c.border};transition:all .2s}
    .step-row:last-child{border-bottom:none}
    .step-num-b{font-size:10px;font-family:'JetBrains Mono',monospace;color:${c.textTer};min-width:18px;text-align:center;padding-top:3px;flex-shrink:0}
    .step-check{width:20px;height:20px;border-radius:6px;border:1.5px solid ${c.border};flex-shrink:0;margin-top:1px;display:flex;align-items:center;justify-content:center;font-size:10px;cursor:pointer;transition:all .25s;color:transparent}
    .step-check:hover{border-color:${c.accent}}
    .step-check.on{background:${c.accent};border-color:${c.accent};color:white}
    .step-lbl{font-size:13px;line-height:1.45;color:${c.textSec};flex:1}
    .step-lbl.done{text-decoration:line-through;opacity:.4}

    .tip-box{margin:10px 0 4px;padding:14px 16px;border-radius:12px;background:${c.accentSoft};border:.5px solid ${dk?'rgba(0,113,227,.2)':'rgba(0,113,227,.12)'};font-size:13px;line-height:1.5;color:${c.textSec};animation:rise .3s cubic-bezier(.16,1,.3,1) both}
    .tip-box strong{color:${c.accent};font-weight:600}
    .tip-toggle{padding:4px 10px;border-radius:8px;border:.5px solid ${c.border};background:${c.bgCard};color:${c.textTer};font-size:11px;font-family:inherit;font-weight:500;cursor:pointer;transition:all .2s}
    .tip-toggle:hover{border-color:${c.accent};color:${c.accent};background:${c.accentSoft}}

    .mob-bar{display:none;position:fixed;bottom:0;left:0;right:0;z-index:100;height:64px;padding-bottom:env(safe-area-inset-bottom,0);background:${c.bgGlassStrong};backdrop-filter:blur(40px) saturate(1.8);border-top:.5px solid ${c.border};align-items:center;justify-content:space-around}
    .mob-tab{display:flex;flex-direction:column;align-items:center;gap:2px;font-size:10px;font-weight:500;color:${c.textTer};cursor:pointer;padding:6px 8px;border-radius:8px;transition:all .2s;border:none;background:none;font-family:inherit}
    .mob-tab.on{color:${c.accent}}
    .mob-tab-icon{font-size:20px}

    @media(max-width:768px){
      .features-grid{grid-template-columns:1fr}
      .stats-row{flex-direction:column;gap:0}
      .stat-g{border-radius:0!important}.stat-g:first-child{border-radius:14px 14px 0 0!important}.stat-g:last-child{border-radius:0 0 14px 14px!important}
      .domain-grid{grid-template-columns:1fr}
      .hero h1{font-size:32px}.hero-sub{font-size:15px}.hero{padding:60px 20px 40px}
      .side{display:none}.main{padding:20px 16px 90px}.dash{display:block}.mob-bar{display:flex}
      .q-title{font-size:20px}.task-header{padding:14px}.steps-panel{padding:0 14px 14px}
      .nav{padding:0 16px}.onboard{padding:74px 16px 40px}.step-title{font-size:22px}
      .analysis-card{padding:16px}
    }
  `;

  const hasContent = useTextInput ? textContent.trim().length > 30 : !!file;

  // Prevent hydration mismatch - render nothing until client-side mount
  if (!mounted) {
    return (
      <div style={{ minHeight: "100vh", background: "#000" }} />
    );
  }

  return (
    <div className="root">
      <style>{css}</style>
      <div className="orb orb-1"/><div className="orb orb-2"/>
      <svg width="0" height="0"><defs><linearGradient id="rG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#0071e3"/><stop offset="100%" stopColor="#bf5af2"/></linearGradient></defs></svg>

      <nav className="nav">
        <div className="nav-brand" onClick={()=>{
          if (page === "dashboard" && !window.confirm("Voulez-vous vraiment quitter ? Votre progression est sauvegardée.")) return;
          setPage("landing");setDomain(null);setFile(null);setActiveTask(null);setTextContent("");setUseTextInput(false);
        }}>
          <div className="nav-logo">m</div><span>maimoirkuest</span>
        </div>
        <div className="nav-right">
          {page==="dashboard"&&domain&&<span className="nav-pill">{DOMAINS.find(d=>d.id===domain)?.label}</span>}
          {page==="dashboard"&&analysis&&<span className="nav-pill" style={{background:c.greenSoft,color:c.green,borderColor:"transparent"}}>✦ IA</span>}
          {page==="dashboard"&&saveStatus&&(
            <span className="nav-pill" style={{
              background: saveStatus === "saved" ? c.greenSoft : saveStatus === "error" ? c.redSoft : c.bgCard,
              color: saveStatus === "saved" ? c.green : saveStatus === "error" ? c.red : c.textSec,
              borderColor: "transparent"
            }}>
              {saveStatus === "saving" ? "⏳" : saveStatus === "saved" ? "✓ Sauvegardé" : "⚠️ Erreur"}
            </span>
          )}
          {page==="dashboard"&&(
            <button className="btn-sec" style={{fontSize:11,padding:"5px 12px"}} onClick={async ()=>{
              if (window.confirm("Voulez-vous vraiment recommencer ? Toutes vos données seront effacées.")) {
                if (user) {
                  await supabase.from('user_progress').delete().eq('user_id', user.id);
                }
                setQuests(FALLBACK_QUESTS);
                setCompletedSteps({});
                setAnalysis(null);
                setRequirementsSummary(null);
                setDomain(null);
                setPage("landing");
                setHasSavedData(false);
              }
            }}>Nouvelle analyse</button>
          )}
          <button className="icon-btn" onClick={()=>setMode(dk?"light":"dark")}>{dk?"☀︎":"☾"}</button>
          {user ? (
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <img src={user.user_metadata?.avatar_url} alt="" style={{width:28,height:28,borderRadius:"50%",border:`.5px solid ${c.border}`}} />
              <button className="btn-sec" style={{fontSize:11,padding:"5px 12px"}} onClick={signOut}>Déconnexion</button>
            </div>
          ) : (
            !authLoading && page==="landing" && (
              <button className="btn-blue" onClick={signInWithGoogle}>
                <span style={{marginRight:6}}>G</span> Connexion Google
              </button>
            )
          )}
          {page==="landing"&&user&&<button className="btn-blue" onClick={()=>setPage("onboard")}>Commencer</button>}
          {page==="landing"&&user&&hasSavedData&&<button className="btn-sec" onClick={()=>setPage("dashboard")}>Reprendre</button>}
        </div>
      </nav>

      {page==="landing"&&(
        <div className="landing">
          <section className="hero">
            <div className="hero-chip"><span className="pulse-dot"/>Propulsé par l'IA · Gratuit</div>
            <h1>Votre mémoire, <span className="grad">notre guide.</span></h1>
            <p className="hero-sub">L'IA analyse votre sujet et crée un plan d'action personnalisé. Vous avancez pas à pas, on vous accompagne.</p>
            <div className="hero-btns">
              <button className="btn-blue" onClick={()=>setPage("onboard")}>Analyser mon sujet →</button>
              <button className="btn-sec">GitHub ↗</button>
            </div>
          </section>
          <div className="features-grid">
            <div className="g-card"><div className="g-card-icon">🧠</div><h3>Analyse IA profonde</h3><p>L'IA lit votre cahier des charges et comprend votre sujet en détail.</p></div>
            <div className="g-card"><div className="g-card-icon">🎯</div><h3>Plan personnalisé</h3><p>Un plan d'action unique, adapté à VOTRE sujet, pas un template générique.</p></div>
            <div className="g-card"><div className="g-card-icon">🚀</div><h3>Guidage pas à pas</h3><p>Chaque étape découpée en sous-actions. Impossible de se perdre.</p></div>
          </div>
          <div className="stats-row">
            <div className="stat-g"><div className="stat-n"><AnimNum value={6} dur={900}/></div><div className="stat-l">Quêtes adaptées</div></div>
            <div className="stat-g"><div className="stat-n">~<AnimNum value={25} dur={1100}/></div><div className="stat-l">Missions sur-mesure</div></div>
            <div className="stat-g"><div className="stat-n">~<AnimNum value={87} dur={1300}/></div><div className="stat-l">Actions concrètes</div></div>
          </div>
          <div className="footer">maimoirkuest · Open Source · Propulsé par Claude AI</div>
        </div>
      )}

      {page==="onboard"&&(
        <div className="onboard">
          <div className="onboard-step">
            <div className="step-num">Étape 01</div>
            <h2 className="step-title">Votre domaine</h2>
            <p className="step-desc">Pour adapter l'analyse IA à votre cursus.</p>
            <div className="domain-grid">
              {DOMAINS.map(d=>(
                <div key={d.id} className={`d-card ${domain===d.id?"on":""}`} onClick={()=>setDomain(d.id)}>
                  <div className="d-icon">{d.icon}</div>
                  <div><div className="d-label">{d.label}</div><div className="d-desc">{d.desc}</div></div>
                </div>
              ))}
            </div>
          </div>
          {domain&&(
            <div className="onboard-step" style={{marginTop:32,animationDelay:".08s"}}>
              <div className="step-num">Étape 02</div>
              <h2 className="step-title">Votre sujet</h2>
              <p className="step-desc">L'IA va analyser votre document et créer un plan personnalisé.</p>

              <div className="toggle-input">
                {useTextInput
                  ? <><span>Mode texte</span> · <span className="toggle-link" onClick={()=>setUseTextInput(false)}>Uploader un fichier</span></>
                  : <><span>Mode fichier</span> · <span className="toggle-link" onClick={()=>setUseTextInput(true)}>Coller du texte</span></>
                }
              </div>

              {useTextInput ? (
                <textarea
                  className="text-area"
                  placeholder="Collez ici votre sujet de mémoire, cahier des charges, ou consignes…"
                  value={textContent}
                  onChange={(e)=>setTextContent(e.target.value)}
                />
              ) : (
                <>
                  <input ref={fileRef} type="file" accept=".txt,.md,.rtf,.pdf,.png,.jpg,.jpeg,image/png,image/jpeg,application/pdf" style={{display:"none"}} onChange={e=>handleFile(e.target.files?.[0]||null)}/>
                  <div className={`upload-area ${file?"filled":""}`} onClick={()=>fileRef.current?.click()}>
                    {file?(<><div className="upload-icon-w">✓</div><div className="upload-f">{file.name}</div><div className="upload-h" style={{marginTop:4}}>Cliquez pour changer</div></>)
                         :(<><div className="upload-icon-w">↑</div><div className="upload-l">Cliquez pour uploader</div><div className="upload-h">PDF, PNG, JPEG ou fichier texte</div></>)}
                  </div>
                </>
              )}

              <div className="step-actions">
                <button className="btn-sec" onClick={()=>setDomain(null)}>Retour</button>
                <button className="btn-blue" style={{opacity:hasContent?1:.4,pointerEvents:hasContent?"auto":"none"}} onClick={startAnalysis}>Analyser avec l'IA →</button>
              </div>
            </div>
          )}
        </div>
      )}

      {analyzing&&(
        <div className="analyze-ov">
          <div className="analyze-box">
            <div className="spinner"/>
            <div style={{fontSize:16,fontWeight:600,marginBottom:4}}>Analyse IA en cours</div>
            <div style={{fontSize:13,color:c.textSec,lineHeight:1.5,marginTop:4}}>{analyzeStatus}</div>
            <div className="prog-track"><div className="prog-fill" style={{width:`${Math.min(progress,100)}%`}}/></div>
            <div style={{fontSize:12,color:c.textTer,marginTop:8,fontFamily:"'JetBrains Mono',monospace"}}>{Math.min(Math.round(progress),100)}%</div>
          </div>
        </div>
      )}

      {page==="dashboard"&&(<>
        <div className="dash">
          <aside className="side">
            <div className="ring-wrap">
              <div className="ring-c">
                <svg width="72" height="72" viewBox="0 0 80 80">
                  <circle className="ring-bg" cx="40" cy="40" r="35"/>
                  <circle className="ring-fg" cx="40" cy="40" r="35" strokeDasharray={circ} strokeDashoffset={dashOff}/>
                </svg>
                <div className="ring-pct">{overallPct}%</div>
              </div>
              <span className="ring-lbl">Progression globale</span>
            </div>

            {analysis && (
              <div style={{padding:"0 4px",marginBottom:16}}>
                <div className="ai-badge">✦ Plan personnalisé par l'IA</div>
              </div>
            )}

            <div className="side-lbl">Quêtes</div>
            {quests.map(q=>{const qp=getQuestProg(q);return(
              <div key={q.id} className={`q-item ${activeQuest===q.id?"on":""}`} onClick={()=>{setActiveQuest(q.id);setActiveTask(null)}}>
                <span className="q-emoji">{q.emoji}</span><span style={{flex:1}}>{q.title}</span>
                <span className={`q-pct ${qp.pct===100?"ok":""}`}>{qp.pct}%</span>
              </div>
            )})}

            <div style={{marginTop:20,padding:"12px 10px",borderRadius:10,background:c.bgCard,border:`.5px solid ${c.border}`,fontSize:10,color:c.textTer,lineHeight:1.5}}>
              {user ? "☁️ Votre progression est sauvegardée automatiquement dans le cloud. Connectez-vous sur n'importe quel appareil pour retrouver vos données." : "💾 Connectez-vous avec Google pour sauvegarder votre progression dans le cloud."}
            </div>

            {user && (
              <button
                onClick={async () => {
                  if (!window.confirm("Voulez-vous vraiment supprimer votre compte et toutes vos données ? Cette action est irréversible.")) return;
                  if (!window.confirm("Dernière confirmation : toutes vos données seront définitivement supprimées.")) return;
                  try {
                    await supabase.from('user_progress').delete().eq('user_id', user.id);
                    await supabase.auth.signOut();
                    setQuests(FALLBACK_QUESTS);
                    setCompletedSteps({});
                    setAnalysis(null);
                    setRequirementsSummary(null);
                    setDomain(null);
                    setPage("landing");
                    setHasSavedData(false);
                  } catch (e) {
                    console.error("Erreur suppression compte:", e);
                    alert("Une erreur est survenue lors de la suppression. Veuillez réessayer.");
                  }
                }}
                style={{
                  marginTop:10,
                  width:"100%",
                  padding:"9px 10px",
                  borderRadius:10,
                  border:`.5px solid ${dk?'rgba(255,69,58,0.25)':'rgba(255,69,58,0.2)'}`,
                  background:c.redSoft,
                  color:c.red,
                  fontSize:11,
                  fontWeight:500,
                  fontFamily:"inherit",
                  cursor:"pointer",
                  transition:"all .2s",
                }}
              >
                Supprimer mon compte et mes données
              </button>
            )}
          </aside>

          <main className="main">
            {aiError && <div className="ai-error">⚠️ {aiError}</div>}

            {requirementsSummary && activeQuest === quests[0]?.id && (
              <div className="analysis-card" style={{background: dk ? "rgba(0,113,227,0.08)" : "rgba(0,113,227,0.05)", borderColor: dk ? "rgba(0,113,227,0.2)" : "rgba(0,113,227,0.15)"}}>
                <div style={{fontSize:11,fontWeight:600,color:c.accent,marginBottom:12,textTransform:"uppercase",letterSpacing:".06em",fontFamily:"'JetBrains Mono',monospace"}}>📋 Ce que le cahier des charges attend de vous</div>

                {requirementsSummary.main_objective && (
                  <div style={{fontSize:15,fontWeight:600,marginBottom:showFullRequirements ? 16 : 12,lineHeight:1.4}}>{requirementsSummary.main_objective}</div>
                )}

                {showFullRequirements && (
                  <>
                    {requirementsSummary.deliverables && requirementsSummary.deliverables.length > 0 && (
                      <div style={{marginBottom:14}}>
                        <div style={{fontSize:12,fontWeight:600,marginBottom:6,color:c.text}}>Livrables attendus</div>
                        <ul style={{margin:0,paddingLeft:18,fontSize:13,color:c.textSec,lineHeight:1.6}}>
                          {requirementsSummary.deliverables.map((d,i) => <li key={i}>{d}</li>)}
                        </ul>
                      </div>
                    )}

                    {requirementsSummary.constraints && requirementsSummary.constraints.length > 0 && (
                      <div style={{marginBottom:14}}>
                        <div style={{fontSize:12,fontWeight:600,marginBottom:6,color:c.text}}>Contraintes & exigences</div>
                        <ul style={{margin:0,paddingLeft:18,fontSize:13,color:c.textSec,lineHeight:1.6}}>
                          {requirementsSummary.constraints.map((item,i) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>
                    )}

                    {requirementsSummary.evaluation_criteria && requirementsSummary.evaluation_criteria.length > 0 && (
                      <div style={{marginBottom:14}}>
                        <div style={{fontSize:12,fontWeight:600,marginBottom:6,color:c.text}}>Critères d'évaluation</div>
                        <ul style={{margin:0,paddingLeft:18,fontSize:13,color:c.textSec,lineHeight:1.6}}>
                          {requirementsSummary.evaluation_criteria.map((item,i) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>
                    )}
                  </>
                )}

                <button
                  onClick={() => setShowFullRequirements(!showFullRequirements)}
                  style={{
                    background:"none",
                    border:"none",
                    color:c.accent,
                    fontSize:12,
                    fontWeight:500,
                    cursor:"pointer",
                    padding:"4px 0",
                    fontFamily:"inherit"
                  }}
                >
                  {showFullRequirements ? "▲ Voir moins" : "▼ Voir plus"}
                </button>

                <div style={{
                  marginTop:14,
                  paddingTop:12,
                  borderTop:`1px solid ${c.border}`,
                  fontSize:10,
                  color:c.textTer,
                  lineHeight:1.5,
                  fontStyle:"italic"
                }}>
                  ⚠️ Cet outil est fourni à titre pédagogique uniquement. L'IA peut commettre des erreurs d'interprétation. En utilisant ce service, vous reconnaissez que les suggestions générées ne constituent pas un avis professionnel et que vous êtes seul responsable de vos décisions académiques. L'éditeur décline toute responsabilité quant aux résultats obtenus.
                </div>
              </div>
            )}

            {analysis && quest && activeQuest === quests[0]?.id && (
              <div className="analysis-card">
                <div style={{fontSize:11,fontWeight:600,color:c.accent,marginBottom:8,textTransform:"uppercase",letterSpacing:".06em",fontFamily:"'JetBrains Mono',monospace"}}>Analyse de votre sujet</div>
                <div className="analysis-subject">{analysis.subject}</div>
                {analysis.keywords && (
                  <div className="analysis-themes">
                    {analysis.keywords.map((t,i)=><span key={i} className="analysis-theme">{t}</span>)}
                  </div>
                )}
                <div className="analysis-meta">
                  {analysis.difficulty && <span>Difficulté : {analysis.difficulty}</span>}
                  {analysis.estimated_weeks && <span>~{analysis.estimated_weeks} semaines</span>}
                </div>
              </div>
            )}

            {quest&&(<>
              <div className="q-header" key={quest.id}>
                <div className="q-badge">{quest.emoji} {quest.phase}</div>
                <h2 className="q-title">{quest.title}</h2>
                <p className="q-desc">{quest.desc}</p>
              </div>
              {(()=>{const qp=getQuestProg(quest);return(
                <div className="q-prog">
                  <div className="q-prog-h"><span className="q-prog-l">{qp.done}/{qp.total} sous-étapes</span><span className="q-prog-p">{qp.pct}%</span></div>
                  <div className="q-prog-bar"><div className="q-prog-fill" style={{width:`${qp.pct}%`}}/></div>
                </div>
              )})()}
              <div className="task-list">
                {quest.tasks.map((task,tIdx)=>{
                  const tp=getTaskProg(task);const isOpen=activeTask===task.id;
                  const status=tp.pct===100?"done":tp.pct>0?"partial":"";
                  return(
                    <div key={task.id} className={`task-item ${isOpen?"active":""}`} style={{animationDelay:`${tIdx*.05}s`}}>
                      <div className="task-header" onClick={()=>setActiveTask(isOpen?null:task.id)}>
                        <div className={`task-status ${status}`}>{status==="done"&&"✓"}</div>
                        <div className="task-meta">
                          <div className="task-name">{task.title}</div>
                          <div className="task-sub">{tp.done}/{tp.total} étapes{status==="done"?" · ✓":""}</div>
                        </div>
                        <span className={`task-arrow ${isOpen?"open":""}`}>›</span>
                      </div>
                      {isOpen&&(
                        <div className="steps-panel">
                          {task.steps.map((step,sIdx)=>{
                            const sk=`${task.id}-${sIdx}`;const isDone=!!completedSteps[sk];
                            return(
                              <div className="step-row" key={sk}>
                                <span className="step-num-b">{sIdx+1}</span>
                                <div className={`step-check ${isDone?"on":""}`} onClick={()=>toggleStep(sk)}>{isDone&&"✓"}</div>
                                <span className={`step-lbl ${isDone?"done":""}`}>{step.label}</span>
                              </div>
                            )
                          })}
                          <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}>
                            <button className="tip-toggle" onClick={()=>setShowTip(showTip===task.id?null:task.id)}>
                              {showTip===task.id?"Masquer":"💡 Conseil IA"}
                            </button>
                          </div>
                          {showTip===task.id&&task.tip&&(
                            <div className="tip-box" dangerouslySetInnerHTML={{__html:`💡 ${task.tip.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")}`}}/>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>)}
          </main>
        </div>

        <div className="mob-bar">
          {quests.map(q=>{const qp=getQuestProg(q);return(
            <button key={q.id} className={`mob-tab ${activeQuest===q.id?"on":""}`}
              onClick={()=>{setActiveQuest(q.id);setActiveTask(null)}}>
              <span className="mob-tab-icon">{q.emoji}</span>
              {qp.pct===100?"✓":q.title}
            </button>
          )})}
        </div>
      </>)}
    </div>
  );
}
