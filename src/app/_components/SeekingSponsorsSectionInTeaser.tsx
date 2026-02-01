import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Decoration } from "@/components/Decoration";
import { Button } from "@/ui/button";

export function SeekingSponsorsSectionInTeaser() {
  return (
    <div className="w-full flex flex-col items-center gap-16 px-8 pt-10 pb-16">
      <div className="w-full lg:w-[760px] flex flex-col items-center gap-10">
        <div className="flex flex-col items-center">
          <h2 className="lg:text-[32px] md:text-[28px] text-[24px] font-bold text-center pb-4">
            スポンサー募集
          </h2>
          <Decoration />
        </div>
        <div className="text-[16px] md:text-[18px] text-left leading-[1.8]">
          <p>
            TypeScriptコミュニティの発展に共に取り組んでいただけるスポンサー企業を募集いたします。
            希望される企業様はスポンサー向け資料をご確認の上、お申し込みください。
          </p>
          <br />
          <p>
            [1/26追記] 1次募集は2026/1/26 18:00 を持って終了いたしました。
            2次募集は1次募集で残った枠数に応じて開始予定です。
            公式サイトやXなどでお知らせしますので、今しばらくお待ちください。
          </p>
        </div>
        <Button
          asChild
          variant="default"
          size="lg"
          className="rounded-full w-[280px] h-[60px] fill-primary hover:bg-[#1854FF]"
        >
          <Link
            href="/sponsors/call-for-sponsors"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-base leading-6"
          >
            TSKaigi 2026 協賛の案内
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </div>
  );
}
