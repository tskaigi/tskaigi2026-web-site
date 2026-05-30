import { defineCommand } from "citty";
import { buildPagesOutput } from "../lib/build-pages";
import { logger } from "../utils/logger";

export default defineCommand({
  meta: {
    name: "build-pages",
    description: "OpenNext 出力を Cloudflare Pages 用に整える",
  },
  run() {
    const { outputDir } = buildPagesOutput();
    logger.success(`Pages output generated at ${outputDir}`);
  },
});
