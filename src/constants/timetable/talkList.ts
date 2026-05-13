import { getSessionMasterBySessionId } from "@/constants/sessionMaster";
import type {
  EventDate,
  SessionKey,
  SessionSummary,
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
  { bg: string; text: string; border: string }
> = {
  LEVERAGES: {
    bg: "bg-track-leverages",
    text: "text-white",
    border: "border-track-leverages",
  },
  UPSIDER: {
    bg: "bg-track-upsider",
    text: "text-white",
    border: "border-track-upsider",
  },
  RIGHTTOUCH: {
    bg: "bg-track-righttouch",
    text: "text-white",
    border: "border-track-righttouch",
  },
};

export const TALK_TYPE: Record<SessionKey, { name: string; color: string }> = {
  KEYNOTE: { name: "基調講演", color: "#0CA90E" },
  LONG: { name: "30分セッション", color: "#0C7EDC" },
  SHORT: { name: "10分セッション", color: "#c3620f" },
  SPONSOR: { name: "スポンサーセッション", color: "#E53D84" },
  HANDSON: { name: "ハンズオン", color: "#6B21A8" },
  OST: { name: "参加者体験企画", color: "#6B21A8" },
};

export const HANDSON_ID = "1";

export function isHandsonId(id: string): boolean {
  return id === HANDSON_ID;
}

function resolveSession(id: string): SessionSummary {
  const master = getSessionMasterBySessionId(id);
  if (master) {
    return {
      id,
      title: master.title,
      overview: master.overview,
      speaker: master.speaker,
    };
  }
  return { id, title: "", speaker: { name: "" } };
}

export type Talk = SessionSummary & {
  eventDate: EventDate;
  track: TrackKey;
  time: string;
};

export const talkList: Talk[] = timetableList.flatMap((day) =>
  day.cells.flatMap((cell) => {
    if (cell.content.type !== "session") return [];
    const { sessions } = cell.content;
    const time = myTimetable.formatTimeRange(cell.startTime, cell.endTime);
    return cell.trackKeys.flatMap((trackKey) =>
      sessions.map((ref) => ({
        ...resolveSession(ref.id),
        eventDate: day.day,
        track: trackKey,
        time,
      })),
    );
  }),
);

export const SESSION_IDS = talkList.map((talk) => talk.id);
export type SessionId = (typeof SESSION_IDS)[number];
