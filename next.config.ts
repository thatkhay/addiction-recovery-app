import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The embedded local database ships WebAssembly files; load it from node_modules at runtime.
  serverExternalPackages: ["@electric-sql/pglite"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" }],
  },
};

export default nextConfig;
