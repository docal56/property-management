import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack doesn't walk up and pick a stray
  // lockfile from a parent directory.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
