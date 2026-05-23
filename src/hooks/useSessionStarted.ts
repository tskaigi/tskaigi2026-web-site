import { useSyncExternalStore } from "react";

// useAskTheSpeakerActive と同じパターンで、購読者がいる間だけ 1 秒ティッカーを回し、
// 各セッションの「開始時刻を過ぎたか」を共有 nowMs から判定する。
// 値で比較されるため、開始時刻を跨いだ瞬間以外は再レンダリングされない。
let nowMs = Date.now();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  if (timer === null) {
    timer = setInterval(() => {
      nowMs = Date.now();
      for (const l of listeners) l();
    }, 1000);
  }
  return () => {
    listeners.delete(onStoreChange);
    if (listeners.size === 0 && timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };
}

/**
 * セッションの開始時刻を過ぎているかを返すフック。
 * @param startTimeSec timetable のセル定義と同じく Unix 秒
 *
 * SSR 時はハイドレーション差分を避けるため常に false を返す
 * （初回描画は「開始前」扱い、マウント後に現在時刻で更新）。
 */
export function useSessionStarted(startTimeSec: number): boolean {
  return useSyncExternalStore(
    subscribe,
    () => nowMs >= startTimeSec * 1000,
    () => false,
  );
}
