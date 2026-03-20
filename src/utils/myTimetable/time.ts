import { type EventDate, type Talk, talkList } from "@/constants/talkList";

export type TalkWithMinutes = Talk & {
  startMinutes: number;
  endMinutes: number;
};

function parseClockToMinutes(clock: string) {
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

const PIXELS_PER_MINUTE = 1.6;
const TIMELINE_START_MINUTES = 10 * 60;
const TIMELINE_END_MINUTES = 18 * 60;

export type PositionedTalk = TalkWithMinutes & {
  columnIndex: number;
  columnCount: number;
  isOverlapping: boolean;
};

function compareTalkWithMinutes(a: TalkWithMinutes, b: TalkWithMinutes) {
  if (a.eventDate !== b.eventDate)
    return a.eventDate.localeCompare(b.eventDate);
  if (a.startMinutes !== b.startMinutes) return a.startMinutes - b.startMinutes;
  if (a.endMinutes !== b.endMinutes) return a.endMinutes - b.endMinutes;
  return a.id.localeCompare(b.id);
}

function getTrackBorderClass(track: Talk["track"]) {
  switch (track) {
    case "TRACK1":
      return "border-track-toggle";
    case "TRACK2":
      return "border-track-ascend";
    case "TRACK3":
      return "border-track-leverages";
    default:
      return track satisfies never;
  }
}

function getPositionedTalks(talks: TalkWithMinutes[]): PositionedTalk[] {
  const sorted = [...talks].sort(compareTalkWithMinutes);

  const active: Array<{ id: string; end: number; column: number }> = [];
  const freeColumns: number[] = [];
  const columnById = new Map<string, number>();

  const pullMinColumn = () => {
    if (freeColumns.length === 0) return null;
    freeColumns.sort((a, b) => a - b);
    return freeColumns.shift() ?? null;
  };

  for (const talk of sorted) {
    for (let index = active.length - 1; index >= 0; index -= 1) {
      const item = active[index];
      if (item.end <= talk.startMinutes) {
        freeColumns.push(item.column);
        active.splice(index, 1);
      }
    }

    const reused = pullMinColumn();
    const nextColumn = reused ?? active.length + freeColumns.length;

    columnById.set(talk.id, nextColumn);
    active.push({ id: talk.id, end: talk.endMinutes, column: nextColumn });
  }

  return sorted.map((talk) => {
    const overlaps = sorted.filter(
      (other) =>
        other.eventDate === talk.eventDate &&
        other.startMinutes < talk.endMinutes &&
        talk.startMinutes < other.endMinutes,
    );

    const maxColumn = Math.max(
      ...overlaps.map((item) => columnById.get(item.id) ?? 0),
      0,
    );

    const hasCrossTrackOverlap =
      overlaps.length > 1 &&
      overlaps.some((other) => other.track !== talk.track);

    return {
      ...talk,
      columnIndex: columnById.get(talk.id) ?? 0,
      columnCount: maxColumn + 1,
      isOverlapping: hasCrossTrackOverlap,
    };
  });
}

function getAllTalksWithMinutes(): TalkWithMinutes[] {
  return talkList
    .map((talk) => {
      const parsed = parseTalkTimeToMinutes(talk.time);
      if (!parsed) return null;
      return { ...talk, ...parsed };
    })
    .filter((talk) => talk !== null)
    .sort(compareTalkWithMinutes);
}

function groupTalksByDate(
  talks: TalkWithMinutes[],
): Record<EventDate, TalkWithMinutes[]> {
  return talks.reduce(
    (acc, talk) => {
      acc[talk.eventDate].push(talk);
      return acc;
    },
    {
      DAY1: [] as TalkWithMinutes[],
      DAY2: [] as TalkWithMinutes[],
    },
  );
}

export const MY_TIMETABLE_CONST = {
  PIXELS_PER_MINUTE,
  TIMELINE_START_MINUTES,
  TIMELINE_END_MINUTES,
  TIMELINE_HEIGHT:
    (TIMELINE_END_MINUTES - TIMELINE_START_MINUTES) * PIXELS_PER_MINUTE,
  TIMELINE_MARKERS: Array.from(
    { length: (TIMELINE_END_MINUTES - TIMELINE_START_MINUTES) / 30 + 1 },
    (_, i) => TIMELINE_START_MINUTES + i * 30,
  ),
} as const;

export const myTimetable = {
  minutesToPx: (minutes: number) => minutes * PIXELS_PER_MINUTE,
  minutesToTop: (minutes: number) =>
    (minutes - TIMELINE_START_MINUTES) * PIXELS_PER_MINUTE,
  formatMinutes: (minutes: number) => {
    const hour = Math.floor(minutes / 60)
      .toString()
      .padStart(2, "0");
    const minute = (minutes % 60).toString().padStart(2, "0");
    return `${hour}:${minute}`;
  },
  getTrackBorderClass,
  getPositionedTalks,
  getAllTalksWithMinutes,
  groupTalksByDate,
};
