import fs from "fs";
import path from "path";
import sessionIdMapJson from "./data/session-id-map.json";

const sessionIdMap: Record<string, string> = sessionIdMapJson;
import { generateAndSaveTalkOgp } from "./lib/generate-talk-ogp";
import { getSessionMeta } from "./lib/session-metadata";

const DEFAULT_PROFILE_IMAGE = "public/logo-2026.png";
const SPEAKER_ICON_DIR = "public/talks";
const OUTPUT_DIR = "public/ogp/talks";
const SESSIONS_JSON = "scripts/data/sessions-sample.json";
const SPEAKERS_JSON = "scripts/data/speakers.json";

type SessionEntry = {
  id: string;
  title: string;
};

type SpeakerEntry = {
  id: string;
  speaker: {
    name: string;
    profileImageUrl?: string;
  };
};

function resolveProfileImagePath(sessionId: string): string {
  const iconPath = path.join(SPEAKER_ICON_DIR, `${sessionId}.png`);
  if (fs.existsSync(iconPath)) return iconPath;
  return DEFAULT_PROFILE_IMAGE;
}

async function main() {
  const sessionsPath = process.argv[2] ?? SESSIONS_JSON;

  if (!fs.existsSync(sessionsPath)) {
    console.error(`❌ セッションJSONが見つかりません: ${sessionsPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(SPEAKERS_JSON)) {
    console.error(`❌ スピーカーJSONが見つかりません: ${SPEAKERS_JSON}`);
    process.exit(1);
  }

  const sessions: SessionEntry[] = JSON.parse(
    fs.readFileSync(sessionsPath, "utf-8"),
  );
  const speakers: SpeakerEntry[] = JSON.parse(
    fs.readFileSync(SPEAKERS_JSON, "utf-8"),
  );

  const speakerBySlug = new Map(speakers.map((s) => [s.id, s]));

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(`🚀 OGP画像生成を開始しています... (${sessions.length}件)`);

  let generated = 0;
  let skipped = 0;

  for (const session of sessions) {
    const meta = getSessionMeta(session.id);
    if (!meta) {
      console.warn(
        `⚠️ セッションID "${session.id}" のメタデータが見つかりません。スキップします。`,
      );
      skipped++;
      continue;
    }

    const slug = sessionIdMap[session.id];
    if (!slug) {
      console.warn(
        `⚠️ セッションID "${session.id}" のスラッグIDが対応表にありません。スキップします。`,
      );
      skipped++;
      continue;
    }

    const speaker = speakerBySlug.get(slug);
    if (!speaker) {
      console.warn(
        `⚠️ スラッグID "${slug}" がスピーカーJSONに見つかりません。スキップします。`,
      );
      skipped++;
      continue;
    }

    const profileImagePath = resolveProfileImagePath(session.id);
    const outputPath = path.join(OUTPUT_DIR, `${session.id}.png`);

    await generateAndSaveTalkOgp({
      title: session.title,
      profileImagePath,
      speakerName: speaker.speaker.name,
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
    `✅ OGP画像生成が完了しました。(生成: ${generated}件, スキップ: ${skipped}件)`,
  );
}

main().catch((err) => {
  console.error("❌ エラーが発生しました:", err);
  process.exit(1);
});
