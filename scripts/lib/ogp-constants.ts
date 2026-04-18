/**
 * OGP生成用の色定数
 * src/app/globals.css および src/components/talks/DayTimeTable/index.tsx から参照
 */

/** トラックIDに対応する背景色・文字色 */
export const TRACK_STYLE = {
  LEVERAGES: { bg: "#0cf8c0", text: "#000000" },
  UPSIDER: { bg: "#005faa", text: "#ffffff" },
  RIGHTTOUCH: { bg: "#000000", text: "#ffffff" },
} as const;

export type TrackKey = keyof typeof TRACK_STYLE;

/** セッションタイプに対応する表示ラベル・背景色 */
export const SESSION_TYPE_STYLE = {
  KEYNOTE: { label: "基調講演", bg: "#0CA90E", text: "#ffffff" },
  LONG: { label: "30分セッション", bg: "#0C7EDC", text: "#ffffff" },
  SHORT: { label: "10分セッション", bg: "#c3620f", text: "#ffffff" },
  SPONSOR: { label: "スポンサーセッション", bg: "#E53D84", text: "#ffffff" },
  HANDSON: { label: "ハンズオン", bg: "#8B5CF6", text: "#ffffff" },
} as const;

export type SessionTypeKey = keyof typeof SESSION_TYPE_STYLE;
