import fs from "node:fs";
import { defineCommand } from "citty";
import { loadScriptsConfig } from "../config";
import { logger } from "../utils/logger";

/**
 * scripts/data 配下の生成物（gitignored）を削除する。
 * 追跡対象の画像ディレクトリ（public/speakers, public/talks, public/sponsors）
 * には触れない。
 */
export default defineCommand({
  meta: {
    name: "clean",
    description: "scripts/data 配下の生成物・キャッシュを削除",
  },
  args: {
    "dry-run": {
      type: "boolean",
      description: "削除予定のファイルを表示するだけで削除しない",
      alias: "n",
      default: false,
    },
  },
  async run({ args }) {
    const config = await loadScriptsConfig();
    const targets = [
      config.paths.sessionMasterJson,
      config.paths.dataCompletenessJson,
      config.paths.iconManifestJson,
      config.paths.sponsorsManifestJson,
    ];

    let removed = 0;
    for (const target of targets) {
      if (!fs.existsSync(target)) {
        logger.log(`skip: ${target} (存在しません)`);
        continue;
      }
      if (args["dry-run"]) {
        logger.info(`would remove: ${target}`);
      } else {
        fs.rmSync(target, { force: true });
        logger.success(`removed: ${target}`);
      }
      removed++;
    }

    if (args["dry-run"]) {
      logger.info(`dry-run 完了 (削除予定: ${removed}件)`);
    } else {
      logger.success(`完了 (削除: ${removed}件)`);
    }
  },
});
