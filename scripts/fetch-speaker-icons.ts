import fs from "node:fs";
import path from "node:path";
import type { MasterEntry } from "./lib/session/types";

const SESSION_MASTER_JSON = "scripts/data/session-master.json";
const OUTPUT_DIR = "public/speakers";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function resolveIconUrl(
  speaker: MasterEntry["speaker"],
): Promise<string | null> {
  if (speaker.useIcon === "github" && speaker.githubId) {
    return `https://github.com/${speaker.githubId}.png`;
  }

  if (speaker.useIcon === "x" && speaker.xId) {
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

async function main() {
  if (!fs.existsSync(SESSION_MASTER_JSON)) {
    console.error(
      `❌ セッションマスターJSONが見つかりません: ${SESSION_MASTER_JSON}`,
    );
    process.exit(1);
  }

  const master: MasterEntry[] = JSON.parse(
    fs.readFileSync(SESSION_MASTER_JSON, "utf-8"),
  );

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const [index, entry] of master.entries()) {
    if (index > 0) {
      await delay(200);
    }

    const { speaker } = entry;

    if (!speaker.useIcon) {
      console.log(`⏭️  skip: ${speaker.name} — アイコン情報なし`);
      continue;
    }

    const outputPath = path.join(OUTPUT_DIR, `${entry.speakerId}.png`);

    try {
      const iconUrl = await resolveIconUrl(speaker);
      if (!iconUrl) {
        console.log(`⏭️  skip: ${speaker.name} — IDなし`);
        continue;
      }

      await saveImage(iconUrl, outputPath);
      console.log(`✅ saved: ${outputPath}`);
    } catch (error) {
      console.warn(`⚠️  failed (${speaker.name}):`, error);
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
