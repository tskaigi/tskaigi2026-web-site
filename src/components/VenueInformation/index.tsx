import { ExternalLink } from "lucide-react";
import Link from "next/link";

export const VenueInformation = () => {
  return (
    <section className="flex flex-col items-center text-center mt-[24px] md:mt-[40px] lg:mt-[64px] -mx-6 md:mx-0">
      <div className="py-[32px] md:rounded-2xl bg-white px-[24px] md:px-[40px] lg:px-[40ox] w-full max-w-[740px]">
        <div className="space-y-1 mb-8 px-6">
          <h2>
            開催:
            <span className="text-[18px] lg:text-[20px] md:text-[20px] font-bold">
              2026年5月22日-23日 2Days
            </span>
          </h2>
          <p>
            会場:
            <Link
              href="https://www.hvf.jp/conference/hanedaairport/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-link-light font-bold hover:underline"
            >
              ベルサール羽田空港
              <ExternalLink
                className="ml-2 text-link-light size-5"
                aria-hidden
              />
            </Link>
          </p>
        </div>
        <div className="w-full overflow-hidden">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3246.3698485623568!2d139.7649965!3d35.544567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6018614aac06297b%3A0x5034a6814536049d!2z44OZ44Or44K144O844Or576955Sw56m65riv!5e0!3m2!1sja!2sjp!4v1768122966474!5m2!1sja!2sjp"
            width="100%"
            height="100%"
            className="border-0 h-[380px] md:h-[380px] lg:h-[380px]"
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="ベルサール羽田空港の Google map の情報"
          />
        </div>
      </div>
    </section>
  );
};
