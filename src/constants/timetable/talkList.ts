import type {
  EventDate,
  IndividualSlot,
  SessionSummary,
  SessionTrack,
  TrackKey,
} from "@/types/timetable-api";
import { myTimetable } from "@/utils/myTimetable";
import { timetableList } from "./timetable";

export const EVENT_DATES: EventDate[] = ["Day1", "Day2"];
export const TRACK_KEYS: TrackKey[] = ["LEVERAGES", "UPSIDER", "RIGHTTOUCH"];

export const EVENT_DATE: Record<EventDate, string> = {
  Day1: "2026-05-22",
  Day2: "2026-05-23",
};

export const TRACK_STYLE: Record<
  TrackKey,
  { bg: string; text: string; border: string; cssVar: string }
> = {
  LEVERAGES: {
    bg: "bg-track-leverages",
    text: "text-white",
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
  HANDSON: { name: "ハンズオン", color: "#6B21A8" },
};

export const HANDSON_ID = "76";

export function isHandsonId(id: string): boolean {
  return id === HANDSON_ID;
}

export type Talk = SessionSummary & {
  eventDate: EventDate;
  track: TrackKey;
  time: string;
};

function findSpanGroup(
  day: (typeof timetableList)[number],
  slot: IndividualSlot,
  trackKey: TrackKey,
) {
  return day.spanGroups?.find(
    (g) =>
      g.tracks.includes(trackKey) &&
      slot.startTime >= g.startTime &&
      slot.endTime <= g.endTime,
  );
}

export const talkList: Talk[] = timetableList.flatMap((day) =>
  day.slots
    .filter((slot): slot is IndividualSlot => slot.slotType === "individual")
    .flatMap((slot) =>
      TRACK_KEYS.flatMap((trackKey) => {
        const content = slot.tracks[trackKey];
        if (content.type !== "session") return [];
        const span = findSpanGroup(day, slot, trackKey);
        const time = span
          ? myTimetable.formatTimeRange(span.startTime, span.endTime)
          : myTimetable.formatTimeRange(slot.startTime, slot.endTime);
        return content.sessions.map((session) => ({
          ...session,
          eventDate: day.day,
          track: trackKey,
          time,
        }));
      }),
    ),
);

export const SESSION_IDS = talkList.map((talk) => talk.id);
export type SessionId = (typeof SESSION_IDS)[number];
