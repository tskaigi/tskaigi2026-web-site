import type { Metadata } from "next";
import { Noto_Sans_JP, Outfit } from "next/font/google";
import type React from "react";
import { Suspense } from "react";
import "./globals.css";
import Footer from "@/components/Footer";
import { Header } from "@/components/Header";
import { GlobalToast } from "@/components/ui/GlobalToast";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | TSKaigi 2026",
    default: "TSKaigi 2026",
  },
  metadataBase: new URL("https://2026.tskaigi.org/"),
  description:
    "TSKaigiは日本最大級のTypeScriptをテーマとした技術カンファレンスです。2026/5/22 (金) - 23 (土) の日程で開催します。",
  applicationName: "TSKaigi 2026",
  authors: [
    {
      name: "一般社団法人TSKaigi Association",
      url: "https://association.tskaigi.org/",
    },
  ],
  keywords: [
    "TypeScript",
    "TSKaigi",
    "TS会議",
    "カンファレンス",
    "イベント",
    "オンライン",
  ],
  publisher: "TSKaigi.org",
  robots: "index, follow",
  twitter: {
    title: {
      template: "%s | TSKaigi 2026",
      default: "TSKaigi 2026",
    },
    description:
      "TSKaigiは、日本最大級のTypeScriptをテーマとした技術カンファレンスです",
    card: "summary_large_image",
    site: "@tskaigi",
    creator: "@tskaigi",
    images: ["/ogp.png"],
  },
  openGraph: {
    title: {
      template: "%s | TSKaigi 2026",
      default: "TSKaigi 2026",
    },
    url: "https://2026.tskaigi.org/",
    description:
      "TSKaigiは日本最大級のTypeScriptをテーマとした技術カンファレンスです。2026/5/22 (金) - 23 (土) の日程で開催します。",
    type: "website",
    images: ["/ogp.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${outfit.variable} ${notoSansJP.variable} font-noto antialiased`}
      >
        <Suspense>
          <div className="flex flex-col min-h-screen">
            <Header />
            {children}
            <Footer />
            <GlobalToast />
          </div>
        </Suspense>
      </body>
    </html>
  );
}
