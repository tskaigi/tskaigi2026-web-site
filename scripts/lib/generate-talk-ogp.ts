import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { TALK_TYPE } from "../../src/constants/timetable/talkList";
import type { SessionKey, TrackKey } from "../../src/types/timetable-api";

const TRACK_STYLE: Record<TrackKey, { bg: string; text: string }> = {
  LEVERAGES: { bg: "#26919f", text: "#ffffff" },
  UPSIDER: { bg: "#000000", text: "#ffffff" },
  RIGHTTOUCH: { bg: "#ff4a56", text: "#ffffff" },
};

export type TalkOgpInput = {
  title: string;
  profileImagePath: string;
  profileImageFit?: "cover" | "contain";
  speakerName: string;
  trackKey: TrackKey;
  trackName: string;
  sessionTypeKey: SessionKey;
  dayNumber: 1 | 2;
  timeRange: string;
  baseImagePath: string;
  outputPath: string;
};

type SvgInput = TalkOgpInput & {
  baseImageBuffer: string;
  profileImageBuffer: string;
  speakerNameWidth: number;
  fonts: FontBuffers;
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

const FONTSOURCE_DIR = "node_modules/@fontsource/noto-sans-jp/files";
const FONT_FILES = {
  latin400: `${FONTSOURCE_DIR}/noto-sans-jp-latin-400-normal.woff2`,
  latin700: `${FONTSOURCE_DIR}/noto-sans-jp-latin-700-normal.woff2`,
  japanese400: `${FONTSOURCE_DIR}/noto-sans-jp-japanese-400-normal.woff2`,
  japanese700: `${FONTSOURCE_DIR}/noto-sans-jp-japanese-700-normal.woff2`,
} as const;

type FontBuffers = Record<keyof typeof FONT_FILES, string>;
let fontBuffersCache: FontBuffers | null = null;

async function loadFontBuffers(): Promise<FontBuffers> {
  if (fontBuffersCache !== null) return fontBuffersCache;
  const entries = await Promise.all(
    (Object.entries(FONT_FILES) as [keyof typeof FONT_FILES, string][]).map(
      async ([key, filePath]) => {
        const buf = await fs.promises.readFile(path.resolve(filePath));
        return [key, buf.toString("base64")] as const;
      },
    ),
  );
  fontBuffersCache = Object.fromEntries(entries) as FontBuffers;
  return fontBuffersCache;
}

function buildFontFaceStyle(fonts: FontBuffers): string {
  const face = (weight: number, latin: string, jp: string) => `
    @font-face {
      font-family: "Noto Sans JP";
      font-weight: ${weight};
      src: url("data:font/woff2;base64,${latin}") format("woff2");
      unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+FEFF,U+FFFD;
    }
    @font-face {
      font-family: "Noto Sans JP";
      font-weight: ${weight};
      src: url("data:font/woff2;base64,${jp}") format("woff2");
      unicode-range: U+3000-9FFF,U+F900-FAFF,U+FF00-FFEF;
    }`;
  return (
    face(400, fonts.latin400, fonts.japanese400) +
    face(700, fonts.latin700, fonts.japanese700)
  );
}

const textWidthCache = new Map<string, number>();

async function measureRenderedTextWidth(
  text: string,
  fontSize: number,
  fontWeight: string,
): Promise<number> {
  const cacheKey = `${text}__${fontSize}__${fontWeight}`;
  const cached = textWidthCache.get(cacheKey);
  if (cached !== undefined) return cached;

  const fonts = await loadFontBuffers();
  const height = fontSize * 2;
  const width = 2000;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs><style>${buildFontFaceStyle(fonts)}</style></defs>
    <rect width="${width}" height="${height}" fill="white"/>
    <text x="0" y="${fontSize}" font-family="Noto Sans JP, sans-serif" font-size="${fontSize}" font-weight="${fontWeight}" fill="black">${escapeXml(text)}</text>
  </svg>`;

  const { data, info } = await sharp(Buffer.from(svg))
    .raw()
    .toBuffer({ resolveWithObject: true });

  let result = 0;
  outer: for (let x = info.width - 1; x >= 0; x--) {
    for (let y = 0; y < info.height; y++) {
      const i = (y * info.width + x) * info.channels;
      if (data[i] < 255) {
        result = x + 1;
        break outer;
      }
    }
  }

  textWidthCache.set(cacheKey, result);
  return result;
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

function wrapTitleLines(
  text: string,
  maxWidth: number,
  fontSize: number,
): string[] {
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
  stroke?: string,
): { svg: string; width: number } {
  const paddingH = 20;
  const height = 48;
  const fontSize = 26;
  const width = Math.max(
    Math.ceil(estimateWidth(label, fontSize)) + paddingH * 2,
    90,
  );
  const cx = x + width / 2;
  const ty = y + 34;
  const strokeAttr = stroke ? `stroke="${stroke}" stroke-width="2"` : "";
  const svg = `
    <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" rx="8" ${strokeAttr}/>
    <text x="${cx}" y="${ty}" font-family="Noto Sans JP, sans-serif" font-size="${fontSize}" font-weight="bold" fill="${textColor}" text-anchor="middle">${escapeXml(label)}</text>`;
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

  // 登壇者：名前の右端を speakerRightX に固定し、実測幅でプロフィール画像位置を算出
  const speakerCenterY = 510;
  const nameFontSize = 29;
  const speakerRightX = 1160;
  const nameGap = 20;
  const profileX =
    speakerRightX - input.speakerNameWidth - nameGap - profileSize;
  const profileCY = speakerCenterY - profileRadius;
  const nameX = speakerRightX - input.speakerNameWidth;

  // トラック色（定数から参照）
  const trackStyle = TRACK_STYLE[input.trackKey];
  const trackBadge = badge(
    paddingLeft,
    badgeY,
    input.trackName,
    trackStyle.bg,
    trackStyle.text,
  );

  // セッションタイプ（定数から参照）
  const sessionStyle = TALK_TYPE[input.sessionTypeKey];
  const sessionX = paddingLeft + trackBadge.width + badgeGap;
  // セッションタイプ：白背景、文字と枠線が定数の色
  const sessionBadge = badge(
    sessionX,
    badgeY,
    sessionStyle.name,
    "#ffffff",
    sessionStyle.color,
    sessionStyle.color,
  );

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
  // 3行分の領域内で縦中央揃え
  const maxLines = 3;
  const titleAreaOffset = Math.round(
    ((maxLines - titleLines.length) * titleLineHeight) / 2,
  );
  const titleSvg = titleLines
    .map(
      (line, i) =>
        `<text x="${paddingLeft + 2}" y="${titleStartY + titleAreaOffset + i * titleLineHeight}" font-family="Noto Sans JP, sans-serif" font-size="${titleFontSize}" font-weight="bold" fill="#222222">${escapeXml(line)}</text>`,
    )
    .join("\n    ");

  const clipId = "profileClip";

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <style>${buildFontFaceStyle(input.fonts)}</style>
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
  <text x="${timeX}" y="${badgeY + 34}" font-family="Noto Sans JP, sans-serif" font-size="26" font-weight="normal" fill="#333333">${escapeXml(input.timeRange)}</text>

  <!-- タイトル -->
  ${titleSvg}

  <!-- 登壇者情報（[画像] [名前] で右寄せ） -->
  <image x="${profileX}" y="${profileCY}" width="${profileSize}" height="${profileSize}" xlink:href="data:image/png;base64,${input.profileImageBuffer}" clip-path="url(#${clipId})" />
  <text x="${nameX}" y="${speakerCenterY + 8}" font-family="Noto Sans JP, sans-serif" font-size="${nameFontSize}" font-weight="bold" fill="#1A1A1A">${escapeXml(input.speakerName)}</text>
</svg>`;
}

/**
 * トークOGP画像を生成
 */
export async function generateTalkOgpImage(
  input: TalkOgpInput,
): Promise<Buffer> {
  const [baseImageBuffer, profileImageBuffer, speakerNameWidth, fonts] =
    await Promise.all([
      loadImageAsBuffer(input.baseImagePath),
      sharp(await loadImageAsBuffer(input.profileImagePath))
        .resize(200, 200, {
          fit: input.profileImageFit ?? "cover",
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .png()
        .toBuffer(),
      measureRenderedTextWidth(input.speakerName, 29, "bold"),
      loadFontBuffers(),
    ]);

  const svgInput: SvgInput = {
    ...input,
    baseImageBuffer: baseImageBuffer.toString("base64"),
    profileImageBuffer: profileImageBuffer.toString("base64"),
    speakerNameWidth,
    fonts,
  };

  const svg = generateOgpSvg(svgInput);
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/**
 * トークOGP画像を生成して保存
 */
export async function generateAndSaveTalkOgp(
  input: TalkOgpInput,
): Promise<void> {
  const pngBuffer = await generateTalkOgpImage(input);

  const outputDir = path.dirname(input.outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  await fs.promises.writeFile(input.outputPath, pngBuffer);
  console.log(`✅ OGP画像を生成しました: ${input.outputPath}`);
}
