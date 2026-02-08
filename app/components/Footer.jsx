import Link from "next/link";

export default function Footer() {
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
        color: "rgba(255,255,255,0.25)",
        fontFamily:
          "-apple-system, 'SF Pro Display', 'Helvetica Neue', 'Inter', sans-serif",
        background:
          "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)",
        pointerEvents: "none",
      }}
    >
      <div style={{ pointerEvents: "auto" }}>
        <Link
          href="/privacy"
          style={{
            color: "rgba(255,255,255,0.35)",
            textDecoration: "none",
          }}
        >
          Politique de confidentialité
        </Link>
        <span style={{ margin: "0 8px" }}>|</span>
        <Link
          href="/mentions-legales"
          style={{
            color: "rgba(255,255,255,0.35)",
            textDecoration: "none",
          }}
        >
          Mentions légales
        </Link>
      </div>
    </footer>
  );
}
