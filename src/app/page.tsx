import { ApplyToProposalSection } from "@/components/ApplyToProposalSection";
import { CoreStaffSection } from "@/components/CoreStaffSection";
import { HeroSection } from "@/components/HeroSection";
import { JudgesSection } from "@/components/JudgesSection";
import { MissionSection } from "@/components/MissionSection";
import { SponsorsBoardSection } from "@/components/SponsorsBoardSection";
import { StaffSection } from "@/components/StaffSection";
import { fetchSponsors } from "@/lib/fetch-sponsors";
import { SeekingSponsorsSection } from "./_components/SeekingSponsorsSection";

export default async function Home() {
  const sponsors = await fetchSponsors();

  return (
    <main className="w-full flex flex-col flex-1 items-center font-outfit pt-[60px] md:pt-[68px]">
      <HeroSection />
      <MissionSection />
      <ApplyToProposalSection />
      <SeekingSponsorsSection />
      <SponsorsBoardSection sponsors={sponsors} />
      <JudgesSection />
      <CoreStaffSection />
      <StaffSection />
    </main>
  );
}
