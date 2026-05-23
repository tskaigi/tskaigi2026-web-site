"use client";

import { useCallback, useEffect, useRef } from "react";

// 呼び出し用の卓上チンベルをイメージした明るい金属音。基音は高め。
const FUNDAMENTAL_HZ = 1320;

// 金属棒（グロッケン）系のモード比。明るく金属的な「チンッ」になる。
// { 周波数比, 音量, 減衰秒数 }。高次ほど速く減衰させて打撃感を出す。
const PARTIALS = [
  { ratio: 1, gain: 1.0, decay: 1.6 },
  { ratio: 2.76, gain: 0.6, decay: 1.0 },
  { ratio: 5.4, gain: 0.4, decay: 0.6 },
  { ratio: 8.93, gain: 0.25, decay: 0.35 },
  { ratio: 13.34, gain: 0.12, decay: 0.15 },
];

const MASTER_GAIN = 0.4;
const ATTACK_SECONDS = 0.002;

/**
 * Web Audio API で合成したベル音を鳴らすフック。音源ファイルを持たないので
 * ライセンス不要・オフラインで動作する。AudioContext は再利用する。
 */
export type Bell = {
  /** ベルを鳴らす。 */
  play: () => void;
  /**
   * AudioContext を生成・再開しておく。ブラウザの自動再生制限を避けるため、
   * 0秒での自動再生に備えてユーザー操作（スタート押下など）の中で呼ぶ。
   */
  unlock: () => void;
};

export function useBell(): Bell {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      ctxRef.current?.close();
      ctxRef.current = null;
    };
  }, []);

  const ensureCtx = useCallback(() => {
    if (typeof window === "undefined" || !window.AudioContext) return null;
    let ctx = ctxRef.current;
    if (!ctx) {
      ctx = new AudioContext();
      ctxRef.current = ctx;
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  }, []);

  const play = useCallback(() => {
    const ctx = ensureCtx();
    if (!ctx) return;

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
  }, [ensureCtx]);

  const unlock = useCallback(() => {
    ensureCtx();
  }, [ensureCtx]);

  return { play, unlock };
}
