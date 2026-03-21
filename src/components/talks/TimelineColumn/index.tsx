"use client";

import { Check, X } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import type { EventDate } from "@/constants/talkList";
import { TRACK } from "@/constants/talkList";
import {
  MY_TIMETABLE_CONST,
  myTimetable,
  type TalkWithMinutes,
} from "@/utils/myTimetable";

export function TimelineColumn({
  eventDate,
  talks,
  participatedIds,
  onClickTimeSlot,
  onRemoveTalk,
}: {
  eventDate: EventDate;
  talks: TalkWithMinutes[];
  participatedIds: string[];
  onClickTimeSlot?: (eventDate: EventDate, minutes: number) => void;
  onRemoveTalk?: (id: string) => void;
}) {
  const editable = !!onClickTimeSlot && !!onRemoveTalk;
  const participatedIdsSet = useMemo(
    () => new Set(participatedIds),
    [participatedIds],
  );
  const positionedTalks = myTimetable.getPositionedTalks(talks);

  return (
    <div
      className="relative rounded-lg border border-black-300 bg-blue-purple-100/30"
      style={{ height: `${MY_TIMETABLE_CONST.TIMELINE_HEIGHT}px` }}
    >
      {editable &&
        MY_TIMETABLE_CONST.TIMELINE_MARKERS.slice(0, -1).map((start) => {
          const top = myTimetable.minutesToTop(start);
          const height = myTimetable.minutesToPx(30);
          return (
            <button
              type="button"
              key={`${eventDate}-${start}`}
              className="absolute left-0 right-0 z-0 hover:bg-blue-purple-200/40"
              style={{ top: `${top}px`, height: `${height}px` }}
              onClick={() => onClickTimeSlot(eventDate, start)}
              aria-label={`${eventDate} ${myTimetable.formatMinutes(start)} の時間帯で追加`}
            />
          );
        })}

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
        const isParticipated = participatedIdsSet.has(talk.id);

        return (
          <div
            key={talk.id}
            className={`absolute left-2 right-2 z-20 overflow-hidden rounded-md border border-black-300 bg-white border-l-4 ${myTimetable.getTrackBorderClass(talk.track)} ${editable ? "py-1 px-2 pr-5" : "p-2"}`}
            title={`${talk.time} / ${TRACK[talk.track].name}\n${talk.title}\n${talk.speaker.name}`}
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
            {editable && (
              <button
                type="button"
                className="absolute right-1 top-1 z-10 cursor-pointer text-black-500 hover:text-black-700"
                onClick={() => onRemoveTalk(talk.id)}
                aria-label="削除"
              >
                <X size={14} />
              </button>
            )}
            {isParticipated && (
              <span className="absolute right-1 bottom-1 z-10 inline-flex items-center gap-0.5 rounded-full bg-green-100 px-1.5 py-0.5 text-[9px] font-bold text-green-700">
                <Check size={10} />
                参加済
              </span>
            )}
            <p
              className={`relative z-10 text-[10px] text-black-500 ${editable ? "truncate whitespace-nowrap" : "pr-4"}`}
            >
              {editable
                ? `${talk.time} / ${TRACK[talk.track].name}`
                : talk.time}
            </p>
            <Link
              href={`/talks/${talk.id}`}
              className={`relative z-10 hover:underline block ${editable ? "" : "pr-4"}`}
            >
              <p className="mt-0.5 text-xs font-bold text-black-700 truncate">
                {talk.title}
              </p>
            </Link>
            <p
              className={`relative z-10 mt-0.5 text-[10px] text-black-500 truncate ${editable ? "" : "pr-4"}`}
            >
              {editable
                ? talk.speaker.name
                : `${talk.speaker.name} / ${TRACK[talk.track].name}`}
            </p>
          </div>
        );
      })}

      {talks.length === 0 && (
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center text-sm text-black-500">
          {editable ? "未選択です" : "トークがありません"}
        </div>
      )}
    </div>
  );
}
