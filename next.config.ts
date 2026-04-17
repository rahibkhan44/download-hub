import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@tobyg74/tiktok-api-dl"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
  },
};

export default nextConfig;
