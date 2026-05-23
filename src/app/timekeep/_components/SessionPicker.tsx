"use client";

import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { TALK_TYPE, TRACK_KEYS } from "@/constants/timetable";
import { cn } from "@/lib/utils";
import type { EventDate, TrackKey } from "@/types/timetable-api";
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

type TrackFilter = TrackKey | "ALL";

const chipClass = (active: boolean) =>
  cn(
    "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
    active
      ? "bg-blue-light-500 text-white"
      : "bg-white text-blue-light-600 border border-blue-light-300",
  );

export function SessionPicker({ sessions, selectedId, onSelect }: Props) {
  const [activeDay, setActiveDay] = useState<EventDate>("Day1");
  const [trackFilter, setTrackFilter] = useState<TrackFilter>("ALL");
  const [collapsedTracks, setCollapsedTracks] = useState<Set<TrackKey>>(
    () => new Set(),
  );

  const daySessions = sessions.filter((s) => s.day === activeDay);

  // その日に存在するトラックを TRACK_KEYS 順で抽出（フィルタ表示用）。
  const dayTracks = useMemo(
    () =>
      TRACK_KEYS.filter((track) =>
        daySessions.some((s) => s.track === track),
      ).map((track) => ({
        key: track,
        name: daySessions.find((s) => s.track === track)?.trackName ?? track,
      })),
    [daySessions],
  );

  const visibleTracks =
    trackFilter === "ALL"
      ? dayTracks
      : dayTracks.filter((t) => t.key === trackFilter);

  const toggleCollapsed = (track: TrackKey) => {
    setCollapsedTracks((prev) => {
      const next = new Set(prev);
      if (next.has(track)) next.delete(track);
      else next.add(track);
      return next;
    });
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex gap-2">
        {DAYS.map((day) => (
          <button
            key={day.value}
            type="button"
            onClick={() => setActiveDay(day.value)}
            className={chipClass(activeDay === day.value)}
          >
            {day.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTrackFilter("ALL")}
          className={chipClass(trackFilter === "ALL")}
        >
          すべて
        </button>
        {dayTracks.map((track) => (
          <button
            key={track.key}
            type="button"
            onClick={() => setTrackFilter(track.key)}
            className={chipClass(trackFilter === track.key)}
          >
            {track.name}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        {visibleTracks.map((track) => {
          const trackSessions = daySessions.filter(
            (s) => s.track === track.key,
          );
          if (trackSessions.length === 0) return null;
          const isCollapsed = collapsedTracks.has(track.key);

          return (
            <div key={track.key} className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => toggleCollapsed(track.key)}
                aria-expanded={!isCollapsed}
                className="flex items-center justify-between gap-2 text-left"
              >
                <h3 className="text-sm font-bold text-blue-light-600">
                  {track.name}
                  <span className="ml-2 text-xs font-normal text-black-400">
                    {trackSessions.length}件
                  </span>
                </h3>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-blue-light-600 transition-transform",
                    isCollapsed && "-rotate-90",
                  )}
                />
              </button>
              {!isCollapsed && (
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
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
