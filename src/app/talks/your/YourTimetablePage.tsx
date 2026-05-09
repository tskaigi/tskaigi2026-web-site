"use client";

import { List, Pencil, Plane } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { FlightBoardTimetable } from "@/components/talks/FlightBoardTimetable";
import { TalkDetailDrawer } from "@/components/talks/TalkDetailDrawer";
import { TimelineColumn } from "@/components/talks/TimelineColumn";
import {
  DesktopTimelineLayout,
  MobileTimelineLayout,
} from "@/components/talks/TimelineLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { EventDate } from "@/types/timetable-api";
import {
  getTalksByDateFromIds,
  myTimetableQuery,
  type TalkWithMinutes,
} from "@/utils/myTimetable";

function FlightBoardDialog({
  day1Talks,
  day2Talks,
  onClose,
}: {
  day1Talks: TalkWithMinutes[];
  day2Talks: TalkWithMinutes[];
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[86vh] max-w-6xl overflow-y-auto pt-12 md:pt-14">
        <DialogTitle className="sr-only">フライトボード</DialogTitle>
        <FlightBoardTimetable
          day1Talks={day1Talks}
          day2Talks={day2Talks}
          className="mt-0"
        />
      </DialogContent>
    </Dialog>
  );
}

export default function YourTimetablePage() {
  const searchParams = useSearchParams();
  const [currentEventDate, setCurrentEventDate] = useState<EventDate>("Day1");
  const [drawerTalk, setDrawerTalk] = useState<TalkWithMinutes | null>(null);
  const [isFlightBoardOpen, setIsFlightBoardOpen] = useState(false);

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
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setIsFlightBoardOpen(true)}
            aria-label="フライトボードを表示"
            title="フライトボードを表示"
          >
            <Plane size={18} />
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
                onTalkClick={setDrawerTalk}
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
                  onTalkClick={setDrawerTalk}
                />
              }
              day2Column={
                <TimelineColumn
                  eventDate="Day2"
                  talks={talksByDate.Day2}
                  participatedIds={participatedIds}
                  onTalkClick={setDrawerTalk}
                />
              }
            />
          </div>
        </div>
      </div>

      <TalkDetailDrawer talk={drawerTalk} onClose={() => setDrawerTalk(null)} />

      {isFlightBoardOpen && (
        <FlightBoardDialog
          day1Talks={talksByDate.Day1}
          day2Talks={talksByDate.Day2}
          onClose={() => setIsFlightBoardOpen(false)}
        />
      )}
    </main>
  );
}
