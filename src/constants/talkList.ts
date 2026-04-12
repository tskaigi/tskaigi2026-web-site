import type {
  EventDate,
  IndividualSlot,
  SessionSummary,
  SessionTrack,
  TrackKey,
} from "@/types/timetable-api";
import { timetableList } from "./timetable";

export const EVENT_DATES: EventDate[] = ["Day1", "Day2"];
export const TRACK_KEYS: TrackKey[] = ["LEVERAGES", "UPSIDER", "RIGHTTOUCH"];

export const EVENT_DATE: Record<EventDate, string> = {
  Day1: "2026-05-23",
  Day2: "2026-05-24",
};

export const TRACK: Record<TrackKey, { name: string; tag: string }> = {
  LEVERAGES: { name: "Leveragesトラック", tag: "#tskaigi_leverages" },
  UPSIDER: { name: "UPSIDERトラック", tag: "#tskaigi_upsider" },
  RIGHTTOUCH: { name: "RightTouchトラック", tag: "#tskaigi_righttouch" },
};

export const TALK_TYPE: Record<
  SessionTrack["sessionType"],
  { name: string; color: string }
> = {
  KEYNOTE: { name: "基調講演", color: "#0CA90E" },
  LONG: { name: "30分セッション", color: "#0C7EDC" },
  SHORT: { name: "10分セッション", color: "#c3620f" },
  SPONSOR: { name: "スポンサーセッション", color: "#E53D84" },
};

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
