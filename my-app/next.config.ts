import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  outputFileTracingRoot: path.join(__dirname, ".."),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  webpack: (config) => {
    // Ajouter des alias pour les chemins d'importation
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "./app"),
      "@/components": path.resolve(__dirname, "./app/components"),
      "@/data": path.resolve(__dirname, "./app/data"),
      "@/i18n": path.resolve(__dirname, "./app/i18n"),
    };
    return config;
  },
};

export default nextConfig;
