import { defineCommand } from "citty";
import { buildPagesOutput } from "../build-pages-output.mjs";

export default defineCommand({
  meta: {
    name: "build-pages",
    description: "OpenNext 出力を Cloudflare Pages 用に整える",
  },
  run() {
    buildPagesOutput();
  },
});
