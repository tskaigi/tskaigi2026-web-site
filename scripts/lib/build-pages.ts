import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const WORKER_ENTRY = `import worker from "./worker.js";
export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./worker.js";

export default {
  async fetch(request, env, ctx) {
    if (env?.ASSETS) {
      try {
        const assetResponse = await env.ASSETS.fetch(request);
        if (assetResponse.status !== 404) {
          return assetResponse;
        }
      } catch {
        // Ignore and fall back to SSR handler.
      }
    }

    return worker.fetch(request, env, ctx);
  },
};
`;

/**
 * OpenNext のビルド出力を Cloudflare Pages 用の `pages` ディレクトリへ整える。
 * `openNextDir` 配下に `worker.js` と `assets/` がある前提。
 */
export function buildPagesOutput(openNextDir = ".open-next"): {
  outputDir: string;
} {
  const assetsDir = join(openNextDir, "assets");
  const workerFile = join(openNextDir, "worker.js");
  const pagesDir = join(openNextDir, "pages");

  if (!existsSync(workerFile) || !existsSync(assetsDir)) {
    throw new Error(
      "OpenNext build output was not found. Run `opennextjs-cloudflare build` first.",
    );
  }

  rmSync(pagesDir, { recursive: true, force: true });
  mkdirSync(pagesDir, { recursive: true });

  for (const entry of readdirSync(openNextDir, { withFileTypes: true })) {
    if (entry.name === "assets" || entry.name === "pages") {
      continue;
    }
    cpSync(join(openNextDir, entry.name), join(pagesDir, entry.name), {
      recursive: true,
      verbatimSymlinks: true,
    });
  }

  for (const entry of readdirSync(assetsDir, { withFileTypes: true })) {
    cpSync(join(assetsDir, entry.name), join(pagesDir, entry.name), {
      recursive: true,
      verbatimSymlinks: true,
    });
  }

  writeFileSync(join(pagesDir, "_worker.js"), WORKER_ENTRY, "utf8");

  return { outputDir: pagesDir };
}
