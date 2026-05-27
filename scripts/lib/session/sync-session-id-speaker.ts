import fs from "node:fs";
import type { ScriptsConfig } from "../../config";

type SpeakerEntry = {
  speaker: {
    name: string;
  };
};

/**
 * speakers.json から session-id-speaker.json を更新する。
 * ID 1 = ハンズオン固定、新規スピーカーは末尾に追番する。
 */
export function syncSessionIdSpeaker(config: ScriptsConfig): {
  total: number;
  added: number;
} {
  const { speakersJson, sessionIdSpeakerJson } = config.paths;
  const { handsonLabel } = config;

  if (!fs.existsSync(speakersJson)) {
    throw new Error(`スピーカーJSONが見つかりません: ${speakersJson}`);
  }

  const speakers: SpeakerEntry[] = JSON.parse(
    fs.readFileSync(speakersJson, "utf-8"),
  );

  const data: Record<string, string> = fs.existsSync(sessionIdSpeakerJson)
    ? JSON.parse(fs.readFileSync(sessionIdSpeakerJson, "utf-8"))
    : {};

  const existingNames = new Set(Object.values(data));

  data["1"] = handsonLabel;
  existingNames.add(handsonLabel);

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

  fs.writeFileSync(sessionIdSpeakerJson, `${JSON.stringify(data, null, 2)}\n`);
  return { total: Object.keys(data).length, added };
}
