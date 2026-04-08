import Image from "next/image";
import Link from "next/link";
import type { SponsorApiResponse } from "@/types/sponsor-api";
import ExternalLink from "../ExternalLink";
import RoleBadge from "../RoleBadge";

type Props = SponsorApiResponse;

const Company = ({
  name,
  logoImage,
  plan,
  overview,
  externalLinks,
  slug,
}: Props) => {
  return (
    <div className="flex flex-col gap-y-3 md:flex-row md:items-start md:gap-x-8 lg:gap-x-10">
      <Link href={`/sponsors/${slug}`} className="shrink-0 md:w-1/3 lg:w-1/4">
        <Image
          src={logoImage}
          alt={name}
          width={1280}
          height={640}
          className="w-full aspect-video lg:aspect-video object-contain"
        />
      </Link>

      <div className="flex flex-col gap-y-3">
        <div className="flex gap-2">
          <RoleBadge role={plan} />
        </div>

        <div className="flex flex-col gap-y-6 text-base md:text-lg">
          <p className="font-bold text-xl md:text-2xl lg:text-[28px]">{name}</p>

          {overview && (
            <p className="whitespace-pre-wrap leading-8">{overview}</p>
          )}

          {externalLinks && (
            <ul className="list-disc list-inside flex flex-col gap-y-2">
              {externalLinks.map((link) => (
                <li key={link.label} className="marker:text-xs">
                  <ExternalLink {...link} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Company;
