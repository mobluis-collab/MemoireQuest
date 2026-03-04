import { useState } from "react";

/* ─── Data ───────────────────────────────────────────────────── */
const CHAPTERS = [
  { num: "01", title: "Cadrage du sujet",     sections: 4, done: 4,
    sectionList: ["Problématique","Délimitation du sujet","Hypothèses de recherche","Plan général"] },
  { num: "02", title: "Revue de littérature", sections: 5, done: 3,
    sectionList: ["État de l'art","Auteurs clés","Théories principales","Lacunes identifiées","Positionnement"] },
  { num: "03", title: "Méthodologie",         sections: 4, done: 1,
    sectionList: ["Approche choisie","Terrain & échantillon","Outils de collecte","Limites méthodologiques"] },
  { num: "04", title: "Collecte de données",  sections: 6, done: 0,
    sectionList: ["Protocole","Entretiens","Questionnaires","Observation","Données secondaires","Codage"] },
  { num: "05", title: "Analyse & résultats",  sections: 5, done: 0,
    sectionList: ["Traitement des données","Analyse thématique","Résultats principaux","Discussion","Lien aux hypothèses"] },
  { num: "06", title: "Rédaction finale",     sections: 4, done: 0,
    sectionList: ["Introduction générale","Conclusion","Bibliographie","Annexes"] },
];
const NAV = [
  { icon: "⊞", label: "Dashboard"    },
  { icon: "◎", label: "Mon mémoire"  },
  { icon: "◈", label: "Progression"  },
  { icon: "◇", label: "Achievements" },
];
const START    = new Date("2025-09-01");
const DEADLINE = new Date("2026-06-15");
const TODAY    = new Date("2026-03-01");

const daysBetween = (a, b) => Math.round((b - a) / 864e5);
const addDays     = (d, n) => { const x = new Date(d); x.setDate(x.getDate()+n); return x; };
const fmt         = (d, s="short") => d.toLocaleDateString("fr-FR",{day:"numeric",month:s});
const FONT        = "-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif";

/* ─── Palette ────────────────────────────────────────────────── */
const C = {
  indigo:   "#6366f1",
  indigoDk: "#4338ca",
  sky:      "#38bdf8",
  violet:   "#a78bfa",
  emerald:  "#34d399",
  amber:    "#fbbf24",
  rose:     "#fb7185",
};

/* ─── CSS global (grain + animations) ───────────────────────── */
const GLOBAL_CSS = `
  @keyframes drift {
    0%   { transform: translate(0,0) scale(1);   }
    33%  { transform: translate(-20px,15px) scale(1.04); }
    66%  { transform: translate(15px,-10px) scale(0.97); }
    100% { transform: translate(0,0) scale(1);   }
  }
  @keyframes pulse-today {
    0%,100% { box-shadow: 0 0 0 0px ${C.amber}88, 0 0 6px ${C.amber}; opacity:1; }
    50%     { box-shadow: 0 0 0 3px ${C.amber}22, 0 0 14px ${C.amber}; opacity:0.75; }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }
  @keyframes arc-in {
    from { stroke-dasharray: 0 9999; }
  }
  @keyframes float-orb {
    0%,100% { transform:translate(0,0); }
    50%     { transform:translate(-30px,20px); }
  }
  @keyframes panel-in {
    from { transform: translateX(100%); opacity: 0; }
    to   { transform: translateX(0);    opacity: 1; }
  }
  @keyframes overlay-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  * { box-sizing: border-box; margin:0; padding:0; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 99px; }
`;

/* ─── Gradient border helper ─────────────────────────────────── */
function GBorder({ gradient, radius=18, children, style={} }) {
  return (
    <div style={{
      background: gradient,
      padding: "1px",
      borderRadius: radius,
      ...style,
    }}>
      <div style={{ borderRadius: radius-1, height:"100%", overflow:"hidden" }}>
        {children}
      </div>
    </div>
  );
}

