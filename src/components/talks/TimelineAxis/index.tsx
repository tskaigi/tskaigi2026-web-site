import { MY_TIMETABLE_CONST, myTimetable } from "@/utils/myTimetable";

export function TimelineAxis() {
  return (
    <div
      className="relative"
      style={{ height: `${MY_TIMETABLE_CONST.TIMELINE_HEIGHT}px` }}
    >
      {MY_TIMETABLE_CONST.TIMELINE_MARKERS.map((minutes) => {
        const top = myTimetable.minutesToTop(minutes);
        const label =
          minutes % 60 === 0 ? myTimetable.formatMinutes(minutes) : null;
        return (
          <div
            key={minutes}
            className="absolute -translate-y-1/2 text-xs text-black-500"
            style={{ top: `${top}px` }}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
}
