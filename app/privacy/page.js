import Link from "next/link";

export const metadata = {
  title: "Politique de confidentialité — maimoirkuest",
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
  ul: {
    margin: "8px 0",
    paddingLeft: "20px",
    fontSize: "14px",
    lineHeight: 1.7,
    color: "rgba(255,255,255,0.65)",
  },
  accent: {
    color: "#0071e3",
  },
};

export default function PrivacyPage() {
  return (
    <div style={s.page}>
      <div style={s.container}>
        <Link href="/" style={s.back}>
          ← Retour à l&apos;application
        </Link>

        <h1 style={s.h1}>Politique de confidentialité</h1>
        <p style={s.updated}>Dernière mise à jour : février 2025</p>

        <div style={s.section}>
          <h2 style={s.h2}>Responsable du traitement</h2>
          <p style={s.p}>
            Luis Chabot — projet étudiant open source.
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>Données collectées</h2>
          <ul style={s.ul}>
            <li>Nom et adresse e-mail via l&apos;authentification Google</li>
            <li>Progression du mémoire (quêtes, étapes complétées)</li>
            <li>Documents uploadés pour analyse par l&apos;IA</li>
          </ul>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>Finalité du traitement</h2>
          <p style={s.p}>
            Les données sont collectées dans le but de permettre la sauvegarde
            de votre progression et l&apos;analyse IA de votre sujet de mémoire.
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>Stockage des données</h2>
          <ul style={s.ul}>
            <li>
              <strong style={{ color: "#f5f5f7" }}>Comptes et progression</strong>{" "}
              : stockés sur Supabase (infrastructure cloud).
            </li>
            <li>
              <strong style={{ color: "#f5f5f7" }}>Documents uploadés</strong>{" "}
              : envoyés à Anthropic (Claude AI) pour analyse en temps réel.
              Les documents ne sont pas stockés de notre côté après l&apos;analyse.
            </li>
          </ul>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>Durée de conservation</h2>
          <p style={s.p}>
            Vos données sont conservées tant que votre compte existe. La
            suppression de votre compte entraîne la suppression de toutes vos
            données.
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>Vos droits</h2>
          <p style={s.p}>
            Conformément au RGPD, vous disposez des droits suivants :
          </p>
          <ul style={s.ul}>
            <li>
              <strong style={{ color: "#f5f5f7" }}>Droit d&apos;accès</strong>{" "}
              : obtenir une copie de vos données personnelles.
            </li>
            <li>
              <strong style={{ color: "#f5f5f7" }}>Droit de rectification</strong>{" "}
              : corriger des données inexactes.
            </li>
            <li>
              <strong style={{ color: "#f5f5f7" }}>Droit de suppression</strong>{" "}
              : supprimer votre compte et toutes vos données via le bouton
              &quot;Supprimer mon compte&quot; dans l&apos;application, ou en nous
              contactant.
            </li>
          </ul>
          <p style={s.p}>
            Pour exercer vos droits, ouvrez une demande sur{" "}
            <a href="https://github.com/mobluis-collab/MemoireQuest/issues" target="_blank" rel="noopener noreferrer" style={s.accent}>
              GitHub Issues
            </a>
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>Cookies</h2>
          <p style={s.p}>
            Le site utilise uniquement des cookies de session nécessaires au
            fonctionnement de l&apos;authentification Google. Aucun cookie
            publicitaire ou de tracking n&apos;est utilisé.
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>Hébergement</h2>
          <ul style={s.ul}>
            <li>
              <strong style={{ color: "#f5f5f7" }}>Application</strong>{" "}
              : Vercel Inc., San Francisco, CA (USA)
            </li>
            <li>
              <strong style={{ color: "#f5f5f7" }}>Base de données</strong>{" "}
              : Supabase
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
