import { type Talk, talkList } from "@/constants/talkList";

export const MY_TIMETABLE_STORAGE_KEY = "tskaigi:my-timetable-talk-ids";
export const MY_PARTICIPATED_STORAGE_KEY = "tskaigi:my-participated-talk-ids";

export type TalkWithMinutes = Talk & {
  startMinutes: number;
  endMinutes: number;
};

function parseClockToMinutes(clock: string): number | null {
  const match = clock.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

  return hour * 60 + minute;
}

export function parseTalkTimeToMinutes(timeText: string) {
  const [startText, endText] = timeText.split(/\s*[〜~]\s*/u);
  if (!startText || !endText) return null;

  const startMinutes = parseClockToMinutes(startText);
  const endMinutes = parseClockToMinutes(endText);
  if (
    startMinutes === null ||
    endMinutes === null ||
    endMinutes <= startMinutes
  ) {
    return null;
  }

  return { startMinutes, endMinutes };
}

export function normalizeIds(ids: string[]): string[] {
  const talkIds = new Set(talkList.map((talk) => talk.id));
  return Array.from(new Set(ids)).filter((id) => talkIds.has(id));
}

export function readMyTimetableIds(): string[] {
  const raw = localStorage.getItem(MY_TIMETABLE_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return normalizeIds(parsed.filter((value) => typeof value === "string"));
  } catch {
    return [];
  }
}

export function writeMyTimetableIds(ids: string[]) {
  const normalized = normalizeIds(ids);
  localStorage.setItem(MY_TIMETABLE_STORAGE_KEY, JSON.stringify(normalized));
}

export function readMyParticipatedIds(): string[] {
  const raw = localStorage.getItem(MY_PARTICIPATED_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return normalizeIds(parsed.filter((value) => typeof value === "string"));
  } catch {
    return [];
  }
}

export function writeMyParticipatedIds(ids: string[]) {
  const normalized = normalizeIds(ids);
  localStorage.setItem(
    MY_PARTICIPATED_STORAGE_KEY,
    JSON.stringify(normalized),
  );
}

export function markAsParticipated(talkId: string) {
  const timetableIds = readMyTimetableIds();
  if (!timetableIds.includes(talkId)) {
    writeMyTimetableIds([...timetableIds, talkId]);
  }

  const participatedIds = readMyParticipatedIds();
  if (!participatedIds.includes(talkId)) {
    writeMyParticipatedIds([...participatedIds, talkId]);
  }
}

export function getTalkWithMinutesById(id: string): TalkWithMinutes | null {
  const talk = talkList.find((item) => item.id === id);
  if (!talk) return null;
  const parsed = parseTalkTimeToMinutes(talk.time);
  if (!parsed) return null;
  return {
    ...talk,
    ...parsed,
  };
}

export function getTalksWithMinutesByIds(ids: string[]): TalkWithMinutes[] {
  return normalizeIds(ids)
    .map((id) => getTalkWithMinutesById(id))
    .filter((talk): talk is TalkWithMinutes => !!talk);
}

export function findOverlaps(
  targetId: string,
  selectedIds: string[],
): TalkWithMinutes[] {
  const target = getTalkWithMinutesById(targetId);
  if (!target) return [];

  return getTalksWithMinutesByIds(selectedIds).filter(
    (talk) =>
      talk.id !== target.id &&
      talk.eventDate === target.eventDate &&
      talk.startMinutes < target.endMinutes &&
      target.startMinutes < talk.endMinutes,
  );
}

export function encodeMyTimetableToken(ids: string[]): string {
  return normalizeIds(ids).join(".");
}

export function decodeMyTimetableToken(token: string): string[] {
  if (token.trim().length === 0) return [];

  return normalizeIds(
    token
      .split(".")
      .map((chunk) => chunk.trim())
      .filter((chunk) => !!chunk),
  );
}

export type MyTimetableQuery = {
  ids: string[];
  participatedIds: string[];
};

export function parseMyTimetableQuery(
  searchParams: URLSearchParams,
): MyTimetableQuery | null {
  const mToken = searchParams.get("m");
  const pToken = searchParams.get("p");

  if (!mToken && !pToken) return null;

  const mIds = mToken ? decodeMyTimetableToken(mToken) : [];
  const pIds = pToken ? decodeMyTimetableToken(pToken) : [];

  const allIds = normalizeIds([...mIds, ...pIds]);
  const participatedIds = normalizeIds(pIds);

  return { ids: allIds, participatedIds };
}

export function encodeMyTimetableQuery(
  ids: string[],
  participatedIds: string[],
): { m?: string; p?: string } {
  const participatedSet = new Set(normalizeIds(participatedIds));
  const nonParticipated = normalizeIds(ids).filter(
    (id) => !participatedSet.has(id),
  );
  const participated = normalizeIds(
    ids.filter((id) => participatedSet.has(id)),
  );

  const result: { m?: string; p?: string } = {};
  if (nonParticipated.length > 0) {
    result.m = nonParticipated.join(".");
  }
  if (participated.length > 0) {
    result.p = participated.join(".");
  }
  return result;
}
