import "./globals.css";

export const metadata = {
  title: "MémoireQuest — Structurez votre mémoire, simplement.",
  description:
    "L'assistant IA open source qui analyse votre sujet et vous guide étape par étape jusqu'à la soutenance.",
  openGraph: {
    title: "MémoireQuest",
    description:
      "Structurez votre mémoire avec l'IA. Gratuit et open source.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
