// Day1 (2026-05-22) の Ask the Speaker 対応可否。
// 受付開始のルール:
//   - LONG(30分): そのセッション終了後、15分間。
//   - SHORT(10分): 個々の10分終了ではなく、3本をまとめた30分枠が終わってから、
//     その枠で対応可能なスピーカー全員の受付が一斉に15分間始まる。
// したがって SHORT は枠末(30分枠の終了時刻)を起点にする。
// 出典: 運営シートをスピーカー単位で突き合わせて生成。掲載 = 対応可能。
// 「対応不可」(10:たつかわ / 14:dowod / 24:中田) と キーノート(37) は出さないため未掲載。

/** 2026-05-22T00:00:00+09:00 を unix ミリ秒で表した基準 (timetable.ts の DAY1_BASE と同値) */
const DAY1_BASE_MS = 1779375600 * 1000;
const at = (h: number, m: number) => DAY1_BASE_MS + (h * 3600 + m * 60) * 1000;

export const ASK_THE_SPEAKER_WINDOW_MS = 15 * 60 * 1000;

/** セッションID → 受付開始時刻(unix ミリ秒)。掲載されているID = 対応可能。 */
export const askTheSpeakerStartAtMs: Record<string, number> = {
  // --- LONG (30分): セッション終了 = 受付開始 ---
  "2": at(11, 40),
  "3": at(11, 40),
  "4": at(11, 40),
  "5": at(12, 20),
  "6": at(12, 20),
  "7": at(12, 20),
  "8": at(14, 10),
  "9": at(14, 10),
  "16": at(15, 40),
  "17": at(15, 40),
  "18": at(16, 20),
  "19": at(16, 20),
  "20": at(16, 20),
  "21": at(17, 10),
  // --- SHORT (10分): 30分枠の終了後に一斉開始 ---
  // 14:20-14:50 枠 (10:たつかわ / 14:dowod は対応不可)
  "11": at(14, 50),
  "12": at(14, 50),
  "13": at(14, 50),
  "15": at(14, 50),
  // 16:40-17:10 枠 (24:中田 は対応不可)
  "22": at(17, 10),
  "23": at(17, 10),
  "25": at(17, 10),
  "26": at(17, 10),
  "27": at(17, 10),
  // 17:20-17:50 枠
  "28": at(17, 50),
  "29": at(17, 50),
  "30": at(17, 50),
  "31": at(17, 50),
  "32": at(17, 50),
  "33": at(17, 50),
  "34": at(17, 50),
  "35": at(17, 50),
  "36": at(17, 50),
};

/**
 * 指定セッションが今 Ask the Speaker 受付中か。
 * 受付開始から ASK_THE_SPEAKER_WINDOW_MS の間だけ true。
 * 対応不可/未掲載のセッションは常に false。
 */
export function isAskTheSpeakerActive(
  sessionId: string,
  nowMs: number,
): boolean {
  const startAt = askTheSpeakerStartAtMs[sessionId];
  if (startAt === undefined) return false;
  return nowMs >= startAt && nowMs - startAt < ASK_THE_SPEAKER_WINDOW_MS;
}
