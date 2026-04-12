"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { DayTimeTable } from "@/components/talks/DayTimeTable";
import { EventDateTab } from "@/components/talks/EventDateTab";
import { Button } from "@/components/ui/button";
import type { EventDate } from "@/constants/talkList";
import { timetableList } from "@/constants/timetable";

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
      ? "DAY2"
      : "DAY1"
    : isDay2
      ? "DAY2"
      : "DAY1";

  const [currentEventDate, setCurrentEventDate] =
    useState<EventDate>(defaultDay);

  const handleTabChange = (date: EventDate) => {
    setCurrentEventDate(date);
    const day = date === "DAY1" ? "1" : "2";
    const params = new URLSearchParams(searchParams.toString());
    params.set("day", day);
    router.replace(`?${params.toString()}`);
  };

  const dayData =
    currentEventDate === "DAY1" ? timetableList[0] : timetableList[1];

  return (
    <main className="bg-blue-light-100 mt-16 py-10 px-1 md:py-16 md:px-3 lg:px-10">
      <h1 className="text-2xl font-bold text-blue-light-500 text-center md:text-3xl lg:text-4xl">
        タイムテーブル
      </h1>
      <div className="text-center mt-4">
        <Button type="button" variant="outline" asChild>
          <Link href="/talks/me">マイタイムテーブルへ</Link>
        </Button>
      </div>
      <div className="text-center mt-8">
        <EventDateTab
          currentDate={currentEventDate}
          onTabChange={handleTabChange}
        />
      </div>

      <div className="overflow-x-auto mt-10">
        <div className="min-w-full">
          <DayTimeTable data={dayData} />
        </div>
      </div>
    </main>
  );
};

export default TalksPage;
