import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  redirects: async () => {
    return [
      {
        source: "/sponsors/inquiry",
        destination: "https://example.com/test-form",
        permanent: false,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
