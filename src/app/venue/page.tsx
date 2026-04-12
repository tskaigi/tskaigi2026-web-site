import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "会場図",
  twitter: {
    title: "会場図",
  },
  openGraph: {
    title: "会場図",
  },
};

export default function VenuePage() {
  return (
    <main className="bg-blue-light-100 flex-1 pt-16 py-10 md:px-8">
      <h1 className="text-2xl font-bold text-blue-light-500 text-center py-10 md:py-16 md:text-3xl lg:text-4xl">
        会場図
      </h1>

      <div className="bg-white p-6 flex flex-col gap-6 max-w-screen-xl mx-auto md:rounded-xl lg:p-10">
        <div className="w-full">
          <object
            data="/venue_drawing.pdf"
            type="application/pdf"
            className="w-full h-[60vh] md:h-[75vh] lg:h-[85vh] rounded-lg border border-black-200"
          >
            <p className="text-center text-black-500">
              PDFの表示に対応していないブラウザです。
              <Link
                href="/venue_drawing.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-link-light underline ml-1"
              >
                こちらからダウンロード
              </Link>
              してご覧ください。
            </p>
          </object>
        </div>

        <p className="text-sm text-black-500 text-center">
          <Link
            href="https://www.hvf.jp/conference/hanedaairport/pdf/venue_drawing.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-link-light underline"
          >
            ベルサール羽田空港
          </Link>
          より引用して作成
        </p>
      </div>
    </main>
  );
}
