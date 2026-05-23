import { cn } from "@/lib/utils";
import type { TimekeepPhase } from "../useTimekeepTimer";

type Props = {
  phase: TimekeepPhase;
  remainingSeconds: number;
  phaseTotalSeconds: number;
  isFullscreen?: boolean;
};

function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

const SESSION_WARNING_THRESHOLD_SECONDS = 60;

function getAppearance(phase: TimekeepPhase, remainingSeconds: number) {
  if (phase === "ended") {
    return {
      label: "強制終了",
      container: "bg-red-700 text-white",
      bar: "bg-white/70",
      pulse: false,
    };
  }
  if (phase === "forced") {
    return {
      label: "強制終了まで",
      container: "bg-red-600 text-white",
      bar: "bg-white/80",
      pulse: true,
    };
  }
  if (remainingSeconds <= SESSION_WARNING_THRESHOLD_SECONDS) {
    return {
      label: "まもなく終了",
      container: "bg-orange-500 text-white",
      bar: "bg-white/80",
      pulse: false,
    };
  }
  return {
    label: "セッション終了まで",
    container: "bg-blue-light-500 text-white",
    bar: "bg-white/80",
    pulse: false,
  };
}

export function TimerDisplay({
  phase,
  remainingSeconds,
  phaseTotalSeconds,
  isFullscreen = false,
}: Props) {
  const { label, container, bar, pulse } = getAppearance(
    phase,
    remainingSeconds,
  );
  const progress =
    phaseTotalSeconds > 0
      ? Math.min(100, Math.max(0, (remainingSeconds / phaseTotalSeconds) * 100))
      : 0;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl shadow-[0_4px_6px_rgba(0,0,0,0.09)] transition-colors duration-300",
        isFullscreen ? "px-8 py-12" : "px-6 py-10 md:py-14",
        container,
      )}
    >
      <p
        className={cn(
          "text-center font-medium tracking-wide",
          isFullscreen ? "text-2xl md:text-4xl" : "text-base md:text-xl",
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-center font-semibold tabular-nums leading-none",
          isFullscreen
            ? "text-[22vw] md:text-[18vw]"
            : "text-8xl md:text-[9rem] lg:text-[11rem]",
          pulse && "motion-safe:animate-pulse",
        )}
      >
        {phase === "ended" ? "0:00" : formatClock(remainingSeconds)}
      </p>

      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-black/15",
          isFullscreen ? "mt-12 h-3" : "mt-8 h-2",
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-300",
            bar,
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
