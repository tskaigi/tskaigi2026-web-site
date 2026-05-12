"use client";

import { Check, X } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { TRACK, TRACK_KEYS, TRACK_STYLE } from "@/constants/timetable";
import type { EventDate } from "@/types/timetable-api";
import {
  MY_TIMETABLE_CONST,
  myTimetable,
  type TalkWithMinutes,
} from "@/utils/myTimetable";

export function TimelineColumn({
  id,
  eventDate,
  talks,
  participatedIds,
  onClickTimeSlot,
  onRemoveTalk,
  onTalkClick,
}: {
  id?: string;
  eventDate: EventDate;
  talks: TalkWithMinutes[];
  participatedIds: string[];
  onClickTimeSlot?: (eventDate: EventDate, minutes: number) => void;
  onRemoveTalk?: (id: string) => void;
  onTalkClick?: (talk: TalkWithMinutes) => void;
}) {
  const editable = !!onClickTimeSlot && !!onRemoveTalk;
  const participatedIdsSet = useMemo(
    () => new Set(participatedIds),
    [participatedIds],
  );
  const positionedTalks = myTimetable.getPositionedTalks(talks);

  const groupedTalks = useMemo(() => {
    const trackGroups = new Map<string, (typeof positionedTalks)[number][]>();
    for (const talk of positionedTalks) {
      const key = `${talk.startMinutes}-${talk.endMinutes}-${talk.track}`;
      const group = trackGroups.get(key);
      if (group) {
        group.push(talk);
      } else {
        trackGroups.set(key, [talk]);
      }
    }

    const merged = [...trackGroups.values()].map((group) => ({
      talks: group,
      track: group[0].track,
      startMinutes: group[0].startMinutes,
      endMinutes: group[0].endMinutes,
    }));

    const parent = merged.map((_, i) => i);
    const find = (x: number): number => {
      if (parent[x] !== x) parent[x] = find(parent[x]);
      return parent[x];
    };
    const union = (a: number, b: number) => {
      parent[find(a)] = find(b);
    };

    for (let i = 0; i < merged.length; i++) {
      for (let j = i + 1; j < merged.length; j++) {
        if (
          merged[i].startMinutes < merged[j].endMinutes &&
          merged[j].startMinutes < merged[i].endMinutes
        ) {
          union(i, j);
        }
      }
    }

    const clusterTracks = new Map<number, Set<string>>();
    for (let i = 0; i < merged.length; i++) {
      const root = find(i);
      let set = clusterTracks.get(root);
      if (!set) {
        set = new Set();
        clusterTracks.set(root, set);
      }
      set.add(merged[i].track);
    }

    return merged.map((g, i) => {
      const trackSet = clusterTracks.get(find(i)) ?? new Set();
      const tracks = TRACK_KEYS.filter((k) => trackSet.has(k));
      return {
        talks: g.talks,
        columnIndex: tracks.indexOf(g.track),
        columnCount: tracks.length,
      };
    });
  }, [positionedTalks]);

  const { segments: timelineSegments, height: timelineHeight } =
    MY_TIMETABLE_CONST.TIMELINE_BY_DAY[eventDate];

  return (
    <div
      id={id}
      className="relative rounded-lg border border-black-300 bg-blue-purple-100/30"
      style={{ height: `${timelineHeight}px` }}
    >
      {/* 休憩帯の背景 */}
      {timelineSegments
        .filter((seg) => seg.type === "break")
        .map((seg) => {
          const isFirst = seg.top === 0;
          const isLast = seg.top + seg.height === timelineHeight;
          return (
            <div
              key={`${eventDate}-break-${seg.start}`}
              className={`absolute left-0 right-0 z-0 bg-black-100/50${isFirst ? " rounded-t-lg" : ""}${isLast ? " rounded-b-lg" : ""}`}
              style={{ top: `${seg.top}px`, height: `${seg.height}px` }}
            />
          );
        })}

      {/* セッション枠のクリック領域 */}
      {editable &&
        timelineSegments
          .filter(
            (seg) =>
              seg.type === "session" &&
              myTimetable.hasSessionInSlot(eventDate, seg.start, seg.end),
          )
          .map((seg) => (
            <button
              type="button"
              key={`${eventDate}-${seg.start}`}
              className="absolute left-0 right-0 z-0 cursor-pointer hover:bg-blue-purple-200/40"
              style={{ top: `${seg.top}px`, height: `${seg.height}px` }}
              onClick={() => onClickTimeSlot(eventDate, seg.start)}
              aria-label={`${eventDate} ${myTimetable.formatMinutes(seg.start)} の時間帯で追加`}
            />
          ))}

      {/* セッション時間枠だが、この日には選択できるトークがない領域 */}
      {editable &&
        MY_TIMETABLE_CONST.TIMELINE_SEGMENTS.filter(
          (seg) =>
            seg.type === "session" &&
            !myTimetable.hasSessionInSlot(eventDate, seg.start, seg.end),
        ).map((seg) => {
          const label =
            eventDate === "Day2" && seg.start >= 1040
              ? "OST / 懇親会"
              : "セッションなし";
          return (
            <div
              key={`${eventDate}-empty-session-${seg.start}`}
              aria-hidden="true"
              className="absolute left-0 right-0 z-0 flex items-center justify-center overflow-hidden bg-black-100/65 text-xs font-bold text-black-500"
              style={{ top: `${seg.top}px`, height: `${seg.height}px` }}
            >
              <div
                className="absolute inset-0 opacity-70"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(-45deg, rgba(91, 100, 124, 0.16) 0 8px, transparent 8px 16px)",
                }}
              />
              <span className="relative z-10 rounded-full border border-black-300 bg-white/85 px-3 py-1 shadow-sm">
                {label}
              </span>
            </div>
          );
        })}

      {/* セグメント境界線（各セグメントの上端＋下端、重複排除、最上端・最下端は除外） */}
      {[
        ...new Set(
          timelineSegments.flatMap((seg) => [seg.top, seg.top + seg.height]),
        ),
      ]
        .filter((y) => y > 0 && y < timelineHeight)
        .map((y) => (
          <div
            key={`${eventDate}-line-${y}`}
            className="absolute left-0 right-0 z-10 border-t border-black-200"
            style={{ top: `${y}px` }}
          />
        ))}

      {groupedTalks.map(({ talks: group, columnIndex, columnCount }) => {
        const first = group[0];
        const top = myTimetable.minutesToTop(eventDate, first.startMinutes);
        const height = myTimetable.minutesToHeight(
          eventDate,
          first.startMinutes,
          first.endMinutes,
        );

        const left = `calc(${(100 / columnCount) * columnIndex}% + 8px)`;
        const width = `calc(${100 / columnCount}% - 10px)`;

        return (
          <div
            key={group.map((t) => t.id).join("-")}
            data-tour-session-id={first.id}
            className={`absolute left-2 right-2 z-20 overflow-hidden rounded-md border border-black-300 bg-white border-l-4 ${TRACK_STYLE[first.track].border} ${editable ? "py-1 px-2 pr-5" : "p-2"}`}
            title={group
              .map(
                (t) =>
                  `${t.time} / ${TRACK[t.track].name}\n${t.title}\n${t.speaker.name}`,
              )
              .join("\n\n")}
            style={{
              top: `${top}px`,
              height: `${height}px`,
              left,
              width,
              right: "auto",
            }}
          >
            {first.isOverlapping && (
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
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
                onClick={() => {
                  for (const t of group) onRemoveTalk(t.id);
                }}
                aria-label="削除"
              >
                <X size={14} />
              </button>
            )}
            <p
              className={`relative z-10 text-[10px] text-black-500 ${editable ? "truncate whitespace-nowrap" : "pr-4"}`}
            >
              {editable
                ? `${first.time} / ${TRACK[first.track].name}`
                : first.time}
            </p>
            <div className="relative z-10 flex flex-col gap-0.5">
              {group.map((talk) => {
                const participated = participatedIdsSet.has(talk.id);
                const clamp =
                  group.length > 1 ? "line-clamp-1" : "line-clamp-3";
                return onTalkClick ? (
                  <button
                    key={talk.id}
                    type="button"
                    className={`cursor-pointer hover:underline block text-left w-full ${editable ? "" : "pr-4"}`}
                    onClick={() => onTalkClick(talk)}
                  >
                    <p className={`text-xs font-bold text-black-700 ${clamp}`}>
                      {participated && (
                        <Check
                          size={12}
                          className="inline-block text-green-600 mr-0.5 align-[-2px]"
                        />
                      )}
                      {talk.title}
                    </p>
                  </button>
                ) : (
                  <Link
                    key={talk.id}
                    href={`/talks/${talk.id}`}
                    className={`hover:underline block ${editable ? "" : "pr-4"}`}
                  >
                    <p className={`text-xs font-bold text-black-700 ${clamp}`}>
                      {participated && (
                        <Check
                          size={12}
                          className="inline-block text-green-600 mr-0.5 align-[-2px]"
                        />
                      )}
                      {talk.title}
                    </p>
                  </Link>
                );
              })}
            </div>
            <p
              className={`relative z-10 mt-0.5 text-[10px] text-black-500 truncate ${editable ? "" : "pr-4"}`}
            >
              {editable
                ? group.map((t) => t.speaker.name).join(" / ")
                : `${group.map((t) => t.speaker.name).join(" / ")} / ${TRACK[first.track].name}`}
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
