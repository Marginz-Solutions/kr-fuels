import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the monorepo root so file tracing is correct in the pnpm workspace.
  turbopack: {
    root: path.resolve(__dirname, "..", ".."),
  },
  // @kr/shared is a TypeScript workspace package consumed as source.
  transpilePackages: ["@kr/shared"],
  // Auto-memoizes components/hooks so the heavy client pages (products,
  // testimonials, seo-settings) stop re-rendering on unrelated state changes.
  // Bails out safely on any component it can't compile. The
  // babel-plugin-react-compiler devDependency provides the transform.
  reactCompiler: true,
  images: {
    // Hosts whose images go through Next's optimizer. Firebase Storage serves
    // from both storage.googleapis.com and firebasestorage.googleapis.com.
    // Auth-provider/arbitrary URLs (profile photos, logos) render via
    // <Image unoptimized>, which bypasses this list.
    remotePatterns: [
      { protocol: "https", hostname: "storage.googleapis.com", pathname: "/**" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com", pathname: "/**" },
      { protocol: "https", hostname: "**.googleusercontent.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
