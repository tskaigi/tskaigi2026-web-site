"use client";

import { useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { TRACK_KEYS } from "@/constants/timetable";
import { useTimetable } from "@/hooks/useTimetable";
import { cn } from "@/lib/utils";
import type { Cell, TimeSlot, TimetableResponse } from "@/types/timetable-api";
import { myTimetable } from "@/utils/myTimetable";
import { CellRenderer } from "./CellRenderer";
import { SlotTrackHeader } from "./SlotTrackHeader";
import { TimeLabel } from "./TimeLabel";

const cellKeyOf = (cell: Cell) => `${cell.startTime}-${cell.trackKeys[0]}`;

export function DayTimeTable({ data }: { data: TimetableResponse }) {
  const sessionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // 全セルの startTime/endTime をユニークソートしたものが境界。
  // boundaryIndex は時刻 → 境界番号(grid line - 1)を引くためのMap。
  const { boundaries, boundaryIndex } = useMemo(() => {
    const set = new Set<number>();
    for (const c of data.cells) {
      set.add(c.startTime);
      set.add(c.endTime);
    }
    const sorted = [...set].sort((a, b) => a - b);
    const idx = new Map<number, number>();
    sorted.forEach((t, i) => {
      idx.set(t, i);
    });
    return { boundaries: sorted, boundaryIndex: idx };
  }, [data.cells]);

  const timeSlots = useMemo<TimeSlot[]>(
    () =>
      boundaries
        .slice(0, -1)
        .map((t, i) => ({ startTime: t, endTime: boundaries[i + 1] })),
    [boundaries],
  );

  const sessionTimeTable = useMemo(
    () =>
      timeSlots.map((s) => ({
        id: myTimetable.formatTime(s.startTime),
        start: new Date(s.startTime * 1000),
        end: new Date(s.endTime * 1000),
      })),
    [timeSlots],
  );

  const { showScrollButton, scrollToCurrentSession, isSessionActive } =
    useTimetable({
      sessionTimeTable,
      sessionElements: sessionRefs.current,
    });

  const trackRecord = data.trackRecord;

  // tour-add-button: 一番早い start で、その中で一番左のトラックの通常セッションセル。
  const tourAddButtonCellKey = useMemo(() => {
    const candidates = data.cells
      .filter(
        (c) =>
          c.content.type === "session" && c.content.displayLabel === undefined,
      )
      .sort(
        (a, b) =>
          a.startTime - b.startTime ||
          TRACK_KEYS.indexOf(a.trackKeys[0]) -
            TRACK_KEYS.indexOf(b.trackKeys[0]),
      );
    return candidates[0] ? cellKeyOf(candidates[0]) : null;
  }, [data.cells]);

  // モバイルでは同一 startTime のセルを縦に並べるための索引。
  const cellsByStartTime = useMemo(() => {
    const m = new Map<number, Cell[]>();
    for (const c of data.cells) {
      const arr = m.get(c.startTime) ?? [];
      arr.push(c);
      m.set(c.startTime, arr);
    }
    for (const arr of m.values()) {
      arr.sort(
        (a, b) =>
          TRACK_KEYS.indexOf(a.trackKeys[0]) -
          TRACK_KEYS.indexOf(b.trackKeys[0]),
      );
    }
    return m;
  }, [data.cells]);

  return (
    <>
      <div className="hidden md:block">
        <div className="grid gap-1 mt-4 md:mt-2 grid-cols-[1fr] md:grid-cols-[auto_minmax(210px,1fr)_minmax(210px,1fr)_minmax(210px,1fr)]">
          <div className="w-[70px] md:w-[99px] lg:w-[125px]" />
          {Object.values(data.trackRecord).map((track) => (
            <SlotTrackHeader key={track.id} track={track} />
          ))}
        </div>
      </div>

      {/* Desktop: single CSS grid; cells positioned with grid-row/column span */}
      <div
        className="hidden md:grid gap-1 mt-2 grid-cols-[auto_minmax(210px,1fr)_minmax(210px,1fr)_minmax(210px,1fr)]"
        style={{ gridTemplateRows: `repeat(${timeSlots.length}, auto)` }}
      >
        {timeSlots.map((slot, i) => {
          const timeId = myTimetable.formatTime(slot.startTime);
          const timeText = myTimetable.formatTimeRange(
            slot.startTime,
            slot.endTime,
          );
          const active = isSessionActive(timeId);
          return (
            <div
              key={`time-${timeId}`}
              ref={(el) => {
                sessionRefs.current[timeId] = el;
              }}
              style={{ gridRow: i + 1, gridColumn: 1 }}
            >
              <TimeLabel timeText={timeText} isActive={active} />
            </div>
          );
        })}
        {data.cells.map((cell) => {
          const rowStart = (boundaryIndex.get(cell.startTime) ?? 0) + 1;
          const rowEnd = (boundaryIndex.get(cell.endTime) ?? 0) + 1;
          const colStart = TRACK_KEYS.indexOf(cell.trackKeys[0]) + 2;
          const colEnd =
            TRACK_KEYS.indexOf(cell.trackKeys[cell.trackKeys.length - 1]) + 3;
          const cellKey = cellKeyOf(cell);
          return (
            <div
              key={`cell-${cellKey}`}
              style={{
                gridRow: `${rowStart} / ${rowEnd}`,
                gridColumn: `${colStart} / ${colEnd}`,
              }}
            >
              <CellRenderer
                cell={cell}
                trackRecord={trackRecord}
                id={
                  cellKey === tourAddButtonCellKey
                    ? "tour-add-button"
                    : undefined
                }
              />
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical stack per timeSlot */}
      <div className="md:hidden">
        {timeSlots.map((slot) => {
          const timeId = myTimetable.formatTime(slot.startTime);
          const timeText = myTimetable.formatTimeRange(
            slot.startTime,
            slot.endTime,
          );
          const active = isSessionActive(timeId);
          const cellsHere = cellsByStartTime.get(slot.startTime) ?? [];
          return (
            <div
              key={`m-${timeId}`}
              ref={(el) => {
                sessionRefs.current[timeId] = el;
              }}
              className="grid gap-1 mt-4 grid-cols-[1fr]"
            >
              <TimeLabel timeText={timeText} isActive={active} />
              {cellsHere.map((cell) => {
                const cellKey = cellKeyOf(cell);
                return (
                  <CellRenderer
                    key={cellKey}
                    cell={cell}
                    trackRecord={trackRecord}
                    id={
                      cellKey === tourAddButtonCellKey
                        ? "tour-add-button"
                        : undefined
                    }
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      {showScrollButton && (
        <div
          className={cn(
            "fixed bottom-4 left-1/2 -translate-x-1/2 transition-transform duration-300 z-50",
            "translate-y-0 pointer-events-auto",
          )}
        >
          <Button
            type="button"
            className="font-bold bg-blue-light-500 hover:bg-blue-light-500 rounded-full md:hidden"
            onClick={scrollToCurrentSession}
            tabIndex={0}
          >
            現在のセッションにスクロールする
          </Button>
        </div>
      )}
    </>
  );
}
