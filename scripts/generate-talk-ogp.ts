import fs from "fs";
import path from "path";
import { generateAndSaveTalkOgp } from "./lib/generate-talk-ogp";
import type { MasterEntry } from "./lib/session/types";
import { getSessionMeta } from "./lib/session-metadata";

const DEFAULT_PROFILE_IMAGE = "public/logo-2026.png";
const OUTPUT_DIR = "public/talks";
const SESSION_MASTER_JSON = "scripts/data/session-master.json";

function resolveProfileImagePath(profileImageUrl: string): string {
  const filePath = path.join("public", profileImageUrl);
  if (fs.existsSync(filePath)) return filePath;
  return DEFAULT_PROFILE_IMAGE;
}

async function main(force: boolean) {
  const masterPath =
    process.argv.find((a) => !a.startsWith("-") && a.endsWith(".json")) ??
    SESSION_MASTER_JSON;

  if (!fs.existsSync(masterPath)) {
    console.error(`❌ セッションマスターJSONが見つかりません: ${masterPath}`);
    process.exit(1);
  }

  const master: MasterEntry[] = JSON.parse(
    fs.readFileSync(masterPath, "utf-8"),
  );

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const entries = master.filter((e) => e.id);
  console.log(`🚀 OGP画像生成を開始しています... (${entries.length}件)`);

  let generated = 0;
  let skipped = 0;
  let unchanged = 0;

  for (const entry of entries) {
    const sessionId = entry.id ?? "";
    const meta = getSessionMeta(sessionId);
    if (!meta) {
      console.warn(
        `⚠️ セッションID "${sessionId}" のメタデータが見つかりません。スキップします。`,
      );
      skipped++;
      continue;
    }

    const outputPath = path.join(OUTPUT_DIR, `${sessionId}.png`);

    if (!force && fs.existsSync(outputPath)) {
      unchanged++;
      continue;
    }

    const title = entry.ogpTitle ?? entry.title;
    const profileImagePath = resolveProfileImagePath(
      entry.speaker.profileImageUrl ?? "",
    );

    await generateAndSaveTalkOgp({
      title,
      profileImagePath,
      speakerName: entry.speaker.name,
      trackKey: meta.trackKey,
      trackName: meta.trackName,
      sessionTypeKey: meta.sessionTypeKey,
      dayNumber: meta.dayNumber,
      timeRange: meta.timeRange,
      baseImagePath: "public/OGP-talk.png",
      outputPath,
    });
    generated++;
  }

  console.log(
    `✅ OGP画像生成が完了しました。(生成: ${generated}件, 変更なし: ${unchanged}件, スキップ: ${skipped}件)`,
  );
}

const force = process.argv.includes("--force");
main(force).catch((err) => {
  console.error("❌ エラーが発生しました:", err);
  process.exit(1);
});
