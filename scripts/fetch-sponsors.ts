import fs from "node:fs";
import path from "node:path";
import type { SponsorApiResponse } from "@/types/sponsor-api";

const SPONSORS_API_URL =
  "https://tskaigi-cms.system-admin-df1.workers.dev/api/sponsors";

const OUTPUT_JSON = "src/constants/sponsors.json";
const OUTPUT_IMAGE_DIR = "public/sponsors";
const MANIFEST_JSON = "scripts/data/.sponsors-fetch-manifest.json";

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

function loadManifest(): Manifest {
  if (!fs.existsSync(MANIFEST_JSON)) return {};
  return JSON.parse(fs.readFileSync(MANIFEST_JSON, "utf-8"));
}

function saveManifest(manifest: Manifest) {
  fs.writeFileSync(MANIFEST_JSON, `${JSON.stringify(manifest, null, 2)}\n`);
}

function buildManifest(sponsors: SponsorApiResponse[]): Manifest {
  return Object.fromEntries(
    sponsors.map((sponsor) => [sponsor.slug, getImageUrls(sponsor)]),
  );
}

async function fetchSponsorsFromApi(): Promise<SponsorApiResponse[]> {
  const res = await fetch(SPONSORS_API_URL);
  if (!res.ok) {
    throw new Error(`スポンサーAPIの取得に失敗 (${res.status})`);
  }
  return res.json();
}

function manifestOnly(sponsors: SponsorApiResponse[]) {
  const manifest = buildManifest(sponsors);
  saveManifest(manifest);
  console.log(
    `✅ マニフェストを生成しました (${Object.keys(manifest).length}件)`,
  );
}

async function processSponsorImage(
  sponsor: SponsorApiResponse,
  kind: ImageKind,
  url: string,
  prev: ManifestEntry | undefined,
  force: boolean,
  throttle: boolean,
): Promise<ProcessResult> {
  const ext = extractExtension(url);
  const outputPath = path.join(OUTPUT_IMAGE_DIR, sponsor.slug, `${kind}${ext}`);
  const localPath = localImagePath(sponsor.slug, kind, ext);

  const shouldFetch =
    force || !fs.existsSync(outputPath) || !prev || prev[kind] !== url;

  if (!shouldFetch) {
    console.log(`✅ unchanged: ${sponsor.slug}/${kind}`);
    return { status: "unchanged", path: localPath };
  }

  if (throttle) await delay(200);
  await saveImage(url, outputPath);
  console.log(`✅ saved: ${outputPath}`);
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

async function main(force: boolean) {
  const sponsors = await fetchSponsorsFromApi();
  const prevManifest = force ? {} : loadManifest();

  fs.mkdirSync(OUTPUT_IMAGE_DIR, { recursive: true });

  let fetched = 0;
  let unchanged = 0;
  let skipped = 0;

  const normalized: SponsorApiResponse[] = [];

  for (const sponsor of sponsors) {
    const prev = prevManifest[sponsor.slug];
    const urls = getImageUrls(sponsor);
    const localPaths: ImageUrlMap = { logo: null, ogp: null, jobboard: null };

    try {
      for (const kind of IMAGE_KINDS) {
        const url = urls[kind];
        if (!url) continue;

        const result = await processSponsorImage(
          sponsor,
          kind,
          url,
          prev,
          force,
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

  fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(normalized, null, 2)}\n`);
  saveManifest(buildManifest(sponsors));

  console.log(
    `✅️ 完了 (フェッチ: ${fetched}件, 変更なし: ${unchanged}件, スキップ: ${skipped}件)`,
  );
}

if (process.argv.includes("--manifest-only")) {
  fetchSponsorsFromApi()
    .then(manifestOnly)
    .catch((error) => {
      console.error("❌ エラーが発生しました:", error);
      process.exit(1);
    });
} else {
  const force = process.argv.includes("--force");
  main(force).catch((error) => {
    console.error("❌ エラーが発生しました:", error);
    process.exit(1);
  });
}
