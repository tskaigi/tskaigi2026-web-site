import fs from "node:fs";
import type { MasterEntry } from "./types";

const SESSION_MASTER_JSON = "scripts/data/session-master.json";
const FRONTEND_JSON = "src/constants/session-master.json";
const OUTPUT_JSON = "scripts/data/data-completeness.json";

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

function main() {
  if (!fs.existsSync(SESSION_MASTER_JSON)) {
    console.error(
      `❌ セッションマスターJSONが見つかりません: ${SESSION_MASTER_JSON}`,
    );
    process.exit(1);
  }

  const master: MasterEntry[] = JSON.parse(
    fs.readFileSync(SESSION_MASTER_JSON, "utf-8"),
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

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(results, null, 2) + "\n");

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
  if (fs.existsSync(FRONTEND_JSON)) {
    const frontend: Record<string, MasterEntry> = JSON.parse(
      fs.readFileSync(FRONTEND_JSON, "utf-8"),
    );
    for (const [key, value] of Object.entries(frontend)) {
      if (value.id !== key) {
        console.error(`❌ ID不一致: key="${key}" value.id="${value.id}"`);
        idMismatch++;
      }
    }
  }

  console.log(`📊 チェック結果 (${total}件)`);
  console.log(`  アイコン情報なし: ${noIcon}件`);
  console.log(`  bioなし: ${noBio}件`);
  console.log(`  idなし: ${noSession}件`);
  console.log(`  ogpTitleなし: ${noOgpTitle}件`);
  console.log(`  title≠ogpTitle: ${titleMismatch}件`);
  console.log(`  フロントエンドID不一致: ${idMismatch}件`);
  console.log(`✅ 詳細を出力しました: ${OUTPUT_JSON}`);
}

main();
