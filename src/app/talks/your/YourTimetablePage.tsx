"use client";

import { List, Pencil } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { TimelineColumn } from "@/components/talks/TimelineColumn";
import {
  DesktopTimelineLayout,
  MobileTimelineLayout,
} from "@/components/talks/TimelineLayout";
import { Button } from "@/components/ui/button";
import type { EventDate } from "@/types/timetable-api";
import { getTalksByDateFromIds, myTimetableQuery } from "@/utils/myTimetable";

export default function YourTimetablePage() {
  const searchParams = useSearchParams();
  const [currentEventDate, setCurrentEventDate] = useState<EventDate>("Day1");

  const { ids, participatedIds } = useMemo(
    () => myTimetableQuery.parse(searchParams),
    [searchParams],
  );

  const talksByDate = useMemo(() => getTalksByDateFromIds(ids), [ids]);

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
          <Button type="button" variant="outline" size="icon" asChild>
            <Link
              href={`/talks/me${searchParams.toString() ? `?${searchParams.toString()}` : ""}`}
              aria-label="編集モードへ"
              title="編集モードへ"
            >
              <Pencil size={18} />
            </Link>
          </Button>
        </aside>
        <div>
          <div className="block lg:hidden">
            <MobileTimelineLayout
              currentEventDate={currentEventDate}
              onTabChange={setCurrentEventDate}
            >
              <TimelineColumn
                eventDate={currentEventDate}
                talks={talksByDate[currentEventDate]}
                participatedIds={participatedIds}
              />
            </MobileTimelineLayout>
          </div>

          <div className="hidden lg:block">
            <DesktopTimelineLayout
              day1Column={
                <TimelineColumn
                  eventDate="Day1"
                  talks={talksByDate.Day1}
                  participatedIds={participatedIds}
                />
              }
              day2Column={
                <TimelineColumn
                  eventDate="Day2"
                  talks={talksByDate.Day2}
                  participatedIds={participatedIds}
                />
              }
            />
          </div>
        </div>
      </div>
    </main>
  );
}
