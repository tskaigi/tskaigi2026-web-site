import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "タイムキーパー",
  robots: "noindex, nofollow",
};

export default function TimekeepLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
