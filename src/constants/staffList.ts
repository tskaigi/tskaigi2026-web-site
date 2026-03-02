import { staffListData } from "./staff.generated";

export type Staff = {
  name: string;
  image: string;
  href: `http://${string}` | `https://${string}` | "";
};

export function getStaffList(): Staff[] {
  return [...staffListData] as Staff[];
}
