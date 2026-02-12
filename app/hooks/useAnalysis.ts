"use client";

import { useCallback, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/context/AppProvider";
import { FALLBACK_QUESTS } from "@/lib/fallback-quests";
import type { DomainId, AnalyzeResponse } from "@/types";

const CLIENT_TIMEOUT_MS = 120_000; // 120 seconds

const STATUS_MESSAGES = [
  { at: 0, msg: "Envoi du document…" },
  { at: 10, msg: "Analyse du sujet en cours…" },
  { at: 30, msg: "Identification des axes de travail…" },
  { at: 50, msg: "Structuration du plan personnalisé…" },
  { at: 70, msg: "Finalisation des quêtes…" },
  { at: 85, msg: "Presque terminé…" },
];

export function useAnalysis() {
  const { dispatch } = useApp();
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeStatus, setAnalyzeStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [aiError, setAiError] = useState<string | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const startAnalysis = useCallback(
    async (content: string, domain: DomainId, fileBase64?: string | null, fileType?: string | null) => {
      // Get current session for auth header
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const hasPdf = fileBase64 && fileType === "application/pdf";
      if (!hasPdf && !content?.trim()) return;

      setAnalyzing(true);
      setProgress(0);
      setAiError(null);
      setAnalyzeStatus(STATUS_MESSAGES[0].msg);

      // Abort controller for timeout
      abortRef.current = new AbortController();
      const timeoutId = setTimeout(() => {
        abortRef.current?.abort();
      }, CLIENT_TIMEOUT_MS);

      // Smooth progress animation with evolving status messages
      let prog = 0;
      progressRef.current = setInterval(() => {
        prog += Math.random() * 2.5 + 0.3;
        if (prog > 90) prog = 90;
        setProgress(prog);

        // Update status message based on progress
        const status = [...STATUS_MESSAGES].reverse().find((s) => prog >= s.at);
        if (status) setAnalyzeStatus(status.msg);
      }, 250);

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            text: hasPdf ? null : content,
            domain,
            fileBase64: hasPdf ? fileBase64 : null,
            fileType: hasPdf ? fileType : null,
          }),
          signal: abortRef.current.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Erreur réseau" }));
          throw new Error(err.error || `Erreur ${res.status}`);
        }

        const data: AnalyzeResponse = await res.json();

        if (data.error) throw new Error(data.error);

        setAnalyzeStatus("Plan prêt !");
        setProgress(95);

        if (data.quests && data.quests.length > 0) {
          dispatch({ type: "SET_QUESTS", payload: data.quests });
          dispatch({ type: "SET_ANALYSIS", payload: data.analysis || null });
          dispatch({ type: "SET_REQUIREMENTS_SUMMARY", payload: data.requirements_summary || null });
          dispatch({ type: "SET_ANALYSIS_SOURCE", payload: "ai" });
        }

        await new Promise((r) => setTimeout(r, 500));
        setProgress(100);
        await new Promise((r) => setTimeout(r, 400));

        if (progressRef.current) clearInterval(progressRef.current);
        setAnalyzing(false);
        dispatch({ type: "SET_ACTIVE_QUEST", payload: data.quests?.[0]?.id || 1 });
        dispatch({ type: "SET_PAGE", payload: "dashboard" });
      } catch (err) {
        clearTimeout(timeoutId);
        console.error("Analysis error:", err);
        if (progressRef.current) clearInterval(progressRef.current);

        const isTimeout = err instanceof DOMException && err.name === "AbortError";
        setAiError(
          isTimeout
            ? "L'analyse a pris trop de temps (>2min). On utilise le plan standard."
            : "L'analyse IA a rencontré une erreur. On utilise le plan standard."
        );
        dispatch({ type: "SET_QUESTS", payload: FALLBACK_QUESTS });
        dispatch({ type: "SET_ANALYSIS_SOURCE", payload: "fallback" });
        setProgress(100);
        await new Promise((r) => setTimeout(r, 800));
        setAnalyzing(false);
        dispatch({ type: "SET_PAGE", payload: "dashboard" });
      }
    },
    [dispatch]
  );

  return { analyzing, analyzeStatus, progress, aiError, startAnalysis };
}
