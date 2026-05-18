export type SideEvent = {
  date: string;
  name: string;
  link: string;
  thumbnail: string;
  detail: string;
  tags?: string[];
  sponsors: string[];
  finishedAt: Date;
};

export const sideEventList: SideEvent[] = [
  {
    date: "2/9 (月)",
    name: "TSKaigi Mashup #4 プロポーザルの書き方とコツを学ぼう",
    link: "https://typescript-jpc.connpass.com/event/379927/",
    thumbnail:
      "https://media.connpass.com/thumbs/ad/6b/ad6b92024c9501d4f408977f8fed2406.png",
    detail: `TSKaigi採択者によるトークと、TSKaigiのCfP選考担当者によるトークを通じて、CfP応募のコツや選考のポイントを学べる勉強会です。
初めてCfPに応募しようと考えている方、応募を迷っている・応募に自信がない方におすすめです。`,
    tags: ["勉強会", "CfP"],
    sponsors: ["TSKaigi"],
    finishedAt: new Date("2026-02-09T21:30:00+09:00"),
  },
  {
    date: "1/27 (火)",
    name: "TSKaigi Mashup #3 Type Challenges ハンズオン",
    link: "https://typescript-jpc.connpass.com/event/377810/",
    thumbnail:
      "https://media.connpass.com/thumbs/98/4d/984d98d0c7cbe8b6f1cec1a3bca4411e.png",
    detail: `TypeScriptの型にまつわるプログラミングクイズが収録された type-challenges の問題を解くハンズオンを行います。入門者向けの難易度を予定しています。
当日に問題をいくつかピックアップし、実際に解いてみる → 解説 という形で行います。TypeScriptの経験が豊富なスタッフが講師として入り、適宜サポートします。 まだTypeScriptにあまり慣れていない方や、TypeChallengesを初めて知ったという方でも気軽にご参加ください！`,
    tags: ["ハンズオン"],
    sponsors: ["TSKaigi"],
    finishedAt: new Date("2026-01-27T19:30:00+09:00"),
  },
  {
    date: "2/24 (火)",
    name: "TSKaigi Mashup Kansai 生成AIでTSを扱うときに考えたい設計&ガードレール",
    link: "https://typescript-jpc.connpass.com/event/382128/",
    thumbnail:
      "https://media.connpass.com/thumbs/8b/3a/8b3a3badeb628dae262536c9d75c0fe2.png",
    detail: `Claude Code、Codex、Cursor などの AI エージェントを活用した TypeScript 開発が当たり前になりつつあります。
しかし、AI に「いい感じに書いて」と任せるだけでは、保守しづらいコードや意図しない設計が生まれがちです。
AI の力を最大限引き出しつつ、品質を担保するにはガードレールの設計が欠かせません。

本イベントは、AIエージェントを利用してTypeScript環境で開発を行う際に考えたい設計・ガードレールについて知見を共有する場とし、初級〜中級者の方でも学びを持ち帰れることを目指します。`,
    tags: ["勉強会", "関西"],
    sponsors: ["TSKaigi"],
    finishedAt: new Date("2026-02-25T00:00:00+09:00"),
  },
  {
    date: "5/22 (金)",
    name: "TSKaigi 2026 Drinkup",
    link: "https://nealle.connpass.com/event/393092/",
    thumbnail:
      "https://media.connpass.com/thumbs/ab/a9/aba9cec2964a1c1151d7439f84dadd10.png",
    detail: `TSKaigi 2026 Drinkupは、TypeScriptの熱気をさらに高める交流の場です。
Day1で高まった熱意をそのままに、お酒を片手にセッションを振り返り、アイデアを共有する夜をお届けします。
TypeScriptに情熱を注ぐ参加者が集うアットホームな空間で、新しい出会いや刺激的な会話を通じて、充実した時間を過ごしていただけます。
このDrinkupが、皆様のTypeScriptコミュニティ活動をさらに豊かにする機会となることを願っています。`,
    sponsors: [
      "株式会社ニーリー",
      "MOSH株式会社",
      "Dress Code株式会社",
      "株式会社TOKIUM (TOKIUM, Inc.)",
    ],
    finishedAt: new Date("2026-05-23T00:00:00+09:00"),
  },
  {
    date: "6/3 (水)",
    name: '歴史あるプロダクトで、"AIに任せられる領域"をどう広げるか？TSKaigi アフターイベント',
    link: "https://bitkey.connpass.com/event/390408/",
    thumbnail:
      "https://media.connpass.com/thumbs/14/18/141893b3aca915c229d2ebcbd089d66e.png",
    detail: `AIはそれなりに妥当なコードを返してくれる場面が増えてきました。
とりあえず部分的に書かせるラインには乗りやすくなっている、という感触を持つチームも多いのではないでしょうか？

一方で、壁も見えています。

・成果物を人間がどうレビューするか。フルレビューは負担が重い
・エージェントと対話しながら実装を進めるときには、仕様や背景がドキュメントやコードから汲み取りやすい状態でないと進みにくい

本イベントは、AIにコードを書かせる話ではなく、AIに安心して任せられる領域をどう作り出すか、人間の注意をどこに残すかを思考します。`,
    sponsors: ["株式会社ビットキー", "Ubie株式会社", "株式会社LayerX"],
    finishedAt: new Date("2026-06-04T00:00:00+09:00"),
  },
  {
    date: "6/25 (木)",
    name: "TSKaigi 2026事後勉強会",
    link: "https://smarthr.connpass.com/event/392342",
    thumbnail:
      "https://media.connpass.com/thumbs/9e/83/9e8390656dad1e62e238f61b43a9c509.png",
    detail: `TSKaigi 2026に参加して、「もっと語り合いたい！」と感じた方に向けたイベントです。
テーマは特に設けず、TypeScriptに関連する話題であればなんでも歓迎です。
TSKaigi 2026を通じて得た知見や気づき、実務で考えたこと、最近気になっていることなど、気軽に共有してください！
もちろん、「話を聞いてみたい」という方のご参加も大歓迎です。`,
    sponsors: ["株式会社SmartHR"],
    finishedAt: new Date("2026-06-26T00:00:00+09:00"),
  },
];
