"use client";

// TODO: トーク詳細画面が用意でき次第有効化
// import Link from "next/link";
import { Copy } from "lucide-react";
import React, { useMemo, useRef, useState } from "react";
// import { AddToMyTimetableButton } from "@/components/talks/AddToMyTimetableButton";
// TODO: プロフィールアイコンが用意でき次第有効化
// import { ProfileImage } from "@/components/talks/FallbackImage";
import { Button } from "@/components/ui/button";
import { TALK_TYPE, TRACK_KEYS, TRACK_STYLE } from "@/constants/timetable";
import { useTimetable } from "@/hooks/useTimetable";
import { cn } from "@/lib/utils";
import type {
  IndividualSlot,
  SessionTrack,
  Slot,
  SpanGroup,
  TimetableResponse,
  TrackContent,
  TrackKey,
} from "@/types/timetable-api";
import { myTimetable } from "@/utils/myTimetable";

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
      className={`relative flex flex-col gap-2 p-2 items-center justify-center text-center w-full h-full md:w-[99px] lg:w-[125px] ${
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
  id,
}: {
  content: TrackContent;
  trackKey: TrackKey;
  trackName: string;
  id?: string;
}) {
  const style = TRACK_STYLE[trackKey];

  if (content.type === "override") {
    return (
      <div className="bg-gray-50 px-5 h-16 flex items-center justify-center text-black-700" />
    );
  }

  if (content.type === "closed") {
    return (
      <div className="bg-gray-50 px-5 h-full min-h-16 flex flex-col gap-2 items-center justify-center text-black-700 relative">
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
    if (content.compact) {
      return (
        <div className="bg-gray-50 px-5 h-16 flex items-center justify-center text-black-700">
          {content.label}
        </div>
      );
    }
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
    <SessionCell
      content={content}
      trackKey={trackKey}
      trackName={trackName}
      id={id}
    />
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
  const { name, color } = TALK_TYPE[sessionType];
  return (
    <span
      className="inline-block rounded px-2 py-0.5 text-xs font-bold text-white"
      style={{ backgroundColor: color }}
    >
      {name}
    </span>
  );
}

function SessionCell({
  content,
  trackKey,
  trackName,
  id,
}: {
  content: SessionTrack;
  trackKey: TrackKey;
  trackName: string;
  id?: string;
}) {
  const style = TRACK_STYLE[trackKey];

  return (
    <div
      id={id}
      className="bg-white px-5 pt-10 pb-4 md:py-5 min-h-32 flex flex-col gap-2 items-start justify-start text-black-700 relative"
    >
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
      {/* <div className="flex items-center justify-between w-full">
        <SessionTypeLabel sessionType={content.sessionType} />
        <AddToMyTimetableButton
          talkId={content.sessions[0].id}
          talkIds={content.sessions.map((s) => s.id)}
          withCheckbox
        />
      </div> */}
      <div className="flex flex-col gap-5">
        {content.sessions.map((session) => (
          <div key={session.id} className="flex flex-col gap-1">
            {/* TODO: トーク詳細画面が用意でき次第有効化
            <Link
              href={`/talks/${session.id}`}
              className="underline hover:text-blue-purple-500"
            >
              <p className="text-16">{session.title}</p>
            </Link>
            */}
            <p className="text-16">{session.title}</p>
            <div className="flex items-center gap-2">
              <span className="text-14">{session.speaker.name}</span>
              {/* TODO: プロフィールアイコンが用意でき次第有効化
              <div className="relative h-6 w-6 rounded-full shrink-0 overflow-hidden">
                <ProfileImage
                  speakerName={session.speaker.name}
                  profileImageUrl={session.speaker.profileImageUrl}
                />
              </div>
              */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type ResolvedSpanGroup = {
  tracks: TrackKey[];
  label: string;
  slotIndexStart: number;
  slotIndexEnd: number;
};

function resolveSpanGroups(
  slots: Slot[],
  spanGroups: SpanGroup[] | undefined,
): ResolvedSpanGroup[] {
  if (!spanGroups) return [];

  const resolved: ResolvedSpanGroup[] = [];
  for (const group of spanGroups) {
    const startIdx = slots.findIndex((s) => s.startTime === group.startTime);
    const endIdx = slots.findIndex((s) => s.endTime === group.endTime);
    if (startIdx === -1 || endIdx === -1 || startIdx > endIdx) continue;
    resolved.push({
      tracks: group.tracks,
      label: group.label,
      slotIndexStart: startIdx,
      slotIndexEnd: endIdx,
    });
  }
  return resolved;
}

function buildSpanMap(resolved: ResolvedSpanGroup[]) {
  const hiddenCells = new Set<string>();
  const spanCells = new Map<string, { rowSpan: number; label: string }>();

  for (const group of resolved) {
    const rowSpan = group.slotIndexEnd - group.slotIndexStart + 1;
    for (const track of group.tracks) {
      spanCells.set(`${group.slotIndexStart}-${track}`, {
        rowSpan,
        label: group.label,
      });
      for (let i = group.slotIndexStart + 1; i <= group.slotIndexEnd; i++) {
        hiddenCells.add(`${i}-${track}`);
      }
    }
  }

  return { hiddenCells, spanCells };
}

function SpanGroupSection({
  slots,
  startIndex,
  resolvedSpanGroups,
  hiddenCells,
  spanCells,
  trackNames,
  isSessionActiveFn,
  sessionRefs,
  firstSessionFoundRef,
}: {
  slots: Slot[];
  startIndex: number;
  resolvedSpanGroups: ResolvedSpanGroup[];
  hiddenCells: Set<string>;
  spanCells: Map<string, { rowSpan: number; label: string }>;
  trackNames: Record<string, string>;
  isSessionActiveFn: (id: string) => boolean;
  sessionRefs: React.RefObject<Record<string, HTMLDivElement | null>>;
  firstSessionFoundRef: { current: boolean };
}) {
  const group = resolvedSpanGroups.find((g) => g.slotIndexStart === startIndex);
  if (!group) return null;

  const slotsInGroup = slots.slice(
    group.slotIndexStart,
    group.slotIndexEnd + 1,
  );
  const totalRows = slotsInGroup.length;

  return (
    <>
      {/* モバイル: 通常レイアウト */}
      <div className="md:hidden">
        {slotsInGroup.map((slot) => {
          if (slot.slotType !== "individual") return null;
          const timeId = myTimetable.formatTime(slot.startTime);
          const timeText = myTimetable.formatTimeRange(
            slot.startTime,
            slot.endTime,
          );
          const active = isSessionActiveFn(timeId);

          const hasSession =
            !firstSessionFoundRef.current &&
            TRACK_KEYS.some((k) => slot.tracks[k].type === "session");
          if (hasSession) firstSessionFoundRef.current = true;

          return (
            <IndividualSlotRow
              key={timeId}
              slot={slot}
              timeText={timeText}
              isActive={active}
              trackNames={trackNames}
              isFirstSession={hasSession}
              refHandler={(el) => {
                sessionRefs.current[timeId] = el;
              }}
            />
          );
        })}
      </div>
      {/* デスクトップ: gridでrow-span */}
      <div
        className="hidden md:grid gap-1 mt-2 grid-cols-[auto_minmax(210px,1fr)_minmax(210px,1fr)_minmax(210px,1fr)]"
        style={{ gridTemplateRows: `repeat(${totalRows}, auto)` }}
      >
        {slotsInGroup.map((slot, i) => {
          if (slot.slotType !== "individual") return null;
          const idx = group.slotIndexStart + i;
          const timeId = myTimetable.formatTime(slot.startTime);
          const timeText = myTimetable.formatTimeRange(
            slot.startTime,
            slot.endTime,
          );
          const active = isSessionActiveFn(timeId);

          const hasSession =
            !firstSessionFoundRef.current &&
            TRACK_KEYS.some((k) => slot.tracks[k].type === "session");
          if (hasSession) firstSessionFoundRef.current = true;

          return (
            <React.Fragment key={timeId}>
              <div
                className="h-full"
                ref={(el) => {
                  sessionRefs.current[timeId] = el;
                }}
              >
                <TimeSlot timeText={timeText} isActive={active} />
              </div>
              {TRACK_KEYS.map((key) => {
                const cellKey = `${idx}-${key}`;
                if (hiddenCells.has(cellKey)) return null;

                const span = spanCells.get(cellKey);
                if (span) {
                  // const spanContent = slot.tracks[key];
                  // const spanSessionId =
                  //   spanContent.type === "session"
                  //     ? spanContent.sessions[0]?.id
                  //     : undefined;
                  return (
                    <div
                      key={key}
                      className="bg-white px-5 py-5 min-h-32 flex flex-col gap-2 items-center justify-center text-black-700 relative"
                      style={{
                        gridRow: `span ${span.rowSpan}`,
                      }}
                    >
                      <TriangleBadge cssVar={TRACK_STYLE[key].cssVar} />
                      {span.label}
                      {/* {spanSessionId && (
                        <AddToMyTimetableButton
                          talkId={spanSessionId}
                          withCheckbox
                        />
                      )} */}
                    </div>
                  );
                }

                const content = slot.tracks[key];
                return (
                  <TrackCell
                    key={key}
                    content={content}
                    trackKey={key}
                    trackName={trackNames[key] ?? key}
                  />
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
}

export function DayTimeTable({ data }: { data: TimetableResponse }) {
  const sessionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const sessionTimeTable = useMemo(
    () =>
      data.slots.map((slot) => ({
        id: myTimetable.formatTime(slot.startTime),
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

  const resolvedSpanGroups = useMemo(
    () => resolveSpanGroups(data.slots, data.spanGroups),
    [data.slots, data.spanGroups],
  );

  const { hiddenCells, spanCells } = useMemo(
    () => buildSpanMap(resolvedSpanGroups),
    [resolvedSpanGroups],
  );

  const spanStartIndices = useMemo(() => {
    const set = new Set<number>();
    for (const g of resolvedSpanGroups) {
      set.add(g.slotIndexStart);
    }
    return set;
  }, [resolvedSpanGroups]);

  const spanCoveredIndices = useMemo(() => {
    const set = new Set<number>();
    for (const g of resolvedSpanGroups) {
      for (let i = g.slotIndexStart; i <= g.slotIndexEnd; i++) {
        set.add(i);
      }
    }
    return set;
  }, [resolvedSpanGroups]);

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

      <SlotList
        data={data}
        resolvedSpanGroups={resolvedSpanGroups}
        spanCoveredIndices={spanCoveredIndices}
        spanStartIndices={spanStartIndices}
        hiddenCells={hiddenCells}
        spanCells={spanCells}
        trackNames={trackNames}
        isSessionActive={isSessionActive}
        sessionRefs={sessionRefs}
      />

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

function SlotList({
  data,
  resolvedSpanGroups,
  spanCoveredIndices,
  spanStartIndices,
  hiddenCells,
  spanCells,
  trackNames,
  isSessionActive,
  sessionRefs,
}: {
  data: TimetableResponse;
  resolvedSpanGroups: ResolvedSpanGroup[];
  spanCoveredIndices: Set<number>;
  spanStartIndices: Set<number>;
  hiddenCells: Set<string>;
  spanCells: Map<string, { rowSpan: number; label: string }>;
  trackNames: Record<string, string>;
  isSessionActive: (id: string) => boolean;
  sessionRefs: React.RefObject<Record<string, HTMLDivElement | null>>;
}) {
  const firstSessionFoundRef = useRef(false);

  return (
    <>
      {data.slots.map((slot, slotIndex) => {
        if (
          spanCoveredIndices.has(slotIndex) &&
          !spanStartIndices.has(slotIndex)
        ) {
          return null;
        }

        if (spanStartIndices.has(slotIndex)) {
          const spanTimeId = myTimetable.formatTime(slot.startTime);
          return (
            <SpanGroupSection
              key={`span-${spanTimeId}`}
              slots={data.slots}
              startIndex={slotIndex}
              resolvedSpanGroups={resolvedSpanGroups}
              hiddenCells={hiddenCells}
              spanCells={spanCells}
              trackNames={trackNames}
              isSessionActiveFn={isSessionActive}
              sessionRefs={sessionRefs}
              firstSessionFoundRef={firstSessionFoundRef}
            />
          );
        }

        const timeId = myTimetable.formatTime(slot.startTime);
        const timeText = myTimetable.formatTimeRange(
          slot.startTime,
          slot.endTime,
        );
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

        const hasSession =
          !firstSessionFoundRef.current &&
          TRACK_KEYS.some((k) => slot.tracks[k].type === "session");
        if (hasSession) firstSessionFoundRef.current = true;

        return (
          <IndividualSlotRow
            key={timeId}
            slot={slot}
            timeText={timeText}
            isActive={active}
            trackNames={trackNames}
            isFirstSession={hasSession}
            refHandler={(el) => {
              sessionRefs.current[timeId] = el;
            }}
          />
        );
      })}
    </>
  );
}

function IndividualSlotRow({
  slot,
  timeText,
  isActive,
  trackNames,
  isFirstSession,
  refHandler,
}: {
  slot: IndividualSlot;
  timeText: string;
  isActive: boolean;
  trackNames: Record<string, string>;
  isFirstSession?: boolean;
  refHandler?: (ref: HTMLDivElement | null) => void;
}) {
  let tourIdAssigned = false;
  return (
    <GridRow refHandler={refHandler}>
      <TimeSlot timeText={timeText} isActive={isActive} />
      {TRACK_KEYS.map((key) => {
        const content = slot.tracks[key];
        const shouldAssignTourId =
          isFirstSession && !tourIdAssigned && content.type === "session";
        if (shouldAssignTourId) tourIdAssigned = true;
        return (
          <TrackCell
            key={key}
            content={content}
            trackKey={key}
            trackName={trackNames[key] ?? key}
            id={shouldAssignTourId ? "tour-add-button" : undefined}
          />
        );
      })}
    </GridRow>
  );
}
