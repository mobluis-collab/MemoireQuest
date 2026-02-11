import Link from "next/link";

export const metadata = {
  title: "Politique de confidentialité — maimoirkouest",
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

export default function PrivacyPage() {
  return (
    <div style={s.page}>
      <div style={s.container}>
        <Link href="/" style={s.back}>
          &larr; Retour &agrave; l&apos;application
        </Link>

        <h1 style={s.h1}>Politique de confidentialit&eacute;</h1>
        <p style={s.updated}>Derni&egrave;re mise &agrave; jour : f&eacute;vrier 2026</p>

        <div style={s.section}>
          <h2 style={s.h2}>1. Responsable du traitement</h2>
          <p style={s.p}>
            <strong style={s.strong}>Luis Chabot</strong> &mdash; projet &eacute;tudiant open source &agrave; but p&eacute;dagogique.
          </p>
          <p style={s.p}>
            Contact : <a href="mailto:maimoirkouest@proton.me" style={s.accent}>maimoirkouest@proton.me</a>
            <br />
            GitHub : <a href="https://github.com/mobluis-collab/MemoireQuest/issues" target="_blank" rel="noopener noreferrer" style={s.accent}>GitHub Issues</a>
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>2. Base l&eacute;gale du traitement</h2>
          <p style={s.p}>
            Conform&eacute;ment &agrave; l&apos;article 6.1.a du R&egrave;glement G&eacute;n&eacute;ral sur la Protection des Donn&eacute;es (RGPD),
            le traitement de vos donn&eacute;es personnelles repose sur <strong style={s.strong}>votre consentement</strong>,
            recueilli lors de votre connexion via Google OAuth et via le bandeau de consentement aux cookies.
          </p>
          <p style={s.p}>
            Vous pouvez retirer votre consentement &agrave; tout moment en supprimant votre compte depuis l&apos;application
            ou en nous contactant directement.
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>3. Donn&eacute;es collect&eacute;es</h2>
          <ul style={s.ul}>
            <li>
              <strong style={s.strong}>Donn&eacute;es d&apos;identification</strong> : nom, adresse e-mail et photo de profil via l&apos;authentification Google OAuth.
            </li>
            <li>
              <strong style={s.strong}>Donn&eacute;es de progression</strong> : qu&ecirc;tes, &eacute;tapes compl&eacute;t&eacute;es, analyse IA, domaine choisi.
            </li>
            <li>
              <strong style={s.strong}>Documents soumis</strong> : fichiers PDF ou textes envoy&eacute;s pour analyse par l&apos;IA (non stock&eacute;s apr&egrave;s traitement).
            </li>
            <li>
              <strong style={s.strong}>Donn&eacute;es techniques</strong> : cookies de session n&eacute;cessaires au fonctionnement de l&apos;authentification.
            </li>
          </ul>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>4. Finalit&eacute;s du traitement</h2>
          <ul style={s.ul}>
            <li>Permettre l&apos;authentification et la gestion de votre compte.</li>
            <li>Sauvegarder votre progression dans le cloud.</li>
            <li>Analyser votre sujet de m&eacute;moire via l&apos;intelligence artificielle pour g&eacute;n&eacute;rer un plan personnalis&eacute;.</li>
          </ul>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>5. Donn&eacute;es envoy&eacute;es &agrave; l&apos;IA</h2>
          <p style={s.p}>
            Lorsque vous soumettez un document ou du texte pour analyse, ces donn&eacute;es sont transmises &agrave;
            <strong style={s.strong}> Anthropic (Claude AI)</strong> via leur API pour g&eacute;n&eacute;rer votre plan de m&eacute;moire personnalis&eacute;.
          </p>
          <ul style={s.ul}>
            <li>Les documents sont envoy&eacute;s en temps r&eacute;el et ne sont <strong style={s.strong}>pas stock&eacute;s</strong> par maimoirkouest apr&egrave;s l&apos;analyse.</li>
            <li>Anthropic peut traiter ces donn&eacute;es conform&eacute;ment &agrave; sa propre politique de confidentialit&eacute; (<a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" style={s.accent}>anthropic.com/privacy</a>).</li>
            <li>Seul le r&eacute;sultat structur&eacute; (plan, analyse) est conserv&eacute; dans votre compte.</li>
          </ul>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>6. Sous-traitants et services tiers</h2>
          <p style={s.p}>
            Les services tiers suivants interviennent dans le traitement de vos donn&eacute;es :
          </p>
          <ul style={s.ul}>
            <li>
              <strong style={s.strong}>Google (OAuth)</strong> : authentification. Politique : <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={s.accent}>policies.google.com/privacy</a>
            </li>
            <li>
              <strong style={s.strong}>Supabase</strong> : base de donn&eacute;es et authentification. Politique : <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" style={s.accent}>supabase.com/privacy</a>
            </li>
            <li>
              <strong style={s.strong}>Anthropic (Claude AI)</strong> : analyse IA des documents. Politique : <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" style={s.accent}>anthropic.com/privacy</a>
            </li>
            <li>
              <strong style={s.strong}>Vercel</strong> : h&eacute;bergement de l&apos;application. Politique : <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" style={s.accent}>vercel.com/legal/privacy-policy</a>
            </li>
          </ul>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>7. Transferts internationaux de donn&eacute;es</h2>
          <p style={s.p}>
            Vos donn&eacute;es sont transf&eacute;r&eacute;es et trait&eacute;es aux &Eacute;tats-Unis par nos sous-traitants
            (Vercel, Supabase, Anthropic, Google). Ces transferts sont encadr&eacute;s par le
            <strong style={s.strong}> EU-U.S. Data Privacy Framework</strong> auquel ces prestataires adh&egrave;rent,
            conform&eacute;ment &agrave; la d&eacute;cision d&apos;ad&eacute;quation de la Commission europ&eacute;enne du 10 juillet 2023.
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>8. Dur&eacute;e de conservation</h2>
          <p style={s.p}>
            Vos donn&eacute;es sont conserv&eacute;es tant que votre compte existe. La suppression de votre compte
            entra&icirc;ne la suppression imm&eacute;diate et d&eacute;finitive de toutes vos donn&eacute;es personnelles
            (progression, analyse, informations de profil).
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>9. Cookies</h2>
          <p style={s.p}>
            Le site utilise uniquement des <strong style={s.strong}>cookies de session</strong> n&eacute;cessaires au fonctionnement
            de l&apos;authentification Google OAuth. Aucun cookie publicitaire, analytique ou de tracking n&apos;est utilis&eacute;.
          </p>
          <p style={s.p}>
            Un bandeau de consentement vous permet d&apos;accepter ou de refuser ces cookies lors de votre
            premi&egrave;re visite. En cas de refus, l&apos;authentification Google ne sera pas disponible
            (fonctionnement d&eacute;grad&eacute;).
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>10. Vos droits (RGPD)</h2>
          <p style={s.p}>
            Conform&eacute;ment au RGPD (articles 15 &agrave; 21), vous disposez des droits suivants :
          </p>
          <ul style={s.ul}>
            <li>
              <strong style={s.strong}>Droit d&apos;acc&egrave;s</strong> (art. 15) : obtenir une copie de vos donn&eacute;es personnelles.
            </li>
            <li>
              <strong style={s.strong}>Droit de rectification</strong> (art. 16) : corriger des donn&eacute;es inexactes ou incompl&egrave;tes.
            </li>
            <li>
              <strong style={s.strong}>Droit de suppression</strong> (art. 17) : supprimer votre compte et toutes vos donn&eacute;es via
              le bouton &laquo; Supprimer mon compte &raquo; ou en nous contactant.
            </li>
            <li>
              <strong style={s.strong}>Droit &agrave; la portabilit&eacute;</strong> (art. 20) : recevoir vos donn&eacute;es dans un format structur&eacute;,
              couramment utilis&eacute; et lisible par machine.
            </li>
            <li>
              <strong style={s.strong}>Droit d&apos;opposition</strong> (art. 21) : vous opposer au traitement de vos donn&eacute;es.
            </li>
            <li>
              <strong style={s.strong}>Droit de limitation</strong> (art. 18) : limiter le traitement de vos donn&eacute;es dans certains cas.
            </li>
            <li>
              <strong style={s.strong}>Droit de retrait du consentement</strong> (art. 7) : retirer votre consentement &agrave; tout moment,
              sans affecter la lic&eacute;it&eacute; du traitement ant&eacute;rieur.
            </li>
          </ul>
          <p style={s.p}>
            Pour exercer vos droits, contactez-nous &agrave; :{" "}
            <a href="mailto:maimoirkouest@proton.me" style={s.accent}>maimoirkouest@proton.me</a>
            {" "}ou via{" "}
            <a href="https://github.com/mobluis-collab/MemoireQuest/issues" target="_blank" rel="noopener noreferrer" style={s.accent}>
              GitHub Issues
            </a>.
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>11. Droit de r&eacute;clamation aupr&egrave;s de la CNIL</h2>
          <p style={s.p}>
            Si vous estimez que le traitement de vos donn&eacute;es personnelles constitue une violation du RGPD,
            vous avez le droit d&apos;introduire une r&eacute;clamation aupr&egrave;s de la{" "}
            <strong style={s.strong}>Commission Nationale de l&apos;Informatique et des Libert&eacute;s (CNIL)</strong> :
          </p>
          <ul style={s.ul}>
            <li>Site web : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={s.accent}>www.cnil.fr</a></li>
            <li>Adresse : CNIL, 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07</li>
          </ul>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>12. H&eacute;bergement</h2>
          <ul style={s.ul}>
            <li>
              <strong style={s.strong}>Application</strong> : Vercel Inc., San Francisco, CA (&Eacute;tats-Unis)
            </li>
            <li>
              <strong style={s.strong}>Base de donn&eacute;es</strong> : Supabase Inc., San Francisco, CA (&Eacute;tats-Unis)
            </li>
          </ul>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>13. Modification de cette politique</h2>
          <p style={s.p}>
            Cette politique de confidentialit&eacute; peut &ecirc;tre mise &agrave; jour &agrave; tout moment. La date de derni&egrave;re
            modification est indiqu&eacute;e en haut de cette page. Nous vous invitons &agrave; la consulter r&eacute;guli&egrave;rement.
          </p>
        </div>
      </div>
    </div>
  );
}
