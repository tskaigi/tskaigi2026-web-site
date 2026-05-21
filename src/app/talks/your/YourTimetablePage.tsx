"use client";

import { Download, Pencil, QrCode } from "lucide-react";
import { domToBlob } from "modern-screenshot";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlightBoardPanel } from "@/components/talks/FlightBoardPanel";
import { FloatingNavButtons } from "@/components/talks/FloatingNavButtons";
import { MyTimetableQrDialog } from "@/components/talks/MyTimetableQrDialog";
import { Button } from "@/components/ui/button";
import { getTalksByDateFromIds, myTimetableQuery } from "@/utils/myTimetable";

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

export default function YourTimetablePage() {
  const searchParams = useSearchParams();
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const timetableRef = useRef<HTMLDivElement>(null);

  const { ids } = useMemo(
    () => myTimetableQuery.parse(searchParams),
    [searchParams],
  );

  const talksByDate = useMemo(() => getTalksByDateFromIds(ids), [ids]);
  const queryString = searchParams.toString();

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

  useEffect(() => {
    if (typeof window !== "undefined") setBaseUrl(window.location.origin);
  }, []);

  const currentShareUrl =
    baseUrl.length > 0
      ? `${baseUrl}/talks/me${queryString.length > 0 ? `?${queryString}` : ""}`
      : "";
  const yourShareUrl =
    baseUrl.length > 0
      ? `${baseUrl}/talks/your${queryString.length > 0 ? `?${queryString}` : ""}`
      : "";

  return (
    <main className="bg-blue-light-100 mt-16 py-10 px-2 md:py-16 md:px-6 lg:px-10">
      <h1 className="text-2xl font-bold text-blue-light-500 text-center md:text-3xl lg:text-4xl">
        マイタイムテーブル
      </h1>

      <div className="mt-8 mx-auto max-w-6xl grid lg:grid-cols-[min-content_1fr] gap-4">
        <aside className="flex flex-row lg:flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setIsQrOpen(true)}
            aria-label="QRコードを表示"
            title="QRコードを表示"
          >
            <QrCode size={18} />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleDownload}
            disabled={isDownloading}
            aria-label="画像として保存"
            title="画像として保存"
          >
            <Download size={18} />
          </Button>
          <Button type="button" variant="outline" size="icon" asChild>
            <Link
              href="/talks/me"
              aria-label="編集モードへ"
              title="編集モードへ"
            >
              <Pencil size={18} />
            </Link>
          </Button>
        </aside>
        <div className="min-w-0">
          <FlightBoardPanel
            day1Talks={talksByDate.Day1}
            day2Talks={talksByDate.Day2}
            timetableRef={timetableRef}
          />
        </div>
      </div>

      {isQrOpen && (
        <MyTimetableQrDialog
          currentShareUrl={currentShareUrl}
          yourShareUrl={yourShareUrl}
          onClose={() => setIsQrOpen(false)}
        />
      )}

      <div className="fixed bottom-6 right-6 z-50 flex gap-2">
        <FloatingNavButtons />
      </div>
    </main>
  );
}
