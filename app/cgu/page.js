import Link from "next/link";

export const metadata = {
  title: "Conditions Générales d'Utilisation — maimoirkouest",
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
  strong: {
    color: "#f5f5f7",
  },
};

export default function CGUPage() {
  return (
    <div style={s.page}>
      <div style={s.container}>
        <Link href="/" style={s.back}>
          &larr; Retour &agrave; l&apos;application
        </Link>

        <h1 style={s.h1}>Conditions G&eacute;n&eacute;rales d&apos;Utilisation</h1>
        <p style={s.updated}>Derni&egrave;re mise &agrave; jour : f&eacute;vrier 2026</p>

        <div style={s.section}>
          <h2 style={s.h2}>1. Objet</h2>
          <p style={s.p}>
            Les pr&eacute;sentes Conditions G&eacute;n&eacute;rales d&apos;Utilisation (CGU) encadrent l&apos;utilisation
            du service <strong style={s.strong}>maimoirkouest</strong>, accessible en ligne.
            maimoirkouest est un outil p&eacute;dagogique gratuit qui utilise l&apos;intelligence artificielle
            pour aider les &eacute;tudiants &agrave; structurer leur m&eacute;moire universitaire.
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>2. Acceptation des conditions</h2>
          <p style={s.p}>
            L&apos;utilisation du service implique l&apos;acceptation pleine et enti&egrave;re des pr&eacute;sentes CGU.
            Si vous n&apos;acceptez pas ces conditions, vous ne devez pas utiliser le service.
          </p>
          <p style={s.p}>
            L&apos;acceptation des cookies via le bandeau de consentement et la connexion via Google OAuth
            constituent une acceptation explicite de ces conditions.
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>3. Description du service</h2>
          <p style={s.p}>
            maimoirkouest propose les fonctionnalit&eacute;s suivantes :
          </p>
          <ul style={s.ul}>
            <li>
              <strong style={s.strong}>Analyse IA</strong> : soumission d&apos;un sujet de m&eacute;moire (texte ou PDF)
              qui est analys&eacute; par l&apos;intelligence artificielle (Claude AI par Anthropic) pour g&eacute;n&eacute;rer
              un plan de travail personnalis&eacute;.
            </li>
            <li>
              <strong style={s.strong}>Suivi de progression</strong> : un tableau de bord interactif
              permettant de suivre l&apos;avancement de votre m&eacute;moire &eacute;tape par &eacute;tape.
            </li>
            <li>
              <strong style={s.strong}>Sauvegarde cloud</strong> : avec un compte Google, votre
              progression est sauvegard&eacute;e automatiquement et accessible depuis tout appareil.
            </li>
          </ul>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>4. Limitation de responsabilit&eacute;</h2>
          <p style={s.p}>
            <strong style={s.strong}>L&apos;IA peut se tromper.</strong> Les r&eacute;sultats g&eacute;n&eacute;r&eacute;s par
            l&apos;intelligence artificielle sont fournis &agrave; titre indicatif et p&eacute;dagogique uniquement.
          </p>
          <ul style={s.ul}>
            <li>
              Les plans, analyses et conseils g&eacute;n&eacute;r&eacute;s <strong style={s.strong}>ne constituent pas</strong> un
              avis professionnel, acad&eacute;mique ou juridique.
            </li>
            <li>
              L&apos;utilisateur est <strong style={s.strong}>seul responsable</strong> de la v&eacute;rification,
              de la validation et de l&apos;utilisation des contenus g&eacute;n&eacute;r&eacute;s.
            </li>
            <li>
              L&apos;&eacute;diteur d&eacute;cline toute responsabilit&eacute; quant aux r&eacute;sultats acad&eacute;miques obtenus
              suite &agrave; l&apos;utilisation de l&apos;outil.
            </li>
            <li>
              Le service est fourni &laquo; tel quel &raquo;, sans garantie de disponibilit&eacute;,
              d&apos;exactitude ou de continuit&eacute;.
            </li>
          </ul>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>5. Propri&eacute;t&eacute; intellectuelle</h2>
          <ul style={s.ul}>
            <li>
              Les <strong style={s.strong}>documents soumis</strong> par l&apos;utilisateur restent sa propri&eacute;t&eacute;
              exclusive. Ils ne sont pas stock&eacute;s apr&egrave;s analyse.
            </li>
            <li>
              Les <strong style={s.strong}>contenus g&eacute;n&eacute;r&eacute;s par l&apos;IA</strong> (plans, analyses)
              sont librement utilisables par l&apos;utilisateur.
            </li>
            <li>
              Le <strong style={s.strong}>code source</strong> de maimoirkouest est open source
              et disponible sur GitHub.
            </li>
          </ul>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>6. Compte utilisateur</h2>
          <p style={s.p}>
            La cr&eacute;ation d&apos;un compte (via Google OAuth) est facultative mais n&eacute;cessaire pour
            sauvegarder votre progression. L&apos;utilisateur peut supprimer son compte et
            toutes ses donn&eacute;es &agrave; tout moment depuis l&apos;application.
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>7. Donn&eacute;es personnelles</h2>
          <p style={s.p}>
            Le traitement des donn&eacute;es personnelles est d&eacute;crit dans notre{" "}
            <Link href="/privacy" style={s.accent}>politique de confidentialit&eacute;</Link>.
            En utilisant le service, vous reconnaissez avoir pris connaissance de cette politique.
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>8. Comportement de l&apos;utilisateur</h2>
          <p style={s.p}>
            L&apos;utilisateur s&apos;engage &agrave; :
          </p>
          <ul style={s.ul}>
            <li>Utiliser le service conform&eacute;ment &agrave; sa finalit&eacute; p&eacute;dagogique.</li>
            <li>Ne pas tenter de contourner les limitations techniques du service.</li>
            <li>Ne pas soumettre de contenus illicites, diffamatoires ou portant atteinte aux droits de tiers.</li>
          </ul>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>9. Modification des CGU</h2>
          <p style={s.p}>
            L&apos;&eacute;diteur se r&eacute;serve le droit de modifier les pr&eacute;sentes CGU &agrave; tout moment.
            La date de derni&egrave;re modification est indiqu&eacute;e en haut de cette page.
            La poursuite de l&apos;utilisation du service apr&egrave;s modification vaut acceptation
            des nouvelles conditions.
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>10. Droit applicable</h2>
          <p style={s.p}>
            Les pr&eacute;sentes CGU sont r&eacute;gies par le <strong style={s.strong}>droit fran&ccedil;ais</strong>.
            En cas de litige relatif &agrave; l&apos;interpr&eacute;tation ou &agrave; l&apos;ex&eacute;cution des pr&eacute;sentes,
            et apr&egrave;s tentative de r&eacute;solution amiable, les tribunaux fran&ccedil;ais seront seuls comp&eacute;tents.
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>11. Contact</h2>
          <p style={s.p}>
            Pour toute question relative aux pr&eacute;sentes CGU :
          </p>
          <ul style={s.ul}>
            <li>Email : <a href="mailto:maimoirkouest@proton.me" style={s.accent}>maimoirkouest@proton.me</a></li>
            <li>GitHub : <a href="https://github.com/mobluis-collab/MemoireQuest/issues" target="_blank" rel="noopener noreferrer" style={s.accent}>GitHub Issues</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
