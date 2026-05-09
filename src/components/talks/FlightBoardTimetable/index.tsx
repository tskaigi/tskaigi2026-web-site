"use client";

import { Plane } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EVENT_DATE, TRACK } from "@/constants/timetable";
import type { EventDate } from "@/types/timetable-api";
import type { TalkWithMinutes } from "@/utils/myTimetable";

type FlightStatus = "SCHEDULED" | "BOARDING" | "ARRIVED";

function compareTalks(a: TalkWithMinutes, b: TalkWithMinutes) {
  if (a.startMinutes !== b.startMinutes) return a.startMinutes - b.startMinutes;
  if (a.endMinutes !== b.endMinutes) return a.endMinutes - b.endMinutes;
  return a.id.localeCompare(b.id);
}

function minutesToClock(minutes: number) {
  const hour = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const minute = (minutes % 60).toString().padStart(2, "0");
  return `${hour}:${minute}:00`;
}

function getSessionDateTime(eventDate: EventDate, minutes: number) {
  return new Date(`${EVENT_DATE[eventDate]}T${minutesToClock(minutes)}+09:00`);
}

function getFlightStatus(
  talk: TalkWithMinutes,
  now: Date | null,
): FlightStatus {
  if (!now) return "SCHEDULED";

  const start = getSessionDateTime(talk.eventDate, talk.startMinutes);
  const end = getSessionDateTime(talk.eventDate, talk.endMinutes);

  if (now < start) return "SCHEDULED";
  if (now < end) return "BOARDING";
  return "ARRIVED";
}

function useCurrentMinute() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return now;
}

function FlightBoardRow({
  talk,
  status,
}: {
  talk: TalkWithMinutes;
  status: FlightStatus;
}) {
  const trackName = TRACK[talk.track].name.replace("トラック", "");
  const statusClass =
    status === "BOARDING"
      ? "font-bold text-yellow-300"
      : status === "ARRIVED"
        ? "font-normal text-green-300"
        : "font-normal text-cyan-200/75";

  return (
    <Link
      href={`/talks/${talk.id}`}
      target="_blank"
      rel="noreferrer"
      className="group block border-b border-white/10 px-3 py-3 font-mono text-yellow-50 transition-colors hover:bg-white/10 sm:px-4 lg:grid lg:grid-cols-[110px_120px_minmax(340px,1fr)_120px_92px] lg:gap-3"
    >
      <div className="flex items-start justify-between gap-3 lg:contents">
        <span className="text-xs font-bold text-white sm:text-sm lg:order-1">
          {talk.time.replace(" 〜 ", "-")}
        </span>
        <span
          className={`${statusClass} shrink-0 text-xs lg:order-5 lg:text-sm`}
        >
          {status}
        </span>
      </div>

      <div className="mt-2 text-xs text-yellow-300 lg:order-2 lg:mt-0 lg:text-sm">
        {trackName}
      </div>

      <span
        className="mt-2 block text-sm font-bold leading-relaxed group-hover:underline sm:text-base lg:order-3 lg:mt-0 lg:truncate lg:leading-normal"
        title={talk.title}
      >
        {talk.title}
      </span>

      <span className="mt-1 block truncate text-xs text-white/75 lg:order-4 lg:mt-0 lg:text-sm">
        {talk.speaker.name}
      </span>
    </Link>
  );
}

function FlightBoardDay({
  eventDate,
  talks,
  now,
}: {
  eventDate: EventDate;
  talks: TalkWithMinutes[];
  now: Date | null;
}) {
  const sortedTalks = [...talks].sort(compareTalks);

  return (
    <section className="border-t border-yellow-300/25 first:border-t-0">
      <div className="flex items-center justify-between gap-3 bg-yellow-300 px-3 py-2 text-black-700 sm:px-4">
        <h3 className="font-mono text-sm font-black tracking-normal sm:text-base">
          {eventDate} SESSIONS
        </h3>
        <span className="font-mono text-[11px] font-bold tracking-normal">
          HND / TSK
        </span>
      </div>

      <div>
        <div>
          <div className="hidden grid-cols-[110px_120px_minmax(340px,1fr)_120px_92px] gap-3 border-b border-white/10 px-3 py-2 font-mono text-[10px] font-bold text-cyan-200 sm:px-4 lg:grid">
            <span>TIME</span>
            <span>TRACK</span>
            <span>TITLE</span>
            <span>SPEAKER</span>
            <span>STATUS</span>
          </div>

          {sortedTalks.length > 0 ? (
            sortedTalks.map((talk) => {
              const status = getFlightStatus(talk, now);

              return (
                <FlightBoardRow key={talk.id} talk={talk} status={status} />
              );
            })
          ) : (
            <div className="px-3 py-6 text-center font-mono text-sm text-white/50 sm:px-4">
              NO SELECTED FLIGHTS
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function FlightBoardTimetable({
  day1Talks,
  day2Talks,
  className = "mt-6",
}: {
  day1Talks: TalkWithMinutes[];
  day2Talks: TalkWithMinutes[];
  className?: string;
}) {
  const now = useCurrentMinute();

  return (
    <section
      className={`${className} overflow-hidden rounded-lg border border-black-700 bg-black-700 shadow-[0_18px_40px_rgba(10,10,11,0.22)]`}
    >
      <div className="border-b border-yellow-300/25 bg-black-600 px-4 py-4 text-white">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-yellow-300">
            <Plane size={16} />
            TSKaigi 2026
          </div>
          <h2 className="mt-1 font-mono text-lg font-black tracking-normal sm:text-2xl">
            MY TIMETABLE
          </h2>
        </div>
      </div>

      <FlightBoardDay eventDate="Day1" talks={day1Talks} now={now} />
      <FlightBoardDay eventDate="Day2" talks={day2Talks} now={now} />
    </section>
  );
}
