import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js webpack from bundling native Node.js modules.
  // ws uses bufferutil (a C++ addon) which breaks when bundled by webpack.
  // These packages must be loaded natively from node_modules at runtime.
  serverExternalPackages: [
    "ws",
    "bufferutil",
    "utf-8-validate",
    "@neondatabase/serverless",
    "@prisma/adapter-neon",
  ],
};

export default nextConfig;
