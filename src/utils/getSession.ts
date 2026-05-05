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
    const { title, overview, speaker } = master;
    const { userIcon: _, ...rest } = speaker;
    return { id, title, overview, speaker: rest };
  }
  return { id, title: "", speaker: { name: "" } };
}

export function getSession(sessionId: SessionId): SessionDetail {
  for (const timetable of timetableList) {
    const { day, date, trackRecord, cells } = timetable;
    for (const cell of cells) {
      if (cell.content.type !== "session") continue;
      const { content, trackKeys, startTime, endTime } = cell;
      const { sessions, sessionType } = content;
      for (const ref of sessions) {
        if (ref.id !== sessionId) continue;
        // Cell may span multiple tracks; pick the first as the canonical track.
        const id = trackKeys[0];
        const { name } = trackRecord[id];
        const session = resolveSession(sessionId);
        return {
          day,
          date,
          startTime,
          endTime,
          sessionType,
          id,
          name,
          session,
        };
      }
    }
  }
  notFound();
}
