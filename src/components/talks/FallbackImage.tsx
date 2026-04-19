"use client";

import Image from "next/image";
import { useState } from "react";

export function OgpImage({ id, title }: { id: string; title: string }) {
  const [hasError, setHasError] = useState(false);
  const src = hasError ? "/key-visual-2026.svg" : `/ogp/talks/${id}.png`;

  return (
    <Image
      width={730}
      height={383}
      className="w-full max-w-[730px] h-auto max-h-[383px] mx-auto object-contain"
      src={src}
      alt={title}
      onError={() => setHasError(true)}
    />
  );
}

export function ProfileImage({
  speakerName,
  profileImageUrl,
}: {
  speakerName: string;
  profileImageUrl?: string;
}) {
  const [hasError, setHasError] = useState(false);
  const src = hasError || !profileImageUrl ? "/logo-2026.svg" : profileImageUrl;

  return (
    <Image
      src={src}
      alt={speakerName}
      fill
      className="object-contain"
      onError={() => setHasError(true)}
    />
  );
}
