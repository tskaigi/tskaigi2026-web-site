import fs from "node:fs";
import path from "node:path";
import type { MasterEntry } from "./lib/session/types";

const SESSION_MASTER_JSON = "scripts/data/session-master.json";
const OUTPUT_DIR = "public/speakers";
const MANIFEST_JSON = "scripts/data/.icon-fetch-manifest.json";

type ManifestEntry = {
  userIcon: string;
  xId: string;
  githubId: string;
};

type Manifest = Record<string, ManifestEntry>;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function resolveIconUrl(
  speaker: MasterEntry["speaker"],
): Promise<string | null> {
  if (speaker.userIcon === "github" && speaker.githubId) {
    return `https://github.com/${speaker.githubId}.png`;
  }

  if (speaker.userIcon === "x" && speaker.xId) {
    const html = await (await fetch(`https://x.com/${speaker.xId}`)).text();
    const match = html.match(
      /https:\/\/pbs\.twimg\.com\/profile_images[^"'\s<]+/,
    );
    if (!match) {
      console.error(
        `  Xプロフィール画像URLをHTMLから抽出できませんでした (${speaker.xId})`,
      );
      return null;
    }
    return match[0].replace(/(_normal)(\.\w+)$/, "$2");
  }

  return null;
}

async function saveImage(url: string, outputPath: string): Promise<void> {
  const res = await fetch(url, { redirect: "follow" });
  const bytes = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outputPath, bytes);
}

function loadManifest(): Manifest {
  if (!fs.existsSync(MANIFEST_JSON)) return {};
  return JSON.parse(fs.readFileSync(MANIFEST_JSON, "utf-8"));
}

function toManifestEntry(speaker: MasterEntry["speaker"]): ManifestEntry {
  return {
    userIcon: speaker.userIcon ?? "",
    xId: speaker.xId ?? "",
    githubId: speaker.githubId ?? "",
  };
}

function needsFetch(
  speakerId: string,
  current: ManifestEntry,
  prev: Manifest,
): boolean {
  const outputPath = path.join(OUTPUT_DIR, `${speakerId}.png`);
  if (!fs.existsSync(outputPath)) return true;

  const old = prev[speakerId];
  if (!old) return true;

  return (
    old.userIcon !== current.userIcon ||
    old.xId !== current.xId ||
    old.githubId !== current.githubId
  );
}

function buildManifest(master: MasterEntry[]): Manifest {
  const manifest: Manifest = {};
  for (const entry of master) {
    manifest[entry.speakerId] = toManifestEntry(entry.speaker);
  }
  return manifest;
}

function saveManifest(manifest: Manifest) {
  fs.writeFileSync(MANIFEST_JSON, `${JSON.stringify(manifest, null, 2)}\n`);
}

function readMaster(): MasterEntry[] {
  if (!fs.existsSync(SESSION_MASTER_JSON)) {
    console.error(
      `❌ セッションマスターJSONが見つかりません: ${SESSION_MASTER_JSON}`,
    );
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(SESSION_MASTER_JSON, "utf-8"));
}

function manifestOnly() {
  const master = readMaster();
  const manifest = buildManifest(master);
  saveManifest(manifest);
  console.log(
    `✅ マニフェストを生成しました (${Object.keys(manifest).length}件)`,
  );
}

async function main(force: boolean) {
  const master = readMaster();
  const prevManifest = force ? {} : loadManifest();
  const nextManifest = buildManifest(master);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let fetched = 0;
  let skipped = 0;
  let unchanged = 0;

  for (const entry of master) {
    const { speaker } = entry;
    const manifestEntry = nextManifest[entry.speakerId];

    if (!speaker.profileImageUrl.startsWith("/speakers/")) {
      skipped++;
      console.log(`⏭️  skip: ${speaker.name} — 外部管理画像`);
      continue;
    }

    if (!speaker.userIcon) {
      skipped++;
      console.log(`⏭️  skip: ${speaker.name} — アイコン情報なし`);
      continue;
    }

    if (!needsFetch(entry.speakerId, manifestEntry, prevManifest)) {
      unchanged++;
      console.log(`✅ unchanged: ${speaker.name}`);
      continue;
    }

    if (fetched > 0) {
      await delay(200);
    }

    const outputPath = path.join(OUTPUT_DIR, `${entry.speakerId}.png`);

    try {
      const iconUrl = await resolveIconUrl(speaker);
      if (!iconUrl) {
        console.log(`⏭️  skip: ${speaker.name} — IDなし`);
        skipped++;
        continue;
      }

      await saveImage(iconUrl, outputPath);
      console.log(`✅ saved: ${outputPath}`);
      fetched++;
    } catch (error) {
      console.warn(`⚠️  failed (${speaker.name}):`, error);
    }
  }

  saveManifest(nextManifest);

  console.log(
    `✅️ 完了 (フェッチ: ${fetched}件, 変更なし: ${unchanged}件, スキップ: ${skipped}件)`,
  );
}

if (process.argv.includes("--manifest-only")) {
  manifestOnly();
} else {
  const force = process.argv.includes("--force");
  main(force).catch((error) => {
    console.error("❌ エラーが発生しました:", error);
    process.exit(1);
  });
}
