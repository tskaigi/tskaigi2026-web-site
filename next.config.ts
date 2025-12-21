import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "export",

  redirects: async () => {
    return [
      {
        source: "/sponsors/call-for-sponsors",
        destination: "https://docs.google.com/document/d/e/2PACX-1vRR4qf3tjPB5ZlrGjGln-FyX-TU1EXemj2XqFqyoedJlMFD2r8iYdcwGP5CNqvlvT4vcwYjNGzMjpTJ/pub",
        permanent: false,
        basePath: false,
      },
      {
        source: "/sponsors/apply",
        destination: "https://docs.google.com/forms/d/e/1FAIpQLSeTKamEr_jBcj_Q5ojp0f6XlFdICgph55xopdc_I53eHXcQCw/viewform",
        permanent: false,
        basePath: false,
      },
      {
        source: "/sponsors/inquiry",
        destination: "https://docs.google.com/forms/d/e/1FAIpQLSeoBzHbqzAhVgkKyozSdhYTrME2UftqDGqMLJCLBolbxalz4g/viewform",
        permanent: false,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
