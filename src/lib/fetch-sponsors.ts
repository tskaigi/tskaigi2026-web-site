import type {
  GroupedSponsors,
  SponsorApiResponse,
  SponsorPlan,
} from "@/types/sponsor-api";

const SPONSORS_API_URL =
  "https://tskaigi-cms.system-admin-df1.workers.dev/api/sponsors";

const SPONSOR_PLANS: SponsorPlan[] = ["platinum", "gold", "silver", "bronze"];

export async function fetchSponsors(): Promise<GroupedSponsors> {
  const response = await fetch(SPONSORS_API_URL, {
    next: { revalidate: 3600 }, // 1時間ごとに再検証
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch sponsors: ${response.statusText}`);
  }

  const sponsors: SponsorApiResponse[] = await response.json();

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
