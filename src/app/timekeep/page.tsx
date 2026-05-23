"use client";

import { Bell, Maximize, Minimize } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TALK_TYPE } from "@/constants/timetable";
import { cn } from "@/lib/utils";
import {
  getTimekeepSessions,
  type TimekeepSession,
} from "@/utils/getTimekeepSessions";
import { CustomTimeForm } from "./_components/CustomTimeForm";
import { SessionPicker } from "./_components/SessionPicker";
import { TimerDisplay } from "./_components/TimerDisplay";
import { useBell } from "./useBell";
import {
  FORCED_TERMINATION_MINUTES,
  useTimekeepTimer,
} from "./useTimekeepTimer";

type ActiveTimer =
  | { kind: "session"; session: TimekeepSession }
  | { kind: "custom"; minutes: number };

function formatCustomDuration(totalMinutes: number): string {
  const totalSeconds = Math.round(totalMinutes * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return seconds === 0 ? `${minutes}分` : `${minutes}分${seconds}秒`;
}

export default function TimekeepPage() {
  const sessions = useMemo(() => getTimekeepSessions(), []);
  const [active, setActive] = useState<ActiveTimer | null>(null);
  const [applyToken, setApplyToken] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);

  const durationMinutes =
    active === null
      ? 0
      : active.kind === "session"
        ? active.session.durationMinutes
        : active.minutes;
  const resetKey = active === null ? undefined : `${active.kind}-${applyToken}`;

  const timer = useTimekeepTimer(durationMinutes, resetKey);
  const {
    play: playBell,
    playDouble: playBellDouble,
    unlock: unlockBell,
  } = useBell();

  // 0秒到達でベルを鳴らす。セッション終了(→強制終了フェーズ)は1回、
  // 強制終了は短く2回（チンチン）。
  const prevPhaseRef = useRef(timer.phase);
  useEffect(() => {
    if (prevPhaseRef.current !== timer.phase) {
      if (timer.phase === "forced") {
        playBell();
      } else if (timer.phase === "ended") {
        playBellDouble();
      }
      prevPhaseRef.current = timer.phase;
    }
  }, [timer.phase, playBell, playBellDouble]);

  const fullscreenRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenSupported, setFullscreenSupported] = useState(false);

  useEffect(() => {
    setFullscreenSupported(document.fullscreenEnabled);
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      fullscreenRef.current?.requestFullscreen();
    }
  }, []);

  const applySession = useCallback((session: TimekeepSession) => {
    setActive({ kind: "session", session });
    setApplyToken((t) => t + 1);
    setPickerOpen(false);
  }, []);

  const applyCustom = useCallback((minutes: number) => {
    setActive({ kind: "custom", minutes });
    setApplyToken((t) => t + 1);
    setPickerOpen(false);
  }, []);

  const openPicker = useCallback(() => {
    // 全画面中はドロワーが見えないため、全画面を解除してから開く。
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    setPickerOpen(true);
  }, []);

  const initialSeconds = Math.round(durationMinutes * 60);
  const startLabel = timer.isRunning
    ? "一時停止"
    : timer.phase === "session" && timer.remainingSeconds === initialSeconds
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
            {`セッションを選ぶか時間を自由に設定するとカウントダウンします。0になると一律で「強制終了まで${FORCED_TERMINATION_MINUTES}分」のカウントダウンに切り替わります。`}
          </p>
        </header>

        <Sheet open={pickerOpen} onOpenChange={setPickerOpen}>
          <SheetContent
            side="right"
            className="flex w-full max-w-md flex-col gap-4 overflow-y-auto sm:max-w-md"
          >
            <SheetHeader>
              <SheetTitle>セッション・時間を設定</SheetTitle>
              <SheetDescription>
                {
                  "セッションを選ぶと持ち時間が自動で設定されます。時間を直接指定することもできます。"
                }
              </SheetDescription>
            </SheetHeader>
            <CustomTimeForm onApply={applyCustom} />
            <div className="h-px bg-black-200" />
            <SessionPicker
              sessions={sessions}
              selectedId={active?.kind === "session" ? active.session.id : null}
              onSelect={applySession}
            />
          </SheetContent>
        </Sheet>

        {active ? (
          <div
            ref={fullscreenRef}
            className={cn(
              "flex flex-col gap-6",
              isFullscreen &&
                "h-screen w-screen justify-center bg-blue-light-100 px-6",
            )}
          >
            {active.kind === "session" ? (
              <button
                type="button"
                onClick={openPicker}
                aria-label="セッション・時間を変更する"
                className="w-full cursor-pointer rounded-xl border border-blue-light-300 bg-white p-4 text-left transition-colors hover:border-blue-light-400"
              >
                <div className="flex items-center gap-2 text-xs text-black-400">
                  <span
                    className="rounded-full px-2 py-0.5 font-medium text-white"
                    style={{
                      backgroundColor:
                        TALK_TYPE[active.session.sessionType].color,
                    }}
                  >
                    {TALK_TYPE[active.session.sessionType].name}
                  </span>
                  <span className="tabular-nums">
                    {active.session.cellTime}
                  </span>
                  <span className="ml-auto font-semibold text-blue-light-600">
                    持ち時間 {active.session.durationMinutes}分
                  </span>
                </div>
                <p className="mt-2 text-base font-bold text-black-600">
                  {active.session.title}
                </p>
                <p className="mt-0.5 text-sm text-black-400">
                  {active.session.trackName}
                  {active.session.speaker && ` ・ ${active.session.speaker}`}
                </p>
              </button>
            ) : (
              <button
                type="button"
                onClick={openPicker}
                aria-label="セッション・時間を変更する"
                className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-blue-light-300 bg-white p-4 text-left transition-colors hover:border-blue-light-400"
              >
                <p className="text-base font-bold text-black-600">
                  カスタムタイマー
                </p>
                <span className="font-semibold text-blue-light-600">
                  持ち時間 {formatCustomDuration(active.minutes)}
                </span>
              </button>
            )}

            <TimerDisplay
              phase={timer.phase}
              remainingSeconds={timer.remainingSeconds}
              phaseTotalSeconds={timer.phaseTotalSeconds}
              isFullscreen={isFullscreen}
            />

            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <Button
                  type="button"
                  size="lg"
                  className="flex-1"
                  disabled={timer.phase === "ended"}
                  onClick={
                    timer.isRunning
                      ? timer.pause
                      : () => {
                          unlockBell();
                          timer.start();
                        }
                  }
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
              <div className="flex gap-3">
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={playBell}
                >
                  <Bell className="size-5" />
                  ベルを鳴らす
                </Button>
                {fullscreenSupported && (
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    onClick={toggleFullscreen}
                    aria-label={isFullscreen ? "全画面を終了" : "全画面表示"}
                  >
                    {isFullscreen ? (
                      <Minimize className="size-5" />
                    ) : (
                      <Maximize className="size-5" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={openPicker}
            className="w-full cursor-pointer rounded-xl border border-dashed border-blue-light-300 bg-white p-6 text-center text-sm text-black-400 transition-colors hover:border-blue-light-400 hover:text-blue-light-600"
          >
            セッションを選ぶか時間を設定するとタイマーが表示されます。
          </button>
        )}
      </div>
    </main>
  );
}
