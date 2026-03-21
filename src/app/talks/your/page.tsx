import type { Metadata } from "next";
import YourTimetablePage from "./YourTimetablePage";

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
  return <YourTimetablePage />;
}
