import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { convertSvgToPng } from "../svg-to-png";

const MINIMAL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20" fill="red"/></svg>`;
const TRANSPARENT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect x="5" y="5" width="10" height="10" fill="red"/></svg>`;

describe("convertSvgToPng", () => {
  let dir: string;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "tskaigi-svg-"));
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("SVG を PNG に変換し、出力先省略時は .svg を .png に置換する", async () => {
    const input = path.join(dir, "in.svg");
    fs.writeFileSync(input, MINIMAL_SVG);

    const result = await convertSvgToPng({ input });

    expect(result.outputPath).toBe(path.join(dir, "in.png"));
    const meta = await sharp(result.outputPath).metadata();
    expect(meta.format).toBe("png");
    expect(meta.width).toBe(20);
    expect(meta.height).toBe(20);
    expect(result.bytes).toBeGreaterThan(0);
  });

  it("width と height でリサイズする", async () => {
    const input = path.join(dir, "in.svg");
    fs.writeFileSync(input, MINIMAL_SVG);

    const result = await convertSvgToPng({ input, width: 60, height: 40 });

    const meta = await sharp(result.outputPath).metadata();
    expect(meta.width).toBe(60);
    expect(meta.height).toBe(40);
  });

  it("background を指定すると透過を flatten する", async () => {
    const input = path.join(dir, "in.svg");
    fs.writeFileSync(input, TRANSPARENT_SVG);

    const transparent = await convertSvgToPng({
      input,
      output: path.join(dir, "t.png"),
    });
    const opaque = await convertSvgToPng({
      input,
      output: path.join(dir, "o.png"),
      background: "#000000",
    });

    const tMeta = await sharp(transparent.outputPath).metadata();
    const oMeta = await sharp(opaque.outputPath).metadata();
    expect(tMeta.hasAlpha).toBe(true);
    expect(oMeta.hasAlpha).toBe(false);
  });

  it("出力先が既存で force 無しなら throw する", async () => {
    const input = path.join(dir, "in.svg");
    const output = path.join(dir, "exists.png");
    fs.writeFileSync(input, MINIMAL_SVG);
    fs.writeFileSync(output, "");

    await expect(convertSvgToPng({ input, output })).rejects.toThrow(
      /既に存在/,
    );
  });

  it("force=true なら既存ファイルを上書きする", async () => {
    const input = path.join(dir, "in.svg");
    const output = path.join(dir, "exists.png");
    fs.writeFileSync(input, MINIMAL_SVG);
    fs.writeFileSync(output, "OLD");

    const result = await convertSvgToPng({ input, output, force: true });
    expect(result.bytes).toBeGreaterThan(3);
    const head = fs.readFileSync(result.outputPath).subarray(0, 8);
    // PNG マジックナンバー
    expect(head[0]).toBe(0x89);
    expect(head[1]).toBe(0x50);
    expect(head[2]).toBe(0x4e);
    expect(head[3]).toBe(0x47);
  });

  it("入力ファイルが無いと throw する", async () => {
    await expect(
      convertSvgToPng({ input: path.join(dir, "missing.svg") }),
    ).rejects.toThrow(/見つかりません/);
  });

  it("入出力が同じパスになる場合は throw する", async () => {
    const input = path.join(dir, "same.png");
    fs.writeFileSync(input, "");
    await expect(convertSvgToPng({ input, output: input })).rejects.toThrow(
      /同じパス/,
    );
  });
});
