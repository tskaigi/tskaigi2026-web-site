"use client";

import { TRACK_STYLE } from "@/constants/timetable";
import type { Track } from "@/types/timetable-api";
import { TrackHashtagActions } from "../TrackHashtagActions";

export function SlotTrackHeader({ track }: { track: Track }) {
  const style = TRACK_STYLE[track.id];

  return (
    <div className={`${style.bg} p-2 text-center`}>
      <span className={`font-bold ${style.text}`}>{track.name}</span>
      <div className="mt-2">
        <TrackHashtagActions track={track} variant="header" />
      </div>
    </div>
  );
}
