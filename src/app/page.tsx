import { EventCountdownBanner } from "./_components/EventCountdownBanner";
import { SeekingSponsorsSection } from "./_components/SeekingSponsorsSection";

export default function Home() {
  return (
    <main className="w-full flex flex-col items-center font-outfit">
      <EventCountdownBanner />
      <SeekingSponsorsSection />
    </main>
  );
}
