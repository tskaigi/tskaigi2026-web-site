import { ExternalLink } from "lucide-react";
import type { Cell, Track, TrackKey } from "@/types/timetable-api";
import { CardShell } from "./CardShell";
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

export function CellRenderer({
  cell,
  trackRecord,
  id,
}: {
  cell: Cell;
  trackRecord: Record<TrackKey, Track>;
  id?: string;
}) {
  const tracks = cell.trackKeys.map((k) => trackRecord[k]);
  const c = cell.content;

  if (c.type === "closed") {
    return (
      <CardShell variant="closed" tracks={tracks}>
        クローズ
      </CardShell>
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
      <CardShell variant="card" tracks={tracks}>
        <LabelText label={label ?? ""} link={c.link} />
      </CardShell>
    );
  }

  return <SessionCard content={c} track={tracks[0]} id={id} />;
}
