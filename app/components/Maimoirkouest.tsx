"use client";

import { useState } from "react";
import { useApp } from "@/context/AppProvider";
import { useUserData } from "@/hooks/useUserData";
import { useAnalysis } from "@/hooks/useAnalysis";
import { Navbar } from "@/components/layout/Navbar";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { Landing } from "@/components/landing/Landing";
import { Onboarding } from "@/components/onboarding/Onboarding";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { AnalysisOverlay } from "@/components/dialogs/AnalysisOverlay";
import { SignInPrompt } from "@/components/dialogs/SignInPrompt";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { supabase } from "@/lib/supabase";
import { FALLBACK_QUESTS } from "@/lib/fallback-quests";

export default function Maimoirkouest() {
  const { state, dispatch } = useApp();
  const {
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
  } = useUserData();

  const { analyzing, analyzeStatus, progress, aiError, startAnalysis } = useAnalysis();
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);

  const handleReset = async () => {
    if (!window.confirm("Voulez-vous vraiment recommencer ? Toutes vos données seront effacées.")) return;
    if (user) {
      await supabase.from("user_progress").delete().eq("user_id", user.id);
    }
    dispatch({ type: "RESET" });
  };

  // Loading state while checking saved data
  if (user && !dataChecked) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background text-foreground transition-colors duration-500 overflow-x-hidden relative">
      {/* Decorative orbs — smaller on mobile */}
      <div
        className="orb w-[600px] h-[600px] max-sm:w-[300px] max-sm:h-[300px] bg-[radial-gradient(circle,#0071e3,transparent_70%)] -top-[200px] -right-[150px] max-sm:-top-[100px] max-sm:-right-[80px]"
        aria-hidden="true"
      />
      <div
        className="orb w-[500px] h-[500px] max-sm:w-[250px] max-sm:h-[250px] bg-[radial-gradient(circle,#bf5af2,transparent_70%)] -bottom-[150px] -left-[100px] max-sm:-bottom-[80px] max-sm:-left-[50px]"
        aria-hidden="true"
      />

      {/* SVG gradient definition for progress ring */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <linearGradient id="rG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0071e3" />
            <stop offset="100%" stopColor="#bf5af2" />
          </linearGradient>
        </defs>
      </svg>

      {/* Navigation */}
      <Navbar
        user={user}
        authLoading={authLoading}
        onSignIn={signInWithGoogle}
        onSignOut={signOut}
        onSave={saveUserData}
        onReset={handleReset}
      />

      {/* Pages */}
      {state.page === "landing" && <Landing user={user} onSignIn={signInWithGoogle} />}

      {state.page === "onboard" && (
        <Onboarding user={user} onSignIn={signInWithGoogle} onStartAnalysis={startAnalysis} />
      )}

      {state.page === "dashboard" && <Dashboard user={user} aiError={aiError} onDeleteAccount={deleteAccount} />}

      {/* Overlays */}
      {analyzing && <AnalysisOverlay status={analyzeStatus} progress={progress} />}

      {showSignInPrompt && !user && (
        <SignInPrompt onSignIn={signInWithGoogle} onDismiss={() => setShowSignInPrompt(false)} />
      )}

      {/* Cookie consent */}
      {cookieConsent === null && <CookieBanner onAccept={acceptCookies} onRefuse={refuseCookies} />}
    </div>
  );
}
