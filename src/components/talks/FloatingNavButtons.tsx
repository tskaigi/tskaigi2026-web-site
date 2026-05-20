"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const LINKS: { href: string; label: string; id?: string }[] = [
  {
    href: "/talks/me",
    label: "マイタイムテーブルへ",
    id: "tour-floating-button",
  },
  { href: "/talks", label: "タイムテーブルへ" },
];

export function FloatingNavButtons() {
  const pathname = usePathname();
  return (
    <>
      {LINKS.filter((link) => link.href !== pathname).map((link) => (
        <Button
          key={link.href}
          id={link.id}
          type="button"
          asChild
          className="rounded-full shadow-lg"
        >
          <Link href={link.href}>{link.label}</Link>
        </Button>
      ))}
    </>
  );
}
