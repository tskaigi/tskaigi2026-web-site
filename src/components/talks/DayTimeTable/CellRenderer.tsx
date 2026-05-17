"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { AddToMyTimetableButton } from "@/components/talks/AddToMyTimetableButton";
import { useDevelopMode } from "@/hooks/useDevelopMode";
import type { Cell, Track, TrackKey } from "@/types/timetable-api";
import { CardShell } from "./CardShell";
import { SessionCard } from "./SessionCard";

function LabelText({ label, link }: { label: string; link?: string }) {
  if (!link) return <>{label}</>;
  if (link.startsWith("/")) {
    return (
      <Link href={link} className="underline hover:text-blue-purple-500">
        {label}
      </Link>
    );
  }
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

function DisplayLabelSessionCard({
  label,
  link,
  talkId,
  talkIds,
  tracks,
}: {
  label: string;
  link?: string;
  talkId: string;
  talkIds: string[];
  tracks: Track[];
}) {
  const isDevelop = useDevelopMode();
  return (
    <CardShell variant="card" tracks={tracks} withTriangle>
      {isDevelop && (
        <div className="absolute top-2 right-2 md:top-3 md:right-3">
          <AddToMyTimetableButton
            talkId={talkId}
            talkIds={talkIds}
            withCheckbox
          />
        </div>
      )}
      <LabelText label={label} link={link} />
    </CardShell>
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

  // labeled (non-muted) は白カードシェル
  if (c.type === "labeled") {
    return (
      <CardShell variant="card" tracks={tracks}>
        <LabelText label={c.label} link={c.link} />
      </CardShell>
    );
  }

  // displayLabel 付き session (ハンズオン・OST) はラベル+参加予定チェック
  if (c.displayLabel !== undefined) {
    return (
      <DisplayLabelSessionCard
        label={c.displayLabel}
        link={c.link}
        talkId={c.sessions[0].id}
        talkIds={c.sessions.map((s) => s.id)}
        tracks={tracks}
      />
    );
  }

  return <SessionCard content={c} track={tracks[0]} id={id} />;
}
