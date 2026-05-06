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

  for (const timetable of timetableList) {
    const { day, cells, trackRecord } = timetable;
    const dayNumber: 1 | 2 = day === "Day1" ? 1 : 2;

    for (const cell of cells) {
      const { content, trackKeys, startTime, endTime } = cell;
      if (content.type !== "session") continue;
      const { sessionType, sessions } = content;
      if (!isValidSessionKey(sessionType)) continue;
      const timeRange = `${toHHMM(startTime)} ~ ${toHHMM(endTime)}`;

      for (const trackKey of trackKeys) {
        const trackName = trackRecord[trackKey].name;

        for (const session of sessions) {
          map.set(session.id, {
            trackKey,
            trackName,
            sessionTypeKey: sessionType,
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
