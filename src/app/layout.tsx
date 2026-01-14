import type { Metadata } from "next";
import { Space_Grotesk, Work_Sans } from "next/font/google";
import { BottomNav } from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { DataWarning } from "@/components/DataWarning";
import { Providers } from "@/components/Providers";
import { ICON_V } from "@/lib/version";
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
    default: "Guide Musculation",
    template: "%s · Guide Musculation",
  },
  applicationName: "Guide Musculation",
  description:
    "Guide musculation terrain: projets, séances, exercices, révisions et évaluation.",
  icons: {
    icon: [
      {
        url: `/icon.png?v=${ICON_V}`,
        type: "image/png",
      },
    ],
    apple: [
      {
        url: `/apple-icon.png?v=${ICON_V}`,
        type: "image/png",
      },
    ],
    shortcut: [`/favicon.ico?v=${ICON_V}`],
  },
  manifest: `/manifest.webmanifest?v=${ICON_V}`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${spaceGrotesk.variable} ${workSans.variable} eps-app`}>
        <Providers>
          <main className="eps-app__content px-5 pt-6 pb-[calc(env(safe-area-inset-bottom)+120px)]">
            <DataWarning className="mb-6" />
            {children}
          </main>
          <Footer />
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}


