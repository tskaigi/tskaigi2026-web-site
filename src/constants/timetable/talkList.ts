import type {
  EventDate,
  IndividualSlot,
  SessionSummary,
  SessionTrack,
  Track,
  TrackKey,
} from "@/types/timetable-api";
import { timetableList } from "./timetable";

export const EVENT_DATES: EventDate[] = ["Day1", "Day2"];
export const TRACK_KEYS: TrackKey[] = ["LEVERAGES", "UPSIDER", "RIGHTTOUCH"];

export const EVENT_DATE: Record<EventDate, string> = {
  Day1: "2026-05-23",
  Day2: "2026-05-24",
};

export const TRACK: Record<TrackKey, Track> = {
  LEVERAGES: {
    id: "LEVERAGES",
    name: "Leveragesトラック",
    hashtag: "#tskaigi_leverages",
  },
  UPSIDER: {
    id: "UPSIDER",
    name: "UPSIDERトラック",
    hashtag: "#tskaigi_upsider",
  },
  RIGHTTOUCH: {
    id: "RIGHTTOUCH",
    name: "RightTouchトラック",
    hashtag: "#tskaigi_righttouch",
  },
};

export const TRACK_STYLE: Record<
  TrackKey,
  { bg: string; text: string; border: string; cssVar: string }
> = {
  LEVERAGES: {
    bg: "bg-track-leverages",
    text: "text-black",
    border: "border-track-leverages",
    cssVar: "var(--track-leverages)",
  },
  UPSIDER: {
    bg: "bg-track-upsider",
    text: "text-white",
    border: "border-track-upsider",
    cssVar: "var(--track-upsider)",
  },
  RIGHTTOUCH: {
    bg: "bg-track-righttouch",
    text: "text-white",
    border: "border-track-righttouch",
    cssVar: "var(--track-righttouch)",
  },
};

export const TALK_TYPE: Record<
  SessionTrack["sessionType"],
  { name: string; color: string }
> = {
  KEYNOTE: { name: "基調講演", color: "#0CA90E" },
  LONG: { name: "30分セッション", color: "#0C7EDC" },
  SHORT: { name: "10分セッション", color: "#c3620f" },
  SPONSOR: { name: "スポンサーセッション", color: "#E53D84" },
  HANDSON: { name: "ハンズオン", color: "#8B5CF6" },
};

/** ハンズオンは3枠セットで追加/削除する */
export const HANDSON_IDS = ["handson-1", "handson-2", "handson-3"] as const;

export function isHandsonId(id: string): boolean {
  return HANDSON_IDS.some((v) => v === id);
}

/** ハンズオンIDを含む場合、3枠すべてを含むIDリストを返す */
export function expandHandsonIds(ids: string[]): string[] {
  const hasHandson = ids.some(isHandsonId);
  if (!hasHandson) return ids;
  const withoutHandson = ids.filter((id) => !isHandsonId(id));
  return [...withoutHandson, ...HANDSON_IDS];
}

/** ハンズオンIDを含む場合、3枠すべてを除外したIDリストを返す */
export function removeHandsonIds(ids: string[]): string[] {
  return ids.filter((id) => !isHandsonId(id));
}

export type Talk = SessionSummary & {
  eventDate: EventDate;
  track: TrackKey;
  time: string;
};

function formatTimestamp(ts: number): string {
  const d = new Date(ts * 1000);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

function formatTimeRange(slot: IndividualSlot): string {
  return `${formatTimestamp(slot.startTime)} 〜 ${formatTimestamp(slot.endTime)}`;
}

export const talkList: Talk[] = timetableList.flatMap((day) =>
  day.slots
    .filter((slot): slot is IndividualSlot => slot.slotType === "individual")
    .flatMap((slot) =>
      TRACK_KEYS.flatMap((trackKey) => {
        const content = slot.tracks[trackKey];
        if (content.type !== "session") return [];
        return content.sessions.map((session) => ({
          ...session,
          eventDate: day.day,
          track: trackKey,
          time: formatTimeRange(slot),
        }));
      }),
    ),
);

export const SESSION_IDS = talkList.map((talk) => talk.id);
export type SessionId = (typeof SESSION_IDS)[number];
