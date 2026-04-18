import sharp from "sharp";
import fs from "fs";
import path from "path";

type TalkOgpInput = {
  title: string;
  profileImagePath: string;
  speakerName: string;
  trackName: string;
  sessionType: string;
  dayNumber: 1 | 2;
  timeRange: string;
  baseImagePath: string;
  outputPath: string;
};

/**
 * 画像ファイルを読み込む
 */
async function loadImageAsBuffer(filePath: string): Promise<Buffer> {
  const absolutePath = path.resolve(filePath);
  return fs.promises.readFile(absolutePath);
}

/**
 * SVGを生成
 */
function generateOgpSvg(input: TalkOgpInput): string {
  const dayLabel = input.dayNumber === 1 ? "DAY1" : "DAY2";
  const padding = 40;
  const badgeHeight = 44;
  const badgeGap = 12;
  const profileRadius = 40;

  // メタ情報レイアウト
  const metadataY = padding;
  const titleY = 250;
  const speakerY = 530;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <clipPath id="profileClip">
        <circle cx="${padding + profileRadius}" cy="${speakerY + profileRadius}" r="${profileRadius}" />
      </clipPath>
    </defs>

    <!-- ベース画像 -->
    <image width="1200" height="630" xlink:href="data:image/png;base64,${input.baseImageBuffer}" />

    <!-- 上部: メタ情報 -->
    <!-- トラック名バッジ -->
    <rect x="${padding}" y="${metadataY}" width="210" height="${badgeHeight}" fill="#00D4AA" rx="4" />
    <text x="${padding + 105}" y="${metadataY + 29}" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${escapeXml(input.trackName)}</text>

    <!-- セッションタイプバッジ -->
    <rect x="${padding + 222}" y="${metadataY}" width="190" height="${badgeHeight}" fill="#FFFFFF" stroke="#333333" stroke-width="2" rx="4" />
    <text x="${padding + 317}" y="${metadataY + 29}" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#333333" text-anchor="middle">${escapeXml(input.sessionType)}</text>

    <!-- DAYバッジ -->
    <rect x="${padding + 424}" y="${metadataY}" width="90" height="${badgeHeight}" fill="#0066FF" rx="4" />
    <text x="${padding + 469}" y="${metadataY + 29}" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${dayLabel}</text>

    <!-- 時刻テキスト -->
    <text x="${padding + 526}" y="${metadataY + 29}" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#333333">${escapeXml(input.timeRange)}</text>

    <!-- 中央: タイトル -->
    <text x="${padding}" y="${titleY}" font-family="Arial, sans-serif" font-size="52" font-weight="bold" fill="#1A1A1A" line-height="1.3">${escapeXml(input.title.substring(0, 50))}</text>
    ${input.title.length > 50 ? `<text x="${padding}" y="${titleY + 70}" font-family="Arial, sans-serif" font-size="52" font-weight="bold" fill="#1A1A1A">${escapeXml(input.title.substring(50))}</text>` : ""}

    <!-- 下部: 登壇者情報 -->
    <!-- プロフィール画像（円形） -->
    <image x="${padding}" y="${speakerY}" width="${profileRadius * 2}" height="${profileRadius * 2}" xlink:href="data:image/png;base64,${input.profileImageBuffer}" clip-path="url(#profileClip)" />

    <!-- 登壇者名 -->
    <text x="${padding + profileRadius * 2 + 20}" y="${speakerY + 50}" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#1A1A1A">${escapeXml(input.speakerName)}</text>
  </svg>`;
}

/**
 * XML特殊文字をエスケープ
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * トークOGP画像を生成
 */
export async function generateTalkOgpImage(
  input: TalkOgpInput
): Promise<Buffer> {
  // 基本画像とプロフィール画像を読み込む
  const baseImageBuffer = await loadImageAsBuffer(input.baseImagePath);
  const profileImageBuffer = await loadImageAsBuffer(input.profileImagePath);

  const baseImageBase64 = baseImageBuffer.toString("base64");
  const profileImageBase64 = profileImageBuffer.toString("base64");

  // SVGを生成
  const svg = generateOgpSvg({
    ...input,
    baseImageBuffer: baseImageBase64,
    profileImageBuffer: profileImageBase64,
  } as TalkOgpInput & {
    baseImageBuffer: string;
    profileImageBuffer: string;
  });

  // SVGをPNGに変換
  const pngBuffer = await sharp(Buffer.from(svg))
    .png()
    .toBuffer();

  return pngBuffer;
}

/**
 * トークOGP画像を生成して保存
 */
export async function generateAndSaveTalkOgp(
  input: TalkOgpInput
): Promise<void> {
  const pngBuffer = await generateTalkOgpImage(input);

  const outputDir = path.dirname(input.outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  await fs.promises.writeFile(input.outputPath, pngBuffer);
  console.log(`✅ OGP画像を生成しました: ${input.outputPath}`);
}
