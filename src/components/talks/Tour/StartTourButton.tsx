"use client";

import { HelpCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useOnborda } from "onborda";
import { Button } from "@/components/ui/button";

export function StartTourButton({ iconOnly }: { iconOnly?: boolean }) {
  const { startOnborda } = useOnborda();
  const router = useRouter();
  const pathname = usePathname();

  const handleStart = () => {
    if (pathname !== "/talks") {
      router.push("/talks");
      const observer = new MutationObserver(() => {
        const el = document.querySelector("#tour-add-button");
        if (el) {
          observer.disconnect();
          startOnborda("my-timetable");
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      startOnborda("my-timetable");
    }
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
      使い方案内
    </Button>
  );
}
