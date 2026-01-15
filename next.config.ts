import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "export",
  images: {
    unoptimized: true,
  },
  pageExtensions:
    process.env.IS_DEVELOPMENT === "true" ? ["tsx", "dev.tsx"] : ["tsx"],
};

export default nextConfig;
