import { notFound } from "next/navigation";
import { timetableList } from "@/constants/timetable";
import type {
  SessionSummary,
  SessionTrack,
  TrackKey,
} from "@/types/timetable-api";

export type SessionDetail = {
  session: SessionSummary;
  sessionType: SessionTrack["sessionType"];
  trackKey: TrackKey;
  trackName: string;
  day: 1 | 2;
  date: string;
  startTime: number;
  endTime: number;
};

export function getSession(id: string): SessionDetail {
  for (const day of timetableList) {
    const trackNameMap: Record<string, string> = {};
    for (const t of day.tracks) {
      trackNameMap[t.id] = t.name;
    }

    for (const slot of day.slots) {
      if (slot.slotType !== "individual") continue;
      for (const [key, content] of Object.entries(slot.tracks)) {
        if (content.type !== "session") continue;
        for (const session of content.sessions) {
          if (session.id === id) {
            return {
              session,
              sessionType: content.sessionType,
              trackKey: key as TrackKey,
              trackName: trackNameMap[key] ?? key,
              day: day.day,
              date: day.date,
              startTime: slot.startTime,
              endTime: slot.endTime,
            };
          }
        }
      }
    }
  }
  notFound();
}

export function getAllSessionIds(): { id: string }[] {
  const ids: { id: string }[] = [];
  for (const day of timetableList) {
    for (const slot of day.slots) {
      if (slot.slotType !== "individual") continue;
      for (const content of Object.values(slot.tracks)) {
        if (content.type !== "session") continue;
        for (const session of content.sessions) {
          ids.push({ id: session.id });
        }
      }
    }
  }
  return ids;
}
