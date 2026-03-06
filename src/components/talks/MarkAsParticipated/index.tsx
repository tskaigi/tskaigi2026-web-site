"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { showAppToast } from "@/components/ui/GlobalToast";
import {
  markAsParticipated,
  readMyParticipatedIds,
} from "@/utils/myTimetable";

type Props = {
  talkId: string;
};

export function MarkAsParticipated({ talkId }: Props) {
  const searchParams = useSearchParams();
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    if (processed) return;
    if (searchParams.get("come") !== "true") return;

    const alreadyParticipated = readMyParticipatedIds().includes(talkId);
    if (alreadyParticipated) {
      setProcessed(true);
      return;
    }

    markAsParticipated(talkId);
    window.dispatchEvent(new Event("my-timetable-updated"));
    showAppToast("参加を記録しました");
    setProcessed(true);
  }, [searchParams, talkId, processed]);

  return null;
}
