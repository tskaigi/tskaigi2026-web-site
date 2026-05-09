import type {
  Cell,
  CellContent,
  SessionKey,
  TimetableListResponse,
  TimetableResponse,
  Track,
  TrackKey,
} from "@/types/timetable-api";

export const TRACK: Record<TrackKey, Track> = {
  LEVERAGES: {
    id: "LEVERAGES",
    name: "Leveragesトラック",
    hashtag: "#tskaigi_leverages",
  },
  UPSIDER: {
    id: "UPSIDER",
    name: "UPSIDERトラック",
    hashtag: "#tskaigi_upsider",
  },
  RIGHTTOUCH: {
    id: "RIGHTTOUCH",
    name: "RightTouchトラック",
    hashtag: "#tskaigi_righttouch",
  },
};

const ALL_TRACKS: TrackKey[] = ["LEVERAGES", "UPSIDER", "RIGHTTOUCH"];

/** 2026-05-22T00:00:00+09:00 in unix seconds */
const DAY1_BASE = 1779375600;
/** 2026-05-23T00:00:00+09:00 in unix seconds */
const DAY2_BASE = 1779462000;

/** HH:MM → unix timestamp (seconds) */
const d1 = (h: number, m: number) => DAY1_BASE + h * 3600 + m * 60;
const d2 = (h: number, m: number) => DAY2_BASE + h * 3600 + m * 60;

/** 全トラック共通の1ラベルセル(旧 shared slot)。常に muted (グレー) で描画。 */
const shared = (start: number, end: number, label: string): Cell => ({
  startTime: start,
  endTime: end,
  trackKeys: ALL_TRACKS,
  content: { type: "labeled", label, muted: true },
});

/** 同一行(start-end)で各トラックに別々の content を置く展開ヘルパ */
const row = (
  start: number,
  end: number,
  trackKeys: Partial<Record<TrackKey, CellContent>>,
): Cell[] =>
  ALL_TRACKS.flatMap((k) => {
    const content = trackKeys[k];
    if (!content) return [];
    return [{ startTime: start, endTime: end, trackKeys: [k], content }];
  });

const session = (sessionType: SessionKey, ids: string[]): CellContent => ({
  type: "session",
  sessionType,
  sessions: ids.map((id) => ({ id })),
});

const day1: TimetableResponse = {
  day: "Day1",
  date: "2026-05-22",
  trackRecord: TRACK,
  cells: [
    shared(d1(10, 0), d1(10, 40), "一般開場"),
    ...row(d1(10, 40), d1(11, 0), {
      LEVERAGES: { type: "labeled", label: "オープニングトーク" },
      UPSIDER: { type: "labeled", label: "サテライト" },
      RIGHTTOUCH: { type: "closed" },
    }),
    shared(d1(11, 0), d1(11, 10), "休憩"),
    ...row(d1(11, 10), d1(11, 40), {
      LEVERAGES: session("LONG", ["2"]),
      UPSIDER: session("LONG", ["3"]),
      RIGHTTOUCH: session("LONG", ["4"]),
    }),
    shared(d1(11, 40), d1(11, 50), "休憩"),
    ...row(d1(11, 50), d1(12, 20), {
      LEVERAGES: session("LONG", ["5"]),
      UPSIDER: session("LONG", ["6"]),
      RIGHTTOUCH: session("LONG", ["7"]),
    }),
    shared(d1(12, 20), d1(12, 30), "ランチ配布"),
    shared(d1(12, 30), d1(13, 30), "ランチ"),
    shared(d1(13, 30), d1(13, 40), "休憩"),

    // 13:40-15:40 RIGHTTOUCH ハンズオン (5スロット縦ぶち抜き)
    {
      startTime: d1(13, 40),
      endTime: d1(15, 40),
      trackKeys: ["RIGHTTOUCH"],
      content: {
        type: "session",
        sessionType: "HANDSON",
        sessions: [{ id: "1" }],
        displayLabel: "ハンズオン",
        link: "https://typescript-jpc.connpass.com/event/392953/",
      },
    },
    // 13:40-14:10 LONG x2 (RIGHTTOUCHはハンズオンに覆われる)
    ...row(d1(13, 40), d1(14, 10), {
      LEVERAGES: session("LONG", ["8"]),
      UPSIDER: session("LONG", ["9"]),
    }),
    // 14:10-14:20 休憩 (L+U横ぶち抜き)
    {
      startTime: d1(14, 10),
      endTime: d1(14, 20),
      trackKeys: ["LEVERAGES", "UPSIDER"],
      content: { type: "labeled", label: "休憩", muted: true },
    },
    // 14:20-14:50 SHORT x3 (L) + SHORT x3 (U)
    ...row(d1(14, 20), d1(14, 50), {
      LEVERAGES: session("SHORT", ["10", "11", "12"]),
      UPSIDER: session("SHORT", ["13", "14", "15"]),
    }),
    // 14:50-15:10 休憩 (L+U横ぶち抜き)
    {
      startTime: d1(14, 50),
      endTime: d1(15, 10),
      trackKeys: ["LEVERAGES", "UPSIDER"],
      content: { type: "labeled", label: "休憩", muted: true },
    },
    // 15:10-15:40 LONG x2
    ...row(d1(15, 10), d1(15, 40), {
      LEVERAGES: session("LONG", ["16"]),
      UPSIDER: session("LONG", ["17"]),
    }),

    shared(d1(15, 40), d1(15, 50), "休憩"),
    ...row(d1(15, 50), d1(16, 20), {
      LEVERAGES: session("LONG", ["18"]),
      UPSIDER: session("LONG", ["19"]),
      RIGHTTOUCH: session("LONG", ["20"]),
    }),
    shared(d1(16, 20), d1(16, 40), "休憩"),
    ...row(d1(16, 40), d1(17, 10), {
      LEVERAGES: session("LONG", ["21"]),
      UPSIDER: session("SHORT", ["22", "23", "24"]),
      RIGHTTOUCH: session("SHORT", ["25", "26", "27"]),
    }),
    shared(d1(17, 10), d1(17, 20), "休憩"),
    ...row(d1(17, 20), d1(17, 50), {
      LEVERAGES: session("SHORT", ["28", "29", "30"]),
      UPSIDER: session("SHORT", ["31", "32", "33"]),
      RIGHTTOUCH: session("SHORT", ["34", "35", "36"]),
    }),
    shared(d1(17, 50), d1(18, 10), "休憩"),
    ...row(d1(18, 10), d1(19, 0), {
      LEVERAGES: session("KEYNOTE", ["37"]),
      UPSIDER: { type: "labeled", label: "サテライト" },
      RIGHTTOUCH: { type: "closed" },
    }),
  ],
};

