import type { NextConfig } from "next";
import path from "path";

// Absolute backend API base used SERVER-SIDE only (the session route, server
// components via serverFetch, and the rewrite proxy below). The browser never
// talks to this host directly — see the rewrite + NEXT_PUBLIC_API_BASE_URL note.
const BACKEND_API_BASE_URL =
  process.env.BACKEND_API_BASE_URL ?? "http://localhost:4000/api/v1";

const nextConfig: NextConfig = {
  // Pin the monorepo root so file tracing is correct in the pnpm workspace.
  turbopack: {
    root: path.resolve(__dirname, "..", ".."),
  },
  // Same-origin reverse proxy for the backend API. In production the admin and
  // backend live on different Firebase hostnames (kr-admin--… vs kr-backend--…),
  // so the httpOnly `session` cookie — stored on the admin host — is never sent
  // cross-host by the browser. Client code calls the RELATIVE base "/api/v1"
  // (NEXT_PUBLIC_API_BASE_URL), which is same-origin: the cookie attaches, and
  // Next forwards the request (cookie included) to the real backend here.
  // Note: rewrites() is evaluated at BUILD time, so BACKEND_API_BASE_URL must be
  // available at build (availability: [BUILD, RUNTIME] in apphosting.yaml).
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${BACKEND_API_BASE_URL}/:path*`,
      },
    ];
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
