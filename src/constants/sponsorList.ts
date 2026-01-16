export type ExternalLinkProps = { title: string; href: string };
export type SponsorClass = "platinum" | "gold" | "silver" | "bronze";
export type SponsorRole = SponsorClass | "coffee" | "beer" | "naming-rights";

export type Sponsor = {
  id: string;
  name: string;
  logoImage: string;
  logoImageForSponsorsPage?: string;
  logoLink: string;
  addPadding: boolean;
  isTenantChecked: boolean; // 企業による掲載確認済みかどうかのフラグ、falseの場合はwipページのみに表示
  overview?: string[];
  links?: ExternalLinkProps[];
  roles: SponsorRole[];
  detailPageId: string;
  jobBoard?: {
    imagePath: string;
    link: string;
  };
};

type SponsorList = {
  [key in SponsorClass]: Sponsor[];
};

export const sponsorList: SponsorList = {
  platinum: [
    {
      id: "P01",
      name: "アセンド株式会社",
      logoImage: "/sponsors/ascend.png",
      logoLink: "https://www.ascendlogi.co.jp/",
      addPadding: false,
      isTenantChecked: true,
      overview: [
        `■「日本で最もデジタル化の遅れた物流産業で、最高の業務体験を創る」
アセンド株式会社は日本の物流DXを目指すスタートアップです。
物流業界は20兆円の巨大市場でありながら、クラウド利用率は全産業で最低でありデジタル化の遅れ故に2024年問題をはじめとして社会課題を抱える業界です。アセンドはVertical SaaS「ロジックス」を全国の運送会社へ開発提供し、現場業務のデジタル化と経営の高度化を同時に図り、物流業界の変革を推進しています。`,
        `■ アセンドとTypeScript
アセンドは社会課題を解決するプロダクトエンジニア組織を目指して、Frontend/Backend/IaC/DataPipelineの全てをTypeScriptで統一しました。TSでの言語統一により、全エンジニアがフルスタックに開発し、顧客業務やドメインに深く寄り添いプロダクト価値に拘った開発を進めています。開発生産性は6deploys/dayと高い環境であり、少数チームでありながらサービスは案件管理や労務・車両管理といった多岐にわたる複数プロダクトを展開し、運送会社の全ての業務のデジタル化を推進しています。2023年12月にはシリーズAの資金調達を実施し、より多くの運送会社に更なる機能・価値を届けるため、仲間を募集しています。
TypeScriptを駆使して社会課題解決に挑むプロダクトエンジニアを積極募集中です。お気軽にご連絡ください！`,
      ],
      links: [
        {
          title: "アセンド株式会社",
          href: "https://www.ascendlogi.co.jp/",
        },
        {
          title: "エンジニア採用サイト",
          href: "https://product.career.ascendlogi.co.jp/",
        },
        {
          title: "プロダクトエンジニアに関して",
          href: "https://note.com/niwa_takeru/n/n0ae4acf2964d",
        },
      ],
      roles: ["platinum", "naming-rights"],
      detailPageId: "ascend",
    },
  ],
  gold: [
    {
      id: "G01",
      name: "レバレジーズ株式会社",
      logoImage: "/sponsors/leverages.jpg",
      logoLink: "https://recruit.leverages.jp/recruit/engineer/",
      addPadding: false,
      isTenantChecked: true,
      overview: [
        `レバレジーズ株式会社では、こんなエンジニアを求めています！ピンと来たらぜひご応募ください。
・新規事業や業務改善の提案など、ビジネスからエンジニアリングまで一気通貫でやっていきたい方
・営業、マーケター、デザイナー、事業企画、データアナリストなど、あらゆる職種と協力しながら、イノベーティブなサービスを開発したい方
・「関係者全員の幸福の追求」の理念を共にした仲間と一緒に、社会貢献性の高い事業を行っていきたい方
・先制・再生医療など新しい分野も含め、多角的かつグローバルなサービスに幅広く関わりたい方`,
        `■ 会社紹介         
社会の課題を解決し関係者全員の幸福を追求し続けることをミッションに、IT・医療・介護・若年層を中心とした人材事業や、Webメディア事業、M&Aコンサルティング事業など、社会貢献を軸に様々な領域でこれまで40以上のサービスを展開。2005年に創業以来、黒字経営を継続し19期目の2023年度は年商1149億を突破しました。各分野のスペシャリストが集うオールインハウスの組織構成と、業界を絞らないポートフォリオ経営で、時代を代表するグローバル企業を目指します。`,
      ],
      links: [
        {
          title: "公式サイト",
          href: "https://leverages.jp",
        },
        {
          title: "エンジニア採用",
          href: "https://recruit.leverages.jp/recruit/engineer",
        },
        {
          title: "Leverages Tech Blog",
          href: "https://tech.leverages.jp",
        },
      ],
      roles: ["gold", "naming-rights"],
      detailPageId: "leverages",
      jobBoard: {
        imagePath: "/sponsors/jobBoard/leverages.jpg",
        link: "https://hrmos.co/pages/leverages/jobs?category=1819634044861276161",
      },
    },
  ],
  silver: [
    {
      id: "S02",
      name: "Theoria technologies 株式会社",
      logoImage: "/sponsors/theoria-technologies.png",
      logoLink: "https://theoriatec.com/",
      addPadding: false,
      isTenantChecked: true,
      overview: [
        `Theoria technologiesは、2023年9月に製薬会社エーザイの子会社として設立されました。「認知症との向き合い方を、テクノロジーで変えていく。」をミッションに掲げ、様々なバックグラウンドを持つメンバーが集まり、認知症プラットフォームの実現に向けて日々挑戦しています。解決したい社会課題や取り組みたいプロジェクトが多数あり、新たな仲間を募集中です。あなたの技術と情熱で、共に社会課題の解決に挑みませんか？
まずはカジュアルに話を聞いてみてください。ご連絡お待ちしています！`,
      ],
      links: [
        {
          title: "Theoria technologies 公式サイト",
          href: "https://theoriatec.com",
        },
        {
          title: "Theoria technologies 公式 note",
          href: "https://note.com/theoriatec",
        },
        {
          title: "認知症ポータルサイト「テヲトル」",
          href: "https://theotol.soudan-e65.com",
        },
      ],
      roles: ["silver"],
      detailPageId: "theoria-technologies",
      jobBoard: {
        imagePath: "/sponsors/jobBoard/theoria-technologies.png",
        link: "https://theoriatec.com/recruit",
      },
    },
  ],
  bronze: [
    {
      id: "B02",
      name: "株式会社Gemcook",
      logoImage: "/sponsors/gemcook.png",
      logoLink: "https://gemcook.com",
      addPadding: false,
      isTenantChecked: true,
      roles: ["bronze"],
      detailPageId: "gemcook",
    },
  ],
};

// スポンサー詳細ページで使用するスポンサーIDのリスト
export const sponsorIds = Object.values(sponsorList)
  .flat()
  .map((sponsor) => ({ id: sponsor.detailPageId }));
