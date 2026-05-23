import { getSessionMasterBySessionId } from "@/constants/sessionMaster";
import { timetableList } from "@/constants/timetable";
import type { EventDate, SessionKey, TrackKey } from "@/types/timetable-api";
import { myTimetable } from "@/utils/myTimetable";

export type TimekeepSession = {
  id: string;
  title: string;
  speaker: string;
  day: EventDate;
  track: TrackKey;
  trackName: string;
  sessionType: SessionKey;
  /** このセッション1本あたりの持ち時間（分）。 */
  durationMinutes: number;
  /** セル全体の時間帯（例: "11:10 ~ 11:40"）。 */
  cellTime: string;
};

/**
 * タイムテーブルから各セッションの持ち時間を導出する。
 *
 * 1つのセル（時間枠）に複数セッションが入る場合（10分セッション・スポンサー
 * セッションなど）は、セル全体の長さをセッション数で等分した値を1本あたりの
 * 持ち時間とする。
 */
export function getTimekeepSessions(): TimekeepSession[] {
  const sessions: TimekeepSession[] = [];

  for (const day of timetableList) {
    for (const cell of day.cells) {
      if (cell.content.type !== "session") continue;

      const { sessions: refs, sessionType, displayLabel } = cell.content;
      const totalMinutes = (cell.endTime - cell.startTime) / 60;
      const durationMinutes = Math.round(totalMinutes / refs.length);
      const cellTime = myTimetable.formatTimeRange(
        cell.startTime,
        cell.endTime,
      );
      const track = cell.trackKeys[0];
      const trackName = day.trackRecord[track].name;

      for (const ref of refs) {
        const master = getSessionMasterBySessionId(ref.id);
        sessions.push({
          id: ref.id,
          title: master?.title ?? displayLabel ?? `セッション ${ref.id}`,
          speaker: master?.speaker.name ?? "",
          day: day.day,
          track,
          trackName,
          sessionType,
          durationMinutes,
          cellTime,
        });
      }
    }
  }

  return sessions;
}
