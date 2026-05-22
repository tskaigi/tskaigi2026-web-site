import type { Metadata } from "next";
import MyTimetablePage from "./MyTimetablePage";

export const metadata: Metadata = {
  title: "マイタイムテーブル",
  twitter: {
    title: "マイタイムテーブル",
    images: ["/my-timetable-ogp.png"],
  },
  openGraph: {
    title: "マイタイムテーブル",
    images: ["/my-timetable-ogp.png"],
  },
};

export default function Page() {
  return <MyTimetablePage />;
}
