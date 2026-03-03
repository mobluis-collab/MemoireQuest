import { useState } from "react";

const FONT = "-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif";

/* ── Fake data with hints ── */
const MOCK_CHAPTERS = [
  {
    num: "1",
    title: "Introduction et contexte du projet",
    sections: 5,
    done: 2,
    sectionList: [
      { text: "Présentation du cadre pédagogique et objectifs du mémoire", difficulty: "medium", hint: "Reprends les objectifs mentionnés dans ton cahier des charges, notamment la partie sur le contexte académique et les compétences visées." },
      { text: "Présentation de l'entreprise ou du porteur de projet", difficulty: "medium", hint: "Décris l'activité principale de ton entreprise d'accueil et sa position sur le marché, en lien avec ta mission." },
      { text: "Justification du choix du client et pertinence du besoin identifié", difficulty: "medium", hint: "Appuie-toi sur les éléments du cahier des charges qui décrivent le besoin initial et les problématiques concrètes rencontrées." },
      { text: "Analyse du contexte marché et concurrentiel", difficulty: "hard", hint: "Identifie 3-4 concurrents directs et positionne ta solution par rapport à eux. Utilise les données marché de ton secteur." },
      { text: "Problématique centrale et hypothèses de travail", difficulty: "hard", hint: "Formule ta problématique sous forme de question ouverte. Elle doit relier le besoin client, la solution technique et la valeur ajoutée." },
    ],
  },
  {
    num: "2",
    title: "Cadre théorique et méthodologique",
    sections: 4,
    done: 0,
    sectionList: [
      { text: "Revue de littérature et fondements théoriques", difficulty: "hard", hint: "Cite au moins 3 sources académiques en lien avec ta thématique. Privilégie les articles récents (< 5 ans)." },
      { text: "Méthodologie de recherche et justification des choix", difficulty: "medium", hint: "Explique pourquoi tu as choisi cette approche méthodologique et en quoi elle est adaptée à ta problématique." },
      { text: "Outils et technologies utilisés", difficulty: "easy", hint: "Liste les technologies de ta stack et justifie chaque choix par rapport aux besoins du projet." },
      { text: "Limites de la méthodologie choisie", difficulty: "medium", hint: "Identifie au moins 2 limites de ton approche et propose des pistes d'amélioration." },
    ],
  },
  {
    num: "3",
    title: "Réalisation et mise en œuvre",
    sections: 5,
    done: 0,
    sectionList: [
      { text: "Architecture technique et choix de conception", difficulty: "hard", hint: "Présente un schéma d'architecture (même simplifié) et explique les décisions techniques clés." },
      { text: "Développement des fonctionnalités principales", difficulty: "medium", hint: "Détaille le développement de 2-3 fonctionnalités clés avec les défis rencontrés et les solutions apportées." },
      { text: "Gestion de projet et planning", difficulty: "easy", hint: "Présente ton planning prévisionnel vs réel. Explique les écarts éventuels." },
      { text: "Tests et assurance qualité", difficulty: "medium", hint: "Décris ta stratégie de test : quels types de tests, quelle couverture, quels outils." },
      { text: "Déploiement et mise en production", difficulty: "medium", hint: "Explique ton pipeline de déploiement et les choix d'hébergement." },
    ],
  },
  {
    num: "4",
    title: "Résultats et analyse critique",
    sections: 3,
    done: 0,
    sectionList: [
      { text: "Présentation des résultats obtenus", difficulty: "medium", hint: "Présente les résultats concrets : métriques, retours utilisateurs, objectifs atteints." },
      { text: "Analyse critique et retour d'expérience", difficulty: "hard", hint: "Fais un bilan honnête : qu'est-ce qui a bien fonctionné, qu'est-ce que tu ferais différemment ?" },
      { text: "Perspectives d'évolution et recommandations", difficulty: "medium", hint: "Propose 3-4 axes d'amélioration concrets et réalistes pour la suite du projet." },
    ],
  },
];

const MOCK_PROGRESS = {
  "1": { "0": "done", "1": "done" },
};

