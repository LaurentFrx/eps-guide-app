import type { MetadataRoute } from "next";
import { ICON_V } from "@/lib/version";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Guide Musculation",
    short_name: "Musculation",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0b1020",
    theme_color: "#0b1020",
    icons: [
      {
        src: `/icon-192.png?v=${ICON_V}`,
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: `/icon-512.png?v=${ICON_V}`,
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
