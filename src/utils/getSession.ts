import { notFound } from "next/navigation";
import { getSessionMasterBySessionId } from "@/constants/sessionMaster";
import { type SessionId, timetableList } from "@/constants/timetable";
import type {
  EventDate,
  SessionKey,
  SessionSummary,
  TrackKey,
} from "@/types/timetable-api";

export type SessionDetail = {
  session: SessionSummary;
  sessionType: SessionKey;
  trackKey: TrackKey;
  trackName: string;
  day: EventDate;
  date: string;
  startTime: number;
  endTime: number;
};

function resolveSession(id: string): SessionSummary {
  const master = getSessionMasterBySessionId(id);
  if (master) {
    return {
      id,
      title: master.title,
      overview: master.overview,
      speaker: {
        name: master.speaker.name,
        profileImageUrl: master.speaker.profileImageUrl,
        bio: master.speaker.bio,
        xId: master.speaker.xId,
        githubId: master.speaker.githubId,
        additionalLink: master.speaker.additionalLink,
        qiitaLink: master.speaker.qiitaLink,
        zennLink: master.speaker.zennLink,
        noteLink: master.speaker.noteLink,
        affiliation: master.speaker.affiliation,
        position: master.speaker.position,
      },
    };
  }
  return { id, title: "", speaker: { name: "" } };
}

export function getSession(id: SessionId): SessionDetail {
  for (const day of timetableList) {
    const trackNameMap: Record<string, string> = {};
    for (const t of day.tracks) {
      trackNameMap[t.id] = t.name;
    }

    for (const cell of day.cells) {
      if (cell.content.type !== "session") continue;
      for (const ref of cell.content.sessions) {
        if (ref.id !== id) continue;
        // Cell may span multiple tracks; pick the first as the canonical track.
        const trackKey = cell.tracks[0];
        return {
          session: resolveSession(id),
          sessionType: cell.content.sessionType,
          trackKey,
          trackName: trackNameMap[trackKey] ?? trackKey,
          day: day.day,
          date: day.date,
          startTime: cell.startTime,
          endTime: cell.endTime,
        };
      }
    }
  }
  notFound();
}
