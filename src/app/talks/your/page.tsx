"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { EventDateTab } from "@/components/talks/EventDateTab";
import { Button } from "@/components/ui/button";
import {
  EVENT_DATE,
  type EventDate,
  type Talk,
  TRACK,
  talkList,
} from "@/constants/talkList";
import {
  normalizeIds,
  parseMyTimetableQuery,
  parseTalkTimeToMinutes,
  type TalkWithMinutes,
} from "@/utils/myTimetable";

const PIXELS_PER_MINUTE = 1.6;
const TIMELINE_START_MINUTES = 10 * 60;
const TIMELINE_END_MINUTES = 18 * 60;

type PositionedTalk = TalkWithMinutes & {
  columnIndex: number;
  columnCount: number;
  isOverlapping: boolean;
};

function formatMinutes(minutes: number): string {
  const hour = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const minute = (minutes % 60).toString().padStart(2, "0");
  return `${hour}:${minute}`;
}

function parseTalkIds(searchParams: URLSearchParams): string[] {
  const tokens = [
    ...searchParams.getAll("id").flatMap((value) => value.split(",")),
    ...searchParams.getAll("ids").flatMap((value) => value.split(",")),
  ];

  return Array.from(
    new Set(
      tokens.map((token) => token.trim()).filter((token) => token.length > 0),
    ),
  );
}

function parseTalkIdsFromQuery(searchParams: URLSearchParams): {
  ids: string[];
  participatedIds: string[];
} {
  const parsed = parseMyTimetableQuery(searchParams);
  if (parsed) return parsed;

  const legacyIds = normalizeIds(parseTalkIds(searchParams));
  return { ids: legacyIds, participatedIds: [] };
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
  const sorted = [...talks].sort((a, b) => {
    if (a.startMinutes !== b.startMinutes)
      return a.startMinutes - b.startMinutes;
    if (a.endMinutes !== b.endMinutes) return a.endMinutes - b.endMinutes;
    return a.id.localeCompare(b.id);
  });

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

    return {
      ...talk,
      columnIndex: columnById.get(talk.id) ?? 0,
      columnCount: maxColumn + 1,
      isOverlapping: overlaps.length > 1,
    };
  });
}

function TimelineAxis({ timelineHeight }: { timelineHeight: number }) {
  const markers = [] as { minutes: number; label: string | null }[];
  for (
    let minutes = TIMELINE_START_MINUTES;
    minutes <= TIMELINE_END_MINUTES;
    minutes += 30
  ) {
    markers.push({
      minutes,
      label: minutes % 60 === 0 ? formatMinutes(minutes) : null,
    });
  }

  return (
    <div className="relative" style={{ height: `${timelineHeight}px` }}>
      {markers.map((marker) => {
        const top =
          (marker.minutes - TIMELINE_START_MINUTES) * PIXELS_PER_MINUTE;
        return (
          <div
            key={marker.minutes}
            className="absolute -translate-y-1/2 text-xs text-black-500"
            style={{ top: `${top}px` }}
          >
            {marker.label}
          </div>
        );
      })}
    </div>
  );
}

function ReadOnlyTimelineColumn({
  eventDate,
  talks,
  participatedIds,
}: {
  eventDate: EventDate;
  talks: TalkWithMinutes[];
  participatedIds: Set<string>;
}) {
  const timelineHeight =
    (TIMELINE_END_MINUTES - TIMELINE_START_MINUTES) * PIXELS_PER_MINUTE;

  const markers = [] as number[];
  for (
    let minutes = TIMELINE_START_MINUTES;
    minutes <= TIMELINE_END_MINUTES;
    minutes += 30
  ) {
    markers.push(minutes);
  }

  const positionedTalks = getPositionedTalks(talks);

  return (
    <div
      className="relative rounded-lg border border-black-300 bg-blue-purple-100/30"
      style={{ height: `${timelineHeight}px` }}
    >
      {markers.map((minutes) => {
        const top = (minutes - TIMELINE_START_MINUTES) * PIXELS_PER_MINUTE;
        return (
          <div
            key={`${eventDate}-line-${minutes}`}
            className="absolute left-0 right-0 z-10 border-t border-black-200"
            style={{ top: `${top}px` }}
          />
        );
      })}

      {positionedTalks.map((talk) => {
        const top =
          (talk.startMinutes - TIMELINE_START_MINUTES) * PIXELS_PER_MINUTE;
        const height =
          (talk.endMinutes - talk.startMinutes) * PIXELS_PER_MINUTE;

        const left = `calc(${(100 / talk.columnCount) * talk.columnIndex}% + 8px)`;
        const width = `calc(${100 / talk.columnCount}% - 10px)`;
        const isParticipated = participatedIds.has(talk.id);

        return (
          <div
            key={talk.id}
            className={`absolute left-2 right-2 z-20 overflow-hidden rounded-md border border-black-300 bg-white p-2 border-l-4 ${getTrackBorderClass(talk.track)}`}
            style={{
              top: `${top}px`,
              height: `${height}px`,
              left,
              width,
              right: "auto",
            }}
          >
            {talk.isOverlapping && (
              <div
                className="absolute inset-0 opacity-25 pointer-events-none"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(-45deg, #ff5a5a 0 6px, transparent 6px 12px)",
                }}
              />
            )}
            {isParticipated && (
              <span className="absolute right-1 bottom-1 z-10 inline-flex items-center gap-0.5 rounded-full bg-green-100 px-1.5 py-0.5 text-[9px] font-bold text-green-700">
                <Check size={10} />
                参加
              </span>
            )}
            <p className="relative z-10 text-[10px] text-black-500 pr-4">
              {talk.time}
            </p>
            <Link
              href={`/talks/${talk.id}`}
              className="relative z-10 hover:underline block pr-4"
            >
              <p className="mt-0.5 text-xs font-bold text-black-700 truncate">
                {talk.title}
              </p>
            </Link>
            <p className="relative z-10 mt-0.5 text-[10px] text-black-500 truncate pr-4">
              {talk.speaker.name} / {TRACK[talk.track].name}
            </p>
          </div>
        );
      })}

      {talks.length === 0 && (
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center text-sm text-black-500">
          トークがありません
        </div>
      )}
    </div>
  );
}

