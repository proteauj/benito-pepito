import type { NextConfig } from "next";
import path from "path";

// next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    disableStaticImages: true,
  },
  experimental: {
    disableOptimizedLoading: true,
  },
  turbopack: {},
  webpack: (config: { module: { rules: any[]; }; resolve: { alias: any; }; }) => {
    // Désactiver le loader d'image de Next.js
    config.module.rules = config.module.rules.filter(
      (rule: { loader: string | string[]; }) => !rule.loader?.includes('next-image-loader')
    );
    
    // Alias pour faciliter les imports
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "./app"),
      "@/components": path.resolve(__dirname, "./app/components"),
      "@/data": path.resolve(__dirname, "./app/data"),
      "@/i18n": path.resolve(__dirname, "./app/i18n"),
    };

    return config;
  },
}

export default nextConfig;
