"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type TimekeepPhase = "session" | "forced" | "ended";

/** セッション終了後、一律で確保する「強制終了まで」の猶予時間（分）。 */
export const FORCED_TERMINATION_MINUTES = 2;
const FORCED_TERMINATION_SECONDS = FORCED_TERMINATION_MINUTES * 60;

export type TimekeepTimer = {
  phase: TimekeepPhase;
  /** 現在のフェーズの残り秒数。 */
  remainingSeconds: number;
  /** 現在のフェーズの総秒数（プログレス表示用）。 */
  phaseTotalSeconds: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
};

/**
 * セッションの持ち時間をカウントダウンし、0 になったら一律で
 * 「強制終了まで2分」のカウントダウンへ自動的に切り替えるタイマー。
 *
 * 残り時間は実時刻（Date.now）からの差分で計算するため、タブが非アクティブに
 * なってもズレが蓄積しない。
 */
export function useTimekeepTimer(
  sessionMinutes: number,
  resetKey?: string,
): TimekeepTimer {
  const sessionSeconds = Math.max(0, Math.round(sessionMinutes * 60));

  const [phase, setPhase] = useState<TimekeepPhase>("session");
  const [remainingSeconds, setRemainingSeconds] = useState(sessionSeconds);
  const [isRunning, setIsRunning] = useState(false);

  // 実行中のフェーズが 0 になる実時刻（epoch ms）。停止中は null。
  const deadlineRef = useRef<number | null>(null);

  // セッション（持ち時間 or 選択中のセッション）が変わったら初期状態へ戻す。
  // biome-ignore lint/correctness/useExhaustiveDependencies: resetKey の変化でリセットしたい。
  useEffect(() => {
    setPhase("session");
    setRemainingSeconds(sessionSeconds);
    setIsRunning(false);
    deadlineRef.current = null;
  }, [sessionSeconds, resetKey]);

  useEffect(() => {
    if (!isRunning) return;

    const tick = () => {
      const deadline = deadlineRef.current;
      if (deadline === null) return;

      const remaining = Math.ceil((deadline - Date.now()) / 1000);
      if (remaining > 0) {
        setRemainingSeconds(remaining);
        return;
      }

      if (phase === "session") {
        deadlineRef.current = deadline + FORCED_TERMINATION_SECONDS * 1000;
        setPhase("forced");
        setRemainingSeconds(FORCED_TERMINATION_SECONDS);
        return;
      }

      // forced -> ended
      deadlineRef.current = null;
      setPhase("ended");
      setRemainingSeconds(0);
      setIsRunning(false);
    };

    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [isRunning, phase]);

  const start = useCallback(() => {
    if (isRunning || phase === "ended") return;
    deadlineRef.current = Date.now() + remainingSeconds * 1000;
    setIsRunning(true);
  }, [isRunning, phase, remainingSeconds]);

  const pause = useCallback(() => {
    deadlineRef.current = null;
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    deadlineRef.current = null;
    setIsRunning(false);
    setPhase("session");
    setRemainingSeconds(sessionSeconds);
  }, [sessionSeconds]);

  const phaseTotalSeconds =
    phase === "session" ? sessionSeconds : FORCED_TERMINATION_SECONDS;

  return {
    phase,
    remainingSeconds,
    phaseTotalSeconds,
    isRunning,
    start,
    pause,
    reset,
  };
}
