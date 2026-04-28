import fs from "node:fs";
import path from "node:path";
import sessionIdMap from "./data/session-id-map.json" with { type: "json" };

const reverseSessionIdMap: Record<string, string> = Object.fromEntries(
  Object.entries(sessionIdMap).map(([numId, slug]) => [slug, numId]),
);

const OUTPUT_DIR = "public/talks";
const ICON_DATA_TSV = "scripts/data/icon-data.tsv";
const SPEAKERS_JSON = "scripts/data/speakers.json";

type IconService = "x" | "github";

type IconEntry = {
  speakerName: string;
  useIcon: IconService;
  serviceId: string;
};

type SpeakerEntry = {
  id: string;
  speaker: {
    name: string;
  };
};

function parseTsv(filePath: string): IconEntry[] {
  const lines = fs.readFileSync(filePath, "utf-8").trim().split("\n");
  // skip header
  return lines.slice(1).map((line) => {
    const [speakerName, useIcon, serviceId] = line.split("\t");
    return {
      speakerName: speakerName.trim(),
      useIcon: useIcon.trim().toLowerCase() as IconService,
      serviceId: (serviceId ?? "").trim(),
    };
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function resolveIconUrl(entry: IconEntry): Promise<string | null> {
  if (!entry.serviceId) return null;

  if (entry.useIcon === "github") {
    return `https://github.com/${entry.serviceId}.png`;
  }

  if (entry.useIcon === "x") {
    const html = await (await fetch(`https://x.com/${entry.serviceId}`)).text();
    const match = html.match(
      /https:\/\/pbs\.twimg\.com\/profile_images[^"'\s<]+/,
    );
    if (!match) {
      console.error(
        `  Xプロフィール画像URLをHTMLから抽出できませんでした (${entry.serviceId})`,
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

async function main() {
  if (!fs.existsSync(ICON_DATA_TSV)) {
    console.error(`❌ TSVファイルが見つかりません: ${ICON_DATA_TSV}`);
    process.exit(1);
  }
  if (!fs.existsSync(SPEAKERS_JSON)) {
    console.error(`❌ スピーカーJSONが見つかりません: ${SPEAKERS_JSON}`);
    process.exit(1);
  }

  const iconEntries = parseTsv(ICON_DATA_TSV);
  const speakers: SpeakerEntry[] = JSON.parse(
    fs.readFileSync(SPEAKERS_JSON, "utf-8"),
  );

  const speakerByName = new Map(speakers.map((s) => [s.speaker.name, s]));

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const [index, entry] of iconEntries.entries()) {
    if (index > 0) {
      await delay(200);
    }

    const speaker = speakerByName.get(entry.speakerName);
    if (!speaker) {
      console.log(
        `⏭️  skip: "${entry.speakerName}" がspeakers.jsonに見つかりません`,
      );
      continue;
    }

    const numericId = reverseSessionIdMap[speaker.id];
    if (!numericId) {
      console.log(
        `⏭️  skip: "${speaker.id}" の数字IDが対応表にありません`,
      );
      continue;
    }

    const outputPath = path.join(OUTPUT_DIR, `${numericId}.png`);

    try {
      const iconUrl = await resolveIconUrl(entry);
      if (!iconUrl) {
        console.log(`⏭️  skip (${numericId}): ${entry.speakerName} — IDなし`);
        continue;
      }

      await saveImage(iconUrl, outputPath);
      console.log(`✅ saved (${numericId}): ${outputPath}`);
    } catch (error) {
      console.warn(`⚠️  failed (${numericId}):`, error);
    }
  }

  console.log(
    `✅️ すべてのアイコンのダウンロードが完了しました。出力ディレクトリ: ${OUTPUT_DIR}`,
  );
}

main().catch((error) => {
  console.error("❌ エラーが発生しました:", error);
  process.exit(1);
});
