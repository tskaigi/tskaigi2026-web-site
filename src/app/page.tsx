import { ApplyToProposalSection } from "@/components/ApplyToProposalSection";
import { CoreStaffSection } from "@/components/CoreStaffSection";
import { HeroSection } from "@/components/HeroSection";
import { JudgesSection } from "@/components/JudgesSection";
import { MissionSection } from "@/components/MissionSection";
import { StaffSection } from "@/components/StaffSection";
import { SeekingSponsorsSection } from "./_components/SeekingSponsorsSection";

export default async function Home() {
  return (
    <main className="w-full flex flex-col flex-1 items-center font-outfit pt-[60px] md:pt-[68px]">
      <HeroSection />
      <MissionSection />
      <ApplyToProposalSection />
      <SeekingSponsorsSection />
      <JudgesSection />
      <CoreStaffSection />
      <StaffSection />
    </main>
  );
}
