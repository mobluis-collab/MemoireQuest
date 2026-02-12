"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/context/AppProvider";
import { FALLBACK_QUESTS } from "@/lib/fallback-quests";
import type { User } from "@supabase/supabase-js";

export function useUserData() {
  const { state, dispatch } = useApp();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataChecked, setDataChecked] = useState(false);
  const [cookieConsent, setCookieConsent] = useState<string | null>(null);

  const dataLoadedRef = useRef(false);
  const isLoadingDataRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(false);

  // Load cookie consent
  useEffect(() => {
    setCookieConsent(localStorage.getItem("cookie_consent"));
  }, []);

  const acceptCookies = useCallback(() => {
    localStorage.setItem("cookie_consent", "accepted");
    setCookieConsent("accepted");
  }, []);

  const refuseCookies = useCallback(() => {
    localStorage.setItem("cookie_consent", "refused");
    setCookieConsent("refused");
  }, []);

  // Load user data from Supabase
  const loadUserData = useCallback(
    async (userId: string) => {
      isLoadingDataRef.current = true;
      try {
        const { data, error } = await supabase.from("user_progress").select("*").eq("user_id", userId).single();

        if (error && error.code !== "PGRST116") {
          console.error("Error loading data:", error);
          return;
        }

        if (data) {
          dispatch({
            type: "LOAD_USER_DATA",
            payload: {
              quests: data.quests || FALLBACK_QUESTS,
              completedSteps: data.completed_steps || {},
              analysis: data.analysis || null,
              requirementsSummary: data.requirements_summary || null,
              domain: data.domain || null,
              activeQuest: data.active_quest || 1,
            },
          });
        }
      } catch (e) {
        console.error("Error loading user data:", e);
      } finally {
        setDataChecked(true);
        setTimeout(() => {
          isLoadingDataRef.current = false;
        }, 3000);
      }
    },
    [dispatch]
  );

  // Auth listener
  useEffect(() => {
    mountedRef.current = true;
    dataLoadedRef.current = false;

    if (cookieConsent === "refused") {
      setAuthLoading(false);
      setDataChecked(true);
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);

      if (session?.user && !dataLoadedRef.current) {
        dataLoadedRef.current = true;
        await loadUserData(session.user.id);
        // Restore onboarding state after OAuth redirect (if no saved data was loaded)
        const pendingOnboard = sessionStorage.getItem("mq_pending_onboard");
        if (pendingOnboard) {
          sessionStorage.removeItem("mq_pending_onboard");
          try {
            const { domain } = JSON.parse(pendingOnboard);
            // Only restore if user has no saved progress (loadUserData didn't redirect to dashboard)
            if (state.page !== "dashboard") {
              dispatch({ type: "SET_DOMAIN", payload: domain });
              dispatch({ type: "SET_PAGE", payload: "onboard" });
            }
          } catch {
            /* ignore parse errors */
          }
        }
      } else if (event === "SIGNED_OUT") {
        dataLoadedRef.current = false;
        setDataChecked(false);
        dispatch({ type: "RESET" });
      } else if (!session?.user) {
        setDataChecked(true);
      }
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [cookieConsent, dispatch, loadUserData]);

  // Save function
  const saveUserData = useCallback(async () => {
    if (!user) return;
    dispatch({ type: "SET_SAVE_STATUS", payload: "saving" });

    try {
      const { error } = await supabase.from("user_progress").upsert(
        {
          user_id: user.id,
          quests: state.quests,
          completed_steps: state.completedSteps,
          analysis: state.analysis,
          requirements_summary: state.requirementsSummary,
          domain: state.domain,
          active_quest: state.activeQuest,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      if (error) throw error;
      dispatch({ type: "SET_SAVE_STATUS", payload: "saved" });
      setTimeout(() => dispatch({ type: "SET_SAVE_STATUS", payload: null }), 2000);
    } catch (e) {
      console.error("Error saving data:", e);
      dispatch({ type: "SET_SAVE_STATUS", payload: "error" });
    }
  }, [user, state, dispatch]);

  // Auto-save with debounce
  useEffect(() => {
    if (!user || state.page !== "dashboard" || isLoadingDataRef.current) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(saveUserData, 800);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [
    state.quests,
    state.completedSteps,
    state.analysis,
    state.requirementsSummary,
    state.domain,
    state.activeQuest,
    state.page,
    user,
    saveUserData,
  ]);

  // beforeunload flush — prevent data loss
  useEffect(() => {
    if (!user || state.page !== "dashboard") return;

    const handleBeforeUnload = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      // Synchronous save via sendBeacon
      const payload = JSON.stringify({
        user_id: user.id,
        quests: state.quests,
        completed_steps: state.completedSteps,
        analysis: state.analysis,
        requirements_summary: state.requirementsSummary,
        domain: state.domain,
        active_quest: state.activeQuest,
        updated_at: new Date().toISOString(),
      });
      navigator.sendBeacon?.("/api/user/save", payload);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [user, state]);

  // Sign in / out
  const signInWithGoogle = useCallback(async () => {
    if (cookieConsent === "refused") {
      alert("Vous devez accepter les cookies pour vous connecter.");
      return;
    }
    // Preserve onboarding state across OAuth redirect
    if (state.page === "onboard" && state.domain) {
      sessionStorage.setItem("mq_pending_onboard", JSON.stringify({ domain: state.domain }));
    }
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  }, [cookieConsent, state.page, state.domain]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  // Delete account (soft delete — sets deleted_at, data purged after 30 days)
  const deleteAccount = useCallback(async () => {
    if (!user) return;
    await supabase.from("user_progress").update({ deleted_at: new Date().toISOString() }).eq("user_id", user.id);
    await supabase.auth.signOut();
    dispatch({ type: "RESET" });
  }, [user, dispatch]);

  return {
    user,
    authLoading,
    dataChecked,
    cookieConsent,
    acceptCookies,
    refuseCookies,
    signInWithGoogle,
    signOut,
    saveUserData,
    deleteAccount,
  };
}
