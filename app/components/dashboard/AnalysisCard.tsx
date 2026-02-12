"use client";

import { useState } from "react";
import type { Analysis, RequirementsSummary } from "@/types";

interface AnalysisCardProps {
  analysis: Analysis | null;
  requirementsSummary: RequirementsSummary | null;
}

export function AnalysisCard({ analysis, requirementsSummary }: AnalysisCardProps) {
  const [showFull, setShowFull] = useState(false);

  return (
    <>
      {/* Requirements summary */}
      {requirementsSummary && (
        <div className="p-5 rounded-2xl bg-[var(--accent-blue)]/5 dark:bg-[var(--accent-blue)]/8 border border-[var(--accent-blue)]/15 dark:border-[var(--accent-blue)]/20 mb-5 animate-rise-fast">
          <div className="text-[11px] font-semibold text-[var(--accent-blue)] mb-3 uppercase tracking-[0.06em] font-mono">
            📋 Ce que le cahier des charges attend de vous
          </div>

          {requirementsSummary.main_objective && (
            <div className="text-[15px] font-semibold mb-3 leading-snug">{requirementsSummary.main_objective}</div>
          )}

          {showFull && (
            <div id="requirements-details">
              {requirementsSummary.deliverables && requirementsSummary.deliverables.length > 0 && (
                <div className="mb-3.5">
                  <div className="text-xs font-semibold mb-1.5">Livrables attendus</div>
                  <ul className="m-0 pl-[18px] text-[13px] text-[var(--text-secondary)] leading-relaxed">
                    {requirementsSummary.deliverables.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}

              {requirementsSummary.constraints && requirementsSummary.constraints.length > 0 && (
                <div className="mb-3.5">
                  <div className="text-xs font-semibold mb-1.5">Contraintes &amp; exigences</div>
                  <ul className="m-0 pl-[18px] text-[13px] text-[var(--text-secondary)] leading-relaxed">
                    {requirementsSummary.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {requirementsSummary.evaluation_criteria && requirementsSummary.evaluation_criteria.length > 0 && (
                <div className="mb-3.5">
                  <div className="text-xs font-semibold mb-1.5">Critères d&apos;évaluation</div>
                  <ul className="m-0 pl-[18px] text-[13px] text-[var(--text-secondary)] leading-relaxed">
                    {requirementsSummary.evaluation_criteria.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => setShowFull(!showFull)}
            className="bg-transparent border-none text-[var(--accent-blue)] text-xs font-medium cursor-pointer p-0 py-1 font-sans"
            aria-expanded={showFull}
            aria-controls="requirements-details"
            aria-label={showFull ? "Voir moins de détails" : "Voir plus de détails"}
          >
            {showFull ? "▲ Voir moins" : "▼ Voir plus"}
          </button>

          <div className="mt-3.5 pt-3 border-t border-[var(--border-glass)] text-[10px] text-[var(--text-tertiary)] leading-relaxed italic">
            ⚠️ Cet outil est fourni à titre pédagogique uniquement. L&apos;IA peut commettre des erreurs. Vous êtes seul
            responsable de vos décisions académiques.
          </div>
        </div>
      )}

      {/* Analysis info */}
      {analysis && (
        <div className="p-5 rounded-2xl glass border border-[var(--border-glass)] mb-5 animate-rise-fast">
          <div className="text-[11px] font-semibold text-[var(--accent-blue)] mb-2 uppercase tracking-[0.06em] font-mono">
            Analyse de votre sujet
          </div>
          <div className="text-sm font-semibold mb-2">{analysis.subject}</div>
          {analysis.keywords && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {analysis.keywords.map((k, i) => (
                <span
                  key={i}
                  className="text-[11px] px-2.5 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent-blue)] font-medium"
                >
                  {k}
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-4 mt-2.5 text-xs text-[var(--text-tertiary)]">
            {analysis.difficulty && <span>Difficulté : {analysis.difficulty}</span>}
            {analysis.estimated_weeks && <span>~{analysis.estimated_weeks} semaines</span>}
          </div>
        </div>
      )}
    </>
  );
}
