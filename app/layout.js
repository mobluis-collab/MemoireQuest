import Footer from "./components/Footer";

export const metadata = {
  title: "maimoirkuest — Structurez votre mémoire avec l'IA",
  description: "L'assistant IA qui analyse votre sujet et vous guide pas à pas.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0 }}>
        {children}
        <Footer />
      </body>
    </html>
  );
}
