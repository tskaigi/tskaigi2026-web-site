import { type Talk, talkList } from "@/constants/talkList";

export const MY_TIMETABLE_STORAGE_KEY = "tskaigi:my-timetable-talk-ids";

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
