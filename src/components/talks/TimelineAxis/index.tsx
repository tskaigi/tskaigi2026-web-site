import { MY_TIMETABLE_CONST, myTimetable } from "@/utils/myTimetable";

export function TimelineAxis() {
  const labels = [
    ...new Map(
      MY_TIMETABLE_CONST.TIMELINE_SEGMENTS.filter(
        (seg) => seg.type === "session",
      ).flatMap((seg) => [
        [seg.start, seg.top] as const,
        [seg.end, seg.top + seg.height] as const,
      ]),
    ),
  ];

  return (
    <div
      className="relative"
      style={{ height: `${MY_TIMETABLE_CONST.TIMELINE_HEIGHT}px` }}
    >
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
