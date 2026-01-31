import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Decoration } from "@/components/Decoration";
import { Button } from "@/ui/button";

export const ApplyToProposalSection = () => {
  return (
    <div className="w-full bg-blue-light-100 pb-16 flex items-center justify-center">
      <div className="bg-white p-10 flex flex-col items-center gap-10 rounded-lg md:rounded-2xl max-w-[940px]">
        <div className="flex flex-col items-center">
          <h2 className="lg:text-[32px] md:text-[28px] text-[24px] font-bold text-center pb-4">
            プロポーザル募集
          </h2>
          <Decoration />
        </div>
        <div className="text-[16px] md:text-[18px] text-left leading-[1.8]">
          <p>
            私たちの願いは、フロントエンドからバックエンド、インフラに至るまで、多様な分野のTypeScriptエンジニアたちが集い、普段は交流の少ないエンジニアたちが、それぞれの得意分野や最新の知見を交換し合う交流の場を創り出すことです。
          </p>
          <br />
          <p>
            あなたの発表が、誰かのキャリア、あるいはプロジェクトに新たな光をもたらすかもしれません。
          </p>
          <p>ぜひ一緒に日本のTypeScriptコミュニティを盛り上げましょう！</p>
        </div>
        <Button
          asChild
          variant="default"
          size="lg"
          className="rounded-full w-[280px]  h-[60px] fill-primary  hover:bg-[#1854FF] text-white pl-10 pr-8"
        >
          <Link
            href="https://docs.google.com/forms/d/e/1FAIpQLSfvXmITidCOR66fIpCvNubjWCUUe-chW78efxWuqyztyn72qg/viewform?usp=header"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold flex text-base leading-6"
          >
            応募する
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </div>
  );
};
