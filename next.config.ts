import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone",
  images: {
    unoptimized: true,
  },
  pageExtensions:
    process.env.IS_DEVELOPMENT === "true" ? ["tsx", "dev.tsx"] : ["tsx"],
};

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();
export default nextConfig;
