import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { defaultConfig, type ScriptsConfig } from "../../../config";
import { checkDataCompleteness } from "../check-data-completeness";
import { exportForFrontend } from "../export-for-frontend";
import { initMaster } from "../init-master";
import { injectSessionInfo } from "../inject-session-info";
import { syncSessionIdSpeaker } from "../sync-session-id-speaker";
import type { Speaker, SpeakerSource } from "../types";

function makeConfig(dir: string): ScriptsConfig {
  return {
    ...defaultConfig,
    paths: {
      ...defaultConfig.paths,
      speakersJson: path.join(dir, "speakers.json"),
      keynoteJson: path.join(dir, "keynote.json"),
      handsonJson: path.join(dir, "handson.json"),
      ostJson: path.join(dir, "ost.json"),
      sessionMasterJson: path.join(dir, "session-master.json"),
      sessionIdSpeakerJson: path.join(dir, "session-id-speaker.json"),
      ogpTitleOverridesJson: path.join(dir, "ogp-title-overrides.json"),
      dataCompletenessJson: path.join(dir, "data-completeness.json"),
      frontendSessionMasterJson: path.join(dir, "frontend-session-master.json"),
    },
    fetchThrottleMs: 0,
  };
}

function makeSpeaker(overrides: Partial<Speaker> = {}): Speaker {
  return {
    name: "Alice",
    profileImageUrl: "",
    bio: "hello",
    xId: "alice",
    githubId: "",
    qiitaLink: "",
    zennLink: "",
    noteLink: "",
    additionalLink: "",
    affiliation: "",
    position: "",
    userIcon: "x",
    ...overrides,
  };
}

