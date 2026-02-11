import Link from "next/link";

export const metadata = {
  title: "Mentions légales — maimoirkouest",
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

export default function MentionsLegalesPage() {
  return (
    <div style={s.page}>
      <div style={s.container}>
        <Link href="/" style={s.back}>
          &larr; Retour &agrave; l&apos;application
        </Link>

        <h1 style={s.h1}>Mentions l&eacute;gales</h1>
        <p style={s.updated}>Derni&egrave;re mise &agrave; jour : f&eacute;vrier 2026</p>

        <div style={s.section}>
          <h2 style={s.h2}>1. &Eacute;diteur du site</h2>
          <p style={s.p}>
            <strong style={s.strong}>maimoirkouest</strong> est un projet &eacute;tudiant open source &agrave; but p&eacute;dagogique.
          </p>
          <ul style={s.ul}>
            <li><strong style={s.strong}>&Eacute;diteur</strong> : Luis Chabot (mobluis)</li>
            <li><strong style={s.strong}>Statut</strong> : personne physique &mdash; projet &eacute;tudiant non commercial</li>
            <li><strong style={s.strong}>Contact</strong> : <a href="mailto:maimoirkouest@proton.me" style={s.accent}>maimoirkouest@proton.me</a></li>
          </ul>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>2. Directeur de la publication</h2>
          <p style={s.p}>
            <strong style={s.strong}>Luis Chabot</strong> &mdash; en qualit&eacute; d&apos;&eacute;diteur du site.
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>3. H&eacute;bergeur</h2>
          <p style={s.p}>
            <strong style={s.strong}>Vercel Inc.</strong>
            <br />
            440 N Barranca Ave #4133, Covina, CA 91723, &Eacute;tats-Unis
            <br />
            Site web : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" style={s.accent}>vercel.com</a>
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>4. Nature du site</h2>
          <p style={s.p}>
            maimoirkouest est un outil gratuit &agrave; but p&eacute;dagogique qui utilise l&apos;intelligence artificielle
            (Claude AI par Anthropic) pour aider les &eacute;tudiants &agrave; structurer leur m&eacute;moire.
            Il est fourni &laquo; tel quel &raquo;, sans garantie d&apos;aucune sorte.
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>5. Propri&eacute;t&eacute; intellectuelle</h2>
          <p style={s.p}>
            Le code source de maimoirkouest est distribu&eacute; sous licence open source et est disponible sur{" "}
            <a href="https://github.com/mobluis-collab/MemoireQuest" target="_blank" rel="noopener noreferrer" style={s.accent}>GitHub</a>.
          </p>
          <p style={s.p}>
            Les contenus g&eacute;n&eacute;r&eacute;s par l&apos;intelligence artificielle (plans de m&eacute;moire, analyses, conseils)
            ne sont pas prot&eacute;g&eacute;s par le droit d&apos;auteur et sont librement utilisables par l&apos;utilisateur.
          </p>
          <p style={s.p}>
            Les documents soumis par les utilisateurs restent leur propri&eacute;t&eacute; exclusive.
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>6. Limitation de responsabilit&eacute;</h2>
          <p style={s.p}>
            L&apos;&eacute;diteur ne saurait &ecirc;tre tenu responsable :
          </p>
          <ul style={s.ul}>
            <li>
              Des <strong style={s.strong}>r&eacute;sultats produits par l&apos;intelligence artificielle</strong> :
              les suggestions, plans et analyses g&eacute;n&eacute;r&eacute;s par l&apos;IA sont fournis &agrave; titre indicatif
              et ne constituent en aucun cas un avis professionnel, acad&eacute;mique ou juridique.
              L&apos;IA peut commettre des erreurs d&apos;interpr&eacute;tation ou fournir des informations inexactes.
            </li>
            <li>
              Des <strong style={s.strong}>d&eacute;cisions prises</strong> par l&apos;utilisateur sur la base des
              suggestions g&eacute;n&eacute;r&eacute;es par l&apos;outil.
            </li>
            <li>
              Des <strong style={s.strong}>interruptions de service</strong>, bugs ou indisponibilit&eacute;s
              temporaires de la plateforme ou des services tiers (Supabase, Anthropic, Google).
            </li>
            <li>
              De tout <strong style={s.strong}>dommage direct ou indirect</strong> r&eacute;sultant de
              l&apos;utilisation ou de l&apos;impossibilit&eacute; d&apos;utiliser le service.
            </li>
          </ul>
          <p style={s.p}>
            L&apos;utilisateur est seul responsable de la v&eacute;rification et de la validation
            des contenus g&eacute;n&eacute;r&eacute;s avant toute utilisation dans un contexte acad&eacute;mique.
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>7. Donn&eacute;es personnelles</h2>
          <p style={s.p}>
            Pour toute information concernant le traitement de vos donn&eacute;es personnelles,
            veuillez consulter notre{" "}
            <Link href="/privacy" style={s.accent}>politique de confidentialit&eacute;</Link>.
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>8. Droit applicable</h2>
          <p style={s.p}>
            Les pr&eacute;sentes mentions l&eacute;gales sont r&eacute;gies par le <strong style={s.strong}>droit fran&ccedil;ais</strong>.
            En cas de litige, et apr&egrave;s tentative de r&eacute;solution amiable, les tribunaux fran&ccedil;ais
            seront seuls comp&eacute;tents.
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>9. Contact</h2>
          <p style={s.p}>
            Pour toute question concernant ces mentions l&eacute;gales :
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
