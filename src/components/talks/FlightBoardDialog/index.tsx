"use client";

import { FlightBoardTimetable } from "@/components/talks/FlightBoardTimetable";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { TalkWithMinutes } from "@/utils/myTimetable";

export function FlightBoardDialog({
  day1Talks,
  day2Talks,
  onClose,
}: {
  day1Talks: TalkWithMinutes[];
  day2Talks: TalkWithMinutes[];
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[86vh] max-w-6xl overflow-y-auto pt-12 md:pt-14">
        <DialogTitle className="sr-only">フライトボード</DialogTitle>
        <FlightBoardTimetable
          day1Talks={day1Talks}
          day2Talks={day2Talks}
          className="mt-0"
        />
      </DialogContent>
    </Dialog>
  );
}
