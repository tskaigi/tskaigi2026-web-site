import { defineCommand } from "citty";
import { convertSvgToPng } from "../lib/svg-to-png";
import { logger } from "../utils/logger";

function parsePositiveInt(
  value: string | undefined,
  name: string,
): number | undefined {
  if (value === undefined) return undefined;
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n) || n <= 0) {
    throw new Error(`${name} は正の整数で指定してください: ${value}`);
  }
  return n;
}

export default defineCommand({
  meta: {
    name: "svg-to-png",
    description: "SVG を PNG にラスタライズ（sharp 使用）",
  },
  args: {
    input: {
      type: "positional",
      description: "入力 SVG ファイルパス",
      required: true,
    },
    output: {
      type: "string",
      description: "出力 PNG パス（省略時は入力の .svg → .png）",
      alias: "o",
    },
    width: {
      type: "string",
      description: "出力幅 (px)",
      alias: "w",
    },
    height: {
      type: "string",
      description: "出力高さ (px)",
    },
    density: {
      type: "string",
      description: "SVG ラスタライズの DPI（既定: 72）",
      alias: "d",
    },
    background: {
      type: "string",
      description:
        "背景色（CSS color。'transparent' で透過維持。既定: transparent）",
    },
    force: {
      type: "boolean",
      description: "出力先が存在しても上書きする",
      alias: "f",
      default: false,
    },
  },
  async run({ args }) {
    const result = await convertSvgToPng({
      input: args.input,
      output: args.output,
      width: parsePositiveInt(args.width, "--width"),
      height: parsePositiveInt(args.height, "--height"),
      density: parsePositiveInt(args.density, "--density"),
      background: args.background,
      force: args.force,
    });

    logger.success(`Generated ${result.outputPath} (${result.bytes} bytes)`);
  },
});
