"use client";

import { AlertTriangle, Check, Plus, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { EventDateTab } from "@/components/talks/EventDateTab";
import { Button } from "@/components/ui/button";
import {
  EVENT_DATE,
  type EventDate,
  type Talk,
  TRACK,
  talkList,
} from "@/constants/talkList";
import { Input } from "@/ui/input";
import {
  decodeMyTimetableToken,
  encodeMyTimetableToken,
  normalizeIds,
  parseTalkTimeToMinutes,
  readMyTimetableIds,
  type TalkWithMinutes,
  writeMyTimetableIds,
} from "@/utils/myTimetable";

const PIXELS_PER_MINUTE = 1.6;
const TIMELINE_START_MINUTES = 10 * 60;
const TIMELINE_END_MINUTES = 18 * 60;

type TimePickerState = {
  eventDate: EventDate;
  minutes: number;
} | null;

type OverlapState = {
  targetTalk: TalkWithMinutes;
  overlaps: TalkWithMinutes[];
} | null;

type PositionedTalk = TalkWithMinutes & {
  columnIndex: number;
  columnCount: number;
  isOverlapping: boolean;
};

function formatMinutes(minutes: number): string {
  const hour = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const minute = (minutes % 60).toString().padStart(2, "0");
  return `${hour}:${minute}`;
}

function parseTalkIds(searchParams: URLSearchParams): string[] {
  const tokens = [
    ...searchParams.getAll("id").flatMap((value) => value.split(",")),
    ...searchParams.getAll("ids").flatMap((value) => value.split(",")),
  ];

  return Array.from(
    new Set(
      tokens.map((token) => token.trim()).filter((token) => token.length > 0),
    ),
  );
}

function parseTalkIdsFromQuery(searchParams: URLSearchParams): string[] {
  const token = searchParams.get("m");
  if (token && token.length > 0) {
    return decodeMyTimetableToken(token);
  }

  return normalizeIds(parseTalkIds(searchParams));
}

function areSameIdSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const aSet = new Set(a);
  for (const id of b) {
    if (!aSet.has(id)) return false;
  }
  return true;
}

function getTrackBorderClass(track: Talk["track"]) {
  switch (track) {
    case "TRACK1":
      return "border-track-toggle";
    case "TRACK2":
      return "border-track-ascend";
    case "TRACK3":
      return "border-track-leverages";
    default:
      return track satisfies never;
  }
}

function getPositionedTalks(talks: TalkWithMinutes[]): PositionedTalk[] {
  const sorted = [...talks].sort((a, b) => {
    if (a.startMinutes !== b.startMinutes)
      return a.startMinutes - b.startMinutes;
    if (a.endMinutes !== b.endMinutes) return a.endMinutes - b.endMinutes;
    return a.id.localeCompare(b.id);
  });

  const active: Array<{ id: string; end: number; column: number }> = [];
  const freeColumns: number[] = [];
  const columnById = new Map<string, number>();

  const pullMinColumn = () => {
    if (freeColumns.length === 0) return null;
    freeColumns.sort((a, b) => a - b);
    return freeColumns.shift() ?? null;
  };

  for (const talk of sorted) {
    for (let index = active.length - 1; index >= 0; index -= 1) {
      const item = active[index];
      if (item.end <= talk.startMinutes) {
        freeColumns.push(item.column);
        active.splice(index, 1);
      }
    }

    const reused = pullMinColumn();
    const nextColumn = reused ?? active.length + freeColumns.length;

    columnById.set(talk.id, nextColumn);
    active.push({ id: talk.id, end: talk.endMinutes, column: nextColumn });
  }

  return sorted.map((talk) => {
    const overlaps = sorted.filter(
      (other) =>
        other.eventDate === talk.eventDate &&
        other.startMinutes < talk.endMinutes &&
        talk.startMinutes < other.endMinutes,
    );

    const maxColumn = Math.max(
      ...overlaps.map((item) => columnById.get(item.id) ?? 0),
      0,
    );

    return {
      ...talk,
      columnIndex: columnById.get(talk.id) ?? 0,
      columnCount: maxColumn + 1,
      isOverlapping: overlaps.length > 1,
    };
  });
}

