import { execFileSync } from "node:child_process";
import { defineCommand } from "citty";
import { loadScriptsConfig } from "../config";
import {
  type CompletenessSummary,
  checkDataCompleteness,
} from "../lib/session/check-data-completeness";
import { exportForFrontend } from "../lib/session/export-for-frontend";
import { initMaster } from "../lib/session/init-master";
import { injectSessionInfo } from "../lib/session/inject-session-info";
import { syncSessionIdSpeaker } from "../lib/session/sync-session-id-speaker";
import { logger } from "../utils/logger";

function reportCompleteness(summary: CompletenessSummary) {
  logger.info(`チェック結果 (${summary.total}件)`);
  logger.log(`  アイコン情報なし: ${summary.noIcon}件`);
  logger.log(`  bioなし: ${summary.noBio}件`);
  logger.log(`  idなし: ${summary.noSession}件`);
  logger.log(`  ogpTitleなし: ${summary.noOgpTitle}件`);
  logger.log(`  title≠ogpTitle: ${summary.titleMismatch}件`);
  logger.log(`  フロントエンドID不一致: ${summary.idMismatch}件`);
  for (const m of summary.idMismatches) {
    logger.error(`ID不一致: key="${m.key}" value.id="${m.id}"`);
  }
  logger.success(`詳細を出力しました: ${summary.outputPath}`);
}

const initCommand = defineCommand({
  meta: {
    name: "init",
    description: "speakers.json → session-master.json を生成",
  },
  async run() {
    const config = await loadScriptsConfig();
    const { count } = initMaster(config);
    logger.success(`完了 (${count}件)`);
  },
});

const injectCommand = defineCommand({
  meta: {
    name: "inject",
    description: "id / ogpTitle を session-master.json に挿入",
  },
  async run() {
    const config = await loadScriptsConfig();
    const { updated, skipped, skippedNames } = injectSessionInfo(config);
    for (const name of skippedNames) {
      logger.log(`skip: "${name}" — IDなし`);
    }
    logger.success(`完了 (更新: ${updated}件, スキップ: ${skipped}件)`);
  },
});

const exportCommand = defineCommand({
  meta: {
    name: "export",
    description: "src/constants/session-master.json に出力 (ID:value形式)",
  },
  async run() {
    const config = await loadScriptsConfig();
    const { count } = exportForFrontend(config);
    logger.success(`完了 (${count}件)`);
  },
});

const checkCommand = defineCommand({
  meta: {
    name: "check",
    description: "データ整合性をチェックし data-completeness.json を出力",
  },
  async run() {
    const config = await loadScriptsConfig();
    reportCompleteness(checkDataCompleteness(config));
  },
});

const syncIdCommand = defineCommand({
  meta: {
    name: "sync-id",
    description: "speakers.json から session-id-speaker.json を更新",
  },
  async run() {
    const config = await loadScriptsConfig();
    const { total, added } = syncSessionIdSpeaker(config);
    logger.success(
      `完了 (合計: ${total}件, 追加: ${added}件, ハンズオン: ID 1 固定)`,
    );
  },
});

const buildCommand = defineCommand({
  meta: {
    name: "build",
    description: "セッションデータのパイプラインを一括実行",
  },
  args: {
    "skip-fix": {
      type: "boolean",
      description: "事前の `pnpm check:fix` をスキップする",
      alias: "s",
      default: false,
    },
  },
  async run({ args }) {
    const config = await loadScriptsConfig();

    if (!args["skip-fix"]) {
      logger.start("pnpm check:fix");
      execFileSync("pnpm", ["check:fix"], { stdio: "inherit" });
    }

    logger.start("speakers.json → session-master.json にコピー");
    const init = initMaster(config);
    logger.success(`完了 (${init.count}件)`);

    logger.start("id / ogpTitle を挿入");
    const inject = injectSessionInfo(config);
    for (const name of inject.skippedNames) {
      logger.log(`skip: "${name}" — IDなし`);
    }
    logger.success(
      `完了 (更新: ${inject.updated}件, スキップ: ${inject.skipped}件)`,
    );

    logger.start("src/constants/session-master.json に出力 (ID:value形式)");
    const exported = exportForFrontend(config);
    logger.success(`完了 (${exported.count}件)`);

    logger.start("データ整合性チェック");
    reportCompleteness(checkDataCompleteness(config));
  },
});

export default defineCommand({
  meta: {
    name: "session",
    description: "セッションデータのパイプライン操作",
  },
  subCommands: {
    init: initCommand,
    inject: injectCommand,
    export: exportCommand,
    check: checkCommand,
    "sync-id": syncIdCommand,
    build: buildCommand,
  },
});
