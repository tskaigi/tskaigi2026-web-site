"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import KeyVisualSvg from "./KeyVisualSvg";

gsap.registerPlugin(useGSAP);

const planeKey = ["blue", "red", "yellow", "green"] as const;
type PlaneKey = (typeof planeKey)[number];

// 対応関係:
// blue-plane  → dots-2, dots-4, cloud-2, cloud-4
// red-plane   → dots-1, cloud-1
// yellow-plane→ dots-3, cloud-3
// green-plane → dots-5, cloud-5
const queryList: Record<
  PlaneKey,
  {
    planeQuery: string;
    trails: string[];
    // 飛行機のスライドイン方向: 全て右下から侵入
    config: { x: number; y: number; delay: number };
  }
> = {
  blue: {
    planeQuery: "#blue-plane",
    trails: ["#dots-2", "#dots-4", "#cloud-2", "#cloud-4"],
    config: { x: 120, y: 80, delay: 0 },
  },
  red: {
    planeQuery: "#red-plane",
    trails: ["#dots-1", "#cloud-1"],
    config: { x: 120, y: 80, delay: 0.1 },
  },
  yellow: {
    planeQuery: "#yellow-plane",
    trails: ["#dots-3", "#cloud-3"],
    config: { x: 120, y: 80, delay: 0.2 },
  },
  green: {
    planeQuery: "#green-plane",
    trails: ["#dots-5", "#cloud-5"],
    config: { x: 120, y: 80, delay: 0.3 },
  },
};

export function KeyVisualAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const fadeInTargets = [
        container.querySelector("#tskaigi-logo"),
        container.querySelector("#date"),
        container.querySelector("#place"),
      ].filter(Boolean);

      // 初期状態: 全て非表示
      gsap.set(fadeInTargets, { opacity: 0 });

      const tl = gsap.timeline();

      // 飛行機スライドイン + 直後に対応する飛行機雲フェードイン
      for (const key of planeKey) {
        const { planeQuery, trails, config } = queryList[key];
        const plane = container.querySelector(planeQuery);

        if (!plane) continue;

        // 初期状態: 全て非表示
        gsap.set(plane, { x: config.x, y: config.y, opacity: 0 });

        const trail = trails
          .map((v) => container.querySelector(v))
          .filter(Boolean);

        // 初期状態: 全て非表示
        gsap.set(trail, { opacity: 0 });

        const vars = {
          x: 0,
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power2.out",
        };
        tl.to(plane, vars, config.delay);

        if (trail.length > 0) {
          const trailVars = { opacity: 1, duration: 0.7, ease: "power1.inOut" };
          tl.to(trail, trailVars, config.delay + 0.3);
        }
      }

      // tskaigi-logo, date, placeのフェードイン（1.4秒後から0.6秒かけて同時に）
      const logoVars = { opacity: 1, duration: 0.6, ease: "power1.inOut" };
      tl.to(fadeInTargets, logoVars, 1.3);
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className="w-full">
      <KeyVisualSvg width="100%" height="auto" style={{ display: "block" }} />
    </div>
  );
}
