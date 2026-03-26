import Image from "next/image";
import { Decoration } from "../Decoration";

export const KeynoteSection = () => {
  return (
    <section id="keynote" className="w-full bg-blue-light-100 pb-16">
      <div className="bg-white md:rounded-2xl mx-auto max-w-[940px] p-6 md:p-8 flex flex-col gap-10">
        <div className="flex flex-col items-center">
          <h2 className="lg:text-[32px] md:text-[28px] text-[24px] font-bold text-center pb-4">
            基調講演
          </h2>
          <Decoration />
        </div>

        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          <Image
            src="/keynote/jake.jpg"
            alt="Jake Bailey"
            width={220}
            height={220}
            className="w-full max-w-40 md:max-w-[220px] rounded-xl object-cover aspect-square mx-auto md:mx-0"
          />

          <div>
            <p className="text-2xl font-bold mb-4">
              『TS 7: How We Got There』
            </p>

            <p className="text-2xl font-bold">Jake Bailey</p>
            <p className="text-[16px] md:text-[18px] text-gray-700 mb-2">
              Principal Software Engineer
            </p>
            <p className="text-[16px] text-gray-700 mb-2">
              Jake is a programming language lover and Principal Software
              Engineer at Microsoft. He currently works on TypeScript, mainly
              focusing on performance, infrastructure, and the ecosystem, along
              with side adventures in Go.
            </p>

            <div className="flex flex-row gap-2 text-[16px]">
              <a
                href="https://jakebailey.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-link-light underline underline-offset-3 hover:no-underline"
              >
                jakebailey.dev
              </a>
              /
              <a
                href="https://bsky.app/profile/jakebailey.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-link-light underline underline-offset-3 hover:no-underline"
              >
                Bluesky
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
