import type { EventDate } from "@/types/timetable-api";
import { MY_TIMETABLE_CONST, myTimetable } from "@/utils/myTimetable";

export function TimelineAxis({ eventDate }: { eventDate: EventDate }) {
  const { segments, height } = MY_TIMETABLE_CONST.TIMELINE_BY_DAY[eventDate];
  const labels = [
    ...new Map(
      segments
        .filter((seg) => seg.type === "session")
        .flatMap((seg) => [
          [seg.start, seg.top] as const,
          [seg.end, seg.top + seg.height] as const,
        ]),
    ),
  ];

  return (
    <div className="relative" style={{ height: `${height}px` }}>
      {labels.map(([minutes, top]) => (
        <div
          key={minutes}
          className="absolute -translate-y-1/2 text-xs text-black-500 leading-none"
          style={{ top: `${top}px` }}
        >
          {myTimetable.formatMinutes(minutes)}
        </div>
      ))}
    </div>
  );
}
