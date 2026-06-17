import type { NextConfig } from "next";

const config = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true, 
  },
};

const nextConfig: NextConfig = config as any;

export default nextConfig;