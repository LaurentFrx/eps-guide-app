import type { Metadata } from "next";
import { Space_Grotesk, Work_Sans } from "next/font/google";
import { BottomNav } from "@/components/BottomNav";
import { DataWarning } from "@/components/DataWarning";
import { Providers } from "@/components/Providers";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const workSans = Work_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Guide EPS",
    template: "%s · Guide EPS",
  },
  description:
    "Fiches exercices EPS, recherche rapide, favoris et acces hors ligne.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${spaceGrotesk.variable} ${workSans.variable}`}>
        <Providers>
          <main className="px-5 pb-28 pt-6">
            <DataWarning className="mb-6" />
            {children}
          </main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
