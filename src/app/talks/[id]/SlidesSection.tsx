"use client";

import Link from "next/link";
import { useSessionStarted } from "@/hooks/useSessionStarted";

/**
 * 登壇資料セクション。開始時刻前は公開予告メッセージ、開始後はリンクを表示する。
 * 開始時刻のゲートはクライアント側で判定するため、このコンポーネント単位で
 * "use client" を切ってある（親の TalkContent は server component のまま）。
 */
export function SlidesSection({
  slidesLink,
  startTime,
}: {
  slidesLink: string;
  startTime: number;
}) {
  const isStarted = useSessionStarted(startTime);

  return (
    <div className="px-6 md:px-8 lg:px-10">
      <h2 className="text-xl font-bold text-blue-light-500 border-b border-blue-light-500 pb-0.5 w-fit pr-2">
        登壇資料
      </h2>
      {isStarted ? (
        <Link
          href={slidesLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center text-link-light hover:underline break-all"
        >
          {slidesLink}
        </Link>
      ) : (
        <p className="mt-3 text-gray-700">
          セッションの開始時間になりましたら公開いたします
        </p>
      )}
    </div>
  );
}
