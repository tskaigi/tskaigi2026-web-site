import type { Metadata } from "next";
import { TourWrapper } from "@/components/talks/Tour";

export const metadata: Metadata = {
  title: {
    template: "%s | TSKaigi 2026",
    default: "タイムテーブル",
  },
  twitter: {
    title: {
      template: "%s | TSKaigi 2026",
      default: "タイムテーブル",
    },
    images: ["/timetable-ogp.png"],
  },
  openGraph: {
    title: {
      template: "%s | TSKaigi 2026",
      default: "タイムテーブル",
    },
    images: ["/timetable-ogp.png"],
  },
};

export default function TalksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TourWrapper>{children}</TourWrapper>;
}
