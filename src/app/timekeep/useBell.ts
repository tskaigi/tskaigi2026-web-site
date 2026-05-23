"use client";

import { useCallback, useEffect, useRef } from "react";

const FUNDAMENTAL_HZ = 880;

// ベルらしい非整数次倍音の重ね合わせ。{ 周波数比, 音量, 減衰秒数 }。
const PARTIALS = [
  { ratio: 1, gain: 1.0, decay: 2.4 },
  { ratio: 2.0, gain: 0.5, decay: 1.8 },
  { ratio: 2.4, gain: 0.35, decay: 1.4 },
  { ratio: 3.0, gain: 0.25, decay: 1.2 },
  { ratio: 4.5, gain: 0.15, decay: 0.8 },
];

const MASTER_GAIN = 0.45;
const ATTACK_SECONDS = 0.005;

/**
 * Web Audio API で合成したベル音を鳴らすフック。音源ファイルを持たないので
 * ライセンス不要・オフラインで動作する。AudioContext は再利用する。
 */
export function useBell() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      ctxRef.current?.close();
      ctxRef.current = null;
    };
  }, []);

  return useCallback(() => {
    if (typeof window === "undefined" || !window.AudioContext) return;

    let ctx = ctxRef.current;
    if (!ctx) {
      ctx = new AudioContext();
      ctxRef.current = ctx;
    }
    // ユーザー操作で呼ばれる想定。サスペンド中なら再開する。
    if (ctx.state === "suspended") void ctx.resume();

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = MASTER_GAIN;
    master.connect(ctx.destination);

    for (const partial of PARTIALS) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = FUNDAMENTAL_HZ * partial.ratio;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(partial.gain, now + ATTACK_SECONDS);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + partial.decay);
      osc.connect(gain);
      gain.connect(master);
      osc.start(now);
      osc.stop(now + partial.decay + 0.05);
    }
  }, []);
}
