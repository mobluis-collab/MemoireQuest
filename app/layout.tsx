import "./globals.css";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/context/ThemeProvider";
import { AppProvider } from "@/context/AppProvider";
import Footer from "./components/Footer";

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
  title: "maimoirkouest — Structurez votre mémoire avec l'IA",
  description: "L'assistant IA qui analyse votre sujet et vous guide pas à pas.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body>
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
