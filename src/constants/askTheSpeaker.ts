import { timetableList } from "@/constants/timetable";

// Ask the Speaker 受付のルール:
//   - LONG(30分): そのセッション終了後、15分間。
//   - SHORT(10分): 個々の10分終了ではなく、3本をまとめた30分枠が終わってから、
//     その枠で対応可能なスピーカー全員の受付が一斉に15分間始まる。
// どちらも「セッションを含むセルの終了時刻(= 枠末)」が受付開始時刻になるため、
// timetable.ts のセル定義から自動導出する(時刻を二重管理しない)。

const ASK_THE_SPEAKER_WINDOW_MS = 15 * 60 * 1000;

/** セッションID → 受付開始時刻(unix ミリ秒)。セルの終了時刻から導出。 */
const sessionEndAtMs: Record<string, number> = (() => {
  const map: Record<string, number> = {};
  for (const day of timetableList) {
    for (const cell of day.cells) {
      if (cell.content.type !== "session") continue;
      for (const ref of cell.content.sessions) {
        map[ref.id] = cell.endTime * 1000;
      }
    }
  }
  return map;
})();

// Ask the Speaker 対応可能なセッションID。
// 出典: 運営シートをセッションのタイトル/氏名で突き合わせて生成。
// 「対応不可」(10,14,24,55,67,68,71,74)・キーノート(37)・スポンサーセッション(77-86) は未掲載。
export const askTheSpeakerAvailableIds: ReadonlySet<string> = new Set([
  // Day1
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "11",
  "12",
  "13",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "25",
  "26",
  "27",
  "28",
  "29",
  "30",
  "31",
  "32",
  "33",
  "34",
  "35",
  "36",
  // Day2
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
  "46",
  "47",
  "48",
  "49",
  "50",
  "51",
  "52",
  "53",
  "54",
  "56",
  "57",
  "58",
  "59",
  "60",
  "61",
  "62",
  "63",
  "64",
  "65",
  "66",
  "69",
  "70",
  "72",
  "73",
  "75",
  "76",
]);

/**
 * 指定セッションが今 Ask the Speaker 受付中か。
 * 対応可能かつ、受付開始(枠末)から ASK_THE_SPEAKER_WINDOW_MS の間だけ true。
 */
export function isAskTheSpeakerActive(
  sessionId: string,
  nowMs: number,
): boolean {
  if (!askTheSpeakerAvailableIds.has(sessionId)) return false;
  const startAt = sessionEndAtMs[sessionId];
  if (startAt === undefined) return false;
  return nowMs >= startAt && nowMs - startAt < ASK_THE_SPEAKER_WINDOW_MS;
}
