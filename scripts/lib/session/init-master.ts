import fs from "node:fs";
import type { ScriptsConfig } from "../../config";
import type { SpeakerSource } from "./types";

/**
 * speakers.json（+ keynote / handson / ost）から session-master.json を生成する。
 * speakerId へのリネームと profileImageUrl の書き換えを行う。
 */
export function initMaster(config: ScriptsConfig): { count: number } {
  const { speakersJson, keynoteJson, handsonJson, ostJson, sessionMasterJson } =
    config.paths;

  if (!fs.existsSync(speakersJson)) {
    throw new Error(`スピーカーJSONが見つかりません: ${speakersJson}`);
  }

  const data: SpeakerSource[] = JSON.parse(
    fs.readFileSync(speakersJson, "utf-8"),
  );

  const renamed = data.map(({ id, slidesLink, speaker, title, overview }) => ({
    speakerId: id,
    title,
    overview,
    slidesLink,
    speaker: {
      ...speaker,
      profileImageUrl: `/speakers/${id}.png`,
    },
  }));

  for (const extraJson of [keynoteJson, handsonJson, ostJson]) {
    if (fs.existsSync(extraJson)) {
      const extra: SpeakerSource = JSON.parse(
        fs.readFileSync(extraJson, "utf-8"),
      );
      renamed.push({
        speakerId: extra.id,
        title: extra.title,
        overview: extra.overview,
        slidesLink: extra.slidesLink,
        speaker: {
          ...extra.speaker,
          profileImageUrl: extra.speaker.profileImageUrl,
        },
      });
    }
  }

  fs.writeFileSync(sessionMasterJson, `${JSON.stringify(renamed, null, 2)}\n`);
  return { count: renamed.length };
}
