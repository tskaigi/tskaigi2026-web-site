import fs from "node:fs";
import type { MasterEntry, Speaker, UseIcon } from "./types";

const ICON_DATA_TSV = "scripts/data/icon-data.tsv";
const SESSION_MASTER_JSON = "scripts/data/session-master.json";

type IconEntry = {
  speakerName: string;
  useIcon: string;
  serviceId: string;
};

function parseTsv(filePath: string): IconEntry[] {
  const lines = fs.readFileSync(filePath, "utf-8").trim().split("\n");
  return lines.slice(1).map((line) => {
    const [speakerName, useIcon, serviceId] = line.split("\t");
    return {
      speakerName: speakerName.trim(),
      useIcon: useIcon.trim().toLowerCase(),
      serviceId: (serviceId ?? "").trim(),
    };
  });
}

function resolveUseIcon(
  tsvEntry: IconEntry | undefined,
  speaker: Speaker,
): UseIcon | null {
  if (tsvEntry && tsvEntry.serviceId) {
    return tsvEntry.useIcon === "github" ? "github" : "x";
  }

  if (speaker.githubId) return "github";
  if (speaker.xId) return "x";
  return null;
}

function main() {
  if (!fs.existsSync(ICON_DATA_TSV)) {
    console.error(`❌ TSVファイルが見つかりません: ${ICON_DATA_TSV}`);
    process.exit(1);
  }
  if (!fs.existsSync(SESSION_MASTER_JSON)) {
    console.error(`❌ スピーカーJSONが見つかりません: ${SESSION_MASTER_JSON}`);
    process.exit(1);
  }

  const iconEntries = parseTsv(ICON_DATA_TSV);
  const tsvByName = new Map(iconEntries.map((e) => [e.speakerName, e]));

  const speakers: MasterEntry[] = JSON.parse(
    fs.readFileSync(SESSION_MASTER_JSON, "utf-8"),
  );

  let updated = 0;
  let skipped = 0;

  for (const entry of speakers) {
    const tsvEntry = tsvByName.get(entry.speaker.name);
    const useIcon = resolveUseIcon(tsvEntry, entry.speaker);

    if (useIcon) {
      entry.speaker.useIcon = useIcon;
      updated++;
    } else {
      skipped++;
      console.log(`⏭️  skip: "${entry.speaker.name}" — アイコン情報なし`);
    }
  }

  fs.writeFileSync(
    SESSION_MASTER_JSON,
    JSON.stringify(speakers, null, 2) + "\n",
  );
  console.log(`✅ 完了 (更新: ${updated}件, スキップ: ${skipped}件)`);
}

main();
