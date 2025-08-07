import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Memberitahu Next.js untuk tidak menghentikan build jika ada error TypeScript.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