/* ─── Arc SVG ────────────────────────────────────────────────── */
function Arc({ pct }) {
  const R=68, SW=8, C2=86, circ=2*Math.PI*R;
  const dash=(pct/100)*circ;
  return (
    <svg width={C2*2} height={C2*2} viewBox={`0 0 ${C2*2} ${C2*2}`} style={{overflow:"visible",flexShrink:0}}>
      <defs>
        <linearGradient id="ag" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={C.sky}/>
          <stop offset="100%" stopColor={C.indigo}/>
        </linearGradient>
        <filter id="arcglow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Track */}
      <circle cx={C2} cy={C2} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={SW}/>
      {/* Arc */}
      <circle cx={C2} cy={C2} r={R} fill="none"
        stroke="url(#ag)" strokeWidth={SW} strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ*0.25}
        filter="url(#arcglow)"
        style={{animation:"arc-in 1.2s cubic-bezier(.4,0,.2,1) both"}}/>
      {/* Label */}
      <text x={C2} y={C2-10} textAnchor="middle" fill="white"
        fontSize="34" fontWeight="800" fontFamily={FONT} letterSpacing="-1.5">{pct}</text>
      <text x={C2} y={C2+14} textAnchor="middle" fill="rgba(255,255,255,0.38)"
        fontSize="12" fontFamily={FONT} fontWeight="500">% terminé</text>
    </svg>
  );
}

