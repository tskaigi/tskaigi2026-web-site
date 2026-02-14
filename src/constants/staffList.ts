import { globSync, readFileSync } from "node:fs";

export type Staff = {
  name: string;
  image: string;
  href: `http://${string}` | `https://${string}` | "";
};

export function getStaffList(): Staff[] {
  const staffFiles = globSync("src/constants/staff/*.json");
  const staffList: Staff[] = [];

  for (const file of staffFiles) {
    const staffData = JSON.parse(readFileSync(file, "utf-8")) as Staff;
    staffList.push(staffData);
  }

  return staffList;
}
