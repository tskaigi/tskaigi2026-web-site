import fs from "fs";
import path from "path";
import type { TrackKey } from "../src/types/timetable-api";
import { generateAndSaveTalkOgp } from "./lib/generate-talk-ogp";

const OST_JSON = "scripts/data/ost.json";
const OUTPUT_DIR = "public/talks";

type OstData = {
  id: string;
  title: string;
  sessionTypeName: string;
  sessionTypeColor: string;
  trackKey: TrackKey;
  trackName: string;
  dayNumber: 1 | 2;
  timeRange: string;
};

async function main() {
  if (!fs.existsSync(OST_JSON)) {
    console.error(`❌ OST JSONが見つかりません: ${OST_JSON}`);
    process.exit(1);
  }

  const data: OstData = JSON.parse(fs.readFileSync(OST_JSON, "utf-8"));
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const outputPath = path.join(OUTPUT_DIR, `${data.id}.png`);

  await generateAndSaveTalkOgp({
    title: data.title,
    profileImagePath: "public/logo-2026.png",
    profileImageFit: "contain",
    speakerName: "TSKaigi運営",
    trackKey: data.trackKey,
    trackName: data.trackName,
    sessionTypeName: data.sessionTypeName,
    sessionTypeColor: data.sessionTypeColor,
    dayNumber: data.dayNumber,
    timeRange: data.timeRange,
    baseImagePath: "public/OGP-talk.png",
    outputPath,
  });

  console.log("✅ OST OGP画像の生成が完了しました。");
}

main().catch((err) => {
  console.error("❌ エラーが発生しました:", err);
  process.exit(1);
});
