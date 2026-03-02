import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const OPEN_NEXT_DIR = ".open-next";
const ASSETS_DIR = join(OPEN_NEXT_DIR, "assets");
const WORKER_FILE = join(OPEN_NEXT_DIR, "worker.js");
const PAGES_DIR = join(OPEN_NEXT_DIR, "pages");

if (!existsSync(WORKER_FILE) || !existsSync(ASSETS_DIR)) {
  throw new Error(
    "OpenNext build output was not found. Run `opennextjs-cloudflare build` first.",
  );
}

rmSync(PAGES_DIR, { recursive: true, force: true });
mkdirSync(PAGES_DIR, { recursive: true });

for (const entry of readdirSync(OPEN_NEXT_DIR, { withFileTypes: true })) {
  if (entry.name === "assets" || entry.name === "pages") {
    continue;
  }

  cpSync(join(OPEN_NEXT_DIR, entry.name), join(PAGES_DIR, entry.name), {
    recursive: true,
  });
}

for (const entry of readdirSync(ASSETS_DIR, { withFileTypes: true })) {
  cpSync(join(ASSETS_DIR, entry.name), join(PAGES_DIR, entry.name), {
    recursive: true,
  });
}

writeFileSync(
  join(PAGES_DIR, "_worker.js"),
  `import worker from "./worker.js";
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
`,
  "utf8",
);

console.log("Pages output generated at .open-next/pages");
