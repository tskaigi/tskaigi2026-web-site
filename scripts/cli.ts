import { defineCommand, runMain } from "citty";

const lazy = {
  session: () => import("./commands/session").then((m) => m.default),
  fetchIcons: () => import("./commands/fetch-icons").then((m) => m.default),
  fetchSponsors: () =>
    import("./commands/fetch-sponsors").then((m) => m.default),
  ogp: () => import("./commands/ogp").then((m) => m.default),
  staffList: () => import("./commands/staff-list").then((m) => m.default),
  svgToPng: () => import("./commands/svg-to-png").then((m) => m.default),
  clean: () => import("./commands/clean").then((m) => m.default),
};

const main = defineCommand({
  meta: {
    name: "tskaigi",
    description: "TSKaigi 2026 サイトのデータ・画像生成コマンド群",
  },
  subCommands: {
    session: lazy.session,
    "fetch-icons": lazy.fetchIcons,
    icons: lazy.fetchIcons,
    "fetch-sponsors": lazy.fetchSponsors,
    sponsors: lazy.fetchSponsors,
    ogp: lazy.ogp,
    "staff-list": lazy.staffList,
    staff: lazy.staffList,
    "svg-to-png": lazy.svgToPng,
    svg: lazy.svgToPng,
    clean: lazy.clean,
  },
});

runMain(main);
