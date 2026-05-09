export type Activity = {
  name: string;
  description: string;
  location?: string;
  time?: string;
  image?: string;
};

export const activityList: Activity[] = [
  {
    name: "NFCカード",
    description:
      "NFC機能付きのカードをお配りします。お好きなURLを書き込めるので、SNSや自己紹介ページのリンクを載せて交流にご活用ください。休憩室でもリンクを書き込むことが可能です。",
    location: "休憩ルーム",
    time: "両日 終日",
  },
  {
    name: "マッサージ",
    description:
      "出張マッサージのコーナーを設置します。長時間の移動や立ち仕事で疲れた体を疲れを、ぜひ会場で癒してください。",
    location: "休憩ルーム",
    time: "両日 13:00〜17:00",
  },
  {
    name: "フェイスペイント",
    description:
      "プロのフェイスペインターによるオリジナルデザインのフェイスペイントを体験できます。現地だからこそできる楽しみ方もぜひ体験してください。",
    location: "エントランス企画ゾーン",
    time: "5/23（土）12:00〜16:00",
  },
  {
    name: "ネイル",
    description:
      "プロのネイリストによるネイルを体験できます。これまでネイルをしたことがない方も大歓迎です。",
    location: "エントランス企画ゾーン",
    time: "5/22（金）12:00〜16:00",
  },
  {
    name: "フォトブース",
    description:
      "チェキでの撮影スポットを設置します。撮影したチェキはお持ち帰りいただけます。フォトフリップと合わせて思い出に残る1枚を。",
    location: "受付横",
    time: "両日 終日",
  },
  {
    name: "Ask the Speaker",
    description:
      "セッション登壇直後の登壇者に直接質問・対話できるコーナーです。気になった話題を、その場で深掘りできます。",
    location: "休憩ルーム",
    time: "各セッション終了後",
  },
  {
    name: "コミュニティ日本地図・イベントカレンダー",
    description:
      "日本地図上でコミュニティ、カレンダー上でイベント情報を自由に記載し、紹介できるコーナーです。ぜひ様々なコミュニティと交流する機会に。",
    location: "エントランス企画ゾーン",
    time: "両日 終日",
  },
];
