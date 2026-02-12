import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

await initOpenNextCloudflareForDev();

const projectRoot = process.cwd();

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
  images: {
    unoptimized: true,
  },
  pageExtensions:
    process.env.IS_DEVELOPMENT === "true" ? ["tsx", "dev.tsx"] : ["tsx"],
};

export default nextConfig;
