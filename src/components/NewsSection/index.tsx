"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export const NewsSection = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <section id="news" className="w-full bg-blue-light-100">
      <div className="bg-white md:rounded-2xl mx-auto max-w-[940px] p-4 sm:p-6">
        <div className="grid gap-2 sm:grid-cols-[max-content_1fr]">
          <div>2026.05.21. </div>
          <div>
            <Link
              href="/talks/me"
              className="text-link-light underline underline-offset-3 hover:no-underline"
            >
              マイタイムテーブル
            </Link>
            を公開しました
          </div>
          <div>2026.05.21. </div>
          <div>
            <Link
              href="/onsite"
              className="text-link-light underline underline-offset-3 hover:no-underline"
            >
              会場インフォメーション
            </Link>
            を公開しました
          </div>
          {expanded && (
            <>
              <div>2026.04.29. </div>
              <div>
                <Link
                  href="/talks"
                  className="text-link-light underline underline-offset-3 hover:no-underline"
                >
                  トーク詳細
                </Link>
                を公開しました
              </div>
              <div>2026.04.23. </div>
              <div>現地参加チケット販売終了しました</div>
              <div>2026.04.22. </div>
              <div>
                <Link
                  href="/talks"
                  className="text-link-light underline underline-offset-3 hover:no-underline"
                >
                  タイムテーブル
                </Link>
                を公開しました
              </div>
              <div>2026.04.18. </div>
              <div>チケット販売第二弾を開始しました</div>
              <div>2026.04.08. </div>
              <div>
                <Link
                  href="/sponsors"
                  className="text-link-light underline underline-offset-3 hover:no-underline"
                >
                  スポンサー情報
                </Link>
                を公開しました
              </div>
              <div>2026.03.26. </div>
              <div>
                <Link
                  href="#keynote"
                  className="text-link-light underline underline-offset-3 hover:no-underline"
                >
                  基調講演
                </Link>
                を公開しました
              </div>
            </>
          )}
        </div>
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            className="flex items-center gap-1 text-sm text-link-light underline underline-offset-3 hover:no-underline"
          >
            {expanded ? "閉じる" : "もっと見る"}
            <ChevronDown
              className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>
    </section>
  );
};
