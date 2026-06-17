import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the monorepo root so file tracing is correct in the pnpm workspace.
  turbopack: {
    root: path.resolve(__dirname, "..", ".."),
  },
  // @kr/shared is consumed as TypeScript source.
  transpilePackages: ["@kr/shared"],
  // firebase-admin must stay a Node external (never bundled).
  serverExternalPackages: ["firebase-admin"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
