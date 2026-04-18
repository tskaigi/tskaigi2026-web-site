import { notFound } from "next/navigation";
import { type SessionId, TRACK_KEYS } from "@/constants/talkList";
import { timetableList } from "@/constants/timetable";
import type {
  EventDate,
  SessionSummary,
  SessionTrack,
  TrackKey,
} from "@/types/timetable-api";

export type SessionDetail = {
  session: SessionSummary;
  sessionType: SessionTrack["sessionType"];
  trackKey: TrackKey;
  trackName: string;
  day: EventDate;
  date: string;
  startTime: number;
  endTime: number;
};

export function getSession(id: SessionId): SessionDetail {
  for (const day of timetableList) {
    const trackNameMap: Record<string, string> = {};
    for (const t of day.tracks) {
      trackNameMap[t.id] = t.name;
    }

    for (const slot of day.slots) {
      if (slot.slotType !== "individual") continue;
      for (const trackKey of TRACK_KEYS) {
        const content = slot.tracks[trackKey];
        if (content.type !== "session") continue;
        for (const session of content.sessions) {
          if (session.id === id) {
            return {
              session,
              sessionType: content.sessionType,
              trackKey,
              trackName: trackNameMap[trackKey] ?? trackKey,
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
