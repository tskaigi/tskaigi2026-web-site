import { normalizeIds } from "@/utils/myTimetable/ids";

function decodeMyTimetableToken(token: string) {
  if (token.trim().length === 0) return [];

  return normalizeIds(
    token
      .split(".")
      .map((chunk) => chunk.trim())
      .filter((chunk) => !!chunk),
  );
}

export const myTimetableQuery = {
  parse: (searchParams: URLSearchParams) => {
    const mToken = searchParams.get("m");
    const pToken = searchParams.get("p");

    const mIds = mToken ? decodeMyTimetableToken(mToken) : [];
    const pIds = pToken ? decodeMyTimetableToken(pToken) : [];

    return {
      ids: [...new Set([...mIds, ...pIds])],
      participatedIds: pIds,
    };
  },
  encode: (ids: string[], participatedIds: string[]) => {
    const normalizedIds = normalizeIds(ids);
    const participatedSet = new Set(normalizeIds(participatedIds));
    const nonParticipated = normalizedIds.filter(
      (id) => !participatedSet.has(id),
    );
    const participated = normalizedIds.filter((id) => participatedSet.has(id));

    const result: { m?: string; p?: string } = {};
    if (nonParticipated.length > 0) {
      result.m = nonParticipated.join(".");
    }
    if (participated.length > 0) {
      result.p = participated.join(".");
    }
    return result;
  },
};
