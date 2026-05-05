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
  TimeSlot,
  TimetableResponse,
  Track,
  TrackKey,
} from "@/types/timetable-api";
import { myTimetable } from "@/utils/myTimetable";

function SlotTrackHeader({ track }: { track: Track }) {
  const [copySuccess, setCopySuccess] = useState(false);
  const style = TRACK_STYLE[track.id];

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

function BadgedShell({
  variant,
  isSingleTrack,
  trackKey,
  trackName,
  children,
}: {
  variant: "closed" | "card";
  isSingleTrack: boolean;
  trackKey: TrackKey;
  trackName: string;
  children: React.ReactNode;
}) {
  const style = TRACK_STYLE[trackKey];
  const sizeCls =
    variant === "closed"
      ? "bg-gray-50 min-h-16"
      : "bg-white pt-10 pb-4 md:py-5 min-h-32";
  return (
    <div
      className={cn(
        sizeCls,
        "px-5 h-full flex flex-col gap-2 items-center justify-center text-black-700 relative",
      )}
    >
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
      {children}
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
  const trackName = trackNames[headTrack] ?? headTrack;
  const c = cell.content;

  if (c.type === "closed") {
    return (
      <BadgedShell
        variant="closed"
        isSingleTrack={isSingleTrack}
        trackKey={headTrack}
        trackName={trackName}
      >
        クローズ
      </BadgedShell>
    );
  }

  if (c.type === "labeled" && c.muted) {
    return (
      <div className="bg-gray-50 px-5 h-full min-h-16 flex items-center justify-center text-black-700">
        <LabelText label={c.label} link={c.link} />
      </div>
    );
  }

  // labeled (non-muted) と displayLabel 付き session は同じ「白カード」シェル
  if (c.type === "labeled" || c.displayLabel !== undefined) {
    const label = c.type === "labeled" ? c.label : c.displayLabel;
    return (
      <BadgedShell
        variant="card"
        isSingleTrack={isSingleTrack}
        trackKey={headTrack}
        trackName={trackName}
      >
        <LabelText label={label ?? ""} link={c.link} />
      </BadgedShell>
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

const cellKeyOf = (cell: Cell) => `${cell.startTime}-${cell.tracks[0]}`;

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

  const trackNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const t of data.tracks) {
      map[t.id] = t.name;
    }
    return map;
  }, [data.tracks]);

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
          TRACK_KEYS.indexOf(a.tracks[0]) - TRACK_KEYS.indexOf(b.tracks[0]),
      );
    return candidates[0] ? cellKeyOf(candidates[0]) : null;
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
            >
              <TimeLabel timeText={timeText} isActive={active} />
            </div>
          );
        })}
        {data.cells.map((cell) => {
          const rowStart = (boundaryIndex.get(cell.startTime) ?? 0) + 1;
          const rowEnd = (boundaryIndex.get(cell.endTime) ?? 0) + 1;
          const colStart = TRACK_KEYS.indexOf(cell.tracks[0]) + 2;
          const colEnd =
            TRACK_KEYS.indexOf(cell.tracks[cell.tracks.length - 1]) + 3;
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
                const cellKey = cellKeyOf(cell);
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
