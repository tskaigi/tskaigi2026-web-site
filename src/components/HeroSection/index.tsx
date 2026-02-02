"use client";
import Image from "next/image";

export function HeroSection() {
  return (
    <div className="w-full">
      <Image
        src="/key-visual-2026.svg"
        alt="TSKaigi"
        width={1344}
        height={484}
        className="w-full"
      />
      <div className="w-full h-10 bg-gradient-to-b from-white to-blue-light-100" />
    </div>
  );
}
