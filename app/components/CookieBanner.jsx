"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookies_accepted");
    if (!accepted) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookies_accepted", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: "16px 20px",
        background: "rgba(30,30,32,0.85)",
        backdropFilter: "blur(40px) saturate(1.8)",
        WebkitBackdropFilter: "blur(40px) saturate(1.8)",
        borderTop: "0.5px solid rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        flexWrap: "wrap",
        fontFamily: "-apple-system, 'SF Pro Display', 'Helvetica Neue', 'Inter', sans-serif",
      }}
    >
      <p
        style={{
          color: "rgba(255,255,255,0.75)",
          fontSize: "13px",
          lineHeight: 1.5,
          margin: 0,
          maxWidth: "600px",
          textAlign: "center",
        }}
      >
        Ce site utilise des cookies pour gérer votre connexion et sauvegarder
        votre progression.
      </p>
      <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
        <button
          onClick={accept}
          style={{
            padding: "7px 20px",
            borderRadius: "980px",
            border: "none",
            background: "#0071e3",
            color: "white",
            fontFamily: "inherit",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Accepter
        </button>
        <Link
          href="/privacy"
          style={{
            padding: "7px 18px",
            borderRadius: "980px",
            border: "0.5px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.06)",
            color: "#f5f5f7",
            fontFamily: "inherit",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          En savoir plus
        </Link>
      </div>
    </div>
  );
}
