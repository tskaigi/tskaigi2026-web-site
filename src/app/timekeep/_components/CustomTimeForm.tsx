"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/ui/input";

type Props = {
  /** 持ち時間（分。秒は小数で含む）を確定する。 */
  onApply: (minutes: number) => void;
};

const PRESET_MINUTES = [3, 5, 10, 15, 30];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function CustomTimeForm({ onApply }: Props) {
  const [minutes, setMinutes] = useState("10");
  const [seconds, setSeconds] = useState("0");

  const parsedMinutes = clamp(Number.parseInt(minutes, 10) || 0, 0, 999);
  const parsedSeconds = clamp(Number.parseInt(seconds, 10) || 0, 0, 59);
  const totalMinutes = parsedMinutes + parsedSeconds / 60;

  const handleApply = () => {
    if (totalMinutes <= 0) return;
    onApply(totalMinutes);
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-bold text-blue-light-600">
        時間を自由に設定
      </h3>

      <div className="flex flex-wrap gap-2">
        {PRESET_MINUTES.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onApply(preset)}
            className="rounded-full border border-blue-light-300 bg-white px-3 py-1 text-sm font-medium text-blue-light-600 transition-colors hover:border-blue-light-400"
          >
            {preset}分
          </button>
        ))}
      </div>

      <div className="flex items-end gap-2">
        <div className="flex flex-1 flex-col gap-1 text-xs text-black-500">
          <label htmlFor="timekeep-custom-minutes">分</label>
          <Input
            id="timekeep-custom-minutes"
            type="number"
            inputMode="numeric"
            min={0}
            max={999}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
          />
        </div>
        <div className="flex flex-1 flex-col gap-1 text-xs text-black-500">
          <label htmlFor="timekeep-custom-seconds">秒</label>
          <Input
            id="timekeep-custom-seconds"
            type="number"
            inputMode="numeric"
            min={0}
            max={59}
            value={seconds}
            onChange={(e) => setSeconds(e.target.value)}
          />
        </div>
        <Button
          type="button"
          onClick={handleApply}
          disabled={totalMinutes <= 0}
        >
          セット
        </Button>
      </div>
    </div>
  );
}
