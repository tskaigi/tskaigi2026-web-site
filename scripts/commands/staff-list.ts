import path from "node:path";
import { defineCommand } from "citty";
import { generateStaffList } from "../lib/staff-list";
import { logger } from "../utils/logger";

export default defineCommand({
  meta: {
    name: "staff-list",
    description: "staff / day-staff の一覧 TS ファイルを生成",
  },
  run() {
    const staff = generateStaffList({
      dir: path.join("src", "constants", "staff"),
      outputFile: path.join("src", "constants", "staff.generated.ts"),
      listName: "STAFF_LIST",
      typeName: "Staff",
      varPrefix: "staff",
    });
    logger.success(`Generated ${staff.outputFile} (${staff.entries} entries)`);

    const dayStaff = generateStaffList({
      dir: path.join("src", "constants", "day-staff"),
      outputFile: path.join("src", "constants", "day-staff.generated.ts"),
      listName: "DAY_STAFF_LIST",
      typeName: "DayStaff",
      varPrefix: "dayStaff",
    });
    logger.success(
      `Generated ${dayStaff.outputFile} (${dayStaff.entries} entries)`,
    );
  },
});
