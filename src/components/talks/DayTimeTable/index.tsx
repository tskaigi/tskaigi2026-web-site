"use client";

import { Copy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTimetable } from "@/hooks/useTimetable";
import { cn } from "@/lib/utils";
import type {
  IndividualSlot,
  SessionTrack,
  Slot,
  TimetableResponse,
  TrackContent,
  TrackKey,
} from "@/types/timetable-api";

const TRACK_KEYS: TrackKey[] = ["LEVERAGES", "UPSIDER", "RIGHTTOUCH"];

const TRACK_STYLE: Record<
  TrackKey,
  { bg: string; text: string; cssVar: string }
> = {
  LEVERAGES: {
    bg: "bg-track-toggle",
    text: "text-black",
    cssVar: "var(--track-toggle)",
  },
  UPSIDER: {
    bg: "bg-track-ascend",
    text: "text-white",
    cssVar: "var(--track-ascend)",
  },
  RIGHTTOUCH: {
    bg: "bg-track-leverages",
    text: "text-white",
    cssVar: "var(--track-leverages)",
  },
};

function formatTime(timestamp: number): string {
  const d = new Date(timestamp * 1000);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

function formatTimeRange(start: number, end: number): string {
  return `${formatTime(start)} ~ ${formatTime(end)}`;
}

function SlotTrackHeader({
  track,
}: {
  track: TimetableResponse["tracks"][number];
}) {
  const [copySuccess, setCopySuccess] = useState(false);
  const key = track.id as TrackKey;
  const style = TRACK_STYLE[key];

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("クリップボードへのコピーに失敗しました", err);
    }
  };

  return (
    <div className={`${style.bg} p-2 text-center`}>
      <span className={`font-bold ${style.text}`}>{track.name}</span>
      <div className="flex justify-center mt-2">
        <Button
          onClick={() => copyToClipboard(track.hashtag)}
          className="rounded-full bg-white text-black hover:bg-gray-100 px-4 py-1 text-sm font-medium h-auto flex items-center gap-2"
        >
          {copySuccess ? (
            <span>コピーしました！</span>
          ) : (
            <>
              <span>{track.hashtag}</span>
              <Copy className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function TimeSlot({
  timeText,
  isActive = false,
}: {
  timeText: string;
  isActive?: boolean;
}) {
  return (
    <div
      className={`relative flex flex-col gap-2 p-2 items-center justify-center text-center w-full md:w-[99px] lg:w-[125px] ${
        isActive
          ? "bg-orange-200 after:content-[''] after:absolute after:top-0 after:right-0 after:w-[5px] after:h-full after:bg-orange-500 after:opacity-50"
          : "bg-yellow-200"
      }`}
    >
      <p
        className={`text-sm lg:text-base font-bold ${
          isActive ? "text-orange-500" : "text-yellow-700"
        }`}
      >
        {timeText}
      </p>
      {isActive && <p className="text-xs text-orange-500 font-normal">now</p>}
    </div>
  );
}

function GridRow({
  children,
  refHandler,
}: {
  children: React.ReactNode;
  refHandler?: (ref: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={refHandler}
      className="grid gap-1 mt-4 md:mt-2 grid-cols-[1fr] md:grid-cols-[auto_minmax(210px,1fr)_minmax(210px,1fr)_minmax(210px,1fr)]"
    >
      {children}
    </div>
  );
}

function SharedSlotRow({
  timeText,
  label,
  isActive,
  refHandler,
}: {
  timeText: string;
  label: string;
  isActive: boolean;
  refHandler?: (ref: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={refHandler}
      className="grid gap-1 mt-4 md:mt-2 grid-cols-[1fr] md:grid-cols-[auto_1fr]"
    >
      <TimeSlot timeText={timeText} isActive={isActive} />
      <div className="bg-gray-50 p-5 h-16 flex items-center justify-center text-black-700">
        {label}
      </div>
    </div>
  );
}

function TrackCell({
  content,
  trackKey,
  trackName,
}: {
  content: TrackContent;
  trackKey: TrackKey;
  trackName: string;
}) {
  const style = TRACK_STYLE[trackKey];

  if (content.type === "closed") {
    return (
      <div className="bg-gray-200 px-5 pt-10 pb-4 md:py-5 min-h-32 flex flex-col gap-2 items-center justify-center text-black-700 relative">
        <div
          className={cn(
            style.bg,
            style.text,
            "block md:hidden py-1 px-2 absolute top-0 left-0 text-xs font-bold",
          )}
        >
          {trackName}
        </div>
        <TriangleBadge cssVar={style.cssVar} />
        クローズ
      </div>
    );
  }

  if (content.type === "other") {
    return (
      <div className="bg-white px-5 pt-10 pb-4 md:py-5 min-h-32 flex flex-col gap-2 items-center justify-center text-black-700 relative">
        <div
          className={cn(
            style.bg,
            style.text,
            "block md:hidden py-1 px-2 absolute top-0 left-0 text-xs font-bold",
          )}
        >
          {trackName}
        </div>
        <TriangleBadge cssVar={style.cssVar} />
        {content.label}
      </div>
    );
  }

  return (
    <SessionCell content={content} trackKey={trackKey} trackName={trackName} />
  );
}

function TriangleBadge({ cssVar }: { cssVar: string }) {
  return (
    <div
      className="hidden md:block"
      style={{
        width: 0,
        height: 0,
        borderStyle: "solid",
        borderWidth: "0 24px 24px 0",
        borderColor: `transparent ${cssVar} transparent transparent`,
        position: "absolute",
        top: 0,
        right: 0,
      }}
    />
  );
}

function SessionTypeLabel({
  sessionType,
}: {
  sessionType: SessionTrack["sessionType"];
}) {
  const config: Record<
    SessionTrack["sessionType"],
    { label: string; color: string }
  > = {
    KEYNOTE: { label: "基調講演", color: "#0CA90E" },
    LONG: { label: "セッション", color: "#0C7EDC" },
    SHORT: { label: "LT", color: "#c3620f" },
    SPONSOR: { label: "スポンサーLT", color: "#E53D84" },
  };
  const { label, color } = config[sessionType];
  return (
    <span
      className="inline-block rounded px-2 py-0.5 text-xs font-bold text-white"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
}

function SessionCell({
  content,
  trackKey,
  trackName,
}: {
  content: SessionTrack;
  trackKey: TrackKey;
  trackName: string;
}) {
  const style = TRACK_STYLE[trackKey];

  return (
    <div className="bg-white px-5 pt-10 pb-4 md:py-5 min-h-32 flex flex-col gap-2 items-start justify-start text-black-700 relative">
      <div
        className={cn(
          style.bg,
          style.text,
          "block md:hidden py-1 px-2 absolute top-0 left-0 text-xs font-bold",
        )}
      >
        {trackName}
      </div>
      <TriangleBadge cssVar={style.cssVar} />
      <SessionTypeLabel sessionType={content.sessionType} />
      <div className="flex flex-col gap-5">
        {content.sessions.map((session) => (
          <div key={session.id} className="flex flex-col gap-1">
            <Link
              href={`/talks/${session.id}`}
              className="underline hover:text-blue-purple-500"
            >
              <p className="text-16">{session.title}</p>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-14">{session.speaker.name}</span>
              {session.speaker.profileImageUrl && (
                <Image
                  src={session.speaker.profileImageUrl}
                  alt={`${session.speaker.name}のプロフィール画像`}
                  width={24}
                  height={24}
                  className="h-6 w-6 rounded-full aspect-square shrink-0 object-cover"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DayTimeTable({ data }: { data: TimetableResponse }) {
  const sessionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const sessionTimeTable = useMemo(
    () =>
      data.slots.map((slot) => ({
        id: formatTime(slot.startTime),
        start: new Date(slot.startTime * 1000),
        end: new Date(slot.endTime * 1000),
      })),
    [data.slots],
  );

  const { showScrollButton, scrollToCurrentSession, isSessionActive } =
    useTimetable({
      sessionTimeTable,
      sessionElements: sessionRefs.current,
    });

  const trackNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const t of data.tracks) {
      map[t.id] = t.name;
    }
    return map;
  }, [data.tracks]);

  return (
    <>
      <div className="hidden md:block">
        <div className="grid gap-1 mt-4 md:mt-2 grid-cols-[1fr] md:grid-cols-[auto_minmax(210px,1fr)_minmax(210px,1fr)_minmax(210px,1fr)]">
          <div className="w-[70px] md:w-[99px] lg:w-[125px]" />
          {data.tracks.map((track) => (
            <SlotTrackHeader key={track.id} track={track} />
          ))}
        </div>
      </div>

      {data.slots.map((slot) => {
        const timeId = formatTime(slot.startTime);
        const timeText = formatTimeRange(slot.startTime, slot.endTime);
        const active = isSessionActive(timeId);

        if (slot.slotType === "shared") {
          return (
            <SharedSlotRow
              key={timeId}
              timeText={timeText}
              label={slot.label}
              isActive={active}
              refHandler={(el) => {
                sessionRefs.current[timeId] = el;
              }}
            />
          );
        }

        return (
          <IndividualSlotRow
            key={timeId}
            slot={slot}
            timeText={timeText}
            isActive={active}
            trackNames={trackNames}
            refHandler={(el) => {
              sessionRefs.current[timeId] = el;
            }}
          />
        );
      })}

      {showScrollButton && (
        <div
          className={cn(
            "fixed bottom-4 left-1/2 -translate-x-1/2 transition-transform duration-300 z-50",
            "translate-y-0 pointer-events-auto",
          )}
        >
          <Button
            type="button"
            className="font-bold bg-blue-light-500 hover:bg-blue-light-500 rounded-full md:hidden"
            onClick={scrollToCurrentSession}
            tabIndex={0}
          >
            現在のセッションにスクロールする
          </Button>
        </div>
      )}
    </>
  );
}

function IndividualSlotRow({
  slot,
  timeText,
  isActive,
  trackNames,
  refHandler,
}: {
  slot: IndividualSlot;
  timeText: string;
  isActive: boolean;
  trackNames: Record<string, string>;
  refHandler?: (ref: HTMLDivElement | null) => void;
}) {
  return (
    <GridRow refHandler={refHandler}>
      <TimeSlot timeText={timeText} isActive={isActive} />
      {TRACK_KEYS.map((key) => (
        <TrackCell
          key={key}
          content={slot.tracks[key]}
          trackKey={key}
          trackName={trackNames[key] ?? key}
        />
      ))}
    </GridRow>
  );
}
