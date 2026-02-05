import { ApplyToProposalSectionInTeaser } from "@/components/ApplyToProposalSection/InTeaser";
import { EventCountdownBanner } from "../_components/EventCountdownBanner";
import { SeekingSponsorsSectionInTeaser } from "../_components/SeekingSponsorsSectionInTeaser";

export default function Home() {
  return (
    <main className="w-full flex flex-col flex-1 items-center font-outfit">
      <EventCountdownBanner />
      <ApplyToProposalSectionInTeaser />
      <SeekingSponsorsSectionInTeaser />
    </main>
  );
}
