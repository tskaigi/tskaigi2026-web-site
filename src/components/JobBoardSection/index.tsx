import Image from "next/image";
import Link from "next/link";
import { fetchSponsors } from "@/lib/fetch-sponsors";

export async function JobBoardSection() {
  const sponsors = await fetchSponsors();
  const jobBoardSponsors = [
    ...sponsors.platinum.filter((v) => v.jobboard),
    ...sponsors.gold.filter((v) => v.jobboard),
    ...sponsors.silver.filter((v) => v.jobboard),
  ];

  return (
    <section className="pb-10 px-6 md:pb-20 md:px-10 bg-blue-light-100">
      <h2 className="text-[24px] md:text-[32px] leading-normal md:leading-12 text-center font-bold pt-8 pb-8 md:pt-10 md:pb-10">
        JOB BOARD
      </h2>

      <div className="mx-auto grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {jobBoardSponsors.map((sponsor) => {
          if (!sponsor.jobboard) return null;
          return (
            <Link
              key={sponsor.id}
              href={sponsor.jobboard.externalLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src={sponsor.jobboard.imagePath}
                alt={`${sponsor.name}のジョブボード`}
                width={1200}
                height={600}
                className="aspect-1200/600 object-contain"
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
