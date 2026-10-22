import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets devices on the LAN load dev assets/HMR; without it the page never hydrates.
  allowedDevOrigins: ["10.10.10.243"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
