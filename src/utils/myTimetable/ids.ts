import { talkList } from "@/constants/timetable";
import { myTimetableQuery } from "@/utils/myTimetable/query";
import {
  myTimetable,
  parseTalkTimeToMinutes,
  type TalkWithMinutes,
} from "@/utils/myTimetable/time";
import { normalizeIds } from "./normalizeIds";

const STORAGE_KEYS = {
  timetable: "tskaigi:my-timetable-talk-ids",
  participated: "tskaigi:my-participated-talk-ids",
} as const;

type StorageKeyType = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

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

function syncQueryParams() {
  if (typeof window === "undefined") return;
  const ids = readStorageIds(STORAGE_KEYS.timetable);
  const participatedIds = readStorageIds(STORAGE_KEYS.participated);
  const tokens = myTimetableQuery.encode(ids, participatedIds);
  const params = new URLSearchParams(window.location.search);
  params.delete("m");
  params.delete("p");
  if (tokens.m) params.set("m", tokens.m);
  if (tokens.p) params.set("p", tokens.p);
  const query = params.toString();
  const url =
    query.length > 0
      ? `${window.location.pathname}?${query}`
      : window.location.pathname;
  window.history.replaceState(null, "", url);
}

function writeStorageIds(key: StorageKeyType, ids: string[]) {
  localStorage.setItem(key, JSON.stringify(normalizeIds(ids)));
  syncQueryParams();
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
