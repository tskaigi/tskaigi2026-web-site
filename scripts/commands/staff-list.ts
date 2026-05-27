import { defineCommand } from "citty";
import { generateStaffLists } from "../generate-staff-list.mjs";

export default defineCommand({
  meta: {
    name: "staff-list",
    description: "staff / day-staff の一覧 TS ファイルを生成",
  },
  run() {
    generateStaffLists();
  },
});
