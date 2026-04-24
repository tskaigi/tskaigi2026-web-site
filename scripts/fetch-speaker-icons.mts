import fs from "node:fs";
import path from "node:path";
import type { SessionSummary } from "../src/types/timetable-api";

type IconService = "X" | "GitHub";

type SessionWithIcon = Omit<SessionSummary, "speaker"> & {
  speaker: SessionSummary["speaker"] & {
    useIcon?: IconService;
  };
};

const OUTPUT_DIR = "public/talks";
const DEFAULT_JSON_PATH = "scripts/data/sessions-sample.json";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function resolveIconUrl(
  session: SessionWithIcon,
): Promise<string | null> {
  const { speaker } = session;

  if (speaker.name === "TSKaigi運営") {
    return null;
  }

  if (speaker.useIcon === "GitHub") {
    if (!speaker.githubId) {
      console.error("githubId が未設定です。");
      return null;
    }
    return `https://github.com/${speaker.githubId}.png`;
  } else if (speaker.useIcon === "X") {
    if (!speaker.xId) {
      console.error("xId が未設定です。");
      return null;
    }

    const html = await (await fetch(`https://x.com/${speaker.xId}`)).text();

    const match = html.match(
      /https:\/\/pbs\.twimg\.com\/profile_images[^"'\\s<]+/,
    );
    if (!match) {
      console.error("Xプロフィール画像URLをHTMLから抽出できませんでした。");
      return null;
    }

    // 画像URLの末尾のサイズ指定を削除
    const xIconUrl = match[0].replace(/(_normal)(\.\w+)$/, "$2");

    return xIconUrl;
  }

  return null;
}

async function saveImage(url: string, outputPath: string): Promise<void> {
  const res = await fetch(url, { redirect: "follow" });
  const bytes = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outputPath, bytes);
}

async function main() {
  const jsonPath = process.argv[2] ?? DEFAULT_JSON_PATH;

  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ JSONファイルが見つかりません: ${jsonPath}`);
    process.exit(1);
  }

  const sessions = JSON.parse(
    fs.readFileSync(jsonPath, "utf-8"),
  ) as SessionWithIcon[];
  if (!Array.isArray(sessions)) {
    console.error(
      "❌ JSONファイルの形式が正しくありません。配列を指定してください。",
    );
    process.exit(1);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const [index, session] of sessions.entries()) {
    if (index > 0) {
      await delay(200); // 念のためちょっと間隔を開ける
    }

    const outputPath = path.join(OUTPUT_DIR, `${session.id}.png`);

    try {
      const iconUrl = await resolveIconUrl(session);
      if (!iconUrl) {
        console.log(`⏭️  skip (${session.id}): ${session.speaker.name}`);
        continue;
      }

      await saveImage(iconUrl, outputPath);
      console.log(`✅ saved (${session.id}): ${outputPath}`);
    } catch (error) {
      console.warn(`⚠️  failed (${session.id}):`, error);
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