function TimelineAxis({ timelineHeight }: { timelineHeight: number }) {
  const markers = [] as { minutes: number; label: string | null }[];
  for (
    let minutes = TIMELINE_START_MINUTES;
    minutes <= TIMELINE_END_MINUTES;
    minutes += 30
  ) {
    markers.push({
      minutes,
      label: minutes % 60 === 0 ? formatMinutes(minutes) : null,
    });
  }

  return (
    <div className="relative" style={{ height: `${timelineHeight}px` }}>
      {markers.map((marker) => {
        const top =
          (marker.minutes - TIMELINE_START_MINUTES) * PIXELS_PER_MINUTE;
        return (
          <div
            key={marker.minutes}
            className="absolute -translate-y-1/2 text-xs text-black-500"
            style={{ top: `${top}px` }}
          >
            {marker.label}
          </div>
        );
      })}
    </div>
  );
}

function TimelineColumn({
  eventDate,
  talks,
  onClickTimeSlot,
  onRemoveTalk,
}: {
  eventDate: EventDate;
  talks: TalkWithMinutes[];
  onClickTimeSlot: (eventDate: EventDate, minutes: number) => void;
  onRemoveTalk: (id: string) => void;
}) {
  const timelineHeight =
    (TIMELINE_END_MINUTES - TIMELINE_START_MINUTES) * PIXELS_PER_MINUTE;

  const markers = [] as number[];
  for (
    let minutes = TIMELINE_START_MINUTES;
    minutes <= TIMELINE_END_MINUTES;
    minutes += 30
  ) {
    markers.push(minutes);
  }

  const clickableSlots = [] as { start: number; end: number }[];
  for (
    let minutes = TIMELINE_START_MINUTES;
    minutes < TIMELINE_END_MINUTES;
    minutes += 30
  ) {
    clickableSlots.push({ start: minutes, end: minutes + 30 });
  }

  const positionedTalks = getPositionedTalks(talks);

  return (
    <div
      className="relative rounded-lg border border-black-300 bg-blue-purple-100/30"
      style={{ height: `${timelineHeight}px` }}
    >
      {clickableSlots.map((slot) => {
        const top = (slot.start - TIMELINE_START_MINUTES) * PIXELS_PER_MINUTE;
        const height = (slot.end - slot.start) * PIXELS_PER_MINUTE;
        return (
          <button
            type="button"
            key={`${eventDate}-${slot.start}`}
            className="absolute left-0 right-0 z-0 hover:bg-blue-purple-200/40"
            style={{ top: `${top}px`, height: `${height}px` }}
            onClick={() => onClickTimeSlot(eventDate, slot.start)}
            aria-label={`${eventDate} ${formatMinutes(slot.start)} の時間帯で追加`}
          />
        );
      })}

      {markers.map((minutes) => {
        const top = (minutes - TIMELINE_START_MINUTES) * PIXELS_PER_MINUTE;
        return (
          <div
            key={`${eventDate}-line-${minutes}`}
            className="absolute left-0 right-0 z-10 border-t border-black-200"
            style={{ top: `${top}px` }}
          />
        );
      })}

      {positionedTalks.map((talk) => {
        const top =
          (talk.startMinutes - TIMELINE_START_MINUTES) * PIXELS_PER_MINUTE;
        const height =
          (talk.endMinutes - talk.startMinutes) * PIXELS_PER_MINUTE;

        const left = `calc(${(100 / talk.columnCount) * talk.columnIndex}% + 8px)`;
        const width = `calc(${100 / talk.columnCount}% - 10px)`;

        return (
          <div
            key={talk.id}
            className={`absolute left-2 right-2 z-20 overflow-hidden rounded-md border border-black-300 bg-white p-2 border-l-4 ${getTrackBorderClass(talk.track)}`}
            style={{
              top: `${top}px`,
              height: `${height}px`,
              left,
              width,
              right: "auto",
            }}
          >
            {talk.isOverlapping && (
              <div
                className="absolute inset-0 opacity-25 pointer-events-none"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(-45deg, #ff5a5a 0 6px, transparent 6px 12px)",
                }}
              />
            )}
            <button
              type="button"
              className="absolute right-1 top-1 z-10 text-black-500 hover:text-black-700"
              onClick={() => onRemoveTalk(talk.id)}
              aria-label="削除"
            >
              <X size={14} />
            </button>
            <p className="relative z-10 text-[10px] text-black-500 pr-4">
              {talk.time}
            </p>
            <Link
              href={`/talks/${talk.id}`}
              className="relative z-10 hover:underline block pr-4"
            >
              <p className="mt-0.5 text-xs font-bold text-black-700 truncate">
                {talk.title}
              </p>
            </Link>
            <p className="relative z-10 mt-0.5 text-[10px] text-black-500 truncate pr-4">
              {talk.speaker.name} / {TRACK[talk.track].name}
            </p>
          </div>
        );
      })}

      {talks.length === 0 && (
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center text-sm text-black-500">
          未選択です
        </div>
      )}
    </div>
  );
}

