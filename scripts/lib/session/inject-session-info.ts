import fs from "node:fs";
import type { MasterEntry } from "./types";

const OGP_TITLE_OVERRIDES_JSON = "scripts/data/ogp-title-overrides.json";
const SESSION_ID_SPEAKER_JSON = "scripts/data/session-id-speaker.json";
const SESSION_MASTER_JSON = "scripts/data/session-master.json";

type OgpTitleOverride = {
  id: string;
  ogpTitle: string;
};

function main() {
  if (!fs.existsSync(SESSION_ID_SPEAKER_JSON)) {
    console.error(
      `❌ セッションIDマップが見つかりません: ${SESSION_ID_SPEAKER_JSON}`,
    );
    process.exit(1);
  }
  if (!fs.existsSync(SESSION_MASTER_JSON)) {
    console.error(
      `❌ セッションマスターJSONが見つかりません: ${SESSION_MASTER_JSON}`,
    );
    process.exit(1);
  }

  const idToName: Record<string, string> = JSON.parse(
    fs.readFileSync(SESSION_ID_SPEAKER_JSON, "utf-8"),
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
  if (fs.existsSync(OGP_TITLE_OVERRIDES_JSON)) {
    const overrides: OgpTitleOverride[] = JSON.parse(
      fs.readFileSync(OGP_TITLE_OVERRIDES_JSON, "utf-8"),
    );
    for (const o of overrides) {
      ogpOverrides.set(o.id, o.ogpTitle);
    }
  }

  const master: MasterEntry[] = JSON.parse(
    fs.readFileSync(SESSION_MASTER_JSON, "utf-8"),
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
  fs.writeFileSync(
    SESSION_MASTER_JSON,
    JSON.stringify(ordered, null, 2) + "\n",
  );
  console.log(`✅ 完了 (更新: ${updated}件, スキップ: ${skipped}件)`);
}

main();
