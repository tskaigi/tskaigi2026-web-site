"use client";

import { CalendarCheck, Check, Square, SquareCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useMarkAsParticipated } from "@/hooks/useMarkAsParticipated";
import { myParticipatedIds, myTimetableIds } from "@/utils/myTimetable";

export function TalkStatus({ talkId }: { talkId: string }) {
  useMarkAsParticipated(talkId);

  const [isScheduled, setIsScheduled] = useState(false);
  const [isParticipated, setIsParticipated] = useState(false);

  useEffect(() => {
    const update = () => {
      setIsScheduled(myTimetableIds.read().includes(talkId));
      setIsParticipated(myParticipatedIds.read().includes(talkId));
    };

    update();
    window.addEventListener("storage", update);
    window.addEventListener("my-timetable-updated", update);

    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("my-timetable-updated", update);
    };
  }, [talkId]);

  return (
    <>
      {isParticipated && (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">
          <Check size={14} />
          参加済み
        </span>
      )}
      {isScheduled && !isParticipated && (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-purple-200 px-2.5 py-1 text-xs font-bold text-blue-purple-700">
          <CalendarCheck size={14} />
          参加予定
        </span>
      )}
    </>
  );
}

export function ToggleParticipatedButton({ talkId }: { talkId: string }) {
  const [isParticipated, setIsParticipated] = useState(false);

  useEffect(() => {
    const update = () => {
      setIsParticipated(myParticipatedIds.read().includes(talkId));
    };

    update();
    window.addEventListener("storage", update);
    window.addEventListener("my-timetable-updated", update);

    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("my-timetable-updated", update);
    };
  }, [talkId]);

  const toggle = () => {
    const current = myParticipatedIds.read();
    const next = isParticipated
      ? current.filter((id) => id !== talkId)
      : [...current, talkId];
    myParticipatedIds.write(next);
    setIsParticipated(!isParticipated);
    window.dispatchEvent(new Event("my-timetable-updated"));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold cursor-pointer bg-black-100 text-black-500 hover:bg-black-200"
    >
      {isParticipated ? <SquareCheck size={16} /> : <Square size={16} />}
      {isParticipated ? "参加記録を外す" : "参加記録を付ける"}
    </button>
  );
}
