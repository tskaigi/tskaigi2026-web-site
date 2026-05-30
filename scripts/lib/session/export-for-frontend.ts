import fs from "node:fs";
import type { ScriptsConfig } from "../../config";
import type { MasterEntry } from "./types";

/**
 * session-master.json をフロントエンド用の ID:value 形式で出力する。
 */
export function exportForFrontend(config: ScriptsConfig): { count: number } {
  const { sessionMasterJson, frontendSessionMasterJson } = config.paths;

  const master: MasterEntry[] = JSON.parse(
    fs.readFileSync(sessionMasterJson, "utf-8"),
  );

  const byId: Record<string, MasterEntry> = {};
  for (const entry of master) {
    if (entry.id) {
      byId[entry.id] = {
        id: entry.id,
        speakerId: entry.speakerId,
        title: entry.title,
        ogpTitle: entry.ogpTitle,
        overview: entry.overview,
        slidesLink: entry.slidesLink,
        speaker: entry.speaker,
      };
    }
  }

  fs.writeFileSync(
    frontendSessionMasterJson,
    `${JSON.stringify(byId, null, 2)}\n`,
  );
  return { count: Object.keys(byId).length };
}
