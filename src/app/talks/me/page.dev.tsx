import type { Metadata } from "next";
import MyTimetablePage from "./MyTimetablePage";

export const metadata: Metadata = {
  title: "マイタイムテーブル",
  twitter: {
    title: "マイタイムテーブル",
  },
  openGraph: {
    title: "マイタイムテーブル",
  },
};

export default function Page() {
  return <MyTimetablePage />;
}
