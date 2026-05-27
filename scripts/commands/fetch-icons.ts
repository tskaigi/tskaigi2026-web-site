import fs from "node:fs";
import path from "node:path";
import { defineCommand } from "citty";
import { loadScriptsConfig, type ScriptsConfig } from "../config";
import type { MasterEntry } from "../lib/session/types";
import { createProgress } from "../utils/progress";

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

function loadManifest(manifestPath: string): Manifest {
  if (!fs.existsSync(manifestPath)) return {};
  return JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
}

function toManifestEntry(speaker: MasterEntry["speaker"]): ManifestEntry {
  return {
    userIcon: speaker.userIcon ?? "",
    xId: speaker.xId ?? "",
    githubId: speaker.githubId ?? "",
  };
}

function needsFetch(
  outputDir: string,
  speakerId: string,
  current: ManifestEntry,
  prev: Manifest,
): boolean {
  const outputPath = path.join(outputDir, `${speakerId}.png`);
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

function saveManifest(manifestPath: string, manifest: Manifest) {
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

function readMaster(sessionMasterJson: string): MasterEntry[] {
  if (!fs.existsSync(sessionMasterJson)) {
    throw new Error(
      `セッションマスターJSONが見つかりません: ${sessionMasterJson}`,
    );
  }
  return JSON.parse(fs.readFileSync(sessionMasterJson, "utf-8"));
}

function runManifestOnly(config: ScriptsConfig) {
  const master = readMaster(config.paths.sessionMasterJson);
  const manifest = buildManifest(master);
  saveManifest(config.paths.iconManifestJson, manifest);
  console.log(
    `✅ マニフェストを生成しました (${Object.keys(manifest).length}件)`,
  );
}

async function runFetch(config: ScriptsConfig, force: boolean) {
  const outputDir = config.paths.speakersImageDir;
  const master = readMaster(config.paths.sessionMasterJson);
  const prevManifest = force ? {} : loadManifest(config.paths.iconManifestJson);
  const nextManifest = buildManifest(master);

  fs.mkdirSync(outputDir, { recursive: true });

  let fetched = 0;
  let skipped = 0;
  let unchanged = 0;
  let processed = 0;
  const total = master.length;
  const progress = createProgress();

  for (const entry of master) {
    const { speaker } = entry;
    processed++;
    progress.update(
      `🚀 アイコン取得中 ${processed}/${total} (取得: ${fetched}, 変更なし: ${unchanged}, スキップ: ${skipped}) — ${speaker.name}`,
    );

    if (!speaker.profileImageUrl.startsWith("/speakers/")) {
      skipped++;
      continue;
    }

    if (!speaker.userIcon) {
      skipped++;
      continue;
    }

    if (
      !needsFetch(
        outputDir,
        entry.speakerId,
        nextManifest[entry.speakerId],
        prevManifest,
      )
    ) {
      unchanged++;
      continue;
    }

    if (fetched > 0) {
      await delay(config.fetchThrottleMs);
    }

    const outputPath = path.join(outputDir, `${entry.speakerId}.png`);

    try {
      const iconUrl = await resolveIconUrl(speaker);
      if (!iconUrl) {
        skipped++;
        continue;
      }

      await saveImage(iconUrl, outputPath);
      fetched++;
    } catch (error) {
      console.warn(`⚠️  failed (${speaker.name}):`, error);
    }
  }

  saveManifest(config.paths.iconManifestJson, nextManifest);

  progress.done(
    `✅️ 完了 (フェッチ: ${fetched}件, 変更なし: ${unchanged}件, スキップ: ${skipped}件)`,
  );
}

export default defineCommand({
  meta: {
    name: "fetch-icons",
    description: "X / GitHub からスピーカーアイコンを取得",
  },
  args: {
    force: {
      type: "boolean",
      description: "全件再取得する",
      default: false,
    },
    "manifest-only": {
      type: "boolean",
      description: "画像取得を行わずマニフェストのみ生成する",
      default: false,
    },
  },
  async run({ args }) {
    const config = await loadScriptsConfig();
    if (args["manifest-only"]) {
      runManifestOnly(config);
      return;
    }
    await runFetch(config, args.force);
  },
});
