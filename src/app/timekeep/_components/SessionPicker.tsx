"use client";

import { useState } from "react";
import { TALK_TYPE, TRACK_KEYS } from "@/constants/timetable";
import { cn } from "@/lib/utils";
import type { EventDate } from "@/types/timetable-api";
import type { TimekeepSession } from "@/utils/getTimekeepSessions";

type Props = {
  sessions: TimekeepSession[];
  selectedId: string | null;
  onSelect: (session: TimekeepSession) => void;
};

const DAYS: { value: EventDate; label: string }[] = [
  { value: "Day1", label: "Day1 (5/22)" },
  { value: "Day2", label: "Day2 (5/23)" },
];

export function SessionPicker({ sessions, selectedId, onSelect }: Props) {
  const [activeDay, setActiveDay] = useState<EventDate>("Day1");

  const daySessions = sessions.filter((s) => s.day === activeDay);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex gap-2">
        {DAYS.map((day) => (
          <button
            key={day.value}
            type="button"
            onClick={() => setActiveDay(day.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              activeDay === day.value
                ? "bg-blue-light-500 text-white"
                : "bg-white text-blue-light-600 border border-blue-light-300",
            )}
          >
            {day.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        {TRACK_KEYS.map((track) => {
          const trackSessions = daySessions.filter((s) => s.track === track);
          if (trackSessions.length === 0) return null;
          const trackName = trackSessions[0].trackName;

          return (
            <div key={track} className="flex flex-col gap-2">
              <h3 className="text-sm font-bold text-blue-light-600">
                {trackName}
              </h3>
              <ul className="flex flex-col gap-2">
                {trackSessions.map((session) => {
                  const isSelected = session.id === selectedId;
                  const typeLabel = TALK_TYPE[session.sessionType].name;
                  return (
                    <li key={`${session.track}-${session.id}`}>
                      <button
                        type="button"
                        onClick={() => onSelect(session)}
                        aria-pressed={isSelected}
                        className={cn(
                          "w-full rounded-xl border bg-white p-3 text-left transition-colors",
                          isSelected
                            ? "border-blue-light-500 ring-2 ring-blue-light-300"
                            : "border-black-300 hover:border-blue-light-400",
                        )}
                      >
                        <div className="flex items-center gap-2 text-xs text-black-400">
                          <span className="tabular-nums">
                            {session.cellTime}
                          </span>
                          <span
                            className="rounded-full px-2 py-0.5 font-medium text-white"
                            style={{
                              backgroundColor:
                                TALK_TYPE[session.sessionType].color,
                            }}
                          >
                            {typeLabel}
                          </span>
                          <span className="ml-auto font-semibold text-blue-light-600">
                            {session.durationMinutes}分
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm font-medium text-black-600">
                          {session.title}
                        </p>
                        {session.speaker && (
                          <p className="mt-0.5 text-xs text-black-400">
                            {session.speaker}
                          </p>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
