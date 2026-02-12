import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

if (process.env.NODE_ENV === "development") {
  await initOpenNextCloudflareForDev();
}

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
