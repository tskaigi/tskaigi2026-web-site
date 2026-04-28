import { notFound } from "next/navigation";
import { getSessionMasterBySessionId } from "@/constants/sessionMaster";
import {
  type SessionId,
  TRACK_KEYS,
  timetableList,
} from "@/constants/timetable";
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

    for (const slot of day.slots) {
      if (slot.slotType !== "individual") continue;
      for (const trackKey of TRACK_KEYS) {
        const content = slot.tracks[trackKey];
        if (content.type !== "session") continue;
        for (const ref of content.sessions) {
          if (ref.id === id) {
            return {
              session: resolveSession(id),
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
