import { type Talk, talkList } from "@/constants/timetable";
import type { EventDate } from "@/types/timetable-api";

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

type SessionSlot = { readonly start: number; readonly end: number };

/** セッション時間枠（開始分・終了分） */
const SESSION_SLOTS_DAY1: readonly SessionSlot[] = [
  { start: 670, end: 700 }, // 11:10〜11:40
  { start: 710, end: 740 }, // 11:50〜12:20
  { start: 750, end: 810 }, // 12:30〜13:30
  { start: 820, end: 850 }, // 13:40〜14:10
  { start: 860, end: 890 }, // 14:20〜14:50
  { start: 910, end: 940 }, // 15:10〜15:40
  { start: 950, end: 980 }, // 15:50〜16:20
  { start: 1000, end: 1030 }, // 16:40〜17:10
  { start: 1040, end: 1070 }, // 17:20〜17:50
  { start: 1090, end: 1130 }, // 18:10〜18:50
] as const;

const SESSION_SLOTS_DAY2: readonly SessionSlot[] = [
  { start: 660, end: 690 }, // 11:00〜11:30
  { start: 700, end: 730 }, // 11:40〜12:10
  { start: 750, end: 810 }, // 12:30〜13:30
  { start: 820, end: 850 }, // 13:40〜14:10
  { start: 860, end: 890 }, // 14:20〜14:50
  { start: 910, end: 940 }, // 15:10〜15:40
  { start: 950, end: 980 }, // 15:50〜16:20
  { start: 1000, end: 1030 }, // 16:40〜17:10
  { start: 1040, end: 1110 }, // 17:20〜18:30
] as const;

const SESSION_SLOTS_BY_DAY: Record<EventDate, readonly SessionSlot[]> = {
  Day1: SESSION_SLOTS_DAY1,
  Day2: SESSION_SLOTS_DAY2,
};

const BASE_SLOT_MINUTES = 30;
const BASE_SLOT_HEIGHT = 100;
const BREAK_HEIGHT = 16;

/**
 * タイムラインのセグメント（セッション枠 + 休憩）を構築する。
 * 各セグメントの top（px上端）と height（px高さ）を返す。
 */
type TimelineSegment = {
  type: "session" | "break";
  start: number;
  end: number;
  top: number;
  height: number;
};

function buildTimelineSegments(
  slots: readonly SessionSlot[],
): TimelineSegment[] {
  const segments: TimelineSegment[] = [];
  let top = 0;

  const firstSlot = slots[0];
  segments.push({
    type: "break",
    start: firstSlot.start,
    end: firstSlot.start,
    top,
    height: BREAK_HEIGHT,
  });
  top += BREAK_HEIGHT;

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];

    if (i > 0) {
      const prevEnd = slots[i - 1].end;
      if (slot.start > prevEnd) {
        segments.push({
          type: "break",
          start: prevEnd,
          end: slot.start,
          top,
          height: BREAK_HEIGHT,
        });
        top += BREAK_HEIGHT;
      }
    }

    const slotMinutes = slot.end - slot.start;
    const slotHeight = BASE_SLOT_HEIGHT * (slotMinutes / BASE_SLOT_MINUTES);
    segments.push({
      type: "session",
      start: slot.start,
      end: slot.end,
      top,
      height: slotHeight,
    });
    top += slotHeight;
  }

  const lastSlot = slots[slots.length - 1];
  segments.push({
    type: "break",
    start: lastSlot.end,
    end: lastSlot.end,
    top,
    height: BREAK_HEIGHT,
  });
  top += BREAK_HEIGHT;

  return segments;
}

type DayTimeline = {
  segments: TimelineSegment[];
  height: number;
  slots: readonly SessionSlot[];
};

function buildDayTimeline(slots: readonly SessionSlot[]): DayTimeline {
  const segments = buildTimelineSegments(slots);
  const last = segments[segments.length - 1];
  return { segments, height: last.top + last.height, slots };
}

const TIMELINE_BY_DAY: Record<EventDate, DayTimeline> = {
  Day1: buildDayTimeline(SESSION_SLOTS_DAY1),
  Day2: buildDayTimeline(SESSION_SLOTS_DAY2),
};

