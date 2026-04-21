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

/** 2026-05-23T00:00:00+09:00 in unix seconds */
const DAY1_BASE = 1779462000;
/** 2026-05-24T00:00:00+09:00 in unix seconds */
const DAY2_BASE = 1779548400;

/** HH:MM → unix timestamp (seconds) */
const d1 = (h: number, m: number) => DAY1_BASE + h * 3600 + m * 60;
const d2 = (h: number, m: number) => DAY2_BASE + h * 3600 + m * 60;

const day1: TimetableResponse = {
  day: "Day1",
  date: "2026-05-23",
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
          sessions: [
            {
              id: "1",
              title: "tscからtsgoへ ── DenoのTypeScript基盤はどう変わったか",
              speaker: { name: "maguro" },
            },
          ],
        },
        UPSIDER: {
          type: "session",
          sessionType: "LONG",
          sessions: [
            {
              id: "2",
              title: "「関数型プログラミング」を分解する.ts",
              speaker: { name: "おーみー" },
            },
          ],
        },
        RIGHTTOUCH: {
          type: "session",
          sessionType: "LONG",
          sessions: [
            {
              id: "3",
              title:
                "開発体験を左右するライブラリの API 設計 ― GraphQL スキーマ構築ライブラリから考える",
              speaker: { name: "izumin5210" },
            },
          ],
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
          sessions: [
            {
              id: "4",
              title:
                "業務に残された「よくない型」で考える「TypeScriptの難しさ」",
              speaker: { name: "Saji" },
            },
          ],
        },
        UPSIDER: {
          type: "session",
          sessionType: "LONG",
          sessions: [
            {
              id: "5",
              title: '関係性から理解する"同一性"の型用語たち',
              speaker: { name: "pvcresin" },
            },
          ],
        },
        RIGHTTOUCH: {
          type: "session",
          sessionType: "LONG",
          sessions: [
            {
              id: "6",
              title: "TypeScriptの「型」をAIのスキルに昇華させてみた件について",
              speaker: { name: "higak9" },
            },
          ],
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
          sessions: [
            {
              id: "7",
              title: "TypeScriptでWebAssemblyを用いた型安全なプラグイン設計",
              speaker: { name: "glassmonkey" },
            },
          ],
        },
        UPSIDER: {
          type: "session",
          sessionType: "LONG",
          sessions: [
            {
              id: "8",
              title: "権限チェックの一貫性を型で守る TypeScript による多層防御",
              speaker: { name: "北川 直昭" },
            },
          ],
        },
        RIGHTTOUCH: {
          type: "session",
          sessionType: "HANDSON",
          sessions: [
            {
              id: "handson-1",
              title: "ハンズオン（前半）",
              speaker: { name: "" },
            },
          ],
        },
      },
    },
    // 14:10–14:20 休憩
    {
      slotType: "shared",
      startTime: d1(14, 10),
      endTime: d1(14, 20),
      label: "休憩",
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
          sessions: [
            {
              id: "9",
              title:
                "TypeScriptとAngular Signal で実現する保守性の高いアプリケーション設計 - 3層アーキテクチャによる責務分離の実践",
              speaker: { name: "たつかわ" },
            },
            {
              id: "10",
              title:
                "OSSのコードベースにneverthrowを漸進的に導入して、AIにも人間にも優しいエラーハンドリングを実現する",
              speaker: { name: "IkedaNoritaka" },
            },
            {
              id: "11",
              title: "型で頑張るプロダクト国際化",
              speaker: { name: "ozawa shotaro" },
            },
          ],
        },
        UPSIDER: {
          type: "session",
          sessionType: "SHORT",
          sessions: [
            {
              id: "12",
              title:
                "checker.tsにチキンレース仕掛けてみた：型エラー(TS2589)が発生する境界線を求めて",
              speaker: { name: "Hal" },
            },
            {
              id: "13",
              title:
                "型の深宇宙へ飛び込め ─ tscを遅くする記述パターンの全解剖 ─",
              speaker: { name: "dowod" },
            },
            {
              id: "14",
              title:
                "決定論的な型チェックへ：Go 製コンパイラによる10倍速の裏側で --stableTypeOrdering から見える並列化への挑戦",
              speaker: { name: "えい" },
            },
          ],
        },
        RIGHTTOUCH: {
          type: "session",
          sessionType: "HANDSON",
          sessions: [
            {
              id: "handson-2",
              title: "ハンズオン（中盤）",
              speaker: { name: "" },
            },
          ],
        },
      },
    },
    // 14:50–15:10 休憩
    {
      slotType: "shared",
      startTime: d1(14, 50),
      endTime: d1(15, 10),
      label: "休憩",
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
          sessions: [
            {
              id: "15",
              title:
                "TypeScriptのclassはなぜこうなったのか — 歴史・落とし穴・そして使いどころを探る",
              speaker: { name: "kosui" },
            },
          ],
        },
        UPSIDER: {
          type: "session",
          sessionType: "LONG",
          sessions: [
            {
              id: "16",
              title: "アンチパターンを避ける型駆動React最適化",
              speaker: { name: "Kazuya Serizawa" },
            },
          ],
        },
        RIGHTTOUCH: {
          type: "session",
          sessionType: "HANDSON",
          sessions: [
            {
              id: "handson-3",
              title: "ハンズオン（後半）",
              speaker: { name: "" },
            },
          ],
        },
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
          sessions: [
            {
              id: "17",
              title: "ビジネスモデルから紐解く、AI+型駆動開発",
              speaker: { name: "omote" },
            },
          ],
        },
        UPSIDER: {
          type: "session",
          sessionType: "LONG",
          sessions: [
            {
              id: "18",
              title: "Stage 3 Decorators でできること / できないこと",
              speaker: { name: "susisu" },
            },
          ],
        },
        RIGHTTOUCH: {
          type: "session",
          sessionType: "LONG",
          sessions: [
            {
              id: "19",
              title:
                "TypeScriptだけでAIエージェントを作る ― フロント・エージェント・インフラのフルスタック実践",
              speaker: { name: "福地開" },
            },
          ],
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
          sessions: [
            {
              id: "20",
              title:
                "プラグインで拡張されるContextをtype-safeにする難しさと設計判断",
              speaker: { name: "kazupon" },
            },
          ],
        },
        UPSIDER: {
          type: "session",
          sessionType: "SHORT",
          sessions: [
            {
              id: "21",
              title: "密結合なバックエンドから TypeScript のコードを生成する",
              speaker: { name: "kemuridama" },
            },
            {
              id: "22",
              title:
                "TypeSpecで繋ぐ複数プロダクトの型安全 — スキーマ共有による「型契約」の実践",
              speaker: { name: "mitsui" },
            },
            {
              id: "23",
              title:
                "TypeScriptの型はAIに届いているか？ ― AIコーディングツール検証で見えたIDEとの断絶",
              speaker: { name: "中田 章太郎" },
            },
          ],
        },
        RIGHTTOUCH: {
          type: "session",
          sessionType: "SHORT",
          sessions: [
            {
              id: "24",
              title: "TanStack StartのcreateServerFnで作る、型が通るAPI",
              speaker: { name: "Yuki Terashima" },
            },
            {
              id: "25",
              title:
                "実践TanStack Start: 新規プロダクトを開発して確立した、サーバーとクライアント境界の設計パターン",
              speaker: { name: "Shimmy" },
            },
            {
              id: "26",
              title: "TanStack Router の型定義を読み解く",
              speaker: { name: "IORI" },
            },
          ],
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
          sessions: [
            {
              id: "27",
              title:
                "TypeScriptエンジニアのためのWASMランタイム入門：AssemblyScriptで実装から理解するメモリの実態",
              speaker: { name: "ayano" },
            },
            {
              id: "28",
              title:
                "Oxlint は ESLint / typescript-eslint を置き換えられるか？",
              speaker: { name: "藤田 翔雅" },
            },
            {
              id: "29",
              title:
                "Oxlintはいかにしてtsgolintのlint ruleを呼び出しているのか",
              speaker: { name: "hakshu" },
            },
          ],
        },
        UPSIDER: {
          type: "session",
          sessionType: "SHORT",
          sessions: [
            {
              id: "30",
              title: "Zod v4 codec でスキーマに型変換を埋め込む REST API 設計",
              speaker: { name: "Ryutaro Yako" },
            },
            {
              id: "31",
              title:
                "Road to contibuter of Valibot - ValibotにISBN validationを追加するまで -",
              speaker: { name: "Kanon" },
            },
            {
              id: "32",
              title: "Navigation APIがlib.dom.d.tsに採用されるまでの道のり",
              speaker: { name: "yamanoku" },
            },
          ],
        },
        RIGHTTOUCH: {
          type: "session",
          sessionType: "SHORT",
          sessions: [
            {
              id: "33",
              title:
                'TypeScriptの型だけでオセロを完全実装する ── 型は"仕様"をどこまで語れるか',
              speaker: { name: "籏野 拓" },
            },
            {
              id: "34",
              title: "TypeScript の型で副作用の実行順序を制御する",
              speaker: { name: "yanaemon" },
            },
            {
              id: "35",
              title:
                "「雰囲気tsconfig」からの脱却：pnpmモノレポ運用で学び直したProject Referencesの基礎と実践",
              speaker: { name: "hedrall" },
            },
          ],
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
          sessions: [
            {
              id: "36",
              title: "基調講演『TS 7: How We Got There』",
              speaker: { name: "Jake Bailey" },
            },
          ],
        },
        UPSIDER: { type: "other", label: "サテライト" },
        RIGHTTOUCH: { type: "closed" },
      },
    },
  ],
};

