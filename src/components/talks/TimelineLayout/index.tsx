import type { ReactNode } from "react";
import { EventDateTab } from "@/components/talks/EventDateTab";
import { TimelineAxis } from "@/components/talks/TimelineAxis";
import { EVENT_DATE } from "@/constants/timetable";
import type { EventDate } from "@/types/timetable-api";

export function DesktopTimelineLayout({
  day1Column,
  day2Column,
}: {
  day1Column: ReactNode;
  day2Column: ReactNode;
}) {
  return (
    <section className="rounded-xl bg-white py-4 md:py-6">
      <div className="grid grid-cols-[40px_1fr_1fr] gap-3 mb-3">
        <div />
        <h2 className="text-lg font-bold text-blue-light-600">
          Day1
          <span className="ml-2 text-xs font-normal text-black-500">
            {EVENT_DATE.Day1}
          </span>
        </h2>
        <h2 className="text-lg font-bold text-pink-500">
          Day2
          <span className="ml-2 text-xs font-normal text-black-500">
            {EVENT_DATE.Day2}
          </span>
        </h2>
      </div>
      <div className="grid grid-cols-[40px_1fr_1fr] gap-3">
        <TimelineAxis />
        {day1Column}
        {day2Column}
      </div>
    </section>
  );
}

export function MobileTimelineLayout({
  currentEventDate,
  onTabChange,
  children,
}: {
  currentEventDate: EventDate;
  onTabChange: (date: EventDate) => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl bg-white py-4 md:py-6">
      <EventDateTab currentDate={currentEventDate} onTabChange={onTabChange} />
      <div className="mt-4 grid grid-cols-[40px_1fr] gap-3">
        <TimelineAxis />
        {children}
      </div>
    </section>
  );
}
