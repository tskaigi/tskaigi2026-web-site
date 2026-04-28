import fs from "node:fs";
import type { SpeakerSource } from "./types";

const SPEAKERS_JSON = "scripts/data/speakers.json";
const KEYNOTE_JSON = "scripts/data/keynote.json";
const SESSION_MASTER_JSON = "scripts/data/session-master.json";

function main() {
  if (!fs.existsSync(SPEAKERS_JSON)) {
    console.error(`❌ スピーカーJSONが見つかりません: ${SPEAKERS_JSON}`);
    process.exit(1);
  }

  const data: SpeakerSource[] = JSON.parse(
    fs.readFileSync(SPEAKERS_JSON, "utf-8"),
  );

  const renamed = data.map(
    ({ id, slidesLink: _, speaker, title, overview }) => ({
      speakerId: id,
      title,
      overview,
      speaker: {
        ...speaker,
        profileImageUrl: `/speakers/${id}.png`,
      },
    }),
  );

  if (fs.existsSync(KEYNOTE_JSON)) {
    const keynote: SpeakerSource = JSON.parse(
      fs.readFileSync(KEYNOTE_JSON, "utf-8"),
    );
    renamed.push({
      speakerId: keynote.id,
      title: keynote.title,
      overview: keynote.overview,
      speaker: {
        ...keynote.speaker,
        profileImageUrl: keynote.speaker.profileImageUrl,
      },
    });
  }

  fs.writeFileSync(
    SESSION_MASTER_JSON,
    JSON.stringify(renamed, null, 2) + "\n",
  );
  console.log(`✅ 完了 (${renamed.length}件)`);
}

main();