/** 分数 → タイムライン上のpx位置（セッション枠・休憩の固定高さベース） */
function minutesToTop(eventDate: EventDate, minutes: number): number {
  const { segments, height } = TIMELINE_BY_DAY[eventDate];
  for (const seg of segments) {
    if (seg.start === seg.end) continue;

    if (minutes <= seg.start) return seg.top;
    if (minutes <= seg.end) {
      const ratio = (minutes - seg.start) / (seg.end - seg.start);
      return seg.top + ratio * seg.height;
    }
  }

  return height;
}

function formatMinutes(minutes: number): string {
  const hour = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const minute = (minutes % 60).toString().padStart(2, "0");
  return `${hour}:${minute}`;
}

/** 開始分〜終了分のpx高さ */
function minutesToHeight(
  eventDate: EventDate,
  startMinutes: number,
  endMinutes: number,
): number {
  return (
    minutesToTop(eventDate, endMinutes) - minutesToTop(eventDate, startMinutes)
  );
}

type PositionedTalk = TalkWithMinutes & {
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

  const directOverlaps = new Map<string, string[]>();
  for (const talk of sorted) {
    directOverlaps.set(
      talk.id,
      sorted
        .filter(
          (other) =>
            other.eventDate === talk.eventDate &&
            other.startMinutes < talk.endMinutes &&
            talk.startMinutes < other.endMinutes,
        )
        .map((t) => t.id),
    );
  }

  const ufParent = new Map<string, string>();
  const find = (x: string): string => {
    if (!ufParent.has(x)) ufParent.set(x, x);
    const p = ufParent.get(x) ?? x;
    if (p !== x) {
      const root = find(p);
      ufParent.set(x, root);
      return root;
    }
    return x;
  };
  const union = (a: string, b: string) => {
    ufParent.set(find(a), find(b));
  };

  for (const [id, neighbors] of directOverlaps) {
    for (const n of neighbors) {
      union(id, n);
    }
  }

  const maxColumnByRoot = new Map<string, number>();
  for (const talk of sorted) {
    const root = find(talk.id);
    const col = columnById.get(talk.id) ?? 0;
    maxColumnByRoot.set(root, Math.max(maxColumnByRoot.get(root) ?? 0, col));
  }

  const talkById = new Map(sorted.map((t) => [t.id, t]));

  return sorted.map((talk) => {
    const root = find(talk.id);
    const maxColumn = maxColumnByRoot.get(root) ?? 0;
    const neighbors = directOverlaps.get(talk.id) ?? [];

    const hasCrossTrackOverlap =
      neighbors.length > 1 &&
      neighbors.some((nId) => {
        const other = talkById.get(nId);
        return other && other.track !== talk.track;
      });

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
      Day1: [] as TalkWithMinutes[],
      Day2: [] as TalkWithMinutes[],
    },
  );
}

function formatTime(timestamp: number): string {
  const d = new Date(timestamp * 1000);
  const h = (d.getUTCHours() + 9).toString().padStart(2, "0");
  const m = d.getUTCMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

function formatTimeRange(start: number, end: number): string {
  return `${formatTime(start)} ~ ${formatTime(end)}`;
}

function hasSessionInSlot(
  eventDate: EventDate,
  slotStart: number,
  slotEnd: number,
): boolean {
  return talkList.some((talk) => {
    if (talk.eventDate !== eventDate) return false;
    const parsed = parseTalkTimeToMinutes(talk.time);
    if (!parsed) return false;
    return parsed.startMinutes < slotEnd && parsed.endMinutes > slotStart;
  });
}

export const MY_TIMETABLE_CONST = {
  TIMELINE_BY_DAY,
  SESSION_SLOTS_BY_DAY,
} as const;

export const myTimetable = {
  minutesToTop,
  minutesToHeight,
  formatMinutes,
  getPositionedTalks,
  getAllTalksWithMinutes,
  groupTalksByDate,
  hasSessionInSlot,
  formatTime,
  formatTimeRange,
};
