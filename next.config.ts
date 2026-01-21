import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/muscutazieff.pdf",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=0, s-maxage=31536000, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/pdfs/muscutazieff.pdf",
        destination: "/muscutazieff.pdf",
        permanent: true,
      },
      {
        source: "/guide/bac",
        destination: "/guide/evaluation/certificative",
        permanent: true,
      },
      {
        source: "/guide/methodes",
        destination: "/guide/connaissances/methodes-overview",
        permanent: true,
      },
      {
        source: "/guide/connaissances/methodes",
        destination: "/guide/connaissances/methodes-overview",
        permanent: true,
      },
      {
        source: "/guide/securite",
        destination: "/guide/connaissances/securite",
        permanent: true,
      },
      {
        source: "/guide/endurance-de-force",
        destination: "/guide/themes/endurance",
        permanent: true,
      },
      {
        source: "/guide/endurance",
        destination: "/guide/themes/endurance",
        permanent: true,
      },
      {
        source: "/guide/volume",
        destination: "/guide/themes/volume",
        permanent: true,
      },
      {
        source: "/guide/puissance",
        destination: "/guide/themes/puissance",
        permanent: true,
      },
      {
        source: "/guide/entrainement",
        destination: "/guide",
        permanent: true,
      },
      {
        source: "/guide/entrainement/anatomie",
        destination: "/guide/connaissances/muscles",
        permanent: true,
      },
      {
        source: "/guide/entrainement/endurance",
        destination: "/guide/themes/endurance",
        permanent: true,
      },
      {
        source: "/guide/entrainement/volume",
        destination: "/guide/themes/volume",
        permanent: true,
      },
      {
        source: "/guide/entrainement/puissance",
        destination: "/guide/themes/puissance",
        permanent: true,
      },
      {
        source: "/guide/evaluation",
        destination: "/guide/evaluation/seconde",
        permanent: true,
      },
      {
        source: "/guide/exercices",
        destination: "/search",
        permanent: true,
      },
      {
        source: "/guide/exercices/demo/:slug",
        destination: "/search?q=:slug",
        permanent: true,
      },
      {
        source: "/exercices/:path*",
        destination: "/exercises/:path*",
        permanent: true,
      },
    ];
  },
};

export default withSerwist(nextConfig);
