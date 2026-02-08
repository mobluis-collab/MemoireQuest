import Link from "next/link";

export const metadata = {
  title: "Mentions légales — maimoirkuest",
};

const s = {
  page: {
    minHeight: "100vh",
    background: "#000",
    color: "#f5f5f7",
    fontFamily: "-apple-system, 'SF Pro Display', 'Helvetica Neue', 'Inter', sans-serif",
    WebkitFontSmoothing: "antialiased",
  },
  container: {
    maxWidth: "720px",
    margin: "0 auto",
    padding: "80px 24px 60px",
  },
  back: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: "#0071e3",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 500,
    marginBottom: "32px",
  },
  h1: {
    fontSize: "32px",
    fontWeight: 700,
    letterSpacing: "-0.03em",
    marginBottom: "8px",
  },
  updated: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.4)",
    marginBottom: "40px",
  },
  section: {
    marginBottom: "32px",
  },
  h2: {
    fontSize: "18px",
    fontWeight: 600,
    letterSpacing: "-0.02em",
    marginBottom: "12px",
    color: "#f5f5f7",
  },
  p: {
    fontSize: "14px",
    lineHeight: 1.7,
    color: "rgba(255,255,255,0.65)",
    marginBottom: "8px",
  },
  accent: {
    color: "#0071e3",
  },
};

export default function MentionsLegalesPage() {
  return (
    <div style={s.page}>
      <div style={s.container}>
        <Link href="/" style={s.back}>
          ← Retour à l&apos;application
        </Link>

        <h1 style={s.h1}>Mentions légales</h1>
        <p style={s.updated}>Dernière mise à jour : février 2025</p>

        <div style={s.section}>
          <h2 style={s.h2}>Éditeur</h2>
          <p style={s.p}>
            <strong style={{ color: "#f5f5f7" }}>mobluis</strong> — projet
            étudiant à but pédagogique.
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>Hébergeur</h2>
          <p style={s.p}>
            Vercel Inc.
            <br />
            San Francisco, CA — États-Unis
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>Contact</h2>
          <p style={s.p}>
            <a href="https://github.com/mobluis-collab/MemoireQuest/issues" target="_blank" rel="noopener noreferrer" style={s.accent}>
              GitHub Issues
            </a>
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>Nature du site</h2>
          <p style={s.p}>
            maimoirkuest est un outil gratuit à but pédagogique. Il est fourni
            « tel quel », sans garantie d&apos;aucune sorte. L&apos;éditeur ne
            saurait être tenu responsable des résultats obtenus via
            l&apos;utilisation de cet outil.
          </p>
        </div>
      </div>
    </div>
  );
}
