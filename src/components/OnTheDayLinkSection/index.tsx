import {
  ArrowDown,
  ArrowRight,
  Clock3,
  Info,
  MonitorPlay,
  QrCode,
  Ticket,
} from "lucide-react";
import Link from "next/link";

const ticketLinks = {
  offline: "https://peatix.com/event/4932169",
  online: "https://peatix.com/event/4932232",
} as const;

export const OnTheDayLinksSection = () => {
  return (
    <section className="w-full bg-blue-light-100 px-4 pb-12">
      <div className="mx-auto flex max-w-[940px] flex-col gap-4 text-blue-purple-700">
        <h2 className="text-[24px] font-bold md:text-[32px] text-center">
          当日案内
        </h2>
        <div className="relative mr-2 mb-2 flex flex-col divide-y divide-gray-300 bg-white shadow-xl border-2 border-gray-900 before:absolute before:top-0.5 before:-right-2.5 before:-bottom-1.5 before:w-2 before:bg-gray-900 before:content-[''] before:skew-y-45 after:absolute after:left-0.5 after:-bottom-2.5 after:h-2 after:-right-1.5 after:bg-gray-900 after:content-[''] after:skew-x-45">
          <Link
            href="/talks"
            className="group flex items-center gap-3 px-3 py-3 transition-colors hover:bg-[#F4F7FF] md:h-22"
          >
            <div className="flex size-10 shrink-0 items-center justify-center bg-blue-purple-700 text-white md:size-16">
              <Clock3 className="size-7 md:size-12" strokeWidth={2.5} />
            </div>
            <div className="space-y-2">
              <h3 className="text-[14px] font-bold leading-none md:text-[18px]">
                タイムテーブル
              </h3>
              <p className="text-[12px] leading-none md:text-[16px]">
                Timetable
              </p>
            </div>
            <ArrowRight
              strokeWidth={2.5}
              className="ml-auto size-10 shrink-0 transition-transform group-hover:translate-x-1 md:size-16"
            />
          </Link>
          <Link
            href="/onsite"
            className="group flex items-center gap-3 px-3 py-3 transition-colors hover:bg-[#F4F7FF] md:h-22"
          >
            <div className="flex size-10 shrink-0 items-center justify-center bg-blue-purple-700 text-white md:size-16">
              <Info className="size-7 md:size-12" strokeWidth={2.5} />
            </div>
            <div className="space-y-2">
              <h3 className="text-[14px] font-bold leading-none md:text-[18px]">
                会場インフォメーション
              </h3>
              <p className="text-[12px] leading-none md:text-[16px]">
                Information
              </p>
            </div>
            <ArrowRight
              strokeWidth={2.5}
              className="ml-auto size-10 shrink-0 transition-transform group-hover:translate-x-1 md:size-16"
            />
          </Link>
          <div className="flex items-center gap-3 px-3 py-3 md:h-22 md:py-0">
            <div className="flex size-10 shrink-0 items-center justify-center bg-blue-purple-700 text-white md:size-16">
              <Ticket className="size-7 md:size-12" strokeWidth={2.5} />
            </div>
            <div className="mr-auto space-y-2 shrink-0">
              <h3 className="text-[14px] font-bold leading-none md:text-[18px]">
                チケット
              </h3>
              <p className="text-[12px] leading-none md:text-[16px]">Ticket</p>
            </div>
            <div className="flex flex-col md:flex-row gap-3">
              <Link
                href={ticketLinks.offline}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 bg-yellow-200 p-3 text-yellow-700 hover:bg-yellow-300 max-md:w-full md:h-18 md:gap-4"
              >
                <QrCode className="size-8 md:size-10" />
                <div className="min-w-0 mr-auto space-y-1">
                  <p className="text-[14px] font-bold leading-none md:text-[18px]">
                    現地参加
                  </p>
                  <p className="text-[12px] font-medium leading-none md:text-[16px]">
                    Offline
                  </p>
                </div>
                <ArrowRight
                  strokeWidth={2.5}
                  className="size-8 shrink-0 transition-transform group-hover:translate-x-1 md:size-12"
                />
              </Link>
              <Link
                href={ticketLinks.online}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 bg-yellow-200 p-3 text-yellow-700 hover:bg-yellow-300 max-md:w-full md:h-18 md:gap-4"
              >
                <MonitorPlay className="size-8 md:size-10" />
                <div className="min-w-0 mr-auto space-y-1">
                  <p className="text-[14px] font-bold leading-none md:text-[18px]">
                    オンライン
                  </p>
                  <p className="text-[12px] font-medium leading-none md:text-[16px]">
                    Online
                  </p>
                </div>
                <ArrowDown
                  strokeWidth={2.5}
                  className="size-8 shrink-0 transition-transform group-hover:translate-y-1 md:size-12"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
