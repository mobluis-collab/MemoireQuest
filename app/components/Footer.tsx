"use client";

import Link from "next/link";
import { useTheme } from "@/context/ThemeProvider";
import { useApp } from "@/context/AppProvider";

export default function Footer() {
  const { isDark } = useTheme();
  const { state } = useApp();
  const isDashboard = state.page === "dashboard";

  return (
    <footer
      className={`fixed bottom-0 left-0 right-0 z-40 text-center py-2.5 px-5 text-[11px] pointer-events-none transition-colors duration-300 pb-[env(safe-area-inset-bottom,0px)] ${
        isDashboard ? "max-md:hidden" : ""
      }`}
      style={{
        color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.44)",
        background: isDark
          ? "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)"
          : "linear-gradient(to top, rgba(245,245,247,0.8) 0%, transparent 100%)",
      }}
    >
      <nav className="pointer-events-auto" aria-label="Liens juridiques">
        <Link
          href="/privacy"
          className="no-underline transition-colors duration-300 hover:opacity-80"
          style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}
        >
          Politique de confidentialit&eacute;
        </Link>
        <span className="mx-2" aria-hidden="true">
          |
        </span>
        <Link
          href="/mentions-legales"
          className="no-underline transition-colors duration-300 hover:opacity-80"
          style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}
        >
          Mentions l&eacute;gales
        </Link>
        <span className="mx-2" aria-hidden="true">
          |
        </span>
        <Link
          href="/cgu"
          className="no-underline transition-colors duration-300 hover:opacity-80"
          style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}
        >
          CGU
        </Link>
      </nav>
    </footer>
  );
}
