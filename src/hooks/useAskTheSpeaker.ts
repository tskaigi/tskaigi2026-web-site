import { useSyncExternalStore } from "react";
import { isAskTheSpeakerActive } from "@/constants/askTheSpeaker";

// 全行で共有する 1 秒ティッカー。購読者がいる間だけ setInterval を回し、
// いなくなったら止める。各 SessionCard 行はこの now を見て自分の残り分を計算する。
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
 * 指定セッションが今 Ask the Speaker 受付中か。
 * getSnapshot が値で比較されるため、状態が変わる時(受付開始/終了)以外は再レンダリングされない。
 */
export function useAskTheSpeakerActive(sessionId: string): boolean {
  return useSyncExternalStore(
    subscribe,
    () => isAskTheSpeakerActive(sessionId, nowMs),
    () => false, // SSR 時はバッジを出さない(ハイドレーション差分回避)
  );
}
