type CommunityArea =
  | "hokkaido"
  | "tohoku"
  | "kanto"
  | "chubu"
  | "kinki"
  | "chugoku"
  | "shikoku"
  | "kyushu"
  | "okinawa"
  | "online";

type Community = {
  name: string;
  link: string;
};

type CommunityList = {
  [key in CommunityArea]?: {
    label: string;
    communities: Community[];
  };
};

export const communityList: CommunityList = {
  hokkaido: {
    label: "北海道",
    communities: [],
  },
  tohoku: {
    label: "東北",
    communities: [],
  },
  kanto: {
    label: "関東",
    communities: [
      {
        name: "（サンプル）コミュニティA",
        link: "https://example.com",
      },
      {
        name: "（サンプル）コミュニティB",
        link: "https://example.com",
      },
    ],
  },
  chubu: {
    label: "中部",
    communities: [],
  },
  kinki: {
    label: "近畿",
    communities: [],
  },
  chugoku: {
    label: "中国",
    communities: [],
  },
  shikoku: {
    label: "四国",
    communities: [],
  },
  kyushu: {
    label: "九州",
    communities: [],
  },
  okinawa: {
    label: "沖縄",
    communities: [],
  },
  online: {
    label: "オンライン",
    communities: [],
  },
};
