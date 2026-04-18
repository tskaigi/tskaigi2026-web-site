import sharp from "sharp";
import fs from "fs";
import path from "path";

export type TalkOgpInput = {
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

type SvgInput = TalkOgpInput & {
  baseImageBuffer: string;
  profileImageBuffer: string;
};

/**
 * 画像ファイルを読み込む
 */
async function loadImageAsBuffer(filePath: string): Promise<Buffer> {
  const absolutePath = path.resolve(filePath);
  return fs.promises.readFile(absolutePath);
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
 * タイトルを単語単位で折り返す（最大3行）
 * 英字フォントサイズ52pxで1文字約30px、利用可能幅1120px → 約37文字/行
 */
function wrapTitleLines(text: string): string[] {
  const maxCharsPerLine = 37;
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (candidate.length <= maxCharsPerLine) {
      currentLine = candidate;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
    if (lines.length >= 2 && currentLine) break;
  }
  if (currentLine) lines.push(currentLine);
  return lines.slice(0, 3);
}

/**
 * バッジSVGを生成する
 */
function badge(
  x: number,
  y: number,
  label: string,
  fill: string,
  textColor: string,
  stroke?: string
): { svg: string; width: number } {
  const paddingH = 20;
  const height = 44;
  const approxCharWidth = 19;
  const width = Math.max(label.length * approxCharWidth + paddingH * 2, 90);
  const cx = x + width / 2;
  const ty = y + 31;
  const strokeAttr = stroke
    ? `stroke="${stroke}" stroke-width="2"`
    : "";
  const svg = `
    <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" rx="8" ${strokeAttr}/>
    <text x="${cx}" y="${ty}" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="${textColor}" text-anchor="middle">${escapeXml(label)}</text>`;
  return { svg, width };
}

/**
 * SVGを生成
 */
function generateOgpSvg(input: SvgInput): string {
  const dayLabel = input.dayNumber === 1 ? "DAY1" : "DAY2";
  const paddingLeft = 56;
  const paddingRight = 56;
  const badgeGap = 12;
  const profileSize = 80;
  const profileRadius = profileSize / 2;

  // バッジ群のY位置：ロゴ下（ロゴは約100px高さ）
  const badgeY = 148;
  const badgeHeight = 44;

  // タイトル：バッジ下 + ギャップ
  const titleStartY = badgeY + badgeHeight + 100;
  const titleLineHeight = 70;

  // 登壇者：[画像] [名前] の順で右寄せ
  // 画像をx=880に固定し、名前をその右に配置
  const speakerCenterY = 500;
  const profileX = 880;
  const profileCY = speakerCenterY - profileRadius;
  const nameX = profileX + profileSize + 20;

  // バッジを順番に並べる
  const trackBadge = badge(paddingLeft, badgeY, input.trackName, "#00D4AA", "#FFFFFF");
  const sessionX = paddingLeft + trackBadge.width + badgeGap;
  const sessionBadge = badge(sessionX, badgeY, input.sessionType, "#FFFFFF", "#333333", "#333333");
  const dayX = sessionX + sessionBadge.width + badgeGap;
  const dayBadge = badge(dayX, badgeY, dayLabel, "#3D7EFF", "#FFFFFF");
  const timeX = dayX + dayBadge.width + badgeGap + 4;

  // タイトル折り返し
  const titleLines = wrapTitleLines(input.title);

  const titleSvg = titleLines
    .map(
      (line, i) =>
        `<text x="${paddingLeft}" y="${titleStartY + i * titleLineHeight}" font-family="Arial, sans-serif" font-size="52" font-weight="bold" fill="#444444">${escapeXml(line)}</text>`
    )
    .join("\n    ");

  // プロフィール画像の clipPath
  const clipId = "profileClip";

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <clipPath id="${clipId}">
      <circle cx="${profileX + profileRadius}" cy="${profileCY + profileRadius}" r="${profileRadius}" />
    </clipPath>

  </defs>

  <!-- ベース画像 -->
  <image width="1200" height="630" xlink:href="data:image/png;base64,${input.baseImageBuffer}" />

  <!-- バッジ群 -->
  ${trackBadge.svg}
  ${sessionBadge.svg}
  ${dayBadge.svg}
  <text x="${timeX}" y="${badgeY + 31}" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#333333">${escapeXml(input.timeRange)}</text>

  <!-- タイトル -->
  ${titleSvg}

  <!-- 登壇者情報（[画像] [名前] で右寄せ） -->
  <image x="${profileX}" y="${profileCY}" width="${profileSize}" height="${profileSize}" xlink:href="data:image/png;base64,${input.profileImageBuffer}" clip-path="url(#${clipId})" />
  <text x="${nameX}" y="${speakerCenterY}" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#1A1A1A">${escapeXml(input.speakerName)}</text>
</svg>`;
}

/**
 * トークOGP画像を生成
 */
export async function generateTalkOgpImage(
  input: TalkOgpInput
): Promise<Buffer> {
  const baseImageBuffer = await loadImageAsBuffer(input.baseImagePath);
  const profileImageBuffer = await loadImageAsBuffer(input.profileImagePath);

  const svgInput: SvgInput = {
    ...input,
    baseImageBuffer: baseImageBuffer.toString("base64"),
    profileImageBuffer: profileImageBuffer.toString("base64"),
  };

  const svg = generateOgpSvg(svgInput);
  return sharp(Buffer.from(svg)).png().toBuffer();
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
