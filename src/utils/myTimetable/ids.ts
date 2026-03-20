import { talkList } from "@/constants/talkList";
import {
  myTimetable,
  parseTalkTimeToMinutes,
  type TalkWithMinutes,
} from "@/utils/myTimetable/time";

const STORAGE_KEYS = {
  timetable: "tskaigi:my-timetable-talk-ids",
  participated: "tskaigi:my-participated-talk-ids",
} as const;

type StorageKeyType = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export function normalizeIds(ids: string[]) {
  const talkIds = new Set(talkList.map((talk) => talk.id));
  return Array.from(new Set(ids)).filter((id) => talkIds.has(id));
}

function readStorageIds(key: StorageKeyType): string[] {
  const raw = localStorage.getItem(key);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return normalizeIds(parsed.filter((value) => typeof value === "string"));
  } catch {
    return [];
  }
}

function writeStorageIds(key: StorageKeyType, ids: string[]) {
  localStorage.setItem(key, JSON.stringify(normalizeIds(ids)));
}

export const myTimetableIds = {
  read: () => readStorageIds(STORAGE_KEYS.timetable),
  write: (ids: string[]) => writeStorageIds(STORAGE_KEYS.timetable, ids),
};

export const myParticipatedIds = {
  read: () => readStorageIds(STORAGE_KEYS.participated),
  write: (ids: string[]) => writeStorageIds(STORAGE_KEYS.participated, ids),
  mark: (talkId: string) => {
    const timetableIds = myTimetableIds.read();
    if (!timetableIds.includes(talkId)) {
      myTimetableIds.write([...timetableIds, talkId]);
    }

    const participatedIds = myParticipatedIds.read();
    if (!participatedIds.includes(talkId)) {
      myParticipatedIds.write([...participatedIds, talkId]);
    }
  },
};

function getTalkWithMinutesById(id: string) {
  const talk = talkList.find((item) => item.id === id);
  if (!talk) return null;
  const parsed = parseTalkTimeToMinutes(talk.time);
  if (!parsed) return null;
  return { ...talk, ...parsed };
}

function getTalksWithMinutesByIds(ids: string[]) {
  return normalizeIds(ids)
    .map((id) => getTalkWithMinutesById(id))
    .filter((talk) => talk !== null);
}

export function getTalksByDateFromIds(ids: string[]) {
  return myTimetable.groupTalksByDate(getTalksWithMinutesByIds(ids));
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
