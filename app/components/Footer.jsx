"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Footer() {
  const [dk, setDk] = useState(true);

  useEffect(() => {
    // Observe the .root element's background to detect theme
    const check = () => {
      const root = document.querySelector(".root");
      if (root) {
        const bg = getComputedStyle(root).backgroundColor;
        // Dark mode has black/very dark bg, light mode has light bg
        setDk(bg === "rgb(0, 0, 0)" || bg === "#000000" || bg === "rgba(0, 0, 0, 0)");
      }
    };
    check();
    const observer = new MutationObserver(check);
    const root = document.querySelector(".root");
    if (root) observer.observe(root, { attributes: true, attributeFilter: ["style", "class"] });
    // Also check periodically as a fallback
    const interval = setInterval(check, 1000);
    return () => { observer.disconnect(); clearInterval(interval); };
  }, []);

  const textColor = dk ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.3)";
  const linkColor = dk ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)";
  const bgGradient = dk
    ? "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)"
    : "linear-gradient(to top, rgba(245,245,247,0.8) 0%, transparent 100%)";

  return (
    <footer
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        textAlign: "center",
        padding: "10px 20px",
        fontSize: "11px",
        color: textColor,
        fontFamily:
          "-apple-system, 'SF Pro Display', 'Helvetica Neue', 'Inter', sans-serif",
        background: bgGradient,
        pointerEvents: "none",
        transition: "color .3s, background .3s",
      }}
    >
      <div style={{ pointerEvents: "auto" }}>
        <Link
          href="/privacy"
          style={{ color: linkColor, textDecoration: "none", transition: "color .3s" }}
        >
          Politique de confidentialit&eacute;
        </Link>
        <span style={{ margin: "0 8px" }}>|</span>
        <Link
          href="/mentions-legales"
          style={{ color: linkColor, textDecoration: "none", transition: "color .3s" }}
        >
          Mentions l&eacute;gales
        </Link>
        <span style={{ margin: "0 8px" }}>|</span>
        <Link
          href="/cgu"
          style={{ color: linkColor, textDecoration: "none", transition: "color .3s" }}
        >
          CGU
        </Link>
      </div>
    </footer>
  );
}
