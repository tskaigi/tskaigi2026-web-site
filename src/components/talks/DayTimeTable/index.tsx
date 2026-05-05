"use client";

import { Copy, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { ProfileImage } from "@/components/talks/FallbackImage";
import { Button } from "@/components/ui/button";
import { getSessionMasterBySessionId } from "@/constants/sessionMaster";
import { TALK_TYPE, TRACK_KEYS, TRACK_STYLE } from "@/constants/timetable";
import { useTimetable } from "@/hooks/useTimetable";
import { cn } from "@/lib/utils";
import type {
  Cell,
  SessionContent,
  TimetableResponse,
  TrackKey,
} from "@/types/timetable-api";
import { myTimetable } from "@/utils/myTimetable";

function SlotTrackHeader({
  track,
}: {
  track: TimetableResponse["tracks"][number];
}) {
  const [copySuccess, setCopySuccess] = useState(false);
  const key = track.id as TrackKey;
  const style = TRACK_STYLE[key];

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("クリップボードへのコピーに失敗しました", err);
    }
  };

  return (
    <div className={`${style.bg} p-2 text-center`}>
      <span className={`font-bold ${style.text}`}>{track.name}</span>
      <div className="flex justify-center mt-2">
        <Button
          onClick={() => copyToClipboard(track.hashtag)}
          className="rounded-full bg-white text-black hover:bg-gray-100 px-4 py-1 text-sm font-medium h-auto flex items-center gap-2"
        >
          {copySuccess ? (
            <span>コピーしました！</span>
          ) : (
            <>
              <span>{track.hashtag}</span>
              <Copy className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function TimeLabel({
  timeText,
  isActive = false,
}: {
  timeText: string;
  isActive?: boolean;
}) {
  return (
    <div
      className={`relative flex flex-col gap-2 p-2 items-center justify-center text-center w-full h-full md:w-[99px] lg:w-[125px] ${
        isActive
          ? "bg-orange-200 after:content-[''] after:absolute after:top-0 after:right-0 after:w-[5px] after:h-full after:bg-orange-500 after:opacity-50"
          : "bg-yellow-200"
      }`}
    >
      <p
        className={`text-sm lg:text-base font-bold ${
          isActive ? "text-orange-500" : "text-yellow-700"
        }`}
      >
        {timeText}
      </p>
      {isActive && <p className="text-xs text-orange-500 font-normal">now</p>}
    </div>
  );
}

function TriangleBadge({ cssVar }: { cssVar: string }) {
  return (
    <div
      className="hidden md:block"
      style={{
        width: 0,
        height: 0,
        borderStyle: "solid",
        borderWidth: "0 24px 24px 0",
        borderColor: `transparent ${cssVar} transparent transparent`,
        position: "absolute",
        top: 0,
        right: 0,
      }}
    />
  );
}

function SessionTypeLabel({
  sessionType,
}: {
  sessionType: SessionContent["sessionType"];
}) {
  const { name, color } = TALK_TYPE[sessionType];
  return (
    <span
      className="inline-block rounded px-2 py-0.5 text-xs font-bold text-white"
      style={{ backgroundColor: color }}
    >
      {name}
    </span>
  );
}

function LabelText({ label, link }: { label: string; link?: string }) {
  if (!link) return <>{label}</>;
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="underline hover:text-blue-purple-500 inline-flex items-center gap-1"
    >
      <span>{label}</span>
      <ExternalLink className="h-4 w-4" aria-hidden="true" />
    </a>
  );
}

function SessionCard({
  content,
  trackKey,
  trackName,
  id,
}: {
  content: SessionContent;
  trackKey: TrackKey;
  trackName: string;
  id?: string;
}) {
  const style = TRACK_STYLE[trackKey];
  return (
    <div
      id={id}
      className="bg-white px-5 pt-10 pb-4 md:py-5 min-h-32 h-full flex flex-col gap-2 items-start justify-start text-black-700 relative"
    >
      <div
        className={cn(
          style.bg,
          style.text,
          "block md:hidden py-1 px-2 absolute top-0 left-0 text-xs font-bold",
        )}
      >
        {trackName}
      </div>
      <TriangleBadge cssVar={style.cssVar} />
      <div className="flex items-center justify-between w-full">
        <SessionTypeLabel sessionType={content.sessionType} />
      </div>
      <div className="flex flex-col gap-5">
        {content.sessions.map((ref) => {
          const master = getSessionMasterBySessionId(ref.id);
          const title = master?.title ?? "";
          const speakerName = master?.speaker.name ?? "";
          return (
            <div key={ref.id} className="flex flex-col gap-1">
              <Link
                href={`/talks/${ref.id}`}
                className="underline hover:text-blue-purple-500"
              >
                <p className="text-[16px]">{title}</p>
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-[14px]">{speakerName}</span>
                <div className="relative h-6 w-6 rounded-full shrink-0 overflow-hidden">
                  <ProfileImage
                    speakerName={speakerName}
                    profileImageUrl={master?.speaker.profileImageUrl}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CellRenderer({
  cell,
  trackNames,
  id,
}: {
  cell: Cell;
  trackNames: Record<string, string>;
  id?: string;
}) {
  const isSingleTrack = cell.tracks.length === 1;
  const headTrack = cell.tracks[0];
  const style = TRACK_STYLE[headTrack];
  const trackName = trackNames[headTrack] ?? headTrack;
  const c = cell.content;

  if (c.type === "closed") {
    return (
      <div className="bg-gray-50 px-5 h-full min-h-16 flex flex-col gap-2 items-center justify-center text-black-700 relative">
        {isSingleTrack && (
          <div
            className={cn(
              style.bg,
              style.text,
              "block md:hidden py-1 px-2 absolute top-0 left-0 text-xs font-bold",
            )}
          >
            {trackName}
          </div>
        )}
        <TriangleBadge cssVar={style.cssVar} />
        クローズ
      </div>
    );
  }

  if (c.type === "labeled") {
    if (c.muted) {
      return (
        <div className="bg-gray-50 px-5 h-full min-h-16 flex items-center justify-center text-black-700">
          <LabelText label={c.label} link={c.link} />
        </div>
      );
    }
    return (
      <div className="bg-white px-5 pt-10 pb-4 md:py-5 min-h-32 h-full flex flex-col gap-2 items-center justify-center text-black-700 relative">
        {isSingleTrack && (
          <div
            className={cn(
              style.bg,
              style.text,
              "block md:hidden py-1 px-2 absolute top-0 left-0 text-xs font-bold",
            )}
          >
            {trackName}
          </div>
        )}
        <TriangleBadge cssVar={style.cssVar} />
        <LabelText label={c.label} link={c.link} />
      </div>
    );
  }

  // SessionContent with displayLabel: render as labeled span (link optional)
  if (c.displayLabel !== undefined) {
    return (
      <div className="bg-white px-5 pt-10 pb-4 md:py-5 min-h-32 h-full flex flex-col gap-2 items-center justify-center text-black-700 relative">
        {isSingleTrack && (
          <div
            className={cn(
              style.bg,
              style.text,
              "block md:hidden py-1 px-2 absolute top-0 left-0 text-xs font-bold",
            )}
          >
            {trackName}
          </div>
        )}
        <TriangleBadge cssVar={style.cssVar} />
        <LabelText label={c.displayLabel} link={c.link} />
      </div>
    );
  }

  return (
    <SessionCard
      content={c}
      trackKey={headTrack}
      trackName={trackName}
      id={id}
    />
  );
}

type TimeSlot = { startTime: number; endTime: number };

function buildTimeSlots(cells: Cell[]): TimeSlot[] {
  const boundaries = new Set<number>();
  for (const c of cells) {
    boundaries.add(c.startTime);
    boundaries.add(c.endTime);
  }
  const sorted = Array.from(boundaries).sort((a, b) => a - b);
  const slots: TimeSlot[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    slots.push({ startTime: sorted[i], endTime: sorted[i + 1] });
  }
  return slots;
}

export function DayTimeTable({ data }: { data: TimetableResponse }) {
  const sessionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const timeSlots = useMemo(() => buildTimeSlots(data.cells), [data.cells]);

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

  const trackNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const t of data.tracks) {
      map[t.id] = t.name;
    }
    return map;
  }, [data.tracks]);

  // Index lookups for grid placement.
  const slotIndexByStart = useMemo(() => {
    const m = new Map<number, number>();
    timeSlots.forEach((s, i) => {
      m.set(s.startTime, i);
    });
    return m;
  }, [timeSlots]);
  const slotIndexByEnd = useMemo(() => {
    const m = new Map<number, number>();
    timeSlots.forEach((s, i) => {
      m.set(s.endTime, i);
    });
    return m;
  }, [timeSlots]);

  // Identify the cell that should carry the tour-add-button id:
  // the session-typed cell (without displayLabel) at the smallest track index
  // among cells starting at the first time slot containing any session.
  const tourAddButtonCellKey = useMemo(() => {
    let firstSessionStart = Infinity;
    for (const c of data.cells) {
      if (c.content.type !== "session" || c.content.displayLabel !== undefined)
        continue;
      if (c.startTime < firstSessionStart) firstSessionStart = c.startTime;
    }
    if (!Number.isFinite(firstSessionStart)) return null;

    let bestTrackIdx = Infinity;
    let bestKey: string | null = null;
    for (const c of data.cells) {
      if (c.startTime !== firstSessionStart) continue;
      if (c.content.type !== "session" || c.content.displayLabel !== undefined)
        continue;
      const trackIdx = TRACK_KEYS.indexOf(c.tracks[0]);
      if (trackIdx < bestTrackIdx) {
        bestTrackIdx = trackIdx;
        bestKey = `${c.startTime}-${c.tracks[0]}`;
      }
    }
    return bestKey;
  }, [data.cells]);

  // Mobile uses single-column flow per timeSlot.
  // Cells starting at this slot.startTime are rendered in track order; cells
  // continuing from earlier slots are skipped (already rendered).
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
          TRACK_KEYS.indexOf(a.tracks[0]) - TRACK_KEYS.indexOf(b.tracks[0]),
      );
    }
    return m;
  }, [data.cells]);

  return (
    <>
      <div className="hidden md:block">
        <div className="grid gap-1 mt-4 md:mt-2 grid-cols-[1fr] md:grid-cols-[auto_minmax(210px,1fr)_minmax(210px,1fr)_minmax(210px,1fr)]">
          <div className="w-[70px] md:w-[99px] lg:w-[125px]" />
          {data.tracks.map((track) => (
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
              className="h-full"
            >
              <TimeLabel timeText={timeText} isActive={active} />
            </div>
          );
        })}
        {data.cells.map((cell) => {
          const rowStart = (slotIndexByStart.get(cell.startTime) ?? 0) + 1;
          const rowEndIdx = slotIndexByEnd.get(cell.endTime);
          const rowEnd = rowEndIdx !== undefined ? rowEndIdx + 2 : rowStart + 1;
          const colStart = TRACK_KEYS.indexOf(cell.tracks[0]) + 2;
          const colEnd =
            TRACK_KEYS.indexOf(cell.tracks[cell.tracks.length - 1]) + 3;
          const cellKey = `${cell.startTime}-${cell.tracks[0]}`;
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
                trackNames={trackNames}
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
                const cellKey = `${cell.startTime}-${cell.tracks[0]}`;
                return (
                  <CellRenderer
                    key={cellKey}
                    cell={cell}
                    trackNames={trackNames}
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
