"use client";

import { Download } from "lucide-react";
import { domToBlob } from "modern-screenshot";
import { useRef, useState } from "react";
import { FlightBoardTimetable } from "@/components/talks/FlightBoardTimetable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { TalkWithMinutes } from "@/utils/myTimetable";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  try {
    link.href = url;
    link.download = filename;
    link.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function FlightBoardDialog({
  day1Talks,
  day2Talks,
  onClose,
}: {
  day1Talks: TalkWithMinutes[];
  day2Talks: TalkWithMinutes[];
  onClose: () => void;
}) {
  const timetableRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!timetableRef.current || isDownloading) return;

    setIsDownloading(true);

    try {
      await document.fonts?.ready;

      const timetableElement = timetableRef.current;
      const originalPadding = timetableElement.style.padding;
      let blob: Blob | null;

      try {
        timetableElement.style.padding = "12px";
        blob = await domToBlob(timetableElement, {
          backgroundColor: "#ffffff",
          height: timetableElement.scrollHeight,
          scale: Math.min(window.devicePixelRatio || 1, 2),
          width: timetableElement.scrollWidth,
        });
      } finally {
        timetableElement.style.padding = originalPadding;
      }

      if (!blob) throw new Error("時刻表画像の生成に失敗しました");

      downloadBlob(blob, "tskaigi-2026-my-timetable.png");
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "時刻表画像の生成に失敗しました",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[78vh] max-w-6xl overflow-hidden pt-12 sm:max-h-[86vh] md:pt-14">
        <DialogTitle className="sr-only">フライトボード</DialogTitle>
        <div className="max-h-[calc(78vh-4rem)] overflow-y-auto pr-1 sm:max-h-[calc(86vh-4rem)]">
          <div ref={timetableRef} className="rounded-xl bg-white p-1 sm:p-2">
            <FlightBoardTimetable
              day1Talks={day1Talks}
              day2Talks={day2Talks}
              className="mt-0 shadow-none"
            />
          </div>
          <div className="mt-3 flex justify-end px-1 pb-1 sm:px-2 sm:pb-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              <Download size={16} />
              {isDownloading ? "保存中..." : "画像として保存"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
