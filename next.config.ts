import type { NextConfig } from "next";

// Invalid src prop (https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop) on `next/image`, hostname "images.unsplash.com" is not configured under images in your `next.config.js`

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "r2.hooshang.app",
        pathname: "/profilemaker/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
