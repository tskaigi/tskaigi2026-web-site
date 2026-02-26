"use client";

import { AlertTriangle, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { showAppToast } from "@/components/ui/GlobalToast";
import {
  findOverlaps,
  readMyTimetableIds,
  type TalkWithMinutes,
  writeMyTimetableIds,
} from "@/utils/myTimetable";

type Props = {
  talkId: string;
  iconOnly?: boolean;
};

export function AddToMyTimetableButton({ talkId, iconOnly = false }: Props) {
  const [storedIds, setStoredIds] = useState<string[]>([]);
  const [overlaps, setOverlaps] = useState<TalkWithMinutes[]>([]);

  useEffect(() => {
    const update = () => setStoredIds(readMyTimetableIds());

    update();
    window.addEventListener("storage", update);
    window.addEventListener("my-timetable-updated", update);

    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("my-timetable-updated", update);
    };
  }, []);

  const isAdded = useMemo(
    () => storedIds.includes(talkId),
    [storedIds, talkId],
  );

  const closeOverlapDialog = () => {
    setOverlaps([]);
  };

  const addWithoutOverlapResolution = () => {
    const nextIds = Array.from(new Set([...readMyTimetableIds(), talkId]));
    writeMyTimetableIds(nextIds);
    setStoredIds(nextIds);
    window.dispatchEvent(new Event("my-timetable-updated"));
    showAppToast("重複したまま追加しました");
    closeOverlapDialog();
  };

  const handleClick = () => {
    const currentIds = readMyTimetableIds();

    if (isAdded) {
      const nextIds = currentIds.filter((id) => id !== talkId);
      writeMyTimetableIds(nextIds);
      setStoredIds(nextIds);
      window.dispatchEvent(new Event("my-timetable-updated"));
      showAppToast("マイタイムテーブルから削除しました");
      return;
    }

    const foundOverlaps = findOverlaps(talkId, currentIds);
    if (foundOverlaps.length > 0) {
      setOverlaps(foundOverlaps);
      return;
    }

    const nextIds = Array.from(new Set([...currentIds, talkId]));
    writeMyTimetableIds(nextIds);
    setStoredIds(nextIds);
    window.dispatchEvent(new Event("my-timetable-updated"));
    showAppToast("マイタイムテーブルに追加しました");
  };

  const overlapDialog = overlaps.length > 0 && (
    <div className="fixed inset-0 z-[70] bg-black/40 p-4 flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0"
        onClick={closeOverlapDialog}
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
              重複中のトークはそのまま残して追加できます。
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-black-300 p-3">
          <p className="text-sm font-bold">重複中のトーク</p>
          <div className="mt-2 flex flex-col gap-2">
            {overlaps.map((talk) => (
              <div
                key={`overlap-button-${talk.id}`}
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
          <Button type="button" variant="outline" onClick={closeOverlapDialog}>
            キャンセル
          </Button>
          <Button type="button" onClick={addWithoutOverlapResolution}>
            重複したまま追加
          </Button>
        </div>
      </section>
    </div>
  );

  if (iconOnly) {
    return (
      <>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleClick}
          aria-label={
            isAdded ? "マイタイムテーブルから削除" : "マイタイムテーブルに追加"
          }
          title={
            isAdded ? "マイタイムテーブルから削除" : "マイタイムテーブルに追加"
          }
        >
          {isAdded ? <X size={16} /> : <Plus size={16} />}
        </Button>
        {overlapDialog}
      </>
    );
  }

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={handleClick}>
        {isAdded ? "マイタイムテーブルから削除" : "マイタイムテーブルに追加"}
      </Button>
      {overlapDialog}
    </>
  );
}
