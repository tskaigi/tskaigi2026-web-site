import type { RefObject } from "react";
import { FlightBoardTimetable } from "@/components/talks/FlightBoardTimetable";
import type { TalkWithMinutes } from "@/utils/myTimetable";

export function FlightBoardPanel({
  day1Talks,
  day2Talks,
  timetableClassName = "mt-0 shadow-none",
  timetableRef,
}: {
  day1Talks: TalkWithMinutes[];
  day2Talks: TalkWithMinutes[];
  timetableClassName?: string;
  timetableRef?: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={timetableRef}>
      <FlightBoardTimetable
        day1Talks={day1Talks}
        day2Talks={day2Talks}
        className={timetableClassName}
      />
    </div>
  );
}
