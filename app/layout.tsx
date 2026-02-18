import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "./context/ThemeProvider";
import { AppProvider } from "./context/AppProvider";
import Footer from "./components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export const metadata: Metadata = {
  title: "MemoireQuest — Ton mémoire, structuré par l'IA",
  description:
    "Dépose ton cahier des charges, reçois un plan de rédaction complet et personnalisé pour ton mémoire de fin d'études.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body className={inter.className}>
        <a href="#main-content" className="skip-to-content">
          Aller au contenu principal
        </a>
        <ThemeProvider>
          <AppProvider>
            {children}
            <Footer />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
