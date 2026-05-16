"use client";

import { Download } from "lucide-react";
import { domToBlob } from "modern-screenshot";
import { useRef, useState } from "react";
import { FlightBoardTimetable } from "@/components/talks/FlightBoardTimetable";
import { Button } from "@/components/ui/button";
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

export function FlightBoardPanel({
  day1Talks,
  day2Talks,
  timetableClassName = "mt-0 shadow-none",
}: {
  day1Talks: TalkWithMinutes[];
  day2Talks: TalkWithMinutes[];
  timetableClassName?: string;
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
    <div className="rounded-xl bg-white p-3 sm:p-4">
      <div ref={timetableRef}>
        <FlightBoardTimetable
          day1Talks={day1Talks}
          day2Talks={day2Talks}
          className={timetableClassName}
        />
      </div>
      <div className="mt-3 flex justify-end">
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
  );
}
