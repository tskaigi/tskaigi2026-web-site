import fs from "node:fs";
import type { MasterEntry } from "./types";

const SESSION_MASTER_JSON = "scripts/data/session-master.json";
const OUTPUT_JSON = "src/constants/session-master.json";

function main() {
  const master: MasterEntry[] = JSON.parse(
    fs.readFileSync(SESSION_MASTER_JSON, "utf-8"),
  );

  const byId: Record<string, MasterEntry> = {};
  for (const entry of master) {
    if (entry.id) {
      byId[entry.id] = entry;
    }
  }

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(byId, null, 2) + "\n");
  console.log(`✅ 完了 (${Object.keys(byId).length}件)`);
}

main();
