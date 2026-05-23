import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "NFCカードの使い方ガイド",
  twitter: {
    title: "NFCカードの使い方ガイド",
    images: ["/ogp.png"],
  },
  openGraph: {
    title: "NFCカードの使い方ガイド",
    images: ["/ogp.png"],
  },
};

export default function NfcUsageGuidePage() {
  return (
    <main className="bg-blue-light-100 flex-1 pt-16 py-10 md:px-8">
      <h1 className="text-2xl font-bold text-blue-light-500 text-center py-10 md:py-16 md:text-3xl lg:text-4xl">
        NFCカードの使い方ガイド
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
                TSKaigi 2026では、参加者のみなさまにオリジナルのNFCカードをお配りしています。ぜひ当日の交流にお役立てください。
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
            使い方ガイド（XのIDを共有する）
          </h2>
          <p>
            ここでは
            <span className="font-bold">「NFC Tools」</span>
            というアプリを使って、自分のXのプロフィールページをNFCカードに書き込む方法をご紹介します。
          </p>

          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold md:text-xl">
              1. 「NFC Tools」アプリをインストールする
            </h3>
            <p>
              お使いのスマートフォンに、無料アプリ
              <span className="font-bold">「NFC Tools」</span>
              をインストールしてください。
            </p>
            <ul className="flex flex-col gap-2 list-disc list-outside pl-5">
              <li>
                <a
                  href="https://apps.apple.com/jp/app/nfc-tools/id1252962749"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link-light underline"
                >
                  App Store（iPhone向け）
                </a>
              </li>
              <li>
                <a
                  href="https://play.google.com/store/apps/details?id=com.wakdev.wdnfc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link-light underline"
                >
                  Google Play（Android向け）
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold md:text-xl">
              2. 「書く」をタップする
            </h3>
            <p>
              アプリを起動し、メニュー画面から
              <span className="font-bold">「書く」</span>を選択します。
            </p>
            <div className="w-full max-w-xs">
              <Image
                src="/nfc-usage-guide/description1.jpg"
                alt="NFC Toolsのメニュー画面。「書く」を選択する。"
                width={490}
                height={1000}
                className="w-full h-auto rounded-lg border border-black-100"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold md:text-xl">
              3. 「レコードを追加」からXのURLを登録する
            </h3>
            <p>
              <span className="font-bold">「レコードを追加」</span>
              をタップして、レコードの種類から
              <span className="font-bold">「URL / URI」</span>
              を選択してください。表示された入力欄に、ご自身のXのプロフィールURL（例：
              <span className="font-mono">https://x.com/yourname</span>
              ）を入力してOKを押します。
            </p>
            <div className="w-full max-w-xl">
              <Image
                src="/nfc-usage-guide/description2.jpg"
                alt="NFC Toolsの「書く」画面。「レコードを追加」「書き込み」のボタンが並んでいる。"
                width={1179}
                height={720}
                className="w-full h-auto rounded-lg border border-black-100"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold md:text-xl">
              4. 「書き込み」でカードに書き込む
            </h3>
            <p>
              <span className="font-bold">「書き込み」</span>
              をタップし、スマートフォンの背面をNFCカードに近づけてください。「書き込みに成功しました」と表示されれば完了です。
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold md:text-xl">
              5. 相手と交換してみる
            </h3>
            <p>
              準備が整ったら、相手のスマートフォンにカードをかざしてみてください。画面上にXのプロフィールページへのリンクが表示されるので、そのままフォローすればOKです。
            </p>
            <p>
              ※ 同じ手順で、GitHubのプロフィールURLや技術ブログのURLを書き込むこともできます。用途に合わせてご活用ください。
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
