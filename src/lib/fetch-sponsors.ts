import sponsorsData from "@/constants/sponsors.json";
import type {
  GroupedSponsors,
  SponsorApiResponse,
  SponsorPlan,
} from "@/types/sponsor-api";

const SPONSOR_PLANS: SponsorPlan[] = ["platinum", "gold", "silver", "bronze"];

const sponsors = sponsorsData as SponsorApiResponse[];

export async function fetchSponsors(): Promise<GroupedSponsors> {
  const grouped: GroupedSponsors = {
    platinum: [],
    gold: [],
    silver: [],
    bronze: [],
  };

  for (const sponsor of sponsors) {
    grouped[sponsor.plan].push(sponsor);
  }

  for (const plan of SPONSOR_PLANS) {
    grouped[plan].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  return grouped;
}

export async function fetchSponsor(slug: string): Promise<SponsorApiResponse> {
  const sponsor = sponsors.find((s) => s.slug === slug);

  if (!sponsor) {
    throw new Error(`Sponsor not found: ${slug}`);
  }

  return sponsor;
}