const day2: TimetableResponse = {
  day: "Day2",
  date: "2026-05-23",
  trackRecord: TRACK,
  cells: [
    shared(d2(10, 0), d2(10, 40), "一般開場"),
    ...row(d2(10, 40), d2(10, 50), {
      LEVERAGES: { type: "labeled", label: "オープニングトーク" },
      UPSIDER: { type: "labeled", label: "サテライト" },
      RIGHTTOUCH: { type: "closed" },
    }),
    shared(d2(10, 50), d2(11, 10), "休憩"),
    ...row(d2(11, 10), d2(11, 40), {
      LEVERAGES: session("LONG", ["38"]),
      UPSIDER: session("LONG", ["39"]),
      RIGHTTOUCH: session("LONG", ["40"]),
    }),
    shared(d2(11, 40), d2(11, 50), "休憩"),
    ...row(d2(11, 50), d2(12, 20), {
      LEVERAGES: session("SHORT", ["41", "42", "43"]),
      UPSIDER: session("SHORT", ["44", "45", "46"]),
      RIGHTTOUCH: session("SHORT", ["47", "48", "49"]),
    }),
    shared(d2(12, 20), d2(12, 30), "ランチ配布"),
    ...row(d2(12, 30), d2(13, 30), {
      LEVERAGES: session("SPONSOR", ["79", "77", "83", "81", "85"]),
      UPSIDER: session("SPONSOR", ["82", "80", "78", "86", "84"]),
      RIGHTTOUCH: { type: "labeled", label: "ランチ", muted: true },
    }),
    shared(d2(13, 30), d2(13, 40), "休憩"),
    ...row(d2(13, 40), d2(14, 10), {
      LEVERAGES: session("LONG", ["50"]),
      UPSIDER: session("LONG", ["51"]),
      RIGHTTOUCH: session("LONG", ["52"]),
    }),
    shared(d2(14, 10), d2(14, 20), "休憩"),
    ...row(d2(14, 20), d2(14, 50), {
      LEVERAGES: session("SHORT", ["53", "54", "55"]),
      UPSIDER: session("SHORT", ["56", "57", "58"]),
      RIGHTTOUCH: session("SHORT", ["59", "60", "61"]),
    }),
    shared(d2(14, 50), d2(15, 10), "休憩"),
    ...row(d2(15, 10), d2(15, 40), {
      LEVERAGES: session("LONG", ["62"]),
      UPSIDER: session("LONG", ["63"]),
      RIGHTTOUCH: session("LONG", ["64"]),
    }),
    shared(d2(15, 40), d2(15, 50), "休憩"),
    ...row(d2(15, 50), d2(16, 20), {
      LEVERAGES: session("LONG", ["65"]),
      UPSIDER: session("LONG", ["66"]),
      RIGHTTOUCH: session("LONG", ["67"]),
    }),
    shared(d2(16, 20), d2(16, 40), "休憩"),
    ...row(d2(16, 40), d2(17, 10), {
      LEVERAGES: session("SHORT", ["68", "69", "70"]),
      UPSIDER: session("SHORT", ["71", "72", "73"]),
      RIGHTTOUCH: session("SHORT", ["74", "75", "76"]),
    }),
    shared(d2(17, 10), d2(17, 20), "休憩"),

    // 17:20-18:40 L+U 懇親会準備 (横+縦のぶち抜き)
    {
      startTime: d2(17, 20),
      endTime: d2(18, 40),
      trackKeys: ["LEVERAGES", "UPSIDER"],
      content: { type: "labeled", label: "懇親会準備" },
    },
    // 17:20-18:30 RIGHTTOUCH 参加者体験企画
    {
      startTime: d2(17, 20),
      endTime: d2(18, 30),
      trackKeys: ["RIGHTTOUCH"],
      content: {
        type: "labeled",
        label: "OST(Open Space Technology)",
        link: "/talks/ost",
      },
    },
    // 18:40-20:40 L+U 懇親会
    {
      startTime: d2(18, 40),
      endTime: d2(20, 40),
      trackKeys: ["LEVERAGES", "UPSIDER"],
      content: { type: "labeled", label: "懇親会" },
    },
    // 18:30-20:40 RIGHTTOUCH closed
    {
      startTime: d2(18, 30),
      endTime: d2(20, 40),
      trackKeys: ["RIGHTTOUCH"],
      content: { type: "closed" },
    },
  ],
};

export const timetableList: TimetableListResponse = [day1, day2];
