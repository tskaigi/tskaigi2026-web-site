"use client";

import { Copy } from "lucide-react";
import { showAppToast } from "@/components/ui/GlobalToast";
import { cn } from "@/lib/utils";
import { copyTalk } from "./copyTalk";

type Props = {
  talkId: string;
  title: string;
  speakerName: string;
  className?: string;
};

export function CopyableTitle({
  talkId,
  title,
  speakerName,
  className,
}: Props) {
  const handleCopy = async () => {
    await copyTalk({ talkId, title, speakerName });
    showAppToast("タイトルとリンクをコピーしました");
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex w-fit items-center gap-2 text-left text-2xl font-bold cursor-pointer rounded-md px-1 -mx-1 py-0.5 border border-transparent backdrop-blur-sm transition-all hover:bg-white/40 hover:border-black-200/60 hover:shadow-sm active:bg-white/60 active:border-black-300/70 active:shadow-inner",
        className,
      )}
    >
      <span>{title}</span>
      <Copy size={20} className="shrink-0 text-black-400" />
    </button>
  );
}
