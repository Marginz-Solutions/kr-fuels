import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the monorepo root so file tracing is correct in the pnpm workspace.
  turbopack: {
    root: path.resolve(__dirname, "..", ".."),
  },
  // NOTE: the same-origin "/api/v1" → backend proxy is NOT a Next rewrite. App
  // Hosting routes by Host header and Next's external rewrite forwarded the
  // admin's own Host, so every proxied call was rejected with a 401 HTML page.
  // It now lives in app/api/v1/[...path]/route.ts, which fetch()es the absolute
  // backend URL (correct Host) and forwards the session cookie. See that file.
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
