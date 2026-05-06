"use client";

import Link from "next/link";
import { ToggleParticipatedButton } from "@/components/talks/TalkStatus";
import { Button } from "@/components/ui/button";
import { useDevelopMode } from "@/hooks/useDevelopMode";

export function DevelopModeToggleButton({ talkId }: { talkId: string }) {
  const isDevelop = useDevelopMode();
  if (!isDevelop) return null;
  return <ToggleParticipatedButton talkId={talkId} />;
}

export function DevelopModeFloatingButtons() {
  const isDevelop = useDevelopMode();
  if (!isDevelop) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex gap-2">
      <Button type="button" asChild className="rounded-full shadow-lg">
        <Link href="/talks/me">マイタイムテーブルへ</Link>
      </Button>
      <Button type="button" asChild className="rounded-full shadow-lg">
        <Link href="/talks">タイムテーブルへ</Link>
      </Button>
    </div>
  );
}
