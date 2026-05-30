import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

export type ConvertSvgToPngOptions = {
  /** 入力 SVG ファイルパス。 */
  input: string;
  /** 出力 PNG パス。省略時は入力の拡張子を `.png` に置換した値。 */
  output?: string;
  /** 出力幅 (px)。省略時は SVG の本来サイズに従う。 */
  width?: number;
  /** 出力高さ (px)。省略時は SVG の本来サイズに従う。 */
  height?: number;
  /** SVG ラスタライズ時の DPI。既定 72。 */
  density?: number;
  /** 背景色（CSS color）。`"transparent"` で透過を維持。既定 `"transparent"`。 */
  background?: string;
  /** 出力先が既に存在する場合に上書きするか。既定 false（既存時は throw）。 */
  force?: boolean;
};

export type ConvertSvgToPngResult = {
  outputPath: string;
  bytes: number;
};

function defaultOutputPath(input: string): string {
  if (/\.svg$/i.test(input)) return input.replace(/\.svg$/i, ".png");
  return `${input}.png`;
}

/**
 * sharp で SVG を PNG にラスタライズする。
 */
export async function convertSvgToPng(
  options: ConvertSvgToPngOptions,
): Promise<ConvertSvgToPngResult> {
  const {
    input,
    width,
    height,
    density = 72,
    background = "transparent",
    force = false,
  } = options;

  if (!fs.existsSync(input)) {
    throw new Error(`入力ファイルが見つかりません: ${input}`);
  }

  const output = options.output ?? defaultOutputPath(input);
  if (path.resolve(output) === path.resolve(input)) {
    throw new Error(
      "出力先が入力と同じパスになります。--output を明示してください。",
    );
  }
  if (fs.existsSync(output) && !force) {
    throw new Error(`出力先が既に存在します（--force で上書き可）: ${output}`);
  }

  let pipeline = sharp(input, { density });

  if (width !== undefined || height !== undefined) {
    pipeline = pipeline.resize(width, height);
  }

  if (background !== "transparent") {
    pipeline = pipeline.flatten({ background });
  }

  const buffer = await pipeline.png().toBuffer();

  fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
  fs.writeFileSync(output, buffer);

  return { outputPath: output, bytes: buffer.length };
}
