"use client";

import { List, Pencil, QrCode } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FlightBoardPanel } from "@/components/talks/FlightBoardPanel";
import { MyTimetableQrDialog } from "@/components/talks/MyTimetableQrDialog";
import { Button } from "@/components/ui/button";
import { getTalksByDateFromIds, myTimetableQuery } from "@/utils/myTimetable";

export default function YourTimetablePage() {
  const searchParams = useSearchParams();
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");

  const { ids } = useMemo(
    () => myTimetableQuery.parse(searchParams),
    [searchParams],
  );

  const talksByDate = useMemo(() => getTalksByDateFromIds(ids), [ids]);
  const queryString = searchParams.toString();

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
            onClick={() => setIsQrOpen(true)}
            aria-label="QRコードを表示"
            title="QRコードを表示"
          >
            <QrCode size={18} />
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
    </main>
  );
}
