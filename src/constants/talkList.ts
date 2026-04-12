import type { TrackKey } from "@/types/timetable-api";
import { timetableList } from "./timetable";

export const EVENT_DATE = {
  DAY1: "2026-05-23",
  DAY2: "2026-05-24",
} as const;
export type EventDate = keyof typeof EVENT_DATE;

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
} as const;
export type Track = TrackKey;

export const TALK_TYPE = {
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
export type TalkType = keyof typeof TALK_TYPE;

export type Speaker = {
  name: string;
  profileImageUrl?: string;
};

export type Talk = {
  id: string;
  eventDate: EventDate;
  track: Track;
  talkType: TalkType;
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
    const eventDate: EventDate = day.day === 1 ? "DAY1" : "DAY2";
    for (const slot of day.slots) {
      if (slot.slotType !== "individual") continue;
      for (const [trackKey, content] of Object.entries(slot.tracks)) {
        if (content.type !== "session") continue;
        for (const session of content.sessions) {
          talks.push({
            id: session.id,
            eventDate,
            track: trackKey as Track,
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

export const talkIds = talkList.map((talk) => ({
  id: talk.id,
}));
