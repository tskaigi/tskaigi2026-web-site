export type Activity = {
  name: string;
  description: string;
  location?: string;
  time?: string;
  image?: string;
};

const DUMMY_IMAGE = "https://placehold.jp/147ac8/ffffff/400x225.png";

export const activityList: Activity[] = [
  {
    name: "マッサージ",
    description:
      "長時間の移動や立ち仕事で疲れた体を、プロのマッサージでリフレッシュ！当日会場内でご利用いただけます。",
    location: "1F ホワイエ",
    time: "10:00 - 18:00",
    image: DUMMY_IMAGE,
  },
  {
    name: "フェイスペイント",
    description:
      "TSKaigi特製デザインのフェイスペイントでイベントをより楽しく彩りましょう。",
    location: "1F ホワイエ",
    image: DUMMY_IMAGE,
  },
  {
    name: "ネイル",
    description: "イベント限定デザインのネイルアートをお楽しみください。",
    location: "2F 受付前",
    time: "11:00 - 16:00",
    image: DUMMY_IMAGE,
  },
  {
    name: "NFCチェキフォト",
    description:
      "NFCタグを活用したチェキ風フォトブースです。撮影した写真をその場でお持ち帰りいただけます。",
    location: "1F・2F ホワイエ",
    image: DUMMY_IMAGE,
  },
  {
    name: "フリップ",
    description:
      "TSKaigi オリジナルフリップを使った撮影スポットです。SNSシェア大歓迎！",
    location: "2F 受付前",
    image: DUMMY_IMAGE,
  },
  {
    name: "Ask the Speaker",
    description:
      "登壇者に直接質問・交流できる企画です。トークの深掘りや技術的な疑問をスピーカーに聞いてみましょう。",
    location: "1F ホワイエ",
    time: "16:10 - 17:10",
    image: DUMMY_IMAGE,
  },
];