function DesktopTimeline({
  talksByDate,
  onClickTimeSlot,
  onRemoveTalk,
}: {
  talksByDate: Record<EventDate, TalkWithMinutes[]>;
  onClickTimeSlot: (eventDate: EventDate, minutes: number) => void;
  onRemoveTalk: (id: string) => void;
}) {
  const timelineHeight =
    (TIMELINE_END_MINUTES - TIMELINE_START_MINUTES) * PIXELS_PER_MINUTE;

  return (
    <section className="rounded-xl bg-white p-4 md:p-6">
      <div className="grid grid-cols-[58px_1fr_1fr] gap-3 mb-3">
        <div />
        <h2 className="text-lg font-bold text-blue-light-600">
          Day1
          <span className="ml-2 text-xs font-normal text-black-500">
            {EVENT_DATE.DAY1}
          </span>
        </h2>
        <h2 className="text-lg font-bold text-pink-500">
          Day2
          <span className="ml-2 text-xs font-normal text-black-500">
            {EVENT_DATE.DAY2}
          </span>
        </h2>
      </div>
      <div className="grid grid-cols-[58px_1fr_1fr] gap-3">
        <TimelineAxis timelineHeight={timelineHeight} />
        <TimelineColumn
          eventDate="DAY1"
          talks={talksByDate.DAY1}
          onClickTimeSlot={onClickTimeSlot}
          onRemoveTalk={onRemoveTalk}
        />
        <TimelineColumn
          eventDate="DAY2"
          talks={talksByDate.DAY2}
          onClickTimeSlot={onClickTimeSlot}
          onRemoveTalk={onRemoveTalk}
        />
      </div>
    </section>
  );
}

function MobileTimeline({
  currentEventDate,
  talksByDate,
  onClickTimeSlot,
  onRemoveTalk,
  onTabChange,
}: {
  currentEventDate: EventDate;
  talksByDate: Record<EventDate, TalkWithMinutes[]>;
  onClickTimeSlot: (eventDate: EventDate, minutes: number) => void;
  onRemoveTalk: (id: string) => void;
  onTabChange: (date: EventDate) => void;
}) {
  const timelineHeight =
    (TIMELINE_END_MINUTES - TIMELINE_START_MINUTES) * PIXELS_PER_MINUTE;

  return (
    <section className="rounded-xl bg-white p-4 md:p-6">
      <EventDateTab currentDate={currentEventDate} onTabChange={onTabChange} />
      <h2 className="mt-4 text-lg font-bold text-blue-light-600">
        {currentEventDate === "DAY1" ? "Day1" : "Day2"}
        <span className="ml-2 text-xs font-normal text-black-500">
          {EVENT_DATE[currentEventDate]}
        </span>
      </h2>
      <div className="mt-3 grid grid-cols-[58px_1fr] gap-3">
        <TimelineAxis timelineHeight={timelineHeight} />
        <TimelineColumn
          eventDate={currentEventDate}
          talks={talksByDate[currentEventDate]}
          onClickTimeSlot={onClickTimeSlot}
          onRemoveTalk={onRemoveTalk}
        />
      </div>
    </section>
  );
}

