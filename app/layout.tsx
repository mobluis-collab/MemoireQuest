import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeProvider";
import GoogleAuthProvider from "@/components/providers/GoogleAuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "maimouarkwest — Ton mémoire, structuré par l'IA",
  description:
    "Dépose ton cahier des charges, reçois un plan de rédaction complet et personnalisé pour ton mémoire de fin d'études.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('theme');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <GoogleAuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </GoogleAuthProvider>
      </body>
    </html>
  );
}
