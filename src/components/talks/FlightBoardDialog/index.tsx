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

      const blob = await domToBlob(timetableRef.current, {
        backgroundColor: "#0a0a0b",
        height: timetableRef.current.scrollHeight,
        scale: Math.min(window.devicePixelRatio || 1, 2),
        width: timetableRef.current.scrollWidth,
      });

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
      <DialogContent className="max-h-[86vh] max-w-6xl overflow-y-auto pt-12 md:pt-14">
        <DialogTitle className="sr-only">フライトボード</DialogTitle>
        <div ref={timetableRef}>
          <FlightBoardTimetable
            day1Talks={day1Talks}
            day2Talks={day2Talks}
            className="mt-0"
          />
        </div>
        <div className="mt-4 flex justify-end">
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
      </DialogContent>
    </Dialog>
  );
}
