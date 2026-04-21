import { convertToUpperCamelCase } from "./utils";

type SponsorClass = "platinum" | "gold" | "silver" | "bronze";
type SponsorRole = SponsorClass | "coffee" | "beer" | "naming-rights";

const bgColor: { [key in SponsorRole]: string } = {
  platinum: "bg-blue-purple-600",
  gold: "bg-yellow-600",
  silver: "bg-blue-light-500",
  bronze: "bg-orange-600",
  coffee: "bg-black-500",
  beer: "bg-black-500",
  "naming-rights": "bg-black-500",
};

const RoleBadge = ({ role }: { role: SponsorRole }) => {
  return (
    <span
      className={`font-bold text-sm text-white px-3 py-1 rounded-s rounded-e ${bgColor[role]}`}
    >
      {convertToUpperCamelCase(role)}
    </span>
  );
};

export default RoleBadge;
