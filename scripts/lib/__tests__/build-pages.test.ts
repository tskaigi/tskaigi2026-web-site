import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildPagesOutput } from "../build-pages";

describe("buildPagesOutput", () => {
  let tmpRoot: string;

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tskaigi-pages-"));
  });

  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it("worker.js または assets/ が無いと throw する", () => {
    const empty = path.join(tmpRoot, "empty");
    fs.mkdirSync(empty);
    expect(() => buildPagesOutput(empty)).toThrow(/OpenNext build output/);
  });

  it("pages/ に worker.js・他ディレクトリ・assets 内容・_worker.js を出力する", () => {
    const openNext = path.join(tmpRoot, ".open-next");
    fs.mkdirSync(openNext);
    fs.writeFileSync(path.join(openNext, "worker.js"), "export default {};");
    fs.mkdirSync(path.join(openNext, "assets"));
    fs.writeFileSync(path.join(openNext, "assets", "robots.txt"), "ok");
    fs.mkdirSync(path.join(openNext, "server-functions"));
    fs.writeFileSync(path.join(openNext, "server-functions", "fn.js"), "// fn");

    const { outputDir } = buildPagesOutput(openNext);
    expect(outputDir).toBe(path.join(openNext, "pages"));

    // worker.js（OPEN_NEXT_DIR 直下から）が pages/ にコピーされる
    expect(fs.existsSync(path.join(outputDir, "worker.js"))).toBe(true);
    // assets 直下の中身が pages/ 直下に来る
    expect(fs.readFileSync(path.join(outputDir, "robots.txt"), "utf-8")).toBe(
      "ok",
    );
    // 他のディレクトリも pages/ にコピーされる
    expect(
      fs.existsSync(path.join(outputDir, "server-functions", "fn.js")),
    ).toBe(true);
    // _worker.js が生成されている
    const workerEntry = fs.readFileSync(
      path.join(outputDir, "_worker.js"),
      "utf-8",
    );
    expect(workerEntry).toContain('import worker from "./worker.js"');
    expect(workerEntry).toContain("env.ASSETS");
  });

  it("既存の pages/ を初期化する", () => {
    const openNext = path.join(tmpRoot, ".open-next");
    fs.mkdirSync(openNext);
    fs.writeFileSync(path.join(openNext, "worker.js"), "");
    fs.mkdirSync(path.join(openNext, "assets"));
    fs.mkdirSync(path.join(openNext, "pages"));
    fs.writeFileSync(path.join(openNext, "pages", "stale.txt"), "old");

    buildPagesOutput(openNext);
    expect(fs.existsSync(path.join(openNext, "pages", "stale.txt"))).toBe(
      false,
    );
  });
});
