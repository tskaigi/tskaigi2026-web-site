import { notFound } from "next/navigation";
import { getSessionMasterBySessionId } from "@/constants/sessionMaster";
import { type SessionId, timetableList } from "@/constants/timetable";
import type {
  SessionKey,
  SessionSummary,
  TimeSlot,
  TimetableResponse,
  Track,
} from "@/types/timetable-api";

export type SessionDetail = TimeSlot &
  Pick<Track, "id" | "name"> &
  Pick<TimetableResponse, "day" | "date"> & {
    session: SessionSummary;
    sessionType: SessionKey;
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

export function getSession(sessionId: SessionId): SessionDetail {
  for (const day of timetableList) {
    const trackNameMap: Record<string, string> = {};
    for (const t of day.tracks) {
      trackNameMap[t.id] = t.name;
    }

    for (const cell of day.cells) {
      if (cell.content.type !== "session") continue;
      for (const ref of cell.content.sessions) {
        if (ref.id !== sessionId) continue;
        // Cell may span multiple tracks; pick the first as the canonical track.
        const trackId = cell.tracks[0];
        return {
          session: resolveSession(sessionId),
          sessionType: cell.content.sessionType,
          id: trackId,
          name: trackNameMap[trackId] ?? trackId,
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
