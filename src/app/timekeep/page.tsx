"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { TALK_TYPE } from "@/constants/timetable";
import {
  getTimekeepSessions,
  type TimekeepSession,
} from "@/utils/getTimekeepSessions";
import { SessionPicker } from "./_components/SessionPicker";
import { TimerDisplay } from "./_components/TimerDisplay";
import {
  FORCED_TERMINATION_MINUTES,
  useTimekeepTimer,
} from "./useTimekeepTimer";

export default function TimekeepPage() {
  const sessions = useMemo(() => getTimekeepSessions(), []);
  const [selected, setSelected] = useState<TimekeepSession | null>(null);

  const timer = useTimekeepTimer(selected?.durationMinutes ?? 0, selected?.id);

  const startLabel = timer.isRunning
    ? "一時停止"
    : timer.phase === "session" &&
        timer.remainingSeconds === (selected?.durationMinutes ?? 0) * 60
      ? "スタート"
      : "再開";

  return (
    <main className="bg-blue-light-100 flex-1 px-4 pt-20 pb-16">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <header className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-bold text-blue-light-500 md:text-3xl">
            タイムキーパー
          </h1>
          <p className="text-sm text-black-500">
            セッションを選ぶと持ち時間をカウントダウンします。0になると一律で
            「強制終了まで{FORCED_TERMINATION_MINUTES}分」のカウントダウンに
            切り替わります。
          </p>
        </header>

        {selected ? (
          <div className="rounded-xl border border-blue-light-300 bg-white p-4">
            <div className="flex items-center gap-2 text-xs text-black-400">
              <span
                className="rounded-full px-2 py-0.5 font-medium text-white"
                style={{
                  backgroundColor: TALK_TYPE[selected.sessionType].color,
                }}
              >
                {TALK_TYPE[selected.sessionType].name}
              </span>
              <span className="tabular-nums">{selected.cellTime}</span>
              <span className="ml-auto font-semibold text-blue-light-600">
                持ち時間 {selected.durationMinutes}分
              </span>
            </div>
            <p className="mt-2 text-base font-bold text-black-600">
              {selected.title}
            </p>
            <p className="mt-0.5 text-sm text-black-400">
              {selected.trackName}
              {selected.speaker && ` ・ ${selected.speaker}`}
            </p>
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-blue-light-300 bg-white p-6 text-center text-sm text-black-400">
            下のリストからセッションを選択してください。
          </p>
        )}

        {selected && (
          <>
            <TimerDisplay
              phase={timer.phase}
              remainingSeconds={timer.remainingSeconds}
              phaseTotalSeconds={timer.phaseTotalSeconds}
            />
            <div className="flex gap-3">
              <Button
                type="button"
                size="lg"
                className="flex-1"
                disabled={timer.phase === "ended"}
                onClick={timer.isRunning ? timer.pause : timer.start}
              >
                {startLabel}
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="flex-1"
                onClick={timer.reset}
              >
                リセット
              </Button>
            </div>
          </>
        )}

        <SessionPicker
          sessions={sessions}
          selectedId={selected?.id ?? null}
          onSelect={setSelected}
        />
      </div>
    </main>
  );
}
