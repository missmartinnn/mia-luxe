import type { NextConfig } from "next";

const config = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true, 
  },
  // 👇 ADD THIS BLOCK to whitelist your Supabase image domain
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cnbsexfktqomakxnmhwx.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", // Add Unsplash too, just in case for mock images
      }
    ],
  },
};

const nextConfig: NextConfig = config as any;

export default nextConfig;