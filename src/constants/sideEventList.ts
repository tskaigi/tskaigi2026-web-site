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
    thumbnail: "/sideevents/mashup_4.png",
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
    thumbnail: "/sideevents/mashup_3.png",
    detail: `TypeScriptの型にまつわるプログラミングクイズが収録された type-challenges の問題を解くハンズオンを行います。入門者向けの難易度を予定しています。
当日に問題をいくつかピックアップし、実際に解いてみる → 解説 という形で行います。TypeScriptの経験が豊富なスタッフが講師として入り、適宜サポートします。 まだTypeScriptにあまり慣れていない方や、TypeChallengesを初めて知ったという方でも気軽にご参加ください！`,
    tags: ["ハンズオン"],
    sponsors: ["TSKaigi"],
    finishedAt: new Date("2026-01-27T19:30:00+09:00"),
  },
];
