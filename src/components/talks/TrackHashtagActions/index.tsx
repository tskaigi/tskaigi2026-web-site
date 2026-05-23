"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showAppToast } from "@/components/ui/GlobalToast";
import { cn } from "@/lib/utils";
import type { Track } from "@/types/timetable-api";
import {
  buildXTrackDeepLinkUrl,
  buildXTrackIntentUrl,
  openXPostIntent,
} from "@/utils/xIntent";

type Props = {
  track: Track;
  /**
   * - "header": スロットヘッダー用の大きめボタン（コピーのみ）
   * - "compact": トーク詳細用の小さめボタン（コピー＋X投稿）
   */
  variant?: "header" | "compact";
  /** compact のみ: 「Xに投稿」ボタンで本文に含めるセッション詳細 URL */
  talkUrl?: string;
  className?: string;
};

export function TrackHashtagActions({
  track,
  variant = "header",
  talkUrl,
  className,
}: Props) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(track.hashtag);
      showAppToast(`${track.hashtag} をコピーしました`);
    } catch (err) {
      console.error("クリップボードへのコピーに失敗しました", err);
    }
  };

  const handleOpenXWithUrl = () => {
    openXPostIntent({
      deepLink: buildXTrackDeepLinkUrl({
        trackHashtag: track.hashtag,
        url: talkUrl,
      }),
      webFallback: buildXTrackIntentUrl({
        trackHashtag: track.hashtag,
        url: talkUrl,
      }),
    });
  };

  const handleOpenXHashtagOnly = () => {
    openXPostIntent({
      deepLink: buildXTrackDeepLinkUrl({ trackHashtag: track.hashtag }),
      webFallback: buildXTrackIntentUrl({ trackHashtag: track.hashtag }),
    });
  };

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2 flex-wrap", className)}>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-full bg-white border border-black-400 px-2.5 py-1 text-xs font-medium text-black-700 hover:bg-black-50 active:bg-black-100 cursor-pointer transition-colors"
        >
          <span>{track.hashtag}</span>
          <Copy size={12} className="shrink-0 text-black-400" />
        </button>
        {talkUrl && (
          <button
            type="button"
            onClick={handleOpenXWithUrl}
            className="inline-flex items-center gap-1.5 rounded-full bg-white border border-black-400 px-2.5 py-1 text-xs font-medium text-black-700 hover:bg-black-50 active:bg-black-100 cursor-pointer transition-colors"
          >
            <img src="/talks/sns/x-logo.png" alt="X" width={12} height={12} />
            <span>に投稿</span>
          </button>
        )}
        <button
          type="button"
          onClick={handleOpenXHashtagOnly}
          className="inline-flex items-center gap-1.5 rounded-full bg-white border border-black-400 px-2.5 py-1 text-xs font-medium text-black-700 hover:bg-black-50 active:bg-black-100 cursor-pointer transition-colors"
        >
          <img src="/talks/sns/x-logo.png" alt="X" width={12} height={12} />
          <span>タグのみ</span>
        </button>
      </div>
    );
  }

  // header: コピーのみ（タイムテーブル側）
  return (
    <div
      className={cn(
        "flex justify-center items-center gap-2 flex-wrap",
        className,
      )}
    >
      <Button
        type="button"
        onClick={handleCopy}
        className="rounded-full bg-white text-black hover:bg-gray-100 px-4 py-1 text-sm font-medium h-auto flex items-center gap-2 cursor-pointer"
      >
        <span>{track.hashtag}</span>
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );
}
