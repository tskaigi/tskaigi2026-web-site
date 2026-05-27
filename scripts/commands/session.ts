import { execFileSync } from "node:child_process";
import { defineCommand } from "citty";
import { loadScriptsConfig } from "../config";
import { checkDataCompleteness } from "../lib/session/check-data-completeness";
import { exportForFrontend } from "../lib/session/export-for-frontend";
import { initMaster } from "../lib/session/init-master";
import { injectSessionInfo } from "../lib/session/inject-session-info";
import { syncSessionIdSpeaker } from "../lib/session/sync-session-id-speaker";

const initCommand = defineCommand({
  meta: {
    name: "init",
    description: "speakers.json → session-master.json を生成",
  },
  async run() {
    const config = await loadScriptsConfig();
    const { count } = initMaster(config);
    console.log(`✅ 完了 (${count}件)`);
  },
});

const injectCommand = defineCommand({
  meta: {
    name: "inject",
    description: "id / ogpTitle を session-master.json に挿入",
  },
  async run() {
    const config = await loadScriptsConfig();
    const { updated, skipped } = injectSessionInfo(config);
    console.log(`✅ 完了 (更新: ${updated}件, スキップ: ${skipped}件)`);
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
    console.log(`✅ 完了 (${count}件)`);
  },
});

const checkCommand = defineCommand({
  meta: {
    name: "check",
    description: "データ整合性をチェックし data-completeness.json を出力",
  },
  async run() {
    const config = await loadScriptsConfig();
    const summary = checkDataCompleteness(config);
    console.log(`📊 チェック結果 (${summary.total}件)`);
    console.log(`  アイコン情報なし: ${summary.noIcon}件`);
    console.log(`  bioなし: ${summary.noBio}件`);
    console.log(`  idなし: ${summary.noSession}件`);
    console.log(`  ogpTitleなし: ${summary.noOgpTitle}件`);
    console.log(`  title≠ogpTitle: ${summary.titleMismatch}件`);
    console.log(`  フロントエンドID不一致: ${summary.idMismatch}件`);
    console.log(`✅ 詳細を出力しました: ${summary.outputPath}`);
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
    console.log(
      `✅ 完了 (合計: ${total}件, 追加: ${added}件, ハンズオン: ID 1 固定)`,
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
      default: false,
    },
  },
  async run({ args }) {
    const config = await loadScriptsConfig();

    if (!args["skip-fix"]) {
      console.log("🧹 pnpm check:fix");
      execFileSync("pnpm", ["check:fix"], { stdio: "inherit" });
    }

    console.log("📋 speakers.json → session-master.json にコピー");
    const init = initMaster(config);
    console.log(`✅ 完了 (${init.count}件)`);

    console.log("🔧 id / ogpTitle を挿入");
    const inject = injectSessionInfo(config);
    console.log(
      `✅ 完了 (更新: ${inject.updated}件, スキップ: ${inject.skipped}件)`,
    );

    console.log("📦 src/constants/session-master.json に出力 (ID:value形式)");
    const exported = exportForFrontend(config);
    console.log(`✅ 完了 (${exported.count}件)`);

    console.log("🔍 データ整合性チェック");
    const summary = checkDataCompleteness(config);
    console.log(`📊 チェック結果 (${summary.total}件)`);
    console.log(`  アイコン情報なし: ${summary.noIcon}件`);
    console.log(`  bioなし: ${summary.noBio}件`);
    console.log(`  idなし: ${summary.noSession}件`);
    console.log(`  ogpTitleなし: ${summary.noOgpTitle}件`);
    console.log(`  title≠ogpTitle: ${summary.titleMismatch}件`);
    console.log(`  フロントエンドID不一致: ${summary.idMismatch}件`);
    console.log(`✅ 詳細を出力しました: ${summary.outputPath}`);
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