/* ─── Dot grid ───────────────────────────────────────────────── */
function DotGrid() {
  const total   = daysBetween(START, DEADLINE);
  const elapsed = Math.min(daysBetween(START, TODAY), total);
  const COLS = 55;
  const rows = Math.ceil(total / COLS);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:2.5}}>
      {Array.from({length:rows},(_,r)=>(
        <div key={r} style={{display:"flex",gap:2.5}}>
          {Array.from({length:COLS},(_,c)=>{
            const i=r*COLS+c;
            if(i>=total) return null;
            const isElapsed=i<elapsed, isToday=i===elapsed-1;
            return (
              <div key={c} title={fmt(addDays(START,i),"long")} style={{
                width:5,height:5,borderRadius:1.5,flexShrink:0,
                background: isToday ? C.amber
                  : isElapsed
                    ? `rgba(99,102,241,${0.35 + (i/elapsed)*0.45})`
                    : "rgba(255,255,255,0.09)",
                animation: isToday ? "pulse-today 2s ease-in-out infinite" : "none",
                transition: "background 0.3s",
              }}/>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ─── Chapter card ───────────────────────────────────────────── */
function ChapterCard({ ch, fill, onClick }) {
  const [h,setH]=useState(false);
  const pct  = Math.round((ch.done/ch.sections)*100);
  const done = pct===100, wip=pct>0&&!done;
  const col  = done ? C.emerald : wip ? C.sky : "rgba(255,255,255,0.15)";
  const grd  = done
    ? "linear-gradient(90deg,rgba(52,211,153,0.01),rgba(52,211,153,0.08))"
    : wip
      ? "linear-gradient(90deg,rgba(56,189,248,0.01),rgba(99,102,241,0.08))"
      : "transparent";
  return (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} onClick={onClick}
      style={{
        position:"relative",overflow:"hidden",
        borderRadius:13,
        background: h
          ? done ? "rgba(52,211,153,0.08)" : wip ? "rgba(56,189,248,0.07)" : "rgba(255,255,255,0.05)"
          : done ? "rgba(52,211,153,0.05)" : wip ? "rgba(56,189,248,0.04)" : "rgba(255,255,255,0.03)",
        border:`1px solid ${done?"rgba(52,211,153,0.25)":wip?"rgba(56,189,248,0.2)":"rgba(255,255,255,0.07)"}`,
        backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",
        padding:"0 20px",
        display:"flex", alignItems:"center",
        transition:"all 0.18s",
        transform: h?"translateY(-2px)":"none",
        boxShadow: h ? `0 8px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.07)` : "none",
        cursor:"pointer",
      }}>
      {/* Liquid fill */}
      <div style={{position:"absolute",left:0,top:0,bottom:0,width:`${pct}%`,background:grd,pointerEvents:"none",transition:"width 1s cubic-bezier(.4,0,.2,1)"}}/>
      {/* Left line */}
      {(done||wip)&&<div style={{position:"absolute",left:0,top:"18%",bottom:"18%",width:3,borderRadius:"0 2px 2px 0",background:col,boxShadow:`0 0 10px ${col}88`}}/>}
      <div style={{position:"relative",display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:11,color:"rgba(255,255,255,0.2)",fontWeight:700,width:16,flexShrink:0}}>{ch.num}</span>
        <span style={{flex:1,fontSize:13,fontWeight:done?400:wip?500:400,color:done?"rgba(255,255,255,0.35)":"rgba(255,255,255,0.85)",textDecoration:done?"line-through":"none",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{ch.title}</span>
        <span style={{fontSize:11,fontWeight:700,color:col,flexShrink:0,letterSpacing:"-0.2px"}}>
          {done?"✓ Terminé":wip?`${ch.done}/${ch.sections}`:"À faire"}
        </span>
      </div>
    </div>
  );
}

/* ─── Side Panel ─────────────────────────────────────────────── */
function SidePanel({ ch, onClose }) {
  const pct  = Math.round((ch.done / ch.sections) * 100);
  const R=28, SW=5, circ=2*Math.PI*R;
  const dash=(pct/100)*circ;

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{
        position:"fixed", inset:0, zIndex:50,
        background:"rgba(4,3,14,0.55)",
        backdropFilter:"blur(4px)",
        animation:"overlay-in 0.25s ease both",
        cursor:"pointer",
      }}/>

      {/* Panel */}
      <div style={{
        position:"fixed", top:0, right:0, bottom:0,
        width:400, zIndex:51,
        display:"flex", flexDirection:"column",
        background:"rgba(10,9,28,0.92)",
        backdropFilter:"blur(40px) saturate(180%)",
        borderLeft:"1px solid rgba(99,102,241,0.25)",
        animation:"panel-in 0.3s cubic-bezier(.4,0,.2,1) both",
        boxShadow:"-20px 0 60px rgba(0,0,0,0.5), inset 1px 0 0 rgba(99,102,241,0.15)",
      }}>

        {/* Header */}
        <div style={{
          padding:"24px 24px 20px",
          borderBottom:"1px solid rgba(255,255,255,0.06)",
          flexShrink:0,
        }}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
            <div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.28)",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>
                Chapitre {ch.num}
              </div>
              <h2 style={{fontSize:20,fontWeight:800,letterSpacing:"-0.5px",color:"#fff",lineHeight:1.2}}>{ch.title}</h2>
            </div>
            <button onClick={onClose} style={{
              width:30,height:30,borderRadius:"50%",border:"1px solid rgba(255,255,255,0.1)",
              background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.5)",
              fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
              flexShrink:0, marginTop:2,
              transition:"all 0.15s",
            }}>✕</button>
          </div>

          {/* Mini arc + stats */}
          <div style={{display:"flex",alignItems:"center",gap:16,marginTop:16}}>
            <svg width={70} height={70} viewBox="0 0 70 70" style={{flexShrink:0,overflow:"visible"}}>
              <defs>
                <linearGradient id="pg2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={C.sky}/>
                  <stop offset="100%" stopColor={C.indigo}/>
                </linearGradient>
                <filter id="glow2"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              </defs>
              <circle cx={35} cy={35} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={SW}/>
              <circle cx={35} cy={35} r={R} fill="none" stroke="url(#pg2)" strokeWidth={SW}
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circ}`}
                strokeDashoffset={circ*0.25}
                filter="url(#glow2)"/>
              <text x={35} y={38} textAnchor="middle" fill="white" fontSize="13" fontWeight="800" fontFamily={FONT}>{pct}%</text>
            </svg>
            <div style={{flex:1}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:12,color:"rgba(255,255,255,0.35)"}}>Sections terminées</span>
                <span style={{fontSize:12,fontWeight:700,color:C.sky}}>{ch.done}/{ch.sections}</span>
              </div>
              {/* Mini barre */}
              <div style={{height:4,borderRadius:99,background:"rgba(255,255,255,0.07)",overflow:"hidden"}}>
                <div style={{height:"100%",width:`${pct}%`,borderRadius:99,background:`linear-gradient(90deg,${C.sky},${C.indigo})`,boxShadow:`0 0 8px ${C.sky}66`}}/>
              </div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.22)",marginTop:5}}>
                {pct===100 ? "✓ Chapitre terminé" : pct===0 ? "Pas encore commencé" : `${ch.sections-ch.done} section${ch.sections-ch.done>1?"s":""} restante${ch.sections-ch.done>1?"s":""}`}
              </div>
            </div>
          </div>
        </div>

        {/* Sections list */}
        <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.25)",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:12}}>
            Sections
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {ch.sectionList.map((sec, i) => {
              const isDone = i < ch.done;
              const isNext = i === ch.done;
              return (
                <div key={i} style={{
                  display:"flex",alignItems:"center",gap:12,
                  padding:"12px 16px",borderRadius:11,
                  background: isDone
                    ? "rgba(52,211,153,0.06)"
                    : isNext
                      ? "rgba(99,102,241,0.1)"
                      : "rgba(255,255,255,0.03)",
                  border:`1px solid ${isDone?"rgba(52,211,153,0.2)":isNext?"rgba(99,102,241,0.25)":"rgba(255,255,255,0.06)"}`,
                  transition:"all 0.15s",
                  cursor: isDone ? "default" : "pointer",
                  boxShadow: isNext ? `0 0 20px rgba(99,102,241,0.12)` : "none",
                }}>
                  {/* Status dot */}
                  <div style={{
                    width:20,height:20,borderRadius:"50%",flexShrink:0,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    background: isDone
                      ? `rgba(52,211,153,0.2)`
                      : isNext
                        ? `rgba(99,102,241,0.25)`
                        : "rgba(255,255,255,0.06)",
                    border:`1px solid ${isDone?"rgba(52,211,153,0.4)":isNext?`rgba(99,102,241,0.5)`:"rgba(255,255,255,0.1)"}`,
                    fontSize:9,
                  }}>
                    {isDone ? <span style={{color:C.emerald}}>✓</span>
                      : isNext ? <span style={{color:C.indigo,fontWeight:800,fontSize:8}}>→</span>
                      : <span style={{color:"rgba(255,255,255,0.2)",fontSize:8}}>{i+1}</span>}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{
                      fontSize:13,fontWeight: isNext ? 600 : 400,
                      color: isDone ? "rgba(255,255,255,0.35)" : isNext ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)",
                      textDecoration: isDone ? "line-through" : "none",
                    }}>{sec}</div>
                    {isNext && <div style={{fontSize:10,color:"rgba(99,102,241,0.8)",marginTop:2,fontWeight:600}}>À faire maintenant ↗</div>}
                    {isDone && <div style={{fontSize:10,color:"rgba(52,211,153,0.6)",marginTop:2}}>Terminé</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer — action */}
        <div style={{
          padding:"16px 20px",
          borderTop:"1px solid rgba(255,255,255,0.06)",
          flexShrink:0,
        }}>
          <button style={{
            width:"100%",padding:"12px 20px",borderRadius:12,border:"none",cursor:"pointer",
            background:`linear-gradient(135deg,${C.indigo},${C.violet})`,
            color:"#fff",fontSize:13,fontWeight:700,letterSpacing:"-0.2px",
            boxShadow:`0 4px 20px ${C.indigo}55`,
            transition:"all 0.18s",
          }}>
            ✦ Demander de l'aide à l'IA pour ce chapitre
          </button>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.2)",textAlign:"center",marginTop:8}}>
            Claude peut t'aider à rédiger, structurer ou relire
          </div>
        </div>

      </div>
    </>
  );
}

/* ─── MAIN APP ───────────────────────────────────────────────── */
export default function Dashboard() {
  const [nav,setNav]=useState(0);
  const [dark,setDark]=useState(true);
  const [selectedCh, setSelectedCh]=useState(null);

  const total     = daysBetween(START,DEADLINE);
  const elapsed   = Math.min(daysBetween(START,TODAY),total);
  const remaining = total-elapsed;
  const timePct   = Math.round((elapsed/total)*100);
  const totalSec  = CHAPTERS.reduce((a,c)=>a+c.sections,0);
  const doneSec   = CHAPTERS.reduce((a,c)=>a+c.done,0);
  const pct       = Math.round((doneSec/totalSec)*100);
  const isAhead   = pct > timePct;

  return (
    <div style={{fontFamily:FONT,height:"100vh",overflow:"hidden",position:"relative",display:"flex",background:"#04030e"}}>
      <style>{GLOBAL_CSS}</style>

      {/* ── BACKGROUND layers ── */}

      {/* Grain texture via SVG */}
      <svg style={{position:"fixed",inset:0,width:"100%",height:"100%",opacity:0.35,zIndex:0,pointerEvents:"none"}} xmlns="http://www.w3.org/2000/svg">
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
        <rect width="100%" height="100%" filter="url(#grain)" opacity="0.12"/>
      </svg>

      {/* Aurora orbs */}
      {[
        {color:"rgba(99,102,241,0.22)",  x:"8%",  y:"5%",  w:700,h:600, delay:"0s"    },
        {color:"rgba(167,139,250,0.14)", x:"75%", y:"60%", w:600,h:550, delay:"-4s"   },
        {color:"rgba(56,189,248,0.10)",  x:"45%", y:"30%", w:500,h:400, delay:"-8s"   },
        {color:"rgba(52,211,153,0.07)",  x:"20%", y:"75%", w:400,h:350, delay:"-12s"  },
      ].map((o,i)=>(
        <div key={i} style={{
          position:"fixed", left:o.x, top:o.y,
          width:o.w, height:o.h, zIndex:0, pointerEvents:"none",
          background:`radial-gradient(ellipse, ${o.color} 0%, transparent 70%)`,
          animation:`drift 20s ease-in-out infinite`,
          animationDelay: o.delay,
        }}/>
      ))}

      {/* ── SIDEBAR ── */}
      <aside style={{
        width:216, flexShrink:0, height:"100vh",
        position:"relative", zIndex:10,
        display:"flex", flexDirection:"column",
        background:"rgba(255,255,255,0.027)",
        backdropFilter:"blur(32px) saturate(180%)",
        WebkitBackdropFilter:"blur(32px) saturate(180%)",
        borderRight:"1px solid rgba(255,255,255,0.065)",
      }}>
        {/* Logo */}
        <div style={{padding:"24px 18px 16px",borderBottom:"1px solid rgba(255,255,255,0.055)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{
              width:30,height:30,borderRadius:9,
              background:`linear-gradient(135deg,${C.indigo},${C.violet})`,
              display:"flex",alignItems:"center",justifyContent:"center",
              color:"#fff",fontSize:13,fontWeight:800,
              boxShadow:`0 4px 18px ${C.indigo}66`,
            }}>M</div>
            <div>
              <div style={{fontSize:13,fontWeight:700,letterSpacing:"-0.3px",color:"rgba(255,255,255,0.9)"}}>maimouarkwest</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.25)",letterSpacing:"0.3px"}}>Thesis OS v1.0</div>
            </div>
          </div>
        </div>

        {/* Avatar */}
        <div style={{padding:"14px 14px 12px",borderBottom:"1px solid rgba(255,255,255,0.055)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <div style={{
              width:34,height:34,borderRadius:"50%",flexShrink:0,
              background:`linear-gradient(135deg,${C.indigo},${C.violet})`,
              display:"flex",alignItems:"center",justifyContent:"center",
              color:"#fff",fontSize:14,fontWeight:800,
              boxShadow:`0 0 0 2px rgba(99,102,241,0.3), 0 4px 14px rgba(99,102,241,0.4)`,
            }}>L</div>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.9)"}}>Louis</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.32)",marginTop:1}}>Niv. 4 · Chercheur Jr.</div>
            </div>
          </div>
          {/* XP bar stylisée */}
          <div style={{height:3,borderRadius:99,background:"rgba(255,255,255,0.07)",overflow:"hidden",marginBottom:3}}>
            <div style={{
              height:"100%",width:"65%",borderRadius:99,
              background:`linear-gradient(90deg,${C.indigo},${C.violet})`,
              boxShadow:`0 0 10px ${C.indigo}88`,
              position:"relative",overflow:"hidden",
            }}>
              <div style={{
                position:"absolute",inset:0,
                background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)",
                backgroundSize:"200px 100%",
                animation:"shimmer 2.5s linear infinite",
              }}/>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <span style={{fontSize:9,color:"rgba(255,255,255,0.2)"}}>210 XP</span>
            <span style={{fontSize:9,color:"rgba(255,255,255,0.2)"}}>320 XP · niv. 5</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{flex:1,padding:"8px 7px"}}>
          {NAV.map((item,i)=>{
            const active=nav===i;
            return (
              <button key={i} onClick={()=>setNav(i)} style={{
                width:"100%",display:"flex",alignItems:"center",gap:9,
                padding:"8px 11px",borderRadius:9,border:"none",cursor:"pointer",
                background: active
                  ? `linear-gradient(90deg,rgba(99,102,241,0.2),rgba(167,139,250,0.1))`
                  : "transparent",
                color: active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.32)",
                fontSize:13,fontWeight:active?600:400,
                textAlign:"left",transition:"all 0.15s",marginBottom:1,
                boxShadow: active ? "inset 1px 0 0 rgba(99,102,241,0.6)" : "none",
              }}>
                <span style={{fontSize:11,opacity:active?1:0.7}}>{item.icon}</span>
                {item.label}
                {active && <div style={{marginLeft:"auto",width:4,height:4,borderRadius:"50%",background:C.indigo}}/>}
              </button>
            );
          })}
        </nav>

        {/* Footer sidebar */}
        <div style={{padding:"8px 7px",borderTop:"1px solid rgba(255,255,255,0.055)"}}>
          <button onClick={()=>setDark(!dark)} style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"8px 11px",borderRadius:9,border:"none",cursor:"pointer",background:"transparent",color:"rgba(255,255,255,0.28)",fontSize:12,textAlign:"left"}}>
            <span>{dark?"☀":"●"}</span> {dark?"Mode clair":"Mode sombre"}
          </button>
          <button style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"8px 11px",borderRadius:9,border:"none",cursor:"pointer",background:"transparent",color:"rgba(251,113,133,0.65)",fontSize:12,textAlign:"left"}}>
            <span>↩</span> Déconnexion
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{flex:1,height:"100vh",overflow:"hidden",padding:"24px 36px 20px",position:"relative",zIndex:1,display:"flex",flexDirection:"column",gap:10}}>

        {/* Row 1 — Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div>
            <h1 style={{
              fontSize:26,fontWeight:800,letterSpacing:"-0.6px",margin:0,
              background:`linear-gradient(90deg, rgba(255,255,255,0.95), rgba(255,255,255,0.55))`,
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
            }}>Bonjour, Louis.</h1>
            <p style={{fontSize:12.5,color:"rgba(255,255,255,0.32)",marginTop:3}}>
              {isAhead
                ? `🟢 Tu es en avance — profite-en pour consolider.`
                : `⚡ ${timePct-pct}% de retard sur le temps écoulé — pousse un peu plus.`}
            </p>
          </div>

          {/* Streak pill stylisée */}
          <div style={{
            display:"flex",alignItems:"center",gap:8,padding:"8px 16px",
            borderRadius:99,
            background:"rgba(251,191,36,0.08)",
            border:"1px solid rgba(251,191,36,0.22)",
            backdropFilter:"blur(16px)",
            boxShadow:"0 0 20px rgba(251,191,36,0.12)",
          }}>
            <span style={{fontSize:15}}>🔥</span>
            <span style={{fontSize:15,fontWeight:800,color:C.amber,letterSpacing:"-0.5px"}}>3</span>
            <span style={{fontSize:12,color:"rgba(255,255,255,0.38)"}}>jours de suite</span>
          </div>
        </div>

        {/* Grille unique : tout contrôlé par les proportions fr */}
        <div style={{flex:1,minHeight:0,display:"grid",gridTemplateColumns:"0.85fr 1.15fr",gridTemplateRows:"0.62fr 0.22fr 1fr",gap:10}}>

          {/* HERO : countdown + dot grid — span 2 rows */}
          <GBorder
            gradient={`linear-gradient(135deg, rgba(99,102,241,0.5), rgba(167,139,250,0.2), rgba(56,189,248,0.3))`}
            style={{}}>
            <div style={{
              height:"100%",padding:"22px 26px",
              background:"linear-gradient(145deg, rgba(99,102,241,0.1) 0%, rgba(4,3,14,0.95) 60%)",
              backdropFilter:"blur(28px)",WebkitBackdropFilter:"blur(28px)",
              display:"flex",flexDirection:"column",justifyContent:"space-between",
              borderRadius:17,
            }}>
              {/* Top */}
              <div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>Soutenance dans</div>
                <div style={{display:"flex",alignItems:"flex-end",gap:10,marginBottom:6}}>
                  <span style={{
                    fontSize:68,fontWeight:900,letterSpacing:"-3px",lineHeight:1,
                    background:`linear-gradient(135deg, #fff 30%, ${C.indigo})`,
                    WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
                  }}>{remaining}</span>
                  <div style={{paddingBottom:8}}>
                    <div style={{fontSize:16,color:"rgba(255,255,255,0.5)",fontWeight:500}}>jours</div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,0.22)"}}>≈ {Math.round(remaining/7)} semaines</div>
                  </div>
                </div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.25)",letterSpacing:"0.2px"}}>
                  Deadline · <span style={{color:"rgba(255,255,255,0.5)",fontWeight:500}}>{fmt(DEADLINE,"long")} 2026</span>
                </div>
              </div>

              {/* Dot grid */}
              <div style={{padding:"4px 0"}}>
                <DotGrid/>
              </div>

              {/* Timeline */}
              <div>
                <div style={{height:2,borderRadius:99,background:"rgba(255,255,255,0.06)",overflow:"visible",position:"relative",marginBottom:7}}>
                  <div style={{height:"100%",width:`${timePct}%`,borderRadius:99,background:`linear-gradient(90deg,${C.indigo},${C.violet})`,boxShadow:`0 0 12px ${C.indigo}66`}}/>
                  <div style={{position:"absolute",left:`${timePct}%`,top:"50%",transform:"translate(-50%,-50%)",width:8,height:8,borderRadius:"50%",background:C.amber,boxShadow:`0 0 10px ${C.amber}`}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontSize:10,color:"rgba(255,255,255,0.2)"}}>1 sept. 2025</span>
                  <span style={{fontSize:10,color:"rgba(255,255,255,0.35)",fontWeight:600}}>{timePct}% du temps écoulé</span>
                  <span style={{fontSize:10,color:"rgba(255,255,255,0.2)"}}>15 juin 2026</span>
                </div>
              </div>
            </div>
          </GBorder>

          {/* ARC de progression */}
          <GBorder gradient={`linear-gradient(135deg, rgba(56,189,248,0.4), rgba(99,102,241,0.2), rgba(4,3,14,0.1))`}>
            <div style={{
              height:"100%",padding:"20px 22px",
              background:"linear-gradient(145deg, rgba(56,189,248,0.07) 0%, rgba(4,3,14,0.95) 70%)",
              backdropFilter:"blur(28px)",WebkitBackdropFilter:"blur(28px)",
              display:"flex",alignItems:"center",gap:20,
              borderRadius:17,
            }}>
              <Arc pct={pct}/>
              <div style={{flex:1}}>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.28)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:16}}>Avancement</div>
                {[
                  {label:"Sections faites", val:`${doneSec}/${totalSec}`, color:C.sky     },
                  {label:"Chapitres finis",  val:"1/6",                   color:C.emerald },
                  {label:"En cours",         val:"2 chapitres",           color:C.violet  },
                  {label:"Temps restant",    val:`${100-timePct}%`,       color:C.amber   },
                ].map(s=>(
                  <div key={s.label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,gap:8,whiteSpace:"nowrap"}}>
                    <span style={{fontSize:11.5,color:"rgba(255,255,255,0.32)",whiteSpace:"nowrap"}}>{s.label}</span>
                    <span style={{fontSize:11.5,fontWeight:700,color:s.color,whiteSpace:"nowrap"}}>{s.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </GBorder>

          {/* STATS — pleine largeur */}
          <GBorder gradient={`linear-gradient(90deg, rgba(99,102,241,0.4), rgba(167,139,250,0.3), rgba(251,191,36,0.3))`} style={{gridColumn:"1/3"}}>
            <div style={{
              height:"100%",padding:"16px 20px",
              background:"rgba(4,3,14,0.88)",
              backdropFilter:"blur(28px)",WebkitBackdropFilter:"blur(28px)",
              display:"flex",alignItems:"center",
              borderRadius:17,
            }}>
              {[
                {label:"Niveau",   val:"4",   sub:"Chercheur Junior",   col:C.indigo, glow:C.indigo  },
                {label:"XP Total", val:"210", sub:"110 XP avant niv. 5", col:C.violet, glow:C.violet  },
                {label:"Série",    val:"3j",  sub:"Record perso : 12j 🏅",col:C.amber,  glow:C.amber   },
              ].map((s,i)=>(
                <div key={i} style={{
                  flex:1,textAlign:"center",
                  borderRight:i<2?`1px solid rgba(255,255,255,0.055)`:"none",
                  padding:"0 24px",
                }}>
                  <div style={{fontSize:10,color:"rgba(255,255,255,0.28)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:6}}>{s.label}</div>
                  <div style={{
                    fontSize:36,fontWeight:900,letterSpacing:"-1px",lineHeight:1,
                    color:"#fff",
                    textShadow:`0 0 28px ${s.glow}77`,
                    marginBottom:5,
                  }}>{s.val}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.25)"}}>{s.sub}</div>
                </div>
              ))}
            </div>
          </GBorder>

          {/* CHAPITRES — row 3, full width, flex pour remplir l'espace */}
          <div style={{gridColumn:"1/3",display:"flex",flexDirection:"column",gap:7,minHeight:0}}>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.25)",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",flexShrink:0}}>Chapitres</div>
            <div style={{flex:1,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gridTemplateRows:"1fr 1fr",gap:7}}>
              {CHAPTERS.map(ch=><ChapterCard key={ch.num} ch={ch} fill onClick={()=>setSelectedCh(ch)}/>)}
            </div>
          </div>

        </div>

      </main>

      {/* Side Panel */}
      {selectedCh && <SidePanel ch={selectedCh} onClose={()=>setSelectedCh(null)}/>}

    </div>
  );
}
