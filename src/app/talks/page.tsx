"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { DayTimeTable } from "@/components/talks/DayTimeTable";
import { EventDateTab } from "@/components/talks/EventDateTab";
import { FloatingNavButtons } from "@/components/talks/FloatingNavButtons";
import { StartTourButton } from "@/components/talks/Tour";
import { Button } from "@/components/ui/button";
import { timetableList } from "@/constants/timetable";
import type { EventDate } from "@/types/timetable-api";

const TalksPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const eventDayParam = searchParams.get("day");

  const currentDate = new Date();
  const isDay2 =
    currentDate.getFullYear() === 2026 &&
    currentDate.getMonth() === 4 &&
    currentDate.getDate() === 24;

  const defaultDay: EventDate = eventDayParam
    ? eventDayParam === "2"
      ? "Day2"
      : "Day1"
    : isDay2
      ? "Day2"
      : "Day1";

  const [currentEventDate, setCurrentEventDate] =
    useState<EventDate>(defaultDay);

  const handleTabChange = (date: EventDate) => {
    setCurrentEventDate(date);
    const day = date === "Day1" ? "1" : "2";
    const params = new URLSearchParams(searchParams.toString());
    params.set("day", day);
    router.replace(`?${params.toString()}`);
  };

  const dayData =
    currentEventDate === "Day1" ? timetableList[0] : timetableList[1];

  const [scrollState, setScrollState] = useState<{
    showScrollButton: boolean;
    scrollToCurrentSession: () => void;
  }>({ showScrollButton: false, scrollToCurrentSession: () => {} });

  const handleScrollStateChange = useCallback(
    (state: {
      showScrollButton: boolean;
      scrollToCurrentSession: () => void;
    }) => {
      setScrollState(state);
    },
    [],
  );

  return (
    <main className="bg-blue-light-100 mt-16 py-10 px-1 md:py-16 md:px-3 lg:px-10">
      <h1 className="text-2xl font-bold text-blue-light-500 text-center md:text-3xl lg:text-4xl">
        タイムテーブル
      </h1>
      <div className="text-center mt-8 flex flex-col items-center gap-4">
        <EventDateTab
          currentDate={currentEventDate}
          onTabChange={handleTabChange}
        />
        <StartTourButton />
      </div>

      <div className="overflow-x-auto mt-10">
        <div className="min-w-full">
          <DayTimeTable
            data={dayData}
            onScrollStateChange={handleScrollStateChange}
          />
        </div>
      </div>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {scrollState.showScrollButton && (
          <Button
            type="button"
            className="rounded-full shadow-lg md:hidden"
            onClick={scrollState.scrollToCurrentSession}
          >
            現在のセッションにスクロールする
          </Button>
        )}
        <FloatingNavButtons />
      </div>
    </main>
  );
};

export default TalksPage;
