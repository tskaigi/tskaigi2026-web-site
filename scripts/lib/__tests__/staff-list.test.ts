import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { generateStaffList } from "../staff-list";

describe("generateStaffList", () => {
  let dir: string;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "tskaigi-staff-"));
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("ディレクトリ内の *.json を natural sort で取り込み TS を出力する", () => {
    const staffDir = path.join(dir, "staff");
    fs.mkdirSync(staffDir);
    fs.writeFileSync(path.join(staffDir, "alice.json"), "{}");
    fs.writeFileSync(path.join(staffDir, "bob.json"), "{}");
    fs.writeFileSync(path.join(staffDir, "10-foo.json"), "{}");
    fs.writeFileSync(path.join(staffDir, "2-bar.json"), "{}");

    const outputFile = path.join(dir, "staff.generated.ts");
    const result = generateStaffList({
      dir: staffDir,
      outputFile,
      listName: "STAFF_LIST",
      typeName: "Staff",
      varPrefix: "staff",
    });

    expect(result.entries).toBe(4);
    expect(result.outputFile).toBe(outputFile);

    const generated = fs.readFileSync(outputFile, "utf-8");
    expect(generated).toContain('import staff2-bar from "./staff/2-bar.json";');
    expect(generated).toContain(
      'import staff10-foo from "./staff/10-foo.json";',
    );
    expect(generated).toContain('import staffalice from "./staff/alice.json";');
    expect(generated).toContain('import staffbob from "./staff/bob.json";');
    expect(generated).toContain("export type Staff");
    expect(generated).toContain("export const STAFF_LIST: Staff[]");

    // natural sort: 2-bar が 10-foo より先
    const idx2 = generated.indexOf("2-bar");
    const idx10 = generated.indexOf("10-foo");
    expect(idx2).toBeLessThan(idx10);
  });

  it("空ディレクトリでも空配列の TS を出力する", () => {
    const staffDir = path.join(dir, "empty");
    fs.mkdirSync(staffDir);

    const outputFile = path.join(dir, "empty.generated.ts");
    const result = generateStaffList({
      dir: staffDir,
      outputFile,
      listName: "EMPTY_LIST",
      typeName: "Empty",
      varPrefix: "empty",
    });

    expect(result.entries).toBe(0);
    const generated = fs.readFileSync(outputFile, "utf-8");
    expect(generated).toContain("export const EMPTY_LIST: Empty[] = [];");
    expect(generated).not.toContain("import");
  });

  it("ディレクトリが無い場合は作成する", () => {
    const staffDir = path.join(dir, "does-not-exist");
    expect(fs.existsSync(staffDir)).toBe(false);

    const outputFile = path.join(dir, "x.generated.ts");
    generateStaffList({
      dir: staffDir,
      outputFile,
      listName: "X_LIST",
      typeName: "X",
      varPrefix: "x",
    });

    expect(fs.existsSync(staffDir)).toBe(true);
  });
});
