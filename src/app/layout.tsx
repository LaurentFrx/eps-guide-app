import type { Metadata } from "next";
import { Space_Grotesk, Work_Sans } from "next/font/google";
import { Providers } from "@/components/Providers";
import { withAssetVersion } from "@/lib/assetVersion";
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
    template: "%s - Guide EPS",
  },
  description:
    "Fiches exercices EPS, recherche rapide, favoris et accès hors ligne.",
  icons: {
    icon: [
      {
        rel: "icon",
        url: withAssetVersion("/favicon-32.png"),
        type: "image/png",
        sizes: "32x32",
      },
      {
        rel: "icon",
        url: withAssetVersion("/favicon-16.png"),
        type: "image/png",
        sizes: "16x16",
      },
    ],
    apple: [
      {
        url: withAssetVersion("/apple-touch-icon.png"),
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: withAssetVersion("/manifest.webmanifest"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${spaceGrotesk.variable} ${workSans.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