const day2: TimetableResponse = {
  day: "Day2",
  date: "2026-05-24",
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
          sessions: [
            {
              id: "37",
              title: "TypeScriptコンパイラの設計考古学",
              speaker: { name: "Yoshiaki Togami" },
            },
          ],
        },
        UPSIDER: {
          type: "session",
          sessionType: "LONG",
          sessions: [
            {
              id: "38",
              title:
                "400超のデータポイントを型で制す —— UPSIDERの与信審査エンジンを支えるTypeScriptの「柔軟性」と「結合力」",
              speaker: { name: "泉雄介" },
            },
          ],
        },
        RIGHTTOUCH: {
          type: "session",
          sessionType: "LONG",
          sessions: [
            {
              id: "39",
              title:
                "AIのために、AIを使った、Effect-TSからの脱却 〜テストを活用した安全なリファクタリングの進め方〜",
              speaker: { name: "佐藤 拓人" },
            },
          ],
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
          sessions: [
            {
              id: "40",
              title:
                "React の props は値の集合ではない — UI の状態を宣言するコンポーネント設計",
              speaker: { name: "nabeliwo" },
            },
            {
              id: "41",
              title: "型プラグインシステムの実装に使われるテクニック",
              speaker: { name: "elecdeer" },
            },
            {
              id: "42",
              title:
                "Auth.jsからBetter Authへの移行に見る「型とランタイム」の設計思想の変化",
              speaker: { name: "宇根昇汰" },
            },
          ],
        },
        UPSIDER: {
          type: "session",
          sessionType: "SHORT",
          sessions: [
            {
              id: "43",
              title: "ReactとSvelteのその先、Ripple-TS",
              speaker: { name: "ssssota" },
            },
            {
              id: "44",
              title:
                "LLM時代のリファクタリング戦略：AIエージェントによる段階的・安全なTS移行方法",
              speaker: { name: "市川 賢" },
            },
            {
              id: "45",
              title:
                "コーディングエージェントはTypeScriptの型エラーをどう自己修正しているのか",
              speaker: { name: "筧万里" },
            },
          ],
        },
        RIGHTTOUCH: {
          type: "session",
          sessionType: "SHORT",
          sessions: [
            {
              id: "46",
              title:
                "10秒のビルドを1秒へ：tsdown が切り拓く 2026 年の TypeScript ライブラリ開発",
              speaker: { name: "irie" },
            },
            {
              id: "47",
              title: "JSで実装した自作プログラミング言語をTSに移行した話",
              speaker: { name: "Keisuke Ikeda" },
            },
            {
              id: "48",
              title: "TypeScriptでドット絵エディタ実装録: 状態設計と実装判断",
              speaker: { name: "つくだに" },
            },
          ],
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
    // 12:30–13:30 ランチ
    {
      slotType: "shared",
      startTime: d2(12, 30),
      endTime: d2(13, 30),
      label: "ランチ",
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
          sessions: [
            {
              id: "49",
              title: "Real World Effect-TS: 堅牢なプロダクトを型で組み上げる",
              speaker: { name: "asa1984" },
            },
          ],
        },
        UPSIDER: {
          type: "session",
          sessionType: "LONG",
          sessions: [
            {
              id: "50",
              title: "tsserverとは何だったのか、これからどうなるのか",
              speaker: { name: "中村遼大" },
            },
          ],
        },
        RIGHTTOUCH: {
          type: "session",
          sessionType: "LONG",
          sessions: [
            {
              id: "51",
              title: "TypeScriptでPlatform SDKを作る技術",
              speaker: { name: "樋口 彰" },
            },
          ],
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
          sessions: [
            {
              id: "52",
              title:
                "ts-morph でプロジェクト固有のアーキテクチャガードレールを作る",
              speaker: { name: "msuto / Michimasa Suto" },
            },
            {
              id: "53",
              title:
                "typescript-goで変わるリンターの世界 — Flintという第三の選択肢",
              speaker: { name: "Tamasho Tomoya" },
            },
            {
              id: "54",
              title:
                "Polymorphic Components パターンで作る、型安全でセマンティックなUIコンポーネント",
              speaker: { name: "ryo" },
            },
          ],
        },
        UPSIDER: {
          type: "session",
          sessionType: "SHORT",
          sessions: [
            {
              id: "55",
              title: "Node.js+TypeScriptにおけるCJS/ESM相互運用の最新ポイント",
              speaker: { name: "桐生直輝" },
            },
            {
              id: "56",
              title: "enum よ、さようなら",
              speaker: { name: "takuma-ru" },
            },
            {
              id: "57",
              title: "inferと仲良くなる10分間",
              speaker: { name: "infixer" },
            },
          ],
        },
        RIGHTTOUCH: {
          type: "session",
          sessionType: "SHORT",
          sessions: [
            {
              id: "58",
              title:
                "AIエージェントと協働するCLI開発 — BunとOpenClawで学んだこと",
              speaker: { name: "yoshikouki" },
            },
            {
              id: "59",
              title: "自動レビューエンジンの実装と運用 ~レビューのない世界へ~",
              speaker: { name: "Kanato" },
            },
            {
              id: "60",
              title:
                "Hono RPCとDrizzle ORMで実現する、AIにも優しいTypeScriptファーストな開発",
              speaker: { name: "Yudai Shinnoki" },
            },
          ],
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
          sessions: [
            {
              id: "61",
              title: "AI時代に考えたい、Branded Typesで実現する堅牢な型付け",
              speaker: { name: "池奥裕太" },
            },
          ],
        },
        UPSIDER: {
          type: "session",
          sessionType: "LONG",
          sessions: [
            {
              id: "62",
              title:
                "いつテストを書くか？―ソフトウェア開発における安心と不安について考える",
              speaker: { name: "lacolaco" },
            },
          ],
        },
        RIGHTTOUCH: {
          type: "session",
          sessionType: "LONG",
          sessions: [
            {
              id: "63",
              title:
                "TypeScriptバックエンドのオブザーバビリティ戦略 — Datadog × NestJSの実践",
              speaker: { name: "山本大星" },
            },
          ],
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
          sessions: [
            {
              id: "64",
              title:
                "次世代リンターで探る、tsgo 時代における型認識カスタムルールの現実解",
              speaker: { name: "Yuta Takahashi" },
            },
          ],
        },
        UPSIDER: {
          type: "session",
          sessionType: "LONG",
          sessions: [
            {
              id: "65",
              title:
                "静的解析への投資がAI時代のコード品質を支える ── カスタムESLintルールの設計と運用",
              speaker: { name: "工藤 颯斗" },
            },
          ],
        },
        RIGHTTOUCH: {
          type: "session",
          sessionType: "LONG",
          sessions: [
            {
              id: "66",
              title:
                "柔軟なPDFレイアウトエディタを支える型システム設計 — Discriminated UnionとConditional Typeの実践",
              speaker: { name: "minako-ph" },
            },
          ],
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
          sessions: [
            {
              id: "67",
              title:
                "childrenの順序まで型で縛る ── Branded Typesで実践するJSXの構造安全",
              speaker: { name: "Mahito" },
            },
            {
              id: "68",
              title:
                "スプレッド構文によるブランド流出問題を乗り越えて、オブジェクト型に対する Branded Types を使い倒す",
              speaker: { name: "tony" },
            },
            {
              id: "69",
              title: "string地獄を脱出する — ValueObject + Zod 実践パターン",
              speaker: { name: "高田 理功" },
            },
          ],
        },
        UPSIDER: {
          type: "session",
          sessionType: "SHORT",
          sessions: [
            {
              id: "70",
              title: "これから非推奨になる設定・コードと代替について",
              speaker: { name: "Ayu" },
            },
            {
              id: "71",
              title:
                "TypeScript Compiler はどのように未使用変数を検出しているのか？",
              speaker: { name: "Kenta TSUNEMI" },
            },
            {
              id: "72",
              title:
                "プロパティの順序で型推論が壊れる！？ TS6.0の修正からContext-Sensitivityの仕組みを追う",
              speaker: { name: "おおいし (bicstone)" },
            },
          ],
        },
        RIGHTTOUCH: {
          type: "session",
          sessionType: "SHORT",
          sessions: [
            {
              id: "73",
              title: "Typiaで配信JSONの安全性を構造的に担保する",
              speaker: { name: "oiki" },
            },
            {
              id: "74",
              title: "バックエンドにElysiaJSを採用して気付いた、良い点・悪い点",
              speaker: { name: "わんこ" },
            },
            {
              id: "75",
              title:
                "型のないDSLを安全に扱う: TypeScriptとメタプログラミングによるElasticsearch連携の実践",
              speaker: { name: "渡邊 耕平" },
            },
          ],
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
        LEVERAGES: { type: "other", label: "懇親会準備" },
        UPSIDER: { type: "other", label: "懇親会準備" },
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
};

export const timetableList: TimetableListResponse = [day1, day2];
