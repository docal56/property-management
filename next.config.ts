import type { NextConfig } from "next";

// Validate env vars at build/dev start.
import "./env";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
