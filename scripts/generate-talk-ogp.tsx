import fs from "fs";
import http from "http";
import https from "https";
import path from "path";
import type { SessionSummary } from "../src/types/timetable-api";
import { generateAndSaveTalkOgp } from "./lib/generate-talk-ogp";
import { getSessionMeta } from "./lib/session-metadata";

const DEFAULT_PROFILE_IMAGE = "public/logo-2026.png";
const OUTPUT_DIR = "public/ogp/talks";

async function downloadImage(url: string, destPath: string): Promise<void> {
  const client = url.startsWith("https://") ? https : http;
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    client
      .get(url, (res) => {
        res.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
  });
}

async function resolveProfileImagePath(
  session: SessionSummary,
  tempDir: string,
): Promise<string> {
  const profileImageUrl = session.speaker.profileImageUrl;
  if (!profileImageUrl) return DEFAULT_PROFILE_IMAGE;

  const ext = path.extname(new URL(profileImageUrl).pathname) || ".png";
  const tempPath = path.join(tempDir, `profile-${session.id}${ext}`);

  try {
    await downloadImage(profileImageUrl, tempPath);
    return tempPath;
  } catch {
    console.warn(
      `⚠️ プロフィール画像のダウンロードに失敗しました (${session.id}): ${profileImageUrl}`,
    );
    return DEFAULT_PROFILE_IMAGE;
  }
}

async function main() {
  const jsonPath = process.argv[2] ?? "scripts/data/sessions-sample.json";

  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ JSONファイルが見つかりません: ${jsonPath}`);
    process.exit(1);
  }

  const sessions: SessionSummary[] = JSON.parse(
    fs.readFileSync(jsonPath, "utf-8"),
  );

  if (!Array.isArray(sessions)) {
    console.error(
      "❌ JSONファイルの形式が正しくありません。配列を指定してください。",
    );
    process.exit(1);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const tempDir = fs.mkdtempSync(path.join(OUTPUT_DIR, ".tmp-"));

  try {
    console.log(`🚀 OGP画像生成を開始しています... (${sessions.length}件)`);

    for (const session of sessions) {
      const meta = getSessionMeta(session.id);
      if (!meta) {
        console.warn(
          `⚠️ セッションID "${session.id}" のメタデータが見つかりません。スキップします。`,
        );
        continue;
      }

      const profileImagePath = await resolveProfileImagePath(session, tempDir);
      const outputPath = path.join(OUTPUT_DIR, `${session.id}.png`);

      await generateAndSaveTalkOgp({
        title: session.title,
        profileImagePath,
        speakerName: session.speaker.name,
        trackKey: meta.trackKey,
        trackName: meta.trackName,
        sessionTypeKey: meta.sessionTypeKey,
        dayNumber: meta.dayNumber,
        timeRange: meta.timeRange,
        baseImagePath: "public/OGP-talk.png",
        outputPath,
      });
    }

    console.log("✅ すべてのOGP画像の生成が完了しました。");
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error("❌ エラーが発生しました:", err);
  process.exit(1);
});