export default function MyTimetablePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentEventDate, setCurrentEventDate] = useState<EventDate>("DAY1");
  const [timePickerState, setTimePickerState] = useState<TimePickerState>(null);
  const [overlapState, setOverlapState] = useState<OverlapState>(null);
  const [baseUrl, setBaseUrl] = useState("");
  const [showQr, setShowQr] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  const allTalksWithMinutes = useMemo(
    () =>
      talkList
        .map((talk) => {
          const parsed = parseTalkTimeToMinutes(talk.time);
          if (!parsed) return null;
          return { ...talk, ...parsed };
        })
        .filter((talk): talk is TalkWithMinutes => !!talk)
        .sort((a, b) => {
          if (a.eventDate !== b.eventDate)
            return a.eventDate.localeCompare(b.eventDate);
          if (a.startMinutes !== b.startMinutes)
            return a.startMinutes - b.startMinutes;
          return a.id.localeCompare(b.id);
        }),
    [],
  );

  const talksWithMinutes = useMemo(
    () =>
      selectedIds
        .map((id) => talkList.find((talk) => talk.id === id))
        .filter((talk): talk is Talk => !!talk)
        .map((talk) => {
          const parsed = parseTalkTimeToMinutes(talk.time);
          if (!parsed) return null;
          return { ...talk, ...parsed };
        })
        .filter((talk): talk is TalkWithMinutes => !!talk)
        .sort((a, b) => {
          if (a.eventDate !== b.eventDate)
            return a.eventDate.localeCompare(b.eventDate);
          if (a.startMinutes !== b.startMinutes)
            return a.startMinutes - b.startMinutes;
          return a.id.localeCompare(b.id);
        }),
    [selectedIds],
  );

  const talksByDate = talksWithMinutes.reduce(
    (acc, talk) => {
      acc[talk.eventDate].push(talk);
      return acc;
    },
    {
      DAY1: [] as TalkWithMinutes[],
      DAY2: [] as TalkWithMinutes[],
    },
  );

  const hasQueryIds =
    searchParams.has("m") || searchParams.has("id") || searchParams.has("ids");

  useEffect(() => {
    const storageIds = readMyTimetableIds();

    setSavedIds(storageIds);

    if (!isInitialized) {
      const queryIds = parseTalkIdsFromQuery(searchParams);
      setSelectedIds(queryIds.length > 0 ? queryIds : storageIds);
      setIsInitialized(true);
      return;
    }

    if (hasQueryIds) {
      const queryIds = parseTalkIdsFromQuery(searchParams);
      setSelectedIds(queryIds);
    }
  }, [searchParams, hasQueryIds, isInitialized]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setBaseUrl(window.location.origin);
  }, []);

  const updateQuery = (ids: string[]) => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("m");
    next.delete("id");
    next.delete("ids");

    const token = encodeMyTimetableToken(ids);
    if (token.length > 0) {
      next.set("m", token);
    }

    const query = next.toString();
    router.replace(query.length > 0 ? `${pathname}?${query}` : pathname);
  };

  const addTalk = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev;

      const targetTalk = allTalksWithMinutes.find((talk) => talk.id === id);
      if (!targetTalk) return prev;

      const overlaps = talksWithMinutes.filter(
        (talk) =>
          talk.eventDate === targetTalk.eventDate &&
          talk.startMinutes < targetTalk.endMinutes &&
          targetTalk.startMinutes < talk.endMinutes,
      );

      if (overlaps.length > 0) {
        setOverlapState({ targetTalk, overlaps });
        setTimePickerState(null);
        return prev;
      }

      const next = [...prev, id];
      updateQuery(next);
      return next;
    });
  };

  const resolveOverlapAndAdd = () => {
    if (!overlapState) return;

    setSelectedIds((prev) => {
      if (prev.includes(overlapState.targetTalk.id)) {
        updateQuery(prev);
        return prev;
      }
      const next = [...prev, overlapState.targetTalk.id];
      updateQuery(next);
      return next;
    });

    setOverlapState(null);
  };

  const removeTalk = (id: string) => {
    setSelectedIds((prev) => {
      const next = prev.filter((currentId) => currentId !== id);
      updateQuery(next);
      return next;
    });
  };

  const clearTalks = () => {
    setSelectedIds([]);
    updateQuery([]);
  };

  const saveToLocalStorage = () => {
    writeMyTimetableIds(selectedIds);
    setSavedIds(selectedIds);
    window.dispatchEvent(new Event("my-timetable-updated"));
  };

  const currentShareUrl =
    baseUrl.length > 0
      ? `${baseUrl}/talks/me${
          selectedIds.length > 0
            ? `?${new URLSearchParams({ m: encodeMyTimetableToken(selectedIds) }).toString()}`
            : ""
        }`
      : "";

  const xShareHref =
    currentShareUrl.length > 0
      ? `https://x.com/intent/tweet?text=${encodeURIComponent("TSKaigiのマイタイムテーブル")}&url=${encodeURIComponent(currentShareUrl)}`
      : "https://x.com/intent/tweet";

  const showSaveButton = !areSameIdSet(selectedIds, savedIds);

  const filteredForPanel = allTalksWithMinutes.filter((talk) => {
    const normalizedKeyword = searchKeyword.trim().toLowerCase();
    if (normalizedKeyword.length === 0) return true;
    return (
      talk.title.toLowerCase().includes(normalizedKeyword) ||
      talk.speaker.name.toLowerCase().includes(normalizedKeyword)
    );
  });

  const pickableByTime = useMemo(() => {
    if (!timePickerState) return [] as TalkWithMinutes[];
    return allTalksWithMinutes.filter(
      (talk) =>
        talk.eventDate === timePickerState.eventDate &&
        talk.startMinutes <= timePickerState.minutes &&
        talk.endMinutes > timePickerState.minutes,
    );
  }, [allTalksWithMinutes, timePickerState]);

  return (
    <main className="bg-blue-light-100 mt-16 py-10 px-2 md:py-16 md:px-6 lg:px-10">
      <h1 className="text-2xl font-bold text-blue-light-500 text-center md:text-3xl lg:text-4xl">
        マイタイムテーブル
      </h1>

      <div className="mt-3 text-center">
        <Button type="button" variant="outline" asChild>
          <Link href="/talks">タイムテーブル一覧へ</Link>
        </Button>
      </div>

      <div className="mt-4 mx-auto max-w-6xl rounded-xl bg-white p-4 md:p-6">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsAddPanelOpen((prev) => !prev)}
          >
            <Plus size={16} />
            追加
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsClearConfirmOpen(true)}
          >
            クリア
          </Button>
          {showSaveButton && (
            <Button type="button" onClick={saveToLocalStorage}>
              LocalStorageに保存
            </Button>
          )}
          <Button type="button" variant="outline" asChild>
            <Link href={xShareHref} target="_blank" rel="noopener noreferrer">
              Xでシェア
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              if (!currentShareUrl) return;
              await navigator.clipboard.writeText(currentShareUrl);
            }}
          >
            URLコピー
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowQr((prev) => !prev)}
          >
            {showQr ? "QRを隠す" : "QRを表示"}
          </Button>
        </div>

        {showQr && currentShareUrl.length > 0 && (
          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <p className="text-xs break-all text-black-500">
              {currentShareUrl}
            </p>
            <div
              role="img"
              aria-label="マイタイムテーブル共有QR"
              className="h-[140px] w-[140px] rounded border border-black-300 bg-white bg-cover bg-center"
              style={{
                backgroundImage: `url(https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                  currentShareUrl,
                )})`,
              }}
            />
          </div>
        )}

        {isAddPanelOpen && (
          <section className="mt-4 rounded-lg border border-black-300 bg-blue-purple-100/30 p-4">
            <p className="text-sm font-bold">トークを選択して追加</p>
            <Input
              className="mt-2 bg-white"
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              placeholder="タイトル or スピーカー名で検索"
            />
            <div className="mt-3 max-h-64 overflow-y-auto rounded border border-black-300 bg-white p-2">
              {filteredForPanel.map((talk) => {
                const isAdded = selectedIds.includes(talk.id);
                return (
                  <div
                    key={`add-panel-${talk.id}`}
                    className="flex items-start justify-between gap-2 border-b border-black-200 py-2 last:border-none"
                  >
                    <div>
                      <p className="text-xs text-black-500">
                        {talk.eventDate} / {talk.time} /{" "}
                        {TRACK[talk.track].name}
                      </p>
                      <p className="text-sm font-bold">{talk.title}</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => addTalk(talk.id)}
                      disabled={isAdded}
                    >
                      {isAdded ? (
                        <>
                          <Check size={14} />
                          追加済み
                        </>
                      ) : (
                        <>
                          <Plus size={14} />
                          追加
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <div className="mt-8 mx-auto max-w-6xl">
        <div className="block lg:hidden">
          <MobileTimeline
            currentEventDate={currentEventDate}
            talksByDate={talksByDate}
            onClickTimeSlot={(eventDate, minutes) =>
              setTimePickerState({ eventDate, minutes })
            }
            onRemoveTalk={removeTalk}
            onTabChange={setCurrentEventDate}
          />
        </div>

        <div className="hidden lg:block">
          <DesktopTimeline
            talksByDate={talksByDate}
            onClickTimeSlot={(eventDate, minutes) =>
              setTimePickerState({ eventDate, minutes })
            }
            onRemoveTalk={removeTalk}
          />
        </div>
      </div>

      {timePickerState && (
        <div className="fixed inset-0 z-50 bg-black/30 p-4 flex items-center justify-center">
          <button
            type="button"
            className="absolute inset-0"
            onClick={() => setTimePickerState(null)}
            aria-label="ダイアログを閉じる"
          />
          <section
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-xl rounded-xl bg-white p-4 md:p-6"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-bold text-black-700">
                {timePickerState.eventDate}{" "}
                {formatMinutes(timePickerState.minutes)}
                の時間帯で追加
              </h3>
              <button
                type="button"
                className="text-black-500 hover:text-black-700"
                onClick={() => setTimePickerState(null)}
                aria-label="閉じる"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-3 max-h-72 overflow-y-auto flex flex-col gap-2">
              {pickableByTime.length === 0 ? (
                <p className="text-sm text-black-500">
                  該当するトークがありません。
                </p>
              ) : (
                pickableByTime.map((talk) => {
                  const isAdded = selectedIds.includes(talk.id);
                  return (
                    <div
                      key={`pick-time-${talk.id}`}
                      className="flex items-center justify-between rounded border border-black-200 p-2"
                    >
                      <div>
                        <p className="text-xs text-black-500">
                          {talk.time} / {TRACK[talk.track].name}
                        </p>
                        <p className="text-sm font-bold">{talk.title}</p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => addTalk(talk.id)}
                        disabled={isAdded}
                      >
                        {isAdded ? (
                          <>
                            <Check size={14} />
                            追加済み
                          </>
                        ) : (
                          <>
                            <Plus size={14} />
                            追加
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      )}

      {overlapState && (
        <div className="fixed inset-0 z-[60] bg-black/40 p-4 flex items-center justify-center">
          <button
            type="button"
            className="absolute inset-0"
            onClick={() => {
              setOverlapState(null);
            }}
            aria-label="ダイアログを閉じる"
          />
          <section
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-xl rounded-xl bg-white p-4 md:p-6"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle size={18} className="mt-0.5 text-orange-600" />
              <div>
                <h3 className="text-base font-bold text-black-700">
                  時間が重複しています
                </h3>
                <p className="mt-1 text-sm text-black-500">
                  追加候補: {overlapState.targetTalk.time} /{" "}
                  {overlapState.targetTalk.title}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-black-300 p-3">
              <p className="text-sm font-bold">重複中のトーク</p>
              <div className="mt-2 flex flex-col gap-2">
                {overlapState.overlaps.map((talk) => {
                  return (
                    <div
                      key={`overlap-${talk.id}`}
                      className="rounded border border-black-200 p-2"
                    >
                      <span className="text-sm">
                        <span className="block text-black-500 text-xs">
                          {talk.time}
                        </span>
                        <span className="block font-bold">{talk.title}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOverlapState(null);
                }}
              >
                キャンセル
              </Button>
              <Button type="button" onClick={resolveOverlapAndAdd}>
                重複したまま追加
              </Button>
            </div>
          </section>
        </div>
      )}

      {isClearConfirmOpen && (
        <div className="fixed inset-0 z-[65] bg-black/40 p-4 flex items-center justify-center">
          <button
            type="button"
            className="absolute inset-0"
            onClick={() => setIsClearConfirmOpen(false)}
            aria-label="ダイアログを閉じる"
          />
          <section
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-md rounded-xl bg-white p-4 md:p-6"
          >
            <h3 className="text-base font-bold text-black-700">確認</h3>
            <p className="mt-2 text-sm text-black-500">
              マイタイムテーブルをすべてクリアします。よろしいですか？
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsClearConfirmOpen(false)}
              >
                キャンセル
              </Button>
              <Button
                type="button"
                onClick={() => {
                  clearTalks();
                  setIsClearConfirmOpen(false);
                }}
              >
                クリアする
              </Button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
