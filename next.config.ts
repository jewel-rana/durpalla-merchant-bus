import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      // Storefront assets (logos, banners, vehicle/room photos) from the Durpalla CDN.
      { protocol: "https", hostname: "**.durpalla.com" },
      ...(process.env.STOREFRONT_IMAGE_HOSTS ?? "").split(",").map((h) => h.trim()).filter(Boolean).map((hostname) => ({ protocol: "https" as const, hostname })),
    ],
  },
};

export default nextConfig;
