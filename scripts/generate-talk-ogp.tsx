import { generateAndSaveTalkOgp } from "./lib/generate-talk-ogp";

/**
 * トークOGP画像生成スクリプト
 * 使用例: npx tsx scripts/generate-talk-ogp.tsx
 */
async function main() {
  try {
    // テスト用のサンプルデータ
    const sampleInput = {
      title: "The New Powerful ESLint Config with Type Safety",
      profileImagePath: "public/logo.png",
      speakerName: "IIHARA議長",
      trackName: "トグルルーム",
      sessionType: "招待講演",
      dayNumber: 1 as const,
      timeRange: "11:00 ~ 11:40",
      baseImagePath: "public/OGP-talk.png",
      outputPath: "public/ogp-sample-generated.png",
    };

    console.log("🚀 OGP画像生成を開始しています...");
    await generateAndSaveTalkOgp(sampleInput);
  } catch (error) {
    console.error("❌ エラーが発生しました:", error);
    process.exit(1);
  }
}

main();
