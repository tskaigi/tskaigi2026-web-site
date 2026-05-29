import fs from "node:fs";
import path from "node:path";
import { defineCommand } from "citty";
import { TALK_TYPE } from "@/constants/timetable/talkList";
import { loadScriptsConfig, type ScriptsConfig } from "../config";
import { generateAndSaveTalkOgp } from "../lib/generate-talk-ogp";
import type { MasterEntry } from "../lib/session/types";
import { getSessionMeta } from "../lib/session-metadata";
import { logger } from "../utils/logger";
import { createProgress } from "../utils/progress";

function resolveProfileImage(
  config: ScriptsConfig,
  profileImageUrl: string,
): { path: string; isFallback: boolean } {
  const fallback = config.paths.defaultProfileImage;
  if (!profileImageUrl) return { path: fallback, isFallback: true };
  const filePath = path.join("public", profileImageUrl);
  if (fs.existsSync(filePath))
    return { path: filePath, isFallback: filePath === fallback };
  return { path: fallback, isFallback: true };
}

async function runOgp(
  config: ScriptsConfig,
  masterPath: string,
  force: boolean,
) {
  if (!fs.existsSync(masterPath)) {
    throw new Error(`セッションマスターJSONが見つかりません: ${masterPath}`);
  }

  const master: MasterEntry[] = JSON.parse(
    fs.readFileSync(masterPath, "utf-8"),
  );

  const outputDir = config.paths.talksImageDir;
  fs.mkdirSync(outputDir, { recursive: true });

  const entries = master.filter((e) => e.id);
  logger.start(`OGP画像生成を開始しています... (${entries.length}件)`);

  let generated = 0;
  let skipped = 0;
  let unchanged = 0;
  let processed = 0;
  const total = entries.length;
  const progress = createProgress();

  for (const entry of entries) {
    const sessionId = entry.id ?? "";
    processed++;
    progress.update(
      `🚀 OGP生成中 ${processed}/${total} (生成: ${generated}, 変更なし: ${unchanged}, スキップ: ${skipped}) — ${sessionId}`,
    );

    const meta = getSessionMeta(sessionId);
    if (!meta) {
      logger.warn(
        `セッションID "${sessionId}" のメタデータが見つかりません。スキップします。`,
      );
      skipped++;
      continue;
    }

    const outputPath = path.join(outputDir, `${sessionId}.png`);

    if (!force && fs.existsSync(outputPath)) {
      unchanged++;
      continue;
    }

    const title = entry.ogpTitle ?? entry.title;
    const profileImage = resolveProfileImage(
      config,
      entry.speaker.profileImageUrl ?? "",
    );

    await generateAndSaveTalkOgp({
      title,
      profileImagePath: profileImage.path,
      profileImageFit: profileImage.isFallback ? "contain" : "cover",
      speakerName: entry.speaker.name,
      trackKey: meta.trackKey,
      trackName: meta.trackName,
      sessionTypeName: TALK_TYPE[meta.sessionTypeKey].name,
      sessionTypeColor: TALK_TYPE[meta.sessionTypeKey].color,
      dayNumber: meta.dayNumber,
      timeRange: meta.timeRange,
      baseImagePath: config.paths.ogpBaseImage,
      outputPath,
    });
    generated++;
  }

  progress.done();
  logger.success(
    `OGP画像生成が完了しました。(生成: ${generated}件, 変更なし: ${unchanged}件, スキップ: ${skipped}件)`,
  );
}

export default defineCommand({
  meta: {
    name: "ogp",
    description: "セッションごとの OGP 画像を生成",
  },
  args: {
    master: {
      type: "positional",
      description: "セッションマスターJSONのパス（省略時は設定値）",
      required: false,
    },
    force: {
      type: "boolean",
      description: "全件再生成する",
      alias: "f",
      default: false,
    },
  },
  async run({ args }) {
    const config = await loadScriptsConfig();
    const masterPath = args.master || config.paths.sessionMasterJson;
    await runOgp(config, masterPath, args.force);
  },
});
