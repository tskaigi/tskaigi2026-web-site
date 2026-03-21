"use client";

import {
  AlertTriangle,
  Check,
  Eye,
  Info,
  List,
  Pencil,
  QrCode,
  RotateCcw,
  Search,
  Share2,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { TimelineColumn } from "@/components/talks/TimelineColumn";
import {
  DesktopTimelineLayout,
  MobileTimelineLayout,
} from "@/components/talks/TimelineLayout";
import { Button } from "@/components/ui/button";
import { showAppToast } from "@/components/ui/GlobalToast";
import { type EventDate, TRACK } from "@/constants/talkList";
import { Input } from "@/ui/input";
import {
  findOverlaps,
  getTalksByDateFromIds,
  myParticipatedIds,
  myTimetable,
  myTimetableIds,
  myTimetableQuery,
  type TalkWithMinutes,
} from "@/utils/myTimetable";

function DialogOverlay({
  children,
  maxWidth = "max-w-xl",
  onClose,
}: {
  children: React.ReactNode;
  maxWidth?: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/30 p-4 flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onClose}
        aria-label="ダイアログを閉じる"
      />
      <section
        role="dialog"
        aria-modal="true"
        className={`relative z-10 w-full ${maxWidth} rounded-xl bg-white p-4 md:p-6`}
      >
        {children}
      </section>
    </div>
  );
}

