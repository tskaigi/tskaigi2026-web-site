import fs from "node:fs";
import type { ScriptsConfig } from "../../config";
import type { MasterEntry } from "./types";

type OgpTitleOverride = {
  id: string;
  ogpTitle: string;
};

/**
 * session-id-speaker.json をもとに各エントリへ id と ogpTitle を挿入する。
 */
export function injectSessionInfo(config: ScriptsConfig): {
  updated: number;
  skipped: number;
} {
  const { sessionIdSpeakerJson, sessionMasterJson, ogpTitleOverridesJson } =
    config.paths;

  if (!fs.existsSync(sessionIdSpeakerJson)) {
    throw new Error(
      `セッションIDマップが見つかりません: ${sessionIdSpeakerJson}`,
    );
  }
  if (!fs.existsSync(sessionMasterJson)) {
    throw new Error(
      `セッションマスターJSONが見つかりません: ${sessionMasterJson}`,
    );
  }

  const idToName: Record<string, string> = JSON.parse(
    fs.readFileSync(sessionIdSpeakerJson, "utf-8"),
  );
  const nameToIds = new Map<string, string[]>();
  for (const [id, name] of Object.entries(idToName)) {
    const ids = nameToIds.get(name);
    if (ids) {
      ids.push(id);
    } else {
      nameToIds.set(name, [id]);
    }
  }

  const ogpOverrides = new Map<string, string>();
  if (fs.existsSync(ogpTitleOverridesJson)) {
    const overrides: OgpTitleOverride[] = JSON.parse(
      fs.readFileSync(ogpTitleOverridesJson, "utf-8"),
    );
    for (const o of overrides) {
      ogpOverrides.set(o.id, o.ogpTitle);
    }
  }

  const master: MasterEntry[] = JSON.parse(
    fs.readFileSync(sessionMasterJson, "utf-8"),
  );

  let updated = 0;
  let skipped = 0;

  for (const entry of master) {
    const ids = nameToIds.get(entry.speaker.name);
    if (ids && ids.length > 0) {
      const id = ids.shift()!;
      entry.id = id;
      const ogpTitle = ogpOverrides.get(id);
      entry.ogpTitle = ogpTitle ?? entry.title;
      updated++;
    } else {
      skipped++;
      console.log(`⏭️  skip: "${entry.speaker.name}" — IDなし`);
    }
  }

  const ordered = master.map(
    ({ id, speakerId, title, ogpTitle, overview, speaker, ...rest }) => ({
      id,
      speakerId,
      title,
      ogpTitle,
      overview,
      speaker,
      ...rest,
    }),
  );
  fs.writeFileSync(sessionMasterJson, `${JSON.stringify(ordered, null, 2)}\n`);
  return { updated, skipped };
}
