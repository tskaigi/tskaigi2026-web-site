import { defineCommand, runMain } from "citty";

const main = defineCommand({
  meta: {
    name: "tskaigi",
    description: "TSKaigi 2026 サイトのデータ・画像生成コマンド群",
  },
  subCommands: {
    session: () => import("./commands/session").then((m) => m.default),
    "fetch-icons": () =>
      import("./commands/fetch-icons").then((m) => m.default),
    "fetch-sponsors": () =>
      import("./commands/fetch-sponsors").then((m) => m.default),
    ogp: () => import("./commands/ogp").then((m) => m.default),
    "staff-list": () => import("./commands/staff-list").then((m) => m.default),
    "build-pages": () =>
      import("./commands/build-pages").then((m) => m.default),
  },
});

runMain(main);
