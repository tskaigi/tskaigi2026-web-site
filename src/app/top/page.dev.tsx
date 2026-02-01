import Image from "next/image";
import { ApplyToProposalSection } from "@/components/ApplyToProposalSection";
import { HeroSection } from "@/components/HeroSection";
import { MissionSection } from "@/components/MissionSection";
import { SeekingSponsorsSection } from "./../_components/SeekingSponsorsSection";

export default function Home() {
  return (
    <main className="w-full flex flex-col flex-1 items-center font-outfit pt-[60px] md:pt-[68px]">
      <HeroSection />
      <MissionSection />
      <ApplyToProposalSection />
      <SeekingSponsorsSection />
    </main>
  );
}
