import { timetableList } from "../../src/constants/timetable";
import type {
  IndividualSlot,
  SessionKey,
  SessionTrack,
  TrackKey,
} from "../../src/types/timetable-api";

export type SessionMeta = {
  trackKey: TrackKey;
  trackName: string;
  sessionTypeKey: SessionKey;
  dayNumber: 1 | 2;
  timeRange: string;
};

function toHHMM(unixSeconds: number): string {
  const date = new Date(unixSeconds * 1000);
  const h = date.getUTCHours() + 9; // JST
  const m = date.getUTCMinutes();
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const SESSION_TYPE_KEYS = new Set<string>([
  "KEYNOTE",
  "LONG",
  "SHORT",
  "SPONSOR",
  "HANDSON",
]);

function isValidSessionKey(key: string): key is SessionKey {
  return SESSION_TYPE_KEYS.has(key);
}

const TRACK_KEYS = new Set<string>(["LEVERAGES", "UPSIDER", "RIGHTTOUCH"]);

function isValidTrackKey(key: string): key is TrackKey {
  return TRACK_KEYS.has(key);
}

function buildMetaMap(): Map<string, SessionMeta> {
  const map = new Map<string, SessionMeta>();

  for (const day of timetableList) {
    const dayNumber: 1 | 2 = day.day === "Day1" ? 1 : 2;

    for (const slot of day.slots) {
      if (slot.slotType !== "individual") continue;
      const individualSlot = slot as IndividualSlot;
      const timeRange = `${toHHMM(slot.startTime)} ~ ${toHHMM(slot.endTime)}`;

      for (const [trackId, trackContent] of Object.entries(
        individualSlot.tracks,
      )) {
        if (trackContent.type !== "session") continue;
        if (!isValidTrackKey(trackId)) continue;

        const sessionTrack = trackContent as SessionTrack;
        if (!isValidSessionKey(sessionTrack.sessionType)) continue;

        const trackInfo = day.tracks.find((t) => t.id === trackId);
        const trackName = trackInfo?.name ?? trackId;

        for (const session of sessionTrack.sessions) {
          map.set(session.id, {
            trackKey: trackId,
            trackName,
            sessionTypeKey: sessionTrack.sessionType,
            dayNumber,
            timeRange,
          });
        }
      }
    }
  }

  return map;
}

const metaMap = buildMetaMap();

export function getSessionMeta(id: string): SessionMeta | undefined {
  return metaMap.get(id);
}
