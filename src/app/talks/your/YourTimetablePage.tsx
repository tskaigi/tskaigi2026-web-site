"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  DesktopTimelineLayout,
  MobileTimelineLayout,
} from "@/components/talks/TimelineLayout";
import { Button } from "@/components/ui/button";
import { type EventDate, TRACK } from "@/constants/talkList";
import {
  getTalksByDateFromIds,
  MY_TIMETABLE_CONST,
  myTimetable,
  myTimetableQuery,
  type TalkWithMinutes,
} from "@/utils/myTimetable";

function ReadOnlyTimelineColumn({
  eventDate,
  talks,
  participatedIds,
}: {
  eventDate: EventDate;
  talks: TalkWithMinutes[];
  participatedIds: Set<string>;
}) {
  const positionedTalks = myTimetable.getPositionedTalks(talks);

  return (
    <div
      className="relative rounded-lg border border-black-300 bg-blue-purple-100/30"
      style={{ height: `${MY_TIMETABLE_CONST.TIMELINE_HEIGHT}px` }}
    >
      {MY_TIMETABLE_CONST.TIMELINE_MARKERS.map((minutes) => {
        const top = myTimetable.minutesToTop(minutes);
        return (
          <div
            key={`${eventDate}-line-${minutes}`}
            className="absolute left-0 right-0 z-10 border-t border-black-200"
            style={{ top: `${top}px` }}
          />
        );
      })}

      {positionedTalks.map((talk) => {
        const top = myTimetable.minutesToTop(talk.startMinutes);
        const height = myTimetable.minutesToPx(
          talk.endMinutes - talk.startMinutes,
        );

        const left = `calc(${(100 / talk.columnCount) * talk.columnIndex}% + 8px)`;
        const width = `calc(${100 / talk.columnCount}% - 10px)`;
        const isParticipated = participatedIds.has(talk.id);

        return (
          <div
            key={talk.id}
            className={`absolute left-2 right-2 z-20 overflow-hidden rounded-md border border-black-300 bg-white p-2 border-l-4 ${myTimetable.getTrackBorderClass(talk.track)}`}
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
                参加済
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

export default function YourTimetablePage() {
  const searchParams = useSearchParams();
  const [currentEventDate, setCurrentEventDate] = useState<EventDate>("DAY1");

  const { ids, participatedIds } = useMemo(
    () => myTimetableQuery.parse(searchParams),
    [searchParams],
  );

  const talksByDate = useMemo(() => getTalksByDateFromIds(ids), [ids]);

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
          <MobileTimelineLayout
            currentEventDate={currentEventDate}
            onTabChange={setCurrentEventDate}
          >
            <ReadOnlyTimelineColumn
              eventDate={currentEventDate}
              talks={talksByDate[currentEventDate]}
              participatedIds={participatedIdsSet}
            />
          </MobileTimelineLayout>
        </div>

        <div className="hidden lg:block">
          <DesktopTimelineLayout
            day1Column={
              <ReadOnlyTimelineColumn
                eventDate="DAY1"
                talks={talksByDate.DAY1}
                participatedIds={participatedIdsSet}
              />
            }
            day2Column={
              <ReadOnlyTimelineColumn
                eventDate="DAY2"
                talks={talksByDate.DAY2}
                participatedIds={participatedIdsSet}
              />
            }
          />
        </div>
      </div>
    </main>
  );
}
