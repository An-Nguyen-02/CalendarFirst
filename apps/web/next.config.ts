import type { NextConfig } from "next";

const apiUrl = process.env.API_INTERNAL_URL || "http://localhost:4000";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiUrl}/:path*` }];
  },
};

export default nextConfig;
