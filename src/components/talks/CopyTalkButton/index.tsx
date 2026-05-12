"use client";

import { Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const BASE_URL = "https://2026.tskaigi.org";

type Props = {
  talkId: string;
  title: string;
  speakerName: string;
};

export function CopyTalkButton({ talkId, title, speakerName }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${BASE_URL}/talks/${talkId}`;
    const anchorText = `${title}（${speakerName}）`;
    const html = `<a href="${url}">${anchorText}</a>`;
    const plain = `${anchorText}\n${url}`;

    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([plain], { type: "text/plain" }),
      }),
    ]);

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="gap-2"
      onClick={handleCopy}
    >
      <Copy size={16} />
      {copied ? "コピーしました！" : "タイトルをコピー"}
    </Button>
  );
}
