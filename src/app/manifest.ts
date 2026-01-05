import type { MetadataRoute } from "next";
import { withAssetVersion } from "@/lib/assetVersion";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Guide EPS",
    short_name: "Guide EPS",
    start_url: "/",
    display: "standalone",
    background_color: "#eef2f7",
    theme_color: "#dbeafe",
    icons: [
      {
        src: withAssetVersion("/icon-192.png"),
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: withAssetVersion("/icon-512.png"),
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
