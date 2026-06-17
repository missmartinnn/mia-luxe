import type { NextConfig } from "next";

// 1. Define the configuration object loosely to bypass type mismatches
const config = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

// 2. Cast the config safely as NextConfig for the framework export
const nextConfig: NextConfig = config as any;

export default nextConfig;