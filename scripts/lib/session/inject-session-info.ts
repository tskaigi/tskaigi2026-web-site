import fs from "node:fs";
import type { MasterEntry } from "./types";

const SESSIONS_JSON = "scripts/data/sessions-sample.json";
const SESSION_ID_SPEAKER_JSON = "scripts/data/session-id-speaker.json";
const SESSION_MASTER_JSON = "scripts/data/session-master.json";

type SessionEntry = {
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
  if (!fs.existsSync(SESSIONS_JSON)) {
    console.error(`❌ セッションJSONが見つかりません: ${SESSIONS_JSON}`);
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
  const nameToId = new Map(
    Object.entries(idToName).map(([id, name]) => [name, id]),
  );

  const sessions: SessionEntry[] = JSON.parse(
    fs.readFileSync(SESSIONS_JSON, "utf-8"),
  );
  const ogpTitleById = new Map(sessions.map((s) => [s.id, s.ogpTitle]));

  const master: MasterEntry[] = JSON.parse(
    fs.readFileSync(SESSION_MASTER_JSON, "utf-8"),
  );

  let updated = 0;
  let skipped = 0;

  for (const entry of master) {
    const id = nameToId.get(entry.speaker.name);
    if (id) {
      entry.id = id;
      const ogpTitle = ogpTitleById.get(id);
      if (ogpTitle) {
        entry.ogpTitle = ogpTitle;
      }
      updated++;
    } else {
      skipped++;
      console.log(`⏭️  skip: "${entry.speaker.name}" — IDなし`);
    }
  }

  fs.writeFileSync(SESSION_MASTER_JSON, JSON.stringify(master, null, 2) + "\n");
  console.log(`✅ 完了 (更新: ${updated}件, スキップ: ${skipped}件)`);
}

main();
