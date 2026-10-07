import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Recovery: one day at a time",
    short_name: "Recovery",
    description: "Sobriety tracker, craving toolkit, journal and support.",
    start_url: "/",
    display: "standalone",
    background_color: "#f3f8f6",
    theme_color: "#0d9488",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
    ],
  };
}
