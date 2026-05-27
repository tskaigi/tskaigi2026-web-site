import fs from "node:fs";
import type { ScriptsConfig } from "../../config";
import type { MasterEntry } from "./types";

type CheckResult = {
  id: string;
  speakerName: string;
  speaker: {
    hasXId: boolean;
    hasGithubId: boolean;
    hasUserIcon: boolean;
    hasBio: boolean;
  };
  session: {
    hasId: boolean;
    hasOgpTitle: boolean;
  };
  titleCheck: {
    titleMatchesOgpTitle: boolean;
    title: string;
    ogpTitle: string;
  };
};

export type CompletenessSummary = {
  total: number;
  noIcon: number;
  noBio: number;
  noSession: number;
  noOgpTitle: number;
  titleMismatch: number;
  idMismatch: number;
  outputPath: string;
};

/**
 * アイコン・bio・ID・OGPタイトルなどの整合性をチェックし、
 * 詳細を data-completeness.json に出力してサマリを返す。
 */
export function checkDataCompleteness(
  config: ScriptsConfig,
): CompletenessSummary {
  const { sessionMasterJson, frontendSessionMasterJson, dataCompletenessJson } =
    config.paths;

  if (!fs.existsSync(sessionMasterJson)) {
    throw new Error(
      `セッションマスターJSONが見つかりません: ${sessionMasterJson}`,
    );
  }

  const master: MasterEntry[] = JSON.parse(
    fs.readFileSync(sessionMasterJson, "utf-8"),
  );

  const normalize = (s: string) => s.replace(/[\s\p{P}\p{S}]/gu, "");

  const results: CheckResult[] = master.map((entry) => {
    const title = entry.title ?? "";
    const ogpTitle = entry.ogpTitle ?? "";

    return {
      id: entry.id ?? "",
      speakerName: entry.speaker.name,
      speaker: {
        hasXId: !!entry.speaker.xId,
        hasGithubId: !!entry.speaker.githubId,
        hasUserIcon: !!entry.speaker.userIcon,
        hasBio: !!entry.speaker.bio,
      },
      session: {
        hasId: !!entry.id,
        hasOgpTitle: !!entry.ogpTitle,
      },
      titleCheck: {
        titleMatchesOgpTitle: normalize(title) === normalize(ogpTitle),
        title,
        ogpTitle,
      },
    };
  });

  fs.writeFileSync(
    dataCompletenessJson,
    `${JSON.stringify(results, null, 2)}\n`,
  );

  const total = results.length;
  const noIcon = results.filter(
    (r) =>
      !r.speaker.hasUserIcon && !r.speaker.hasXId && !r.speaker.hasGithubId,
  ).length;
  const noSession = results.filter((r) => !r.session.hasId).length;
  const noOgpTitle = results.filter((r) => !r.session.hasOgpTitle).length;
  const titleMismatch = results.filter(
    (r) => r.session.hasOgpTitle && !r.titleCheck.titleMatchesOgpTitle,
  ).length;
  const noBio = results.filter((r) => !r.speaker.hasBio).length;

  let idMismatch = 0;
  if (fs.existsSync(frontendSessionMasterJson)) {
    const frontend: Record<string, MasterEntry> = JSON.parse(
      fs.readFileSync(frontendSessionMasterJson, "utf-8"),
    );
    for (const [key, value] of Object.entries(frontend)) {
      if (value.id !== key) {
        console.error(`❌ ID不一致: key="${key}" value.id="${value.id}"`);
        idMismatch++;
      }
    }
  }

  return {
    total,
    noIcon,
    noBio,
    noSession,
    noOgpTitle,
    titleMismatch,
    idMismatch,
    outputPath: dataCompletenessJson,
  };
}
