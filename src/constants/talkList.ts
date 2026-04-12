import type { EventDate, SessionKey, TrackKey } from "@/types/timetable-api";
import { timetableList } from "./timetable";

export const EVENT_DATES: EventDate[] = ["Day1", "Day2"];
export const TRACK_KEYS: TrackKey[] = ["LEVERAGES", "UPSIDER", "RIGHTTOUCH"];

export const EVENT_DATE: Record<EventDate, string> = {
  Day1: "2026-05-23",
  Day2: "2026-05-24",
};

export const TRACK: Record<TrackKey, { name: string; tag: string }> = {
  LEVERAGES: {
    name: "Leveragesトラック",
    tag: "#tskaigi_leverages",
  },
  UPSIDER: {
    name: "UPSIDERトラック",
    tag: "#tskaigi_upsider",
  },
  RIGHTTOUCH: {
    name: "RightTouchトラック",
    tag: "#tskaigi_righttouch",
  },
};

export const TALK_TYPE: Record<SessionKey, { name: string; color: string }> = {
  KEYNOTE: {
    name: "基調講演",
    color: "#0CA90E",
  },
  LONG: {
    name: "30分セッション",
    color: "#0C7EDC",
  },
  SHORT: {
    name: "10分セッション",
    color: "#c3620f",
  },
  SPONSOR: {
    name: "スポンサーセッション",
    color: "#E53D84",
  },
};

export type Speaker = {
  name: string;
  profileImageUrl?: string;
};

export type Talk = {
  id: string;
  eventDate: EventDate;
  track: TrackKey;
  talkType: SessionKey;
  title: string;
  overview: string;
  time: string;
  speaker: Speaker;
};

function formatTimestamp(ts: number): string {
  const d = new Date(ts * 1000);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

function buildTalkList(): Talk[] {
  const talks: Talk[] = [];
  for (const day of timetableList) {
    const eventDate = day.day;
    for (const slot of day.slots) {
      if (slot.slotType !== "individual") continue;
      for (const trackKey of TRACK_KEYS) {
        const content = slot.tracks[trackKey];
        if (content.type !== "session") continue;
        for (const session of content.sessions) {
          talks.push({
            id: session.id,
            eventDate,
            track: trackKey,
            talkType: content.sessionType,
            title: session.title,
            overview: "",
            time: `${formatTimestamp(slot.startTime)} 〜 ${formatTimestamp(slot.endTime)}`,
            speaker: {
              name: session.speaker.name,
              profileImageUrl: session.speaker.profileImageUrl,
            },
          });
        }
      }
    }
  }
  return talks;
}

export const talkList: Talk[] = buildTalkList();

export const SESSION_IDS = talkList.map((talk) => talk.id);
export type SessionId = (typeof SESSION_IDS)[number];
