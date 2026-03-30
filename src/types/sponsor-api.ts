export type SponsorPlan = "platinum" | "gold" | "silver" | "bronze";
export type ExternalLinkProps = { label: string; url: string };

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
  slug: string;
  overview: string | null;
  externalLinks: ExternalLinkProps[];
  ogpImage: string;
};

export type GroupedSponsors = {
  [key in SponsorPlan]: SponsorApiResponse[];
};