function TalkSelectItem({
  talk,
  isAdded,
  metaClassName,
  onClick,
}: {
  talk: TalkWithMinutes;
  isAdded: boolean;
  metaClassName?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`w-full py-2 text-left cursor-pointer rounded-md border px-2 border-l-4 ${isAdded ? `border-black-300 ${myTimetable.getTrackBorderClass(talk.track)} bg-blue-purple-100/40` : "border-black-200 border-l-black-200 hover:bg-black-100"}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-2">
        <p
          className={`text-xs text-black-500 truncate whitespace-nowrap ${metaClassName ?? ""}`}
          title={`${talk.eventDate} / ${talk.time} / ${TRACK[talk.track].name}`}
        >
          {talk.eventDate} / {talk.time} / {TRACK[talk.track].name}
        </p>
        {isAdded && (
          <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-blue-purple-200 px-1.5 py-0 text-[10px] font-bold text-blue-purple-700">
            <Check size={10} />
            選択中
          </span>
        )}
      </div>
      <p className="py-1 text-sm font-bold">{talk.title}</p>
      <p className="text-xs">{talk.speaker.name}</p>
    </button>
  );
}

type TimePickerState = {
  eventDate: EventDate;
  minutes: number;
} | null;

type OverlapState = {
  targetTalk: TalkWithMinutes;
  overlaps: TalkWithMinutes[];
} | null;

function TimePickerDialog({
  timePickerState,
  allTalks,
  selectedIds,
  onAdd,
  onRemove,
  onClose,
}: {
  timePickerState: NonNullable<TimePickerState>;
  allTalks: TalkWithMinutes[];
  selectedIds: string[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}) {
  const pickableByTime = useMemo(
    () =>
      allTalks.filter(
        (talk) =>
          talk.eventDate === timePickerState.eventDate &&
          talk.startMinutes <= timePickerState.minutes &&
          talk.endMinutes > timePickerState.minutes,
      ),
    [allTalks, timePickerState],
  );

  return (
    <DialogOverlay onClose={onClose}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-bold text-black-700">
          {timePickerState.eventDate}{" "}
          {myTimetable.formatMinutes(timePickerState.minutes)}
          の時間帯で追加
        </h3>
        <button
          type="button"
          className="text-black-500 hover:text-black-700 cursor-pointer"
          onClick={onClose}
          aria-label="閉じる"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mt-3 max-h-72 overflow-y-auto flex flex-col gap-2">
        {pickableByTime.length === 0 ? (
          <p className="text-sm text-black-500">該当するトークがありません。</p>
        ) : (
          pickableByTime.map((talk) => {
            const isAdded = selectedIds.includes(talk.id);
            return (
              <TalkSelectItem
                key={`pick-time-${talk.id}`}
                talk={talk}
                isAdded={isAdded}
                onClick={() => (isAdded ? onRemove(talk.id) : onAdd(talk.id))}
              />
            );
          })
        )}
      </div>
    </DialogOverlay>
  );
}

function OverlapDialog({
  overlapState,
  onResolve,
  onClose,
}: {
  overlapState: NonNullable<OverlapState>;
  onResolve: () => void;
  onClose: () => void;
}) {
  return (
    <DialogOverlay onClose={onClose}>
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
          {overlapState.overlaps.map((talk) => (
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
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          キャンセル
        </Button>
        <Button type="button" onClick={onResolve}>
          重複したまま追加
        </Button>
      </div>
    </DialogOverlay>
  );
}

function ClearConfirmDialog({
  onConfirm,
  onClose,
}: {
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <DialogOverlay maxWidth="max-w-md" onClose={onClose}>
      <h3 className="text-base font-bold text-black-700">確認</h3>
      <p className="mt-2 text-sm text-black-500">
        マイタイムテーブルをすべてリセットします。よろしいですか？
      </p>

      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          キャンセル
        </Button>
        <Button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          リセットする
        </Button>
      </div>
    </DialogOverlay>
  );
}

function InfoDialog({ onClose }: { onClose: () => void }) {
  return (
    <DialogOverlay
      maxWidth="max-w-lg max-h-[80vh] overflow-y-auto"
      onClose={onClose}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-black-700">
          マイタイムテーブルとは？
        </h3>
        <button
          type="button"
          className="text-black-500 hover:text-black-700 cursor-pointer"
          onClick={onClose}
          aria-label="閉じる"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-4 text-sm text-black-600">
        <p>
          マイタイムテーブルは、TSKaigi
          2026で聴きたいセッションを自分だけのスケジュールとして管理できる機能です。
        </p>

        <div>
          <h4 className="font-bold text-black-700">スケジュールを組もう</h4>
          <p className="mt-1">
            気になるセッションを検索して追加し、自分だけのタイムテーブルを作成できます。タイムライン上の時間帯をタップして追加することもできます。
          </p>
        </div>

        <div>
          <h4 className="font-bold text-black-700">参加記録を残そう</h4>
          <p className="mt-1">
            会場では各セッションの参加記録QRコードが掲出されます。読み取ると、マイタイムテーブルに参加記録が付きます。目指せ全時間帯参加！
          </p>
        </div>

        <div>
          <h4 className="font-bold text-black-700">共有して会話のタネに</h4>
          <p className="mt-1">
            QRコードやSNSでマイタイムテーブルを共有できます。会場内や懇親会で「こんなセッション聴いたよ！」と見せ合って、会話のきっかけにしましょう。
          </p>
        </div>

        <div>
          <h4 className="font-bold text-black-700">PC・スマホ間の同期</h4>
          <p className="mt-1">
            事前にPCでスケジュールを組んで、QRコードでスマホに同期して会場に持っていくこともできます。
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button type="button" onClick={onClose}>
          閉じる
        </Button>
      </div>
    </DialogOverlay>
  );
}

function SideToolbar({
  selectedIds,
  participatedIds,
  isViewMode,
  onToggleViewMode,
}: {
  selectedIds: string[];
  participatedIds: string[];
  isViewMode: boolean;
  onToggleViewMode: () => void;
}) {
  const [showQr, setShowQr] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setBaseUrl(window.location.origin);
  }, []);

  const shareQueryString = useMemo(() => {
    const tokens = myTimetableQuery.encode(selectedIds, participatedIds);
    const params = new URLSearchParams();
    if (tokens.m) params.set("m", tokens.m);
    if (tokens.p) params.set("p", tokens.p);
    return params.toString();
  }, [selectedIds, participatedIds]);

  const currentShareUrl = useMemo(() => {
    if (baseUrl.length === 0) return "";
    const qs = shareQueryString;
    return `${baseUrl}/talks/me${qs.length > 0 ? `?${qs}` : ""}`;
  }, [baseUrl, shareQueryString]);

  const yourShareUrl = useMemo(() => {
    if (baseUrl.length === 0) return "";
    const qs = shareQueryString;
    return `${baseUrl}/talks/your${qs.length > 0 ? `?${qs}` : ""}`;
  }, [baseUrl, shareQueryString]);

  const xShareHref =
    yourShareUrl.length > 0
      ? `https://x.com/intent/tweet?text=${encodeURIComponent("TSKaigiのマイタイムテーブル")}&url=${encodeURIComponent(yourShareUrl)}`
      : "https://x.com/intent/tweet";

  return (
    <aside className="flex flex-row lg:flex-col gap-2">
      <Button type="button" variant="outline" size="icon" asChild>
        <Link
          href={xShareHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Xでシェア"
          title="Xでシェア"
        >
          <Share2 size={18} />
        </Link>
      </Button>
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setShowQr((prev) => !prev)}
          aria-label={showQr ? "QRを隠す" : "QRを表示"}
          title={showQr ? "QRを隠す" : "QRを表示"}
        >
          <QrCode size={18} />
        </Button>

        {showQr && currentShareUrl.length > 0 && (
          <div className="absolute top-full left-0 z-40 mt-2 rounded-lg border border-black-200 bg-white p-3">
            <div className="grid md:grid-cols-[1fr_auto_1fr] gap-3">
              <div>
                <p className="text-sm font-bold text-black-700">
                  PC・スマホ間の同期用
                </p>
                <p className="mt-1 text-[10px] text-black-500">
                  読み取った端末に保存されているマイタイムテーブル情報が上書きされます
                </p>
                <div
                  role="img"
                  aria-label="自分用マイタイムテーブルQR"
                  className="m-2 h-20 w-20 md:h-[140px] md:w-[140px] bg-white bg-cover bg-center"
                  style={{
                    backgroundImage: `url(https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                      currentShareUrl,
                    )})`,
                  }}
                />
              </div>

              <div className="hidden md:block w-px bg-black-200" />
              <div className="block md:hidden h-px bg-black-200" />

              <div>
                <p className="text-sm font-bold text-black-700">閲覧・共有用</p>
                <p className="mt-1 text-[10px] text-black-500">
                  読み取った端末に保存されているマイタイムテーブル情報は上書きされません
                </p>
                <div
                  role="img"
                  aria-label="共有用タイムテーブルQR"
                  className="m-2 h-20 w-20 md:h-[140px] md:w-[140px] bg-white bg-cover bg-center"
                  style={{
                    backgroundImage: `url(https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                      yourShareUrl,
                    )})`,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      <Button type="button" variant="outline" size="icon" asChild>
        <Link
          href="/talks"
          aria-label="タイムテーブル一覧へ"
          title="タイムテーブル一覧へ"
        >
          <List size={18} />
        </Link>
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onToggleViewMode}
        aria-label={isViewMode ? "編集モードへ" : "閲覧モードへ"}
        title={isViewMode ? "編集モードへ" : "閲覧モードへ"}
      >
        {isViewMode ? <Pencil size={18} /> : <Eye size={18} />}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => setIsInfoOpen(true)}
        aria-label="マイタイムテーブルについて"
        title="マイタイムテーブルについて"
      >
        <Info size={18} />
      </Button>

      {isInfoOpen && <InfoDialog onClose={() => setIsInfoOpen(false)} />}
    </aside>
  );
}

function TalkSearchPanel({
  allTalks,
  selectedIds,
  hasOpenDialog,
  onAdd,
  onRemove,
  onReset,
}: {
  allTalks: TalkWithMinutes[];
  selectedIds: string[];
  hasOpenDialog: boolean;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  onReset: () => void;
}) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (event: MouseEvent) => {
      if (hasOpenDialog) return;
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, hasOpenDialog]);

  const filteredTalks = useMemo(() => {
    const normalizedKeyword = searchKeyword.trim().toLowerCase();
    if (normalizedKeyword.length === 0) return allTalks;
    return allTalks.filter(
      (talk) =>
        talk.title.toLowerCase().includes(normalizedKeyword) ||
        talk.speaker.name.toLowerCase().includes(normalizedKeyword),
    );
  }, [allTalks, searchKeyword]);

  return (
    <div className="flex flex-wrap items-center gap-1">
      <div
        ref={popupRef}
        className="relative w-[220px] max-w-full sm:w-full sm:max-w-md"
      >
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-black-500"
          />
          <Input
            className="bg-white pl-9"
            value={searchKeyword}
            onFocus={() => setIsOpen(true)}
            onChange={(event) => {
              setSearchKeyword(event.target.value);
              setIsOpen(true);
            }}
            placeholder="トークを検索（タイトル or スピーカー名）"
          />
        </div>

        {isOpen && (
          <div className="absolute left-0 right-0 z-40 mt-2 max-h-72 overflow-y-auto rounded border border-black-300 bg-white p-2 shadow-sm flex flex-col gap-2">
            {filteredTalks.map((talk) => {
              const isAdded = selectedIds.includes(talk.id);
              return (
                <TalkSelectItem
                  key={`add-panel-${talk.id}`}
                  talk={talk}
                  isAdded={isAdded}
                  metaClassName="max-w-[180px] sm:max-w-[260px]"
                  onClick={() => (isAdded ? onRemove(talk.id) : onAdd(talk.id))}
                />
              );
            })}
          </div>
        )}
      </div>
      <Button
        type="button"
        variant="ghost"
        className="text-red-500 hover:bg-red-50 hover:text-red-600"
        onClick={onReset}
        aria-label="リセット"
        title="リセット"
      >
        <RotateCcw size={16} />
        リセット
      </Button>
    </div>
  );
}

export default function MyTimetablePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [participatedIds, setParticipatedIds] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentEventDate, setCurrentEventDate] = useState<EventDate>("DAY1");
  const [timePickerState, setTimePickerState] = useState<TimePickerState>(null);
  const [overlapState, setOverlapState] = useState<OverlapState>(null);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const allTalksWithMinutes = useMemo(
    () => myTimetable.getAllTalksWithMinutes(),
    [],
  );

  const talksByDate = useMemo(
    () => getTalksByDateFromIds(selectedIds),
    [selectedIds],
  );

  const hasQueryIds = searchParams.has("m") || searchParams.has("p");

  useEffect(() => {
    const storageIds = myTimetableIds.read();

    if (!isInitialized) {
      const query = myTimetableQuery.parse(searchParams);
      if (query.ids.length > 0) {
        setSelectedIds(query.ids);
        setParticipatedIds(query.participatedIds);
      } else {
        setSelectedIds(storageIds);
        setParticipatedIds(myParticipatedIds.read());
      }
      setIsInitialized(true);
      return;
    }

    if (hasQueryIds) {
      const query = myTimetableQuery.parse(searchParams);
      setSelectedIds(query.ids);
      setParticipatedIds(query.participatedIds);
    }
  }, [searchParams, hasQueryIds, isInitialized]);

  const updateQuery = (
    ids: string[],
    participated: string[] = participatedIds,
  ) => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("m");
    next.delete("p");

    const tokens = myTimetableQuery.encode(ids, participated);
    if (tokens.m) {
      next.set("m", tokens.m);
    }
    if (tokens.p) {
      next.set("p", tokens.p);
    }

    const query = next.toString();
    router.replace(query.length > 0 ? `${pathname}?${query}` : pathname);
  };

  const addTalk = (id: string) => {
    if (selectedIds.includes(id)) return;

    const targetTalk = allTalksWithMinutes.find((talk) => talk.id === id);
    if (!targetTalk) return;

    const overlaps = findOverlaps(id, selectedIds);
    const hasCrossTrackOverlap = overlaps.some(
      (talk) => talk.track !== targetTalk.track,
    );

    if (hasCrossTrackOverlap) {
      setOverlapState({ targetTalk, overlaps });
      setTimePickerState(null);
      return;
    }

    const next = [...selectedIds, id];
    setSelectedIds(next);
    myTimetableIds.write(next);
    window.dispatchEvent(new Event("my-timetable-updated"));
    updateQuery(next);
    showAppToast("マイタイムテーブルに追加しました");
  };

  const resolveOverlapAndAdd = () => {
    if (!overlapState) return;

    if (selectedIds.includes(overlapState.targetTalk.id)) {
      setOverlapState(null);
      return;
    }

    const next = [...selectedIds, overlapState.targetTalk.id];
    setSelectedIds(next);
    myTimetableIds.write(next);
    window.dispatchEvent(new Event("my-timetable-updated"));
    updateQuery(next);
    setOverlapState(null);
    showAppToast("マイタイムテーブルに追加しました");
  };

  const removeTalk = (id: string) => {
    const nextParticipated = participatedIds.filter((pid) => pid !== id);
    const next = selectedIds.filter((currentId) => currentId !== id);
    setParticipatedIds(nextParticipated);
    setSelectedIds(next);
    myTimetableIds.write(next);
    window.dispatchEvent(new Event("my-timetable-updated"));
    updateQuery(next, nextParticipated);
    showAppToast("マイタイムテーブルから削除しました");
  };

  const resetTalks = () => {
    setSelectedIds([]);
    myTimetableIds.write([]);
    window.dispatchEvent(new Event("my-timetable-updated"));
    showAppToast("マイタイムテーブルをリセットしました");
    updateQuery([], []);
  };

  const handleClickTimeSlot = isViewMode
    ? undefined
    : (eventDate: EventDate, minutes: number) =>
        setTimePickerState({ eventDate, minutes });
  const handleRemoveTalk = isViewMode ? undefined : removeTalk;

  return (
    <main className="bg-blue-light-100 mt-16 py-10 px-2 md:py-16 md:px-6 lg:px-10">
      <h1 className="text-2xl font-bold text-blue-light-500 text-center md:text-3xl lg:text-4xl">
        マイタイムテーブル
      </h1>

      <div className="mt-8 mx-auto max-w-6xl grid lg:grid-cols-[min-content_1fr] gap-4">
        <SideToolbar
          selectedIds={selectedIds}
          participatedIds={participatedIds}
          isViewMode={isViewMode}
          onToggleViewMode={() => setIsViewMode((prev) => !prev)}
        />

        <div className={isViewMode ? "" : "bg-white rounded-xl p-4 md:p-6"}>
          {!isViewMode && (
            <TalkSearchPanel
              allTalks={allTalksWithMinutes}
              selectedIds={selectedIds}
              hasOpenDialog={!!overlapState}
              onAdd={addTalk}
              onRemove={removeTalk}
              onReset={() => setIsClearConfirmOpen(true)}
            />
          )}

          <div className="block lg:hidden">
            <MobileTimelineLayout
              currentEventDate={currentEventDate}
              onTabChange={setCurrentEventDate}
            >
              <TimelineColumn
                eventDate={currentEventDate}
                talks={talksByDate[currentEventDate]}
                participatedIds={participatedIds}
                onClickTimeSlot={handleClickTimeSlot}
                onRemoveTalk={handleRemoveTalk}
              />
            </MobileTimelineLayout>
          </div>

          <div className="hidden lg:block">
            <DesktopTimelineLayout
              day1Column={
                <TimelineColumn
                  eventDate="DAY1"
                  talks={talksByDate.DAY1}
                  participatedIds={participatedIds}
                  onClickTimeSlot={handleClickTimeSlot}
                  onRemoveTalk={handleRemoveTalk}
                />
              }
              day2Column={
                <TimelineColumn
                  eventDate="DAY2"
                  talks={talksByDate.DAY2}
                  participatedIds={participatedIds}
                  onClickTimeSlot={handleClickTimeSlot}
                  onRemoveTalk={handleRemoveTalk}
                />
              }
            />
          </div>
        </div>
      </div>

      {timePickerState && (
        <TimePickerDialog
          timePickerState={timePickerState}
          allTalks={allTalksWithMinutes}
          selectedIds={selectedIds}
          onAdd={addTalk}
          onRemove={removeTalk}
          onClose={() => setTimePickerState(null)}
        />
      )}

      {overlapState && (
        <OverlapDialog
          overlapState={overlapState}
          onResolve={resolveOverlapAndAdd}
          onClose={() => setOverlapState(null)}
        />
      )}

      {isClearConfirmOpen && (
        <ClearConfirmDialog
          onConfirm={resetTalks}
          onClose={() => setIsClearConfirmOpen(false)}
        />
      )}
    </main>
  );
}