function MemoireViewPreview({ chapters, questProgress }) {
  const [openChapter, setOpenChapter] = useState("1");
  const [hoveredChapter, setHoveredChapter] = useState(null);

  const totalSec = chapters.reduce((a, c) => a + c.sections, 0);
  const doneSec = chapters.reduce((a, c) => a + c.done, 0);
  const globalPct = totalSec > 0 ? Math.round((doneSec / totalSec) * 100) : 0;

  return (
    <div
      style={{
        fontFamily: FONT,
        background: "#04030e",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        color: "rgba(255,255,255,0.85)",
        padding: "24px 36px 20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          marginBottom: 16,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "-0.5px",
              margin: 0,
              color: "rgba(255,255,255,0.90)",
            }}
          >
            Mon memoire
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.45)",
              marginTop: 6,
            }}
          >
            {doneSec} / {totalSec} sections -- {globalPct}%
          </p>
        </div>
        <div style={{ width: 200 }}>
          <div
            style={{
              height: 4,
              borderRadius: 99,
              background: "rgba(255,255,255,0.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${globalPct}%`,
                borderRadius: 99,
                background: "rgba(255,255,255,0.35)",
                transition: "width 0.8s cubic-bezier(.4,0,.2,1)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Chapters — SCROLLABLE */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          paddingRight: 4,
        }}
      >
        {chapters.map((ch) => {
          const isOpen = openChapter === ch.num;
          const isHovered = hoveredChapter === ch.num;
          const pct =
            ch.sections > 0 ? Math.round((ch.done / ch.sections) * 100) : 0;
          const done = pct === 100;
          const wip = pct > 0 && !done;
          const chProgress = questProgress[ch.num] ?? {};

          return (
            <div
              key={ch.num}
              style={{
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.02)",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {/* Chapter header */}
              <div
                onClick={() => setOpenChapter(isOpen ? null : ch.num)}
                onMouseEnter={() => setHoveredChapter(ch.num)}
                onMouseLeave={() => setHoveredChapter(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 20px",
                  cursor: "pointer",
                  background: isHovered
                    ? "rgba(255,255,255,0.03)"
                    : "transparent",
                  transition: "background 0.15s",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.45)",
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {ch.num}
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: done
                        ? "rgba(255,255,255,0.55)"
                        : "rgba(255,255,255,0.90)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {ch.title}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.35)",
                      marginTop: 2,
                    }}
                  >
                    {ch.done}/{ch.sections} sections
                  </div>
                </div>

                <div style={{ width: 100, flexShrink: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        color: "rgba(255,255,255,0.45)",
                      }}
                    >
                      {done ? "Termine" : wip ? "En cours" : "A faire"}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.65)",
                      }}
                    >
                      {pct}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 3,
                      borderRadius: 99,
                      background: "rgba(255,255,255,0.08)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        borderRadius: 99,
                        background: done
                          ? "rgba(255,255,255,0.45)"
                          : "rgba(255,255,255,0.25)",
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.35)",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                    flexShrink: 0,
                  }}
                >
                  &#9662;
                </div>
              </div>

              {/* Sections with hints */}
              {isOpen && (
                <div
                  style={{
                    padding: "0 20px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      height: 1,
                      background: "rgba(255,255,255,0.04)",
                      marginBottom: 4,
                    }}
                  />
                  {ch.sectionList.map((sec, i) => {
                    const isDone = chProgress[String(i)] === "done";
                    const isNext =
                      !isDone &&
                      Array.from(
                        { length: i },
                        (_, j) => chProgress[String(j)] === "done"
                      ).every(Boolean);

                    return (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                          padding: "11px 16px",
                          borderRadius: 10,
                          background: isNext
                            ? "rgba(255,255,255,0.05)"
                            : "rgba(255,255,255,0.02)",
                          border: `1px solid ${isNext ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)"}`,
                          cursor: isDone || isNext ? "pointer" : "default",
                        }}
                      >
                        {/* Status circle */}
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: isDone
                              ? "rgba(255,255,255,0.10)"
                              : isNext
                                ? "rgba(255,255,255,0.08)"
                                : "rgba(255,255,255,0.02)",
                            border: `1.5px solid ${isDone ? "rgba(255,255,255,0.25)" : isNext ? "rgba(255,255,255,0.20)" : "rgba(255,255,255,0.08)"}`,
                            fontSize: 10,
                            marginTop: 2,
                          }}
                        >
                          {isDone ? (
                            <span
                              style={{ color: "rgba(255,255,255,0.55)" }}
                            >
                              &#10003;
                            </span>
                          ) : isNext ? (
                            <span
                              style={{
                                color: "rgba(255,255,255,0.6)",
                                fontWeight: 800,
                                fontSize: 9,
                              }}
                            >
                              &#8594;
                            </span>
                          ) : (
                            <span
                              style={{
                                color: "rgba(255,255,255,0.20)",
                                fontSize: 9,
                              }}
                            >
                              {i + 1}
                            </span>
                          )}
                        </div>

                        {/* Text + hint */}
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: isNext ? 600 : 400,
                              color: isDone
                                ? "rgba(255,255,255,0.50)"
                                : isNext
                                  ? "rgba(255,255,255,0.90)"
                                  : "rgba(255,255,255,0.65)",
                            }}
                          >
                            {sec.text}
                          </div>
                          {/* HINT / CONSEIL */}
                          {sec.hint && (
                            <div
                              style={{
                                fontSize: 11,
                                color: "rgba(255,255,255,0.35)",
                                marginTop: 5,
                                lineHeight: 1.5,
                                fontStyle: "italic",
                                paddingLeft: 0,
                              }}
                            >
                              {sec.hint}
                            </div>
                          )}
                          {isNext && (
                            <div
                              style={{
                                fontSize: 10,
                                color: "rgba(255,255,255,0.45)",
                                marginTop: 3,
                              }}
                            >
                              Cliquer pour valider
                            </div>
                          )}
                          {isDone && (
                            <div
                              style={{
                                fontSize: 10,
                                color: "rgba(255,255,255,0.30)",
                                marginTop: 3,
                              }}
                            >
                              Cliquer pour annuler
                            </div>
                          )}
                        </div>

                        {/* Difficulty */}
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 600,
                            flexShrink: 0,
                            padding: "2px 7px",
                            borderRadius: 99,
                            background: "rgba(255,255,255,0.04)",
                            color: "rgba(255,255,255,0.35)",
                            marginTop: 2,
                          }}
                        >
                          {sec.difficulty === "hard"
                            ? "difficile"
                            : sec.difficulty === "medium"
                              ? "moyen"
                              : "facile"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Preview() {
  return (
    <MemoireViewPreview
      chapters={MOCK_CHAPTERS}
      questProgress={MOCK_PROGRESS}
    />
  );
}
