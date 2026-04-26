type CommunityEventMonth = "6月" | "7月" | "8月" | "9月" | "11月" | "その他";

type CommunityEvent = {
  name: string;
  link: string;
  schedule: string;
};

export const communityEventList: {
  [key in CommunityEventMonth]: CommunityEvent[];
} = {
  "6月": [
    {
      name: "（サンプル）イベントA",
      link: "https://example.com",
      schedule: "6月頃",
    },
    {
      name: "（サンプル）イベントB",
      link: "https://example.com",
      schedule: "6/TBD",
    },
  ],
  "7月": [],
  "8月": [],
  "9月": [],
  "11月": [],
  その他: [],
};
