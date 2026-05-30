import { loadConfig } from "c12";

export type ScriptsConfig = {
  paths: {
    speakersJson: string;
    keynoteJson: string;
    handsonJson: string;
    ostJson: string;
    sessionMasterJson: string;
    sessionIdSpeakerJson: string;
    ogpTitleOverridesJson: string;
    dataCompletenessJson: string;
    iconManifestJson: string;
    sponsorsManifestJson: string;
    frontendSessionMasterJson: string;
    frontendSponsorsJson: string;
    speakersImageDir: string;
    sponsorsImageDir: string;
    talksImageDir: string;
    ogpBaseImage: string;
    defaultProfileImage: string;
  };
  sponsors: {
    apiUrl: string;
  };
  handsonLabel: string;
  fetchThrottleMs: number;
};

export const defaultConfig: ScriptsConfig = {
  paths: {
    speakersJson: "scripts/data/speakers.json",
    keynoteJson: "scripts/data/keynote.json",
    handsonJson: "scripts/data/handson.json",
    ostJson: "scripts/data/ost.json",
    sessionMasterJson: "scripts/data/session-master.json",
    sessionIdSpeakerJson: "scripts/data/session-id-speaker.json",
    ogpTitleOverridesJson: "scripts/data/ogp-title-overrides.json",
    dataCompletenessJson: "scripts/data/data-completeness.json",
    iconManifestJson: "scripts/data/.icon-fetch-manifest.json",
    sponsorsManifestJson: "scripts/data/.sponsors-fetch-manifest.json",
    frontendSessionMasterJson: "src/constants/session-master.json",
    frontendSponsorsJson: "src/constants/sponsors.json",
    speakersImageDir: "public/speakers",
    sponsorsImageDir: "public/sponsors",
    talksImageDir: "public/talks",
    ogpBaseImage: "public/OGP-talk.png",
    defaultProfileImage: "public/logo-2026.png",
  },
  sponsors: {
    apiUrl: "https://tskaigi-cms.system-admin-df1.workers.dev/api/sponsors",
  },
  handsonLabel: "ハンズオン",
  fetchThrottleMs: 200,
};

/**
 * c12 でスクリプト共通設定を読み込む。
 * リポジトリ直下に `tskaigi-scripts.config.ts` を置くと既定値を上書きできる。
 */
export async function loadScriptsConfig(): Promise<ScriptsConfig> {
  const { config } = await loadConfig<ScriptsConfig>({
    name: "tskaigi-scripts",
    defaults: defaultConfig,
  });
  return config ?? defaultConfig;
}
