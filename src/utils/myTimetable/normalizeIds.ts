import { talkList } from "@/constants/timetable";

export function normalizeIds(ids: string[]) {
  const talkIds = new Set(talkList.map((talk) => talk.id));
  return Array.from(new Set(ids)).filter((id) => talkIds.has(id));
}
