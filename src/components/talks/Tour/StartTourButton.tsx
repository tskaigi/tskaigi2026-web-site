"use client";

import { HelpCircle } from "lucide-react";
import { useOnborda } from "onborda";
import { Button } from "@/components/ui/button";

export function StartTourButton({ iconOnly }: { iconOnly?: boolean }) {
  const { startOnborda } = useOnborda();

  const handleStart = () => {
    startOnborda("my-timetable");
  };

  if (iconOnly) {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleStart}
        aria-label="使い方"
        title="使い方"
      >
        <HelpCircle size={18} />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleStart}
      className="gap-1"
    >
      <HelpCircle size={16} />
      マイタイムテーブル機能使い方案内
    </Button>
  );
}
