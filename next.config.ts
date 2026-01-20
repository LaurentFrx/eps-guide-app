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
  async redirects() {
    return [
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
