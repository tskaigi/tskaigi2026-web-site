import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Decoration } from "@/components/Decoration";
import { Button } from "@/components/ui/button";

const BuyTicketPageLink = {
  offline: "https://peatix.com/event/4932169",
  online: "https://peatix.com/event/4932232",
} as const;

export const BuyTicketSection = () => {
  return (
    <div className="w-full bg-blue-light-100 pb-16 flex items-center justify-center">
      <div className="bg-white p-10 flex flex-col items-center gap-10 rounded-lg md:rounded-2xl max-w-[940px]">
        <div className="flex flex-col items-center">
          <h2 className="lg:text-[32px] md:text-[28px] text-[24px] font-bold text-center pb-4">
            チケットを購入
          </h2>
          <Decoration />
        </div>
        <div className="text-[16px] md:text-[18px] text-left leading-[1.8]">
          <p>
            日本最大級のTypeScriptをテーマとした技術カンファレンス「TSKaigi
            2026」開催決定！
          </p>
          <br />
          <p>
            昨年に続き、TSKaigi 2026を開催します！
            今年は羽田に会場を移し、2日間にわたって開催。
            昨年よりもさらに充実したプログラムを用意し、皆さんをお迎えします。
          </p>
          <p>
            これまでのコンセプトを継承し、学びの場を提供し、情報交換と交流を促進し、TypeScriptコミュニティをさらに盛り上げます！
          </p>
        </div>
        <div className="flex flex-col justify-center gap-5 lg:flex-row">
          <Button
            asChild
            variant="default"
            size="lg"
            className="rounded-full h-[60px] bg-blue-purple-500 hover:bg-blue-purple-600 text-white pl-8 pr-6 md:pl-10 md:pr-8 lg:pl-10 lg:pr-8"
          >
            <Link
              href={BuyTicketPageLink.offline}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold flex items-center text-22 [&_svg]:size-6"
            >
              <span className="text-18 lg:text-22 leading-[1.8]">
                現地参加チケット
              </span>
              <ArrowRight />
            </Link>
          </Button>
          <Button
            asChild
            variant="default"
            size="lg"
            className="rounded-full h-[60px] bg-blue-purple-500 hover:bg-blue-purple-600 text-white pl-8 pr-6 md:pl-10 md:pr-8 lg:pl-10 lg:pr-8"
          >
            <Link
              href={BuyTicketPageLink.online}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold flex items-center text-22 [&_svg]:size-6"
            >
              <span className="text-18 lg:text-22 leading-[1.8]">
                オンライン参加チケット
              </span>
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