function DesktopTimeline({
  talksByDate,
  participatedIds,
}: {
  talksByDate: Record<EventDate, TalkWithMinutes[]>;
  participatedIds: Set<string>;
}) {
  const timelineHeight =
    (TIMELINE_END_MINUTES - TIMELINE_START_MINUTES) * PIXELS_PER_MINUTE;

  return (
    <section className="rounded-xl bg-white p-4 md:p-6">
      <div className="grid grid-cols-[58px_1fr_1fr] gap-3 mb-3">
        <div />
        <h2 className="text-lg font-bold text-blue-light-600">
          Day1
          <span className="ml-2 text-xs font-normal text-black-500">
            {EVENT_DATE.DAY1}
          </span>
        </h2>
        <h2 className="text-lg font-bold text-pink-500">
          Day2
          <span className="ml-2 text-xs font-normal text-black-500">
            {EVENT_DATE.DAY2}
          </span>
        </h2>
      </div>
      <div className="grid grid-cols-[58px_1fr_1fr] gap-3">
        <TimelineAxis timelineHeight={timelineHeight} />
        <ReadOnlyTimelineColumn
          eventDate="DAY1"
          talks={talksByDate.DAY1}
          participatedIds={participatedIds}
        />
        <ReadOnlyTimelineColumn
          eventDate="DAY2"
          talks={talksByDate.DAY2}
          participatedIds={participatedIds}
        />
      </div>
    </section>
  );
}

function MobileTimeline({
  currentEventDate,
  talksByDate,
  participatedIds,
  onTabChange,
}: {
  currentEventDate: EventDate;
  talksByDate: Record<EventDate, TalkWithMinutes[]>;
  participatedIds: Set<string>;
  onTabChange: (date: EventDate) => void;
}) {
  const timelineHeight =
    (TIMELINE_END_MINUTES - TIMELINE_START_MINUTES) * PIXELS_PER_MINUTE;

  return (
    <section className="rounded-xl bg-white p-4 md:p-6">
      <EventDateTab currentDate={currentEventDate} onTabChange={onTabChange} />
      <h2 className="mt-4 text-lg font-bold text-blue-light-600">
        {currentEventDate === "DAY1" ? "Day1" : "Day2"}
        <span className="ml-2 text-xs font-normal text-black-500">
          {EVENT_DATE[currentEventDate]}
        </span>
      </h2>
      <div className="mt-3 grid grid-cols-[58px_1fr] gap-3">
        <TimelineAxis timelineHeight={timelineHeight} />
        <ReadOnlyTimelineColumn
          eventDate={currentEventDate}
          talks={talksByDate[currentEventDate]}
          participatedIds={participatedIds}
        />
      </div>
    </section>
  );
}

export default function YourTimetablePage() {
  const searchParams = useSearchParams();
  const [currentEventDate, setCurrentEventDate] = useState<EventDate>("DAY1");

  const { ids, participatedIds } = useMemo(
    () => parseTalkIdsFromQuery(searchParams),
    [searchParams],
  );

  const talksWithMinutes = useMemo(
    () =>
      ids
        .map((id) => talkList.find((talk) => talk.id === id))
        .filter((talk): talk is Talk => !!talk)
        .map((talk) => {
          const parsed = parseTalkTimeToMinutes(talk.time);
          if (!parsed) return null;
          return { ...talk, ...parsed };
        })
        .filter((talk): talk is TalkWithMinutes => !!talk)
        .sort((a, b) => {
          if (a.eventDate !== b.eventDate)
            return a.eventDate.localeCompare(b.eventDate);
          if (a.startMinutes !== b.startMinutes)
            return a.startMinutes - b.startMinutes;
          return a.id.localeCompare(b.id);
        }),
    [ids],
  );

  const talksByDate = talksWithMinutes.reduce(
    (acc, talk) => {
      acc[talk.eventDate].push(talk);
      return acc;
    },
    {
      DAY1: [] as TalkWithMinutes[],
      DAY2: [] as TalkWithMinutes[],
    },
  );

  const participatedIdsSet = useMemo(
    () => new Set(participatedIds),
    [participatedIds],
  );

  return (
    <main className="bg-blue-light-100 mt-16 py-10 px-2 md:py-16 md:px-6 lg:px-10">
      <h1 className="text-2xl font-bold text-blue-light-500 text-center md:text-3xl lg:text-4xl">
        タイムテーブル
      </h1>

      <div className="mt-3 text-center flex flex-wrap justify-center gap-2">
        <Button type="button" variant="outline" asChild>
          <Link href="/talks">タイムテーブル一覧へ</Link>
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/talks/me">自分のタイムテーブルへ</Link>
        </Button>
      </div>

      <div className="mt-8 mx-auto max-w-6xl">
        <div className="block lg:hidden">
          <MobileTimeline
            currentEventDate={currentEventDate}
            talksByDate={talksByDate}
            participatedIds={participatedIdsSet}
            onTabChange={setCurrentEventDate}
          />
        </div>

        <div className="hidden lg:block">
          <DesktopTimeline
            talksByDate={talksByDate}
            participatedIds={participatedIdsSet}
          />
        </div>
      </div>
    </main>
  );
}
