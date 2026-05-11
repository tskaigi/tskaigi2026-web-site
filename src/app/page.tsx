import { BuyTicketSection } from "@/components/BuyTicketSection";
import { CoreStaffSection } from "@/components/CoreStaffSection";
import { HeroSection } from "@/components/HeroSection";
import { JobBoardSection } from "@/components/JobBoardSection";
import { JudgesSection } from "@/components/JudgesSection";
import { KeynoteSection } from "@/components/KeynoteSection";
import { MissionSection } from "@/components/MissionSection";
import { NewsSection } from "@/components/NewsSection";
import { OnTheDayLinksSection } from "@/components/OnTheDayLinkSection";
import PersonalSponsorsSection from "@/components/PersonalSponsorsSection";
import { SponsorsBoardSection } from "@/components/SponsorsBoardSection";
import { StaffSection } from "@/components/StaffSection";
import { fetchSponsors } from "@/lib/fetch-sponsors";

export default async function Home() {
  const sponsors = await fetchSponsors();
  return (
    <main className="w-full flex flex-col flex-1 items-center font-outfit pt-[60px] md:pt-[68px]">
      <HeroSection />
      <OnTheDayLinksSection />
      <NewsSection />
      <MissionSection />
      <KeynoteSection />
      <BuyTicketSection />
      <JobBoardSection sponsors={sponsors} />
      <SponsorsBoardSection sponsors={sponsors} />
      <PersonalSponsorsSection />
      <JudgesSection />
      <CoreStaffSection />
      <StaffSection />
    </main>
  );
}
