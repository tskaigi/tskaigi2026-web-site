import { ApplyToProposalSection } from "@/components/ApplyToProposalSection";
import { BuyTicketSection } from "@/components/BuyTicketSection";
import { CoreStaffSection } from "@/components/CoreStaffSection";
import { HeroSection } from "@/components/HeroSection";
import { JudgesSection } from "@/components/JudgesSection";
import { KeynoteSection } from "@/components/KeynoteSection";
import { MissionSection } from "@/components/MissionSection";
import { NewsSection } from "@/components/NewsSection";
import { SponsorsBoardSection } from "@/components/SponsorsBoardSection";
import { StaffSection } from "@/components/StaffSection";
import { SeekingSponsorsSection } from "./_components/SeekingSponsorsSection";

export default async function Home() {
  return (
    <main className="w-full flex flex-col flex-1 items-center font-outfit pt-[60px] md:pt-[68px]">
      <HeroSection />
      <NewsSection />
      <MissionSection />
      <KeynoteSection />
      <BuyTicketSection />
      <ApplyToProposalSection />
      <SeekingSponsorsSection />
      <SponsorsBoardSection />
      <JudgesSection />
      <CoreStaffSection />
      <StaffSection />
    </main>
  );
}
