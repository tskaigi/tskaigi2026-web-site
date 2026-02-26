export type SponsorPlan = "platinum" | "gold" | "silver" | "bronze";

export type SponsorOption =
  | "session_room_naming"
  | "sponsor_session"
  | "intermission_cm"
  | "coffee"
  | "beer"
  | "name_card"
  | "student_support";

export type SponsorApiResponse = {
  id: string;
  name: string;
  sponsorOptions: SponsorOption[];
  plan: SponsorPlan;
  logoImage: string;
  logoLink: string;
  displayOrder: number;
};

export type GroupedSponsors = {
  [key in SponsorPlan]: SponsorApiResponse[];
};
