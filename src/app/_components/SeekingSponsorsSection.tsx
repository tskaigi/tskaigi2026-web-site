import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/ui/button";

export function SeekingSponsorsSection() {
  return (
    <div className="w-full flex flex-col items-center gap-16 px-8 pt-10 pb-16">
      <div className="w-full lg:w-[760px] flex flex-col items-center gap-10">
        <h2 className="text-[32px] lg:text-4xl leading-[48px] tracking-[-1.2%] font-bold text-center">
          スポンサー2次募集
        </h2>
        <div className="px-0 md:px-10 font-normal text-m leading-[25px] tracking-[-0.75%]">
          <p>
            TypeScriptコミュニティの発展に共に取り組んでいただけるスポンサー企業を募集いたします。
            希望される企業様はスポンサー向け資料をご確認の上、お申し込みください。
            現在は2次募集中です。
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
