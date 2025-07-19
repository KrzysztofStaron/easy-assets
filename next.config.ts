import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // Increase limit to handle larger images (OpenAI limit is 4MB)
    },
  },
};

export default nextConfig;
