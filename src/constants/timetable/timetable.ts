import type {
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

/** 2026-05-22T00:00:00+09:00 in unix seconds */
const DAY1_BASE = 1779375600;
/** 2026-05-23T00:00:00+09:00 in unix seconds */
const DAY2_BASE = 1779462000;

/** HH:MM → unix timestamp (seconds) */
const d1 = (h: number, m: number) => DAY1_BASE + h * 3600 + m * 60;
const d2 = (h: number, m: number) => DAY2_BASE + h * 3600 + m * 60;

const day1: TimetableResponse = {
  day: "Day1",
  date: "2026-05-22",
  tracks: Object.values(TRACK),
  slots: [
    // 10:00–10:40 一般開場
    {
      slotType: "shared",
      startTime: d1(10, 0),
      endTime: d1(10, 40),
      label: "一般開場",
    },
    // 10:40–11:00 オープニングトーク / サテライト / クローズ
    {
      slotType: "individual",
      startTime: d1(10, 40),
      endTime: d1(11, 0),
      tracks: {
        LEVERAGES: { type: "other", label: "オープニングトーク" },
        UPSIDER: { type: "other", label: "サテライト" },
        RIGHTTOUCH: { type: "closed" },
      },
    },
    // 11:00–11:10 休憩
    {
      slotType: "shared",
      startTime: d1(11, 0),
      endTime: d1(11, 10),
      label: "休憩",
    },
    // 11:10–11:40 LONG x3
    {
      slotType: "individual",
      startTime: d1(11, 10),
      endTime: d1(11, 40),
      tracks: {
        LEVERAGES: {
          type: "session",
          sessionType: "LONG",
          sessions: [{ id: "2" }],
        },
        UPSIDER: {
          type: "session",
          sessionType: "LONG",
          sessions: [{ id: "3" }],
        },
        RIGHTTOUCH: {
          type: "session",
          sessionType: "LONG",
          sessions: [{ id: "4" }],
        },
      },
    },
    // 11:40–11:50 休憩
    {
      slotType: "shared",
      startTime: d1(11, 40),
      endTime: d1(11, 50),
      label: "休憩",
    },
    // 11:50–12:20 LONG x3
    {
      slotType: "individual",
      startTime: d1(11, 50),
      endTime: d1(12, 20),
      tracks: {
        LEVERAGES: {
          type: "session",
          sessionType: "LONG",
          sessions: [{ id: "5" }],
        },
        UPSIDER: {
          type: "session",
          sessionType: "LONG",
          sessions: [{ id: "6" }],
        },
        RIGHTTOUCH: {
          type: "session",
          sessionType: "LONG",
          sessions: [{ id: "7" }],
        },
      },
    },
    // 12:20–12:30 ランチ配布
    {
      slotType: "shared",
      startTime: d1(12, 20),
      endTime: d1(12, 30),
      label: "ランチ配布",
    },
    // 12:30–13:30 ランチ
    {
      slotType: "shared",
      startTime: d1(12, 30),
      endTime: d1(13, 30),
      label: "ランチ",
    },
    // 13:30–13:40 休憩
    {
      slotType: "shared",
      startTime: d1(13, 30),
      endTime: d1(13, 40),
      label: "休憩",
    },
    // 13:40–14:10 LONG x2 + ハンズオン
    {
      slotType: "individual",
      startTime: d1(13, 40),
      endTime: d1(14, 10),
      tracks: {
        LEVERAGES: {
          type: "session",
          sessionType: "LONG",
          sessions: [{ id: "8" }],
        },
        UPSIDER: {
          type: "session",
          sessionType: "LONG",
          sessions: [{ id: "9" }],
        },
        RIGHTTOUCH: {
          type: "session",
          sessionType: "HANDSON",
          sessions: [{ id: "1" }],
        },
      },
    },
    // 14:10–14:20 休憩 + ハンズオン
    {
      slotType: "individual",
      startTime: d1(14, 10),
      endTime: d1(14, 20),
      tracks: {
        LEVERAGES: { type: "other", label: "休憩", compact: true },
        UPSIDER: { type: "other", label: "休憩", compact: true },
        RIGHTTOUCH: { type: "override" },
      },
    },
    // 14:20–14:50 SHORT x3 (Track1/Track2) + ハンズオン
    {
      slotType: "individual",
      startTime: d1(14, 20),
      endTime: d1(14, 50),
      tracks: {
        LEVERAGES: {
          type: "session",
          sessionType: "SHORT",
          sessions: [{ id: "10" }, { id: "11" }, { id: "12" }],
        },
        UPSIDER: {
          type: "session",
          sessionType: "SHORT",
          sessions: [{ id: "13" }, { id: "14" }, { id: "15" }],
        },
        RIGHTTOUCH: { type: "override" },
      },
    },
    // 14:50–15:10 休憩 + ハンズオン
    {
      slotType: "individual",
      startTime: d1(14, 50),
      endTime: d1(15, 10),
      tracks: {
        LEVERAGES: { type: "other", label: "休憩", compact: true },
        UPSIDER: { type: "other", label: "休憩", compact: true },
        RIGHTTOUCH: { type: "override" },
      },
    },
    // 15:10–15:40 LONG x2 + ハンズオン
    {
      slotType: "individual",
      startTime: d1(15, 10),
      endTime: d1(15, 40),
      tracks: {
        LEVERAGES: {
          type: "session",
          sessionType: "LONG",
          sessions: [{ id: "16" }],
        },
        UPSIDER: {
          type: "session",
          sessionType: "LONG",
          sessions: [{ id: "17" }],
        },
        RIGHTTOUCH: { type: "override" },
      },
    },
    // 15:40–15:50 休憩
    {
      slotType: "shared",
      startTime: d1(15, 40),
      endTime: d1(15, 50),
      label: "休憩",
    },
    // 15:50–16:20 LONG x3
    {
      slotType: "individual",
      startTime: d1(15, 50),
      endTime: d1(16, 20),
      tracks: {
        LEVERAGES: {
          type: "session",
          sessionType: "LONG",
          sessions: [{ id: "18" }],
        },
        UPSIDER: {
          type: "session",
          sessionType: "LONG",
          sessions: [{ id: "19" }],
        },
        RIGHTTOUCH: {
          type: "session",
          sessionType: "LONG",
          sessions: [{ id: "20" }],
        },
      },
    },
    // 16:20–16:40 休憩
    {
      slotType: "shared",
      startTime: d1(16, 20),
      endTime: d1(16, 40),
      label: "休憩",
    },
    // 16:40–17:10 LONG (Track1) + SHORT x3 (Track2/Track3)
    {
      slotType: "individual",
      startTime: d1(16, 40),
      endTime: d1(17, 10),
      tracks: {
        LEVERAGES: {
          type: "session",
          sessionType: "LONG",
          sessions: [{ id: "21" }],
        },
        UPSIDER: {
          type: "session",
          sessionType: "SHORT",
          sessions: [{ id: "22" }, { id: "23" }, { id: "24" }],
        },
        RIGHTTOUCH: {
          type: "session",
          sessionType: "SHORT",
          sessions: [{ id: "25" }, { id: "26" }, { id: "27" }],
        },
      },
    },
    // 17:10–17:20 休憩
    {
      slotType: "shared",
      startTime: d1(17, 10),
      endTime: d1(17, 20),
      label: "休憩",
    },
    // 17:20–17:50 SHORT x3 x3
    {
      slotType: "individual",
      startTime: d1(17, 20),
      endTime: d1(17, 50),
      tracks: {
        LEVERAGES: {
          type: "session",
          sessionType: "SHORT",
          sessions: [{ id: "28" }, { id: "29" }, { id: "30" }],
        },
        UPSIDER: {
          type: "session",
          sessionType: "SHORT",
          sessions: [{ id: "31" }, { id: "32" }, { id: "33" }],
        },
        RIGHTTOUCH: {
          type: "session",
          sessionType: "SHORT",
          sessions: [{ id: "34" }, { id: "35" }, { id: "36" }],
        },
      },
    },
    // 17:50–18:10 休憩
    {
      slotType: "shared",
      startTime: d1(17, 50),
      endTime: d1(18, 10),
      label: "休憩",
    },
    // 18:10–18:50 KEYNOTE / サテライト / クローズ
    {
      slotType: "individual",
      startTime: d1(18, 10),
      endTime: d1(18, 50),
      tracks: {
        LEVERAGES: {
          type: "session",
          sessionType: "KEYNOTE",
          sessions: [{ id: "37" }],
        },
        UPSIDER: { type: "other", label: "サテライト" },
        RIGHTTOUCH: { type: "closed" },
      },
    },
  ],
  spanGroups: [
    {
      tracks: ["RIGHTTOUCH"],
      label: "ハンズオン",
      startTime: d1(13, 40),
      endTime: d1(15, 40),
    },
  ],
};

const day2: TimetableResponse = {
  day: "Day2",
  date: "2026-05-23",
  tracks: Object.values(TRACK),
  slots: [
    // 10:00–10:40 一般開場
    {
      slotType: "shared",
      startTime: d2(10, 0),
      endTime: d2(10, 40),
      label: "一般開場",
    },
    // 10:40–10:50 オープニングトーク / サテライト / クローズ
    {
      slotType: "individual",
      startTime: d2(10, 40),
      endTime: d2(10, 50),
      tracks: {
        LEVERAGES: { type: "other", label: "オープニングトーク" },
        UPSIDER: { type: "other", label: "サテライト" },
        RIGHTTOUCH: { type: "closed" },
      },
    },
    // 10:50–11:10 休憩
    {
      slotType: "shared",
      startTime: d2(10, 50),
      endTime: d2(11, 10),
      label: "休憩",
    },
    // 11:10–11:40 LONG x3
    {
      slotType: "individual",
      startTime: d2(11, 10),
      endTime: d2(11, 40),
      tracks: {
        LEVERAGES: {
          type: "session",
          sessionType: "LONG",
          sessions: [{ id: "38" }],
        },
        UPSIDER: {
          type: "session",
          sessionType: "LONG",
          sessions: [{ id: "39" }],
        },
        RIGHTTOUCH: {
          type: "session",
          sessionType: "LONG",
          sessions: [{ id: "40" }],
        },
      },
    },
    // 11:40–11:50 休憩
    {
      slotType: "shared",
      startTime: d2(11, 40),
      endTime: d2(11, 50),
      label: "休憩",
    },
    // 11:50–12:20 SHORT x3 x3
    {
      slotType: "individual",
      startTime: d2(11, 50),
      endTime: d2(12, 20),
      tracks: {
        LEVERAGES: {
          type: "session",
          sessionType: "SHORT",
          sessions: [{ id: "41" }, { id: "42" }, { id: "43" }],
        },
        UPSIDER: {
          type: "session",
          sessionType: "SHORT",
          sessions: [{ id: "44" }, { id: "45" }, { id: "46" }],
        },
        RIGHTTOUCH: {
          type: "session",
          sessionType: "SHORT",
          sessions: [{ id: "47" }, { id: "48" }, { id: "49" }],
        },
      },
    },
    // 12:20–12:30 ランチ配布
    {
      slotType: "shared",
      startTime: d2(12, 20),
      endTime: d2(12, 30),
      label: "ランチ配布",
    },
    // 12:30–13:30 ランチ/スポンサーセッション
    {
      slotType: "shared",
      startTime: d2(12, 30),
      endTime: d2(13, 30),
      label: "ランチ/スポンサーセッション",
    },
    // 13:30–13:40 休憩
    {
      slotType: "shared",
      startTime: d2(13, 30),
      endTime: d2(13, 40),
      label: "休憩",
    },
    // 13:40–14:10 LONG x3
    {
      slotType: "individual",
      startTime: d2(13, 40),
      endTime: d2(14, 10),
      tracks: {
        LEVERAGES: {
          type: "session",
          sessionType: "LONG",
          sessions: [{ id: "50" }],
        },
        UPSIDER: {
          type: "session",
          sessionType: "LONG",
          sessions: [{ id: "51" }],
        },
        RIGHTTOUCH: {
          type: "session",
          sessionType: "LONG",
          sessions: [{ id: "52" }],
        },
      },
    },
    // 14:10–14:20 休憩
    {
      slotType: "shared",
      startTime: d2(14, 10),
      endTime: d2(14, 20),
      label: "休憩",
    },
    // 14:20–14:50 SHORT x3 x3
    {
      slotType: "individual",
      startTime: d2(14, 20),
      endTime: d2(14, 50),
      tracks: {
        LEVERAGES: {
          type: "session",
          sessionType: "SHORT",
          sessions: [{ id: "53" }, { id: "54" }, { id: "55" }],
        },
        UPSIDER: {
          type: "session",
          sessionType: "SHORT",
          sessions: [{ id: "56" }, { id: "57" }, { id: "58" }],
        },
        RIGHTTOUCH: {
          type: "session",
          sessionType: "SHORT",
          sessions: [{ id: "59" }, { id: "60" }, { id: "61" }],
        },
      },
    },
    // 14:50–15:10 休憩
    {
      slotType: "shared",
      startTime: d2(14, 50),
      endTime: d2(15, 10),
      label: "休憩",
    },
    // 15:10–15:40 LONG x3
    {
      slotType: "individual",
      startTime: d2(15, 10),
      endTime: d2(15, 40),
      tracks: {
        LEVERAGES: {
          type: "session",
          sessionType: "LONG",
          sessions: [{ id: "62" }],
        },
        UPSIDER: {
          type: "session",
          sessionType: "LONG",
          sessions: [{ id: "63" }],
        },
        RIGHTTOUCH: {
          type: "session",
          sessionType: "LONG",
          sessions: [{ id: "64" }],
        },
      },
    },
    // 15:40–15:50 休憩
    {
      slotType: "shared",
      startTime: d2(15, 40),
      endTime: d2(15, 50),
      label: "休憩",
    },
    // 15:50–16:20 LONG x3
    {
      slotType: "individual",
      startTime: d2(15, 50),
      endTime: d2(16, 20),
      tracks: {
        LEVERAGES: {
          type: "session",
          sessionType: "LONG",
          sessions: [{ id: "65" }],
        },
        UPSIDER: {
          type: "session",
          sessionType: "LONG",
          sessions: [{ id: "66" }],
        },
        RIGHTTOUCH: {
          type: "session",
          sessionType: "LONG",
          sessions: [{ id: "67" }],
        },
      },
    },
    // 16:20–16:40 休憩
    {
      slotType: "shared",
      startTime: d2(16, 20),
      endTime: d2(16, 40),
      label: "休憩",
    },
    // 16:40–17:10 SHORT x3 x3
    {
      slotType: "individual",
      startTime: d2(16, 40),
      endTime: d2(17, 10),
      tracks: {
        LEVERAGES: {
          type: "session",
          sessionType: "SHORT",
          sessions: [{ id: "68" }, { id: "69" }, { id: "70" }],
        },
        UPSIDER: {
          type: "session",
          sessionType: "SHORT",
          sessions: [{ id: "71" }, { id: "72" }, { id: "73" }],
        },
        RIGHTTOUCH: {
          type: "session",
          sessionType: "SHORT",
          sessions: [{ id: "74" }, { id: "75" }, { id: "76" }],
        },
      },
    },
    // 17:10–17:20 休憩
    {
      slotType: "shared",
      startTime: d2(17, 10),
      endTime: d2(17, 20),
      label: "休憩",
    },
    // 17:20–18:30 懇親会準備 / 参加者体験企画
    {
      slotType: "individual",
      startTime: d2(17, 20),
      endTime: d2(18, 30),
      tracks: {
        LEVERAGES: { type: "other", label: "懇親会準備" },
        UPSIDER: { type: "other", label: "懇親会準備" },
        RIGHTTOUCH: { type: "other", label: "参加者体験企画" },
      },
    },
    // 18:30–18:40 休憩 (Track3)
    {
      slotType: "individual",
      startTime: d2(18, 30),
      endTime: d2(18, 40),
      tracks: {
        LEVERAGES: { type: "override" },
        UPSIDER: { type: "override" },
        RIGHTTOUCH: { type: "closed" },
      },
    },
    // 18:40–20:40 懇親会
    {
      slotType: "individual",
      startTime: d2(18, 40),
      endTime: d2(20, 40),
      tracks: {
        LEVERAGES: { type: "other", label: "懇親会" },
        UPSIDER: { type: "other", label: "懇親会" },
        RIGHTTOUCH: { type: "closed" },
      },
    },
  ],
  spanGroups: [
    {
      tracks: ["LEVERAGES", "UPSIDER"],
      label: "懇親会準備",
      startTime: d2(17, 20),
      endTime: d2(18, 40),
    },
  ],
};

export const timetableList: TimetableListResponse = [day1, day2];
