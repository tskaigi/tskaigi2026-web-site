import fs from "node:fs";
import path from "node:path";
import { defineCommand } from "citty";
import type { SponsorApiResponse } from "@/types/sponsor-api";
import { loadScriptsConfig, type ScriptsConfig } from "../config";
import { createProgress } from "../utils/progress";

const IMAGE_KINDS = ["logo", "ogp", "jobboard"] as const;
type ImageKind = (typeof IMAGE_KINDS)[number];

type ImageUrlMap = Record<ImageKind, string | null>;
type ManifestEntry = ImageUrlMap;
type Manifest = Record<string, ManifestEntry>;

type ProcessResult =
  | { status: "fetched"; path: string }
  | { status: "unchanged"; path: string };

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function extractExtension(url: string): string {
  const ext = path.extname(new URL(url).pathname).toLowerCase();
  if (!ext) {
    throw new Error(`URL から拡張子を抽出できませんでした: ${url}`);
  }
  return ext;
}

function localImagePath(slug: string, kind: ImageKind, ext: string): string {
  return `/sponsors/${slug}/${kind}${ext}`;
}

function getImageUrls(sponsor: SponsorApiResponse): ImageUrlMap {
  return {
    logo: sponsor.logoImage,
    ogp: sponsor.ogpImage ?? null,
    jobboard: sponsor.jobboard?.imagePath ?? null,
  };
}

async function saveImage(url: string, outputPath: string): Promise<void> {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) {
    throw new Error(`画像取得に失敗 (${res.status}): ${url}`);
  }
  const bytes = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, bytes);
}

function loadManifest(manifestPath: string): Manifest {
  if (!fs.existsSync(manifestPath)) return {};
  return JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
}

function saveManifest(manifestPath: string, manifest: Manifest) {
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

function buildManifest(sponsors: SponsorApiResponse[]): Manifest {
  return Object.fromEntries(
    sponsors.map((sponsor) => [sponsor.slug, getImageUrls(sponsor)]),
  );
}

async function fetchSponsorsFromApi(
  apiUrl: string,
): Promise<SponsorApiResponse[]> {
  const res = await fetch(apiUrl);
  if (!res.ok) {
    throw new Error(`スポンサーAPIの取得に失敗 (${res.status})`);
  }
  return res.json();
}

async function processSponsorImage(
  outputImageDir: string,
  sponsor: SponsorApiResponse,
  kind: ImageKind,
  url: string,
  prev: ManifestEntry | undefined,
  force: boolean,
  throttleMs: number,
  throttle: boolean,
): Promise<ProcessResult> {
  const ext = extractExtension(url);
  const outputPath = path.join(outputImageDir, sponsor.slug, `${kind}${ext}`);
  const localPath = localImagePath(sponsor.slug, kind, ext);

  const shouldFetch =
    force || !fs.existsSync(outputPath) || !prev || prev[kind] !== url;

  if (!shouldFetch) {
    return { status: "unchanged", path: localPath };
  }

  if (throttle) await delay(throttleMs);
  await saveImage(url, outputPath);
  return { status: "fetched", path: localPath };
}

function normalize(
  sponsor: SponsorApiResponse,
  localPaths: ImageUrlMap,
): SponsorApiResponse {
  return {
    ...sponsor,
    logoImage: localPaths.logo ?? sponsor.logoImage,
    ogpImage: localPaths.ogp ?? "",
    jobboard:
      sponsor.jobboard && localPaths.jobboard
        ? { ...sponsor.jobboard, imagePath: localPaths.jobboard }
        : null,
  };
}

function runManifestOnly(
  config: ScriptsConfig,
  sponsors: SponsorApiResponse[],
) {
  const manifest = buildManifest(sponsors);
  saveManifest(config.paths.sponsorsManifestJson, manifest);
  console.log(
    `✅ マニフェストを生成しました (${Object.keys(manifest).length}件)`,
  );
}

async function runFetch(config: ScriptsConfig, force: boolean) {
  const outputImageDir = config.paths.sponsorsImageDir;
  const sponsors = await fetchSponsorsFromApi(config.sponsors.apiUrl);
  const prevManifest = force
    ? {}
    : loadManifest(config.paths.sponsorsManifestJson);

  fs.mkdirSync(outputImageDir, { recursive: true });

  let fetched = 0;
  let unchanged = 0;
  let skipped = 0;
  let processed = 0;
  const total = sponsors.length;
  const progress = createProgress();

  const normalized: SponsorApiResponse[] = [];

  for (const sponsor of sponsors) {
    processed++;
    progress.update(
      `🚀 スポンサー画像取得中 ${processed}/${total} (取得: ${fetched}, 変更なし: ${unchanged}, スキップ: ${skipped}) — ${sponsor.slug}`,
    );

    const prev = prevManifest[sponsor.slug];
    const urls = getImageUrls(sponsor);
    const localPaths: ImageUrlMap = { logo: null, ogp: null, jobboard: null };

    try {
      for (const kind of IMAGE_KINDS) {
        const url = urls[kind];
        if (!url) continue;

        const result = await processSponsorImage(
          outputImageDir,
          sponsor,
          kind,
          url,
          prev,
          force,
          config.fetchThrottleMs,
          fetched > 0,
        );
        localPaths[kind] = result.path;
        if (result.status === "fetched") {
          fetched++;
        } else {
          unchanged++;
        }
      }

      normalized.push(normalize(sponsor, localPaths));
    } catch (error) {
      skipped++;
      console.warn(`⚠️  failed (${sponsor.slug}):`, error);
    }
  }

  fs.writeFileSync(
    config.paths.frontendSponsorsJson,
    `${JSON.stringify(normalized, null, 2)}\n`,
  );
  saveManifest(config.paths.sponsorsManifestJson, buildManifest(sponsors));

  progress.done(
    `✅️ 完了 (フェッチ: ${fetched}件, 変更なし: ${unchanged}件, スキップ: ${skipped}件)`,
  );
}

export default defineCommand({
  meta: {
    name: "fetch-sponsors",
    description: "tskaigi-cms からスポンサー情報と画像を取得",
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
      const sponsors = await fetchSponsorsFromApi(config.sponsors.apiUrl);
      runManifestOnly(config, sponsors);
      return;
    }
    await runFetch(config, args.force);
  },
});
