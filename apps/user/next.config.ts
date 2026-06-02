import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, "..", ".."),
  },
  transpilePackages: ["@kr/shared"],
  images: {
    // Hosts whose images go through Next's optimizer. Firebase Storage serves
    // from both storage.googleapis.com and firebasestorage.googleapis.com.
    // Arbitrary admin-entered URLs (logos/avatars) render via <Image unoptimized>,
    // which bypasses this list.
    remotePatterns: [
      { protocol: "https", hostname: "storage.googleapis.com", pathname: "/**" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com", pathname: "/**" },
      { protocol: "https", hostname: "**.lovable.app", pathname: "/**" },
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
