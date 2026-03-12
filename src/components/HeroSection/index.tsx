"use client";
import { KeyVisualAnimation } from "./KeyVisualAnimation";

export function HeroSection() {
  return (
    <div className="w-full">
      <KeyVisualAnimation />
      <div className="w-full h-10 bg-gradient-to-b from-white to-blue-light-100" />
    </div>
  );
}
