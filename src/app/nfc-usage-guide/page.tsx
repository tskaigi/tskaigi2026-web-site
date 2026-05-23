import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "NFCカードについて",
  twitter: {
    title: "NFCカードについて",
    images: ["/ogp.png"],
  },
  openGraph: {
    title: "NFCカードについて",
    images: ["/ogp.png"],
  },
};

export default function NfcUsageGuidePage() {
  return (
    <main className="bg-blue-light-100 flex-1 pt-16 py-10 md:px-8">
      <h1 className="text-2xl font-bold text-blue-light-500 text-center py-10 md:py-16 md:text-3xl lg:text-4xl">
        NFCカードについて
      </h1>

      <div className="bg-white p-6 flex flex-col gap-10 max-w-screen-xl mx-auto md:rounded-xl lg:p-10">
        <section className="flex flex-col gap-6">
          <h2 className="text-xl font-bold text-blue-light-500 md:text-2xl">
            NFCカードとは？
          </h2>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-8">
            <div className="flex flex-col gap-4 flex-1">
              <p>
                NFCカードは、スマートフォンをかざすだけで情報を読み書きできる
                <span className="font-bold">非接触型のICカード</span>です。
              </p>
              <p>
                カードにあらかじめURLや連絡先などの情報を書き込んでおくと、相手のスマートフォンをかざすだけでその情報を共有できます。アプリのインストールや会員登録は不要で、ほとんどのスマートフォンで利用できます。
              </p>
              <p>
                TSKaigi 2026では、参加者のみなさまにオリジナルのNFCカードをお配りしています。
                <span className="font-bold">
                  受付時にお渡ししているノベルティトートバックの中
                </span>
                に入っていますので、ぜひ当日の交流にお役立てください。
              </p>
            </div>
            <div className="w-full md:max-w-sm">
              <Image
                src="/nfc-usage-guide/nfc-card.jpg"
                alt="TSKaigi 2026のNFCカード"
                width={600}
                height={600}
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="text-xl font-bold text-blue-light-500 md:text-2xl">
            カンファレンスでこんなことありませんか？
          </h2>
          <div className="flex flex-col gap-4">
            <ul className="flex flex-col gap-3 list-disc list-outside pl-5">
              <li>
                懇親会で意気投合した相手と
                <span className="font-bold">
                  X（旧Twitter）やGitHub、技術記事をシェアし合いたい
                </span>
                けど、お互いのアカウントを検索するのが面倒……
              </li>
              <li>
                IDを口頭で伝えても聞き間違えてしまい、なかなか正しく繋がれない……
              </li>
              <li>
                その場では繋がったつもりだったのに、後から見返すと誰だったかわからなくなってしまった……
              </li>
            </ul>
            <p>
              <span className="font-bold text-pink-500">NFCカード</span>
              を使えば、相手のスマートフォンにカードをかざすだけで、自分のXやGitHubのプロフィールページなどを一瞬で共有できます。
            </p>
            <p>
              検索もタイプミスも不要。会話の流れを止めずに、スマートに繋がることができます。
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="text-xl font-bold text-blue-light-500 md:text-2xl">
            使い方がわからない場合
          </h2>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-8">
            <div className="flex flex-col gap-4 flex-1">
              <p>
                NFCカードへの情報の書き込み方や、相手のカードの読み取り方がわからない場合は、
                <span className="font-bold">休憩ルーム</span>
                に使い方をご案内するブースを設けています。お気軽にお立ち寄りください！
              </p>
            </div>
            <div className="w-full md:max-w-sm">
              <Image
                src="/nfc-usage-guide/guide-booth.jpg"
                alt="休憩ルームに設置されたNFCカードの書き込みブース。ホワイトボードに使い方が掲示されている。"
                width={600}
                height={450}
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
