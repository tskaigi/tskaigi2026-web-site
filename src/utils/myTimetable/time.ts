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

/** セッション時間枠（開始分・終了分） */
const SESSION_SLOTS = [
  { start: 670, end: 700 }, // 11:10〜11:40
  { start: 710, end: 740 }, // 11:50〜12:20
  { start: 820, end: 850 }, // 13:40〜14:10
  { start: 860, end: 890 }, // 14:20〜14:50
  { start: 910, end: 940 }, // 15:10〜15:40
  { start: 950, end: 980 }, // 15:50〜16:20
  { start: 1000, end: 1030 }, // 16:40〜17:10
  { start: 1040, end: 1070 }, // 17:20〜17:50
  { start: 1080, end: 1130 }, // 18:00〜18:50
] as const;

const SESSION_SLOT_HEIGHT = 80;
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

function buildTimelineSegments(): TimelineSegment[] {
  const segments: TimelineSegment[] = [];
  let top = 0;

  // 最初のセッション前の休憩
  const firstSlot = SESSION_SLOTS[0];
  segments.push({
    type: "break",
    start: firstSlot.start,
    end: firstSlot.start,
    top,
    height: BREAK_HEIGHT,
  });
  top += BREAK_HEIGHT;

  for (let i = 0; i < SESSION_SLOTS.length; i++) {
    const slot = SESSION_SLOTS[i];

    // 前のスロットとの間に休憩を挟む
    if (i > 0) {
      const prevEnd = SESSION_SLOTS[i - 1].end;
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

    segments.push({
      type: "session",
      start: slot.start,
      end: slot.end,
      top,
      height: SESSION_SLOT_HEIGHT,
    });
    top += SESSION_SLOT_HEIGHT;
  }

  // 最後のセッション後の休憩
  const lastSlot = SESSION_SLOTS[SESSION_SLOTS.length - 1];
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

const TIMELINE_SEGMENTS = buildTimelineSegments();
const TIMELINE_HEIGHT =
  TIMELINE_SEGMENTS[TIMELINE_SEGMENTS.length - 1].top +
  TIMELINE_SEGMENTS[TIMELINE_SEGMENTS.length - 1].height;

/** 分数 → タイムライン上のpx位置（セッション枠・休憩の固定高さベース） */
function minutesToTop(minutes: number): number {
  for (const seg of TIMELINE_SEGMENTS) {
    // start === end のパディング用セグメントはスキップ
    if (seg.start === seg.end) continue;

    if (minutes <= seg.start) return seg.top;
    if (minutes <= seg.end) {
      const ratio = (minutes - seg.start) / (seg.end - seg.start);
      return seg.top + ratio * seg.height;
    }
  }

  // 最後のセグメントより後
  return TIMELINE_HEIGHT;
}

function formatMinutes(minutes: number): string {
  const hour = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const minute = (minutes % 60).toString().padStart(2, "0");
  return `${hour}:${minute}`;
}

/** 開始分〜終了分のpx高さ */
function minutesToHeight(startMinutes: number, endMinutes: number): number {
  return minutesToTop(endMinutes) - minutesToTop(startMinutes);
}

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

export const MY_TIMETABLE_CONST = {
  TIMELINE_HEIGHT,
  TIMELINE_SEGMENTS,
  /** クリック可能な時間帯 */
  SESSION_SLOTS,
} as const;

export const myTimetable = {
  minutesToTop,
  minutesToHeight,
  formatMinutes,
  getPositionedTalks,
  getAllTalksWithMinutes,
  groupTalksByDate,
  formatTime,
  formatTimeRange,
};