function makeSource(overrides: Partial<SpeakerSource> = {}): SpeakerSource {
  return {
    id: "src-1",
    title: "talk title",
    overview: "overview",
    slidesLink: "",
    speaker: makeSpeaker(),
    ...overrides,
  };
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

describe("scripts/lib/session", () => {
  let dir: string;
  let config: ScriptsConfig;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "tskaigi-test-"));
    config = makeConfig(dir);
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("initMaster は speakerId へリネームし profileImageUrl を書き換える", () => {
    fs.writeFileSync(
      config.paths.speakersJson,
      JSON.stringify([
        makeSource({ id: "alice", speaker: makeSpeaker({ name: "Alice" }) }),
        makeSource({ id: "bob", speaker: makeSpeaker({ name: "Bob" }) }),
      ]),
    );

    const { count } = initMaster(config);
    expect(count).toBe(2);

    const master = readJson<
      Array<{ speakerId: string; speaker: { profileImageUrl: string } }>
    >(config.paths.sessionMasterJson);
    expect(master[0].speakerId).toBe("alice");
    expect(master[0].speaker.profileImageUrl).toBe("/speakers/alice.png");
    expect(master[1].speakerId).toBe("bob");
    expect(master[1].speaker.profileImageUrl).toBe("/speakers/bob.png");
  });

  it("initMaster は handson/keynote/ost を末尾に追加する", () => {
    fs.writeFileSync(
      config.paths.speakersJson,
      JSON.stringify([makeSource({ id: "alice" })]),
    );
    fs.writeFileSync(
      config.paths.handsonJson,
      JSON.stringify(
        makeSource({
          id: "handson-1",
          title: "ハンズオン",
          speaker: makeSpeaker({
            name: "TSKaigi運営",
            profileImageUrl: "/external/handson.png",
          }),
        }),
      ),
    );

    initMaster(config);
    const master = readJson<Array<{ speakerId: string; title: string }>>(
      config.paths.sessionMasterJson,
    );
    expect(master).toHaveLength(2);
    expect(master[1].speakerId).toBe("handson-1");
    expect(master[1].title).toBe("ハンズオン");
  });

  it("injectSessionInfo は同名スピーカーへ id と ogpTitle を割り当てる", () => {
    fs.writeFileSync(
      config.paths.sessionIdSpeakerJson,
      JSON.stringify({ "10": "Alice", "11": "Bob" }),
    );
    fs.writeFileSync(
      config.paths.ogpTitleOverridesJson,
      JSON.stringify([{ id: "10", ogpTitle: "Custom OGP" }]),
    );
    fs.writeFileSync(
      config.paths.sessionMasterJson,
      JSON.stringify([
        {
          speakerId: "alice",
          title: "Alice の話",
          overview: "",
          speaker: makeSpeaker({ name: "Alice" }),
        },
        {
          speakerId: "bob",
          title: "Bob の話",
          overview: "",
          speaker: makeSpeaker({ name: "Bob" }),
        },
        {
          speakerId: "charlie",
          title: "Charlie の話",
          overview: "",
          speaker: makeSpeaker({ name: "Charlie" }),
        },
      ]),
    );

    const result = injectSessionInfo(config);
    expect(result.updated).toBe(2);
    expect(result.skipped).toBe(1);
    expect(result.skippedNames).toEqual(["Charlie"]);

    const master = readJson<
      Array<{ id?: string; ogpTitle?: string; title: string }>
    >(config.paths.sessionMasterJson);
    expect(master[0].id).toBe("10");
    expect(master[0].ogpTitle).toBe("Custom OGP");
    expect(master[1].id).toBe("11");
    expect(master[1].ogpTitle).toBe("Bob の話");
    expect(master[2].id).toBeUndefined();
  });

  it("exportForFrontend は id を持つエントリのみを map で書き出す", () => {
    fs.writeFileSync(
      config.paths.sessionMasterJson,
      JSON.stringify([
        {
          id: "1",
          speakerId: "alice",
          title: "Alice",
          ogpTitle: "Alice",
          overview: "",
          speaker: makeSpeaker({ name: "Alice" }),
        },
        {
          speakerId: "charlie",
          title: "Charlie",
          overview: "",
          speaker: makeSpeaker({ name: "Charlie" }),
        },
      ]),
    );

    const { count } = exportForFrontend(config);
    expect(count).toBe(1);

    const frontend = readJson<
      Record<string, { id: string; speakerId: string }>
    >(config.paths.frontendSessionMasterJson);
    expect(Object.keys(frontend)).toEqual(["1"]);
    expect(frontend["1"].speakerId).toBe("alice");
  });

  it("syncSessionIdSpeaker は ID 1 をハンズオン固定にし新規スピーカーを追番する", () => {
    fs.writeFileSync(
      config.paths.speakersJson,
      JSON.stringify([
        { speaker: { name: "Alice" } },
        { speaker: { name: "Bob" } },
        { speaker: { name: "Charlie" } },
      ]),
    );
    fs.writeFileSync(
      config.paths.sessionIdSpeakerJson,
      JSON.stringify({ "1": "旧名", "2": "Alice" }),
    );

    const result = syncSessionIdSpeaker(config);
    expect(result.added).toBe(2);
    expect(result.total).toBe(4);

    const map = readJson<Record<string, string>>(
      config.paths.sessionIdSpeakerJson,
    );
    expect(map["1"]).toBe("ハンズオン");
    expect(map["2"]).toBe("Alice");
    expect(map["3"]).toBe("Bob");
    expect(map["4"]).toBe("Charlie");
  });

  it("checkDataCompleteness は欠損カテゴリとID不一致を集計する", () => {
    fs.writeFileSync(
      config.paths.sessionMasterJson,
      JSON.stringify([
        {
          id: "1",
          speakerId: "alice",
          title: "Alice の話",
          ogpTitle: "Alice の話",
          overview: "",
          speaker: makeSpeaker({ name: "Alice", bio: "" }),
        },
        {
          speakerId: "bob",
          title: "Bob",
          overview: "",
          speaker: makeSpeaker({
            name: "Bob",
            userIcon: undefined as unknown as "x",
            xId: "",
            githubId: "",
          }),
        },
      ]),
    );
    fs.writeFileSync(
      config.paths.frontendSessionMasterJson,
      JSON.stringify({
        "1": { id: "1", speakerId: "alice" },
        "2": { id: "999", speakerId: "bob" },
      }),
    );

    const summary = checkDataCompleteness(config);
    expect(summary.total).toBe(2);
    expect(summary.noBio).toBe(1);
    expect(summary.noIcon).toBe(1);
    expect(summary.noSession).toBe(1);
    expect(summary.idMismatch).toBe(1);
    expect(summary.idMismatches).toEqual([{ key: "2", id: "999" }]);
  });
});
