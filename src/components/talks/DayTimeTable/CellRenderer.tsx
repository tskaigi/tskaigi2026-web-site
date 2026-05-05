import { ExternalLink } from "lucide-react";
import { TRACK_STYLE } from "@/constants/timetable";
import { cn } from "@/lib/utils";
import type { Cell, TrackKey } from "@/types/timetable-api";
import { SessionCard } from "./SessionCard";

function LabelText({ label, link }: { label: string; link?: string }) {
  if (!link) return <>{label}</>;
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="underline hover:text-blue-purple-500 inline-flex items-center gap-1"
    >
      <span>{label}</span>
      <ExternalLink className="h-4 w-4" aria-hidden="true" />
    </a>
  );
}

function BadgedShell({
  variant,
  isSingleTrack,
  trackKey,
  trackName,
  children,
}: {
  variant: "closed" | "card";
  isSingleTrack: boolean;
  trackKey: TrackKey;
  trackName: string;
  children: React.ReactNode;
}) {
  const style = TRACK_STYLE[trackKey];
  const sizeCls =
    variant === "closed"
      ? "bg-gray-50 min-h-16"
      : "bg-white pt-10 pb-4 md:py-5 min-h-32";
  return (
    <div
      className={cn(
        sizeCls,
        "px-5 h-full flex flex-col gap-2 items-center justify-center text-black-700 relative",
      )}
    >
      {isSingleTrack && (
        <div
          className={cn(
            style.bg,
            style.text,
            "block md:hidden py-1 px-2 absolute top-0 left-0 text-xs font-bold",
          )}
        >
          {trackName}
        </div>
      )}
      {children}
    </div>
  );
}

export function CellRenderer({
  cell,
  trackNames,
  id,
}: {
  cell: Cell;
  trackNames: Record<string, string>;
  id?: string;
}) {
  const isSingleTrack = cell.tracks.length === 1;
  const headTrack = cell.tracks[0];
  const trackName = trackNames[headTrack] ?? headTrack;
  const c = cell.content;

  if (c.type === "closed") {
    return (
      <BadgedShell
        variant="closed"
        isSingleTrack={isSingleTrack}
        trackKey={headTrack}
        trackName={trackName}
      >
        クローズ
      </BadgedShell>
    );
  }

  if (c.type === "labeled" && c.muted) {
    return (
      <div className="bg-gray-50 px-5 h-full min-h-16 flex items-center justify-center text-black-700">
        <LabelText label={c.label} link={c.link} />
      </div>
    );
  }

  // labeled (non-muted) と displayLabel 付き session は同じ「白カード」シェル
  if (c.type === "labeled" || c.displayLabel !== undefined) {
    const label = c.type === "labeled" ? c.label : c.displayLabel;
    return (
      <BadgedShell
        variant="card"
        isSingleTrack={isSingleTrack}
        trackKey={headTrack}
        trackName={trackName}
      >
        <LabelText label={label ?? ""} link={c.link} />
      </BadgedShell>
    );
  }

  return (
    <SessionCard
      content={c}
      trackKey={headTrack}
      trackName={trackName}
      id={id}
    />
  );
}
