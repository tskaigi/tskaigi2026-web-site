import type { Metadata } from "next";
import YourTimetablePage from "./YourTimetablePage";

export const metadata: Metadata = {
  title: "タイムテーブル",
  twitter: {
    title: "タイムテーブル",
  },
  openGraph: {
    title: "タイムテーブル",
  },
};

export default function Page() {
  return <YourTimetablePage />;
}
