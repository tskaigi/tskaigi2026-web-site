import { timetableList } from "../../src/constants/timetable";
import type { SessionKey, TrackKey } from "../../src/types/timetable-api";

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

function buildMetaMap(): Map<string, SessionMeta> {
  const map = new Map<string, SessionMeta>();

  for (const day of timetableList) {
    const dayNumber: 1 | 2 = day.day === "Day1" ? 1 : 2;

    for (const cell of day.cells) {
      if (cell.content.type !== "session") continue;
      if (!isValidSessionKey(cell.content.sessionType)) continue;
      const timeRange = `${toHHMM(cell.startTime)} ~ ${toHHMM(cell.endTime)}`;

      for (const trackKey of cell.tracks) {
        const trackInfo = day.tracks.find((t) => t.id === trackKey);
        const trackName = trackInfo?.name ?? trackKey;

        for (const session of cell.content.sessions) {
          map.set(session.id, {
            trackKey,
            trackName,
            sessionTypeKey: cell.content.sessionType,
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
