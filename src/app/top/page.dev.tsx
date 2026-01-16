import { SponsorsBoardSection } from "@/components/SponsorsBoardSection";
import { HeroSectionWithMotion } from "../../components/HeroSectionWithMotion";
import { MissionSection } from "../../components/MissionSection";

export default function Home() {
  return (
    <main className="pt-8 overflow-x-hidden">
      <HeroSectionWithMotion />
      <MissionSection />
      <SponsorsBoardSection />
    </main>
  );
}
