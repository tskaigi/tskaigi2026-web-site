import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | TSKaigi 2025",
    default: "マイタイムテーブル",
  },
  twitter: {
    title: {
      template: "%s | TSKaigi 2025",
      default: "マイタイムテーブル",
    },
  },
  openGraph: {
    title: {
      template: "%s | TSKaigi 2025",
      default: "マイタイムテーブル",
    },
  },
};

export default function MyTimetableLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
