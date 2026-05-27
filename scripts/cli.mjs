#!/usr/bin/env node
import { fileURLToPath } from "node:url";
import { createJiti } from "jiti";

// jiti で TS をそのまま実行する。`@/` を src/ に解決するため alias を渡す。
const jiti = createJiti(import.meta.url, {
  alias: {
    "@": fileURLToPath(new URL("../src", import.meta.url)),
  },
});

await jiti.import("./cli.ts");
