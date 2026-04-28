import fs from "node:fs";

const SPEAKERS_JSON = "scripts/data/speakers.json";
const SESSION_ID_SPEAKER_JSON = "scripts/data/session-id-speaker.json";
const HANDSON_LABEL = "ハンズオン";

type SpeakerEntry = {
  speaker: {
    name: string;
  };
};

function main() {
  if (!fs.existsSync(SPEAKERS_JSON)) {
    console.error(`❌ スピーカーJSONが見つかりません: ${SPEAKERS_JSON}`);
    process.exit(1);
  }

  const speakers: SpeakerEntry[] = JSON.parse(
    fs.readFileSync(SPEAKERS_JSON, "utf-8"),
  );

  const data: Record<string, string> = fs.existsSync(SESSION_ID_SPEAKER_JSON)
    ? JSON.parse(fs.readFileSync(SESSION_ID_SPEAKER_JSON, "utf-8"))
    : {};

  const existingNames = new Set(Object.values(data));

  data["1"] = HANDSON_LABEL;
  existingNames.add(HANDSON_LABEL);

  const maxId = Object.keys(data).reduce(
    (max, k) => Math.max(max, Number(k)),
    1,
  );

  let nextId = maxId + 1;
  let added = 0;

  for (const s of speakers) {
    if (!existingNames.has(s.speaker.name)) {
      data[String(nextId)] = s.speaker.name;
      nextId++;
      added++;
    }
  }

  fs.writeFileSync(
    SESSION_ID_SPEAKER_JSON,
    JSON.stringify(data, null, 2) + "\n",
  );
  console.log(
    `✅ 完了 (既存: ${existingNames.size}件, 追加: ${added}件, ハンズオン: ID ${nextId})`,
  );
}

main();
