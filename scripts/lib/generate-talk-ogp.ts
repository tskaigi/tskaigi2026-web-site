import sharp from "sharp";
import fs from "fs";
import path from "path";
import {
  TRACK_STYLE,
  SESSION_TYPE_STYLE,
  type TrackKey,
  type SessionTypeKey,
} from "./ogp-constants";

export type TalkOgpInput = {
  title: string;
  profileImagePath: string;
  speakerName: string;
  trackKey: TrackKey;
  trackName: string;
  sessionTypeKey: SessionTypeKey;
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

function estimateWidth(text: string, fontSize: number): number {
  return [...text].reduce((acc, ch) => {
    const code = ch.charCodeAt(0);
    if (code > 127) return acc + fontSize;
    if (ch >= "A" && ch <= "Z") return acc + fontSize * 0.72;
    if (ch >= "a" && ch <= "z") return acc + fontSize * 0.58;
    if (ch >= "0" && ch <= "9") return acc + fontSize * 0.62;
    if (ch === " ") return acc + fontSize * 0.3;
    return acc + fontSize * 0.5;
  }, 0);
}

function wrapTitleLines(text: string, maxWidth: number, fontSize: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (estimateWidth(candidate, fontSize) <= maxWidth) {
      currentLine = candidate;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = "";
      }
      if (estimateWidth(word, fontSize) > maxWidth) {
        let partial = "";
        for (const ch of word) {
          const test = partial + ch;
          if (estimateWidth(test, fontSize) <= maxWidth) {
            partial = test;
          } else {
            if (partial) lines.push(partial);
            partial = ch;
          }
        }
        currentLine = partial;
      } else {
        currentLine = word;
      }
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
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
  const height = 48;
  const fontSize = 26;
  const width = Math.max(Math.ceil(estimateWidth(label, fontSize)) + paddingH * 2, 90);
  const cx = x + width / 2;
  const ty = y + 34;
  const strokeAttr = stroke ? `stroke="${stroke}" stroke-width="2"` : "";
  const svg = `
    <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" rx="8" ${strokeAttr}/>
    <text x="${cx}" y="${ty}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="${textColor}" text-anchor="middle">${escapeXml(label)}</text>`;
  return { svg, width };
}

/**
 * SVGを生成
 */
function generateOgpSvg(input: SvgInput): string {
  const dayLabel = input.dayNumber === 1 ? "DAY1" : "DAY2";
  const paddingLeft = 40;
  const badgeGap = 12;
  const profileSize = 100;
  const profileRadius = profileSize / 2;

  // バッジ群のY位置：ロゴ下
  const badgeY = 170;

  // タイトル：バッジとは独立した固定位置
  const titleStartY = 288;
  const titleLineHeight = 70;

  // 登壇者：プロフィール画像を固定位置、ギャップ固定で名前を右に配置
  const speakerCenterY = 510;
  const nameFontSize = 29;
  const profileX = 830;
  const profileCY = speakerCenterY - profileRadius;
  const nameX = profileX + profileSize + 20;

  // トラック色（定数から参照）
  const trackStyle = TRACK_STYLE[input.trackKey];
  const trackBadge = badge(paddingLeft, badgeY, input.trackName, trackStyle.bg, trackStyle.text);

  // セッションタイプ（定数から参照）
  const sessionStyle = SESSION_TYPE_STYLE[input.sessionTypeKey];
  const sessionX = paddingLeft + trackBadge.width + badgeGap;
  // セッションタイプ：白背景、文字と枠線が定数の色
  const sessionBadge = badge(sessionX, badgeY, sessionStyle.label, "#ffffff", sessionStyle.bg, sessionStyle.bg);

  // DAYバッジ
  const dayX = sessionX + sessionBadge.width + badgeGap;
  const dayBadge = badge(dayX, badgeY, dayLabel, "#3D7EFF", "#ffffff");
  const timeX = dayX + dayBadge.width + badgeGap + 4;

  // タイトル折り返し（\n があれば手動改行、なければ自動折り返し）
  const titleFontSize = 48;
  const titleMaxWidth = 1200 - paddingLeft - 40;
  const titleLines = input.title.includes("\n")
    ? input.title.split("\n")
    : wrapTitleLines(input.title, titleMaxWidth, titleFontSize);
  const titleSvg = titleLines
    .map(
      (line, i) =>
        `<text x="${paddingLeft + 2}" y="${titleStartY + i * titleLineHeight}" font-family="Arial, sans-serif" font-size="${titleFontSize}" font-weight="bold" fill="#222222">${escapeXml(line)}</text>`
    )
    .join("\n    ");

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
  <text x="${timeX}" y="${badgeY + 34}" font-family="Arial, sans-serif" font-size="26" font-weight="normal" fill="#333333">${escapeXml(input.timeRange)}</text>

  <!-- タイトル -->
  ${titleSvg}

  <!-- 登壇者情報（[画像] [名前] で右寄せ） -->
  <image x="${profileX}" y="${profileCY}" width="${profileSize}" height="${profileSize}" xlink:href="data:image/png;base64,${input.profileImageBuffer}" clip-path="url(#${clipId})" />
  <text x="${nameX}" y="${speakerCenterY + 2}" font-family="Arial, sans-serif" font-size="${nameFontSize}" font-weight="bold" fill="#1A1A1A">${escapeXml(input.speakerName)}</text>
</svg>`;
}

/**
 * トークOGP画像を生成
 */
export async function generateTalkOgpImage(
  input: TalkOgpInput
): Promise<Buffer> {
  const baseImageBuffer = await loadImageAsBuffer(input.baseImagePath);
  const profileImageBuffer = await sharp(await loadImageAsBuffer(input.profileImagePath)).png().toBuffer();

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
