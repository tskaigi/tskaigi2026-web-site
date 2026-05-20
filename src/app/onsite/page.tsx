import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "会場インフォメーション",
  twitter: {
    title: "会場インフォメーション",
    images: ["/onsite-ogp.png"],
  },
  openGraph: {
    title: "会場インフォメーション",
    images: ["/onsite-ogp.png"],
  },
};

export default function OnsitePage() {
  return (
    <main className="bg-blue-light-100 flex-1 pt-16 py-10 md:px-8">
      <h1 className="text-2xl font-bold text-blue-light-500 text-center py-10 md:py-16 md:text-3xl lg:text-4xl">
        会場インフォメーション
      </h1>

      <div className="bg-white p-6 flex flex-col gap-10 max-w-screen-xl mx-auto md:rounded-xl lg:p-10">
        <section className="flex flex-col gap-6">
          <h2 className="text-xl font-bold text-blue-light-500 md:text-2xl">
            フロアマップ
          </h2>
          <div className="w-full">
            <Image
              src="/onsite/onsite-map.svg"
              alt="フロアマップ"
              width={502}
              height={344}
              className="w-full h-auto"
            />
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="text-xl font-bold text-blue-light-500 md:text-2xl">
            開場時間
          </h2>
          <div className="flex flex-col gap-4">
            <p>
              <span className="font-bold">一般開場：</span>会場は
              <span className="font-bold">10:00</span>より開場します。
            </p>
            <p>
              <span className="font-bold">オープニングトーク：</span>
              <span className="font-bold">10:40</span>より開始します。
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="text-xl font-bold text-blue-light-500 md:text-2xl">
            アクセス
          </h2>
          <div className="flex flex-col gap-4">
            <p>
              会場のベルサール羽田空港は、
              <span className="font-bold">「羽田エアポートガーデン1F」</span>
              にございます。
            </p>
            <p>
              羽田エアポートガーデンは空港到着ロビー及び京浜急行・東京モノレールの
              <span className="font-bold">「羽田空港第3ターミナル」</span>
              駅から連絡通路でホテルに直結しています。
            </p>
            <p>
              アクセスの詳細は
              <a
                href="https://www.shopping-sumitomo-rd.com/haneda/access/#:~:text=京急線「羽田空港第３ターミナル」駅からの行き方"
                target="_blank"
                rel="noopener noreferrer"
                className="text-link-light underline"
              >
                こちら
              </a>
              をご確認ください。
            </p>
            <div>
              <p className="font-bold">所在地：</p>
              <p>〒144-0041</p>
              <p>東京都大田区羽田空港2-7-1　羽田エアポートガーデン1F</p>
            </div>
            <div className="w-full max-w-2xl overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3246.3698485623568!2d139.7649965!3d35.544567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6018614aac06297b%3A0x5034a6814536049d!2z44OZ44Or44K144O844Or576955Sw56m65riv!5e0!3m2!1sja!2sjp!4v1768122966474!5m2!1sja!2sjp"
                width="100%"
                height="100%"
                className="border-0 h-[380px]"
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="ベルサール羽田空港の Google map の情報"
              />
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="text-xl font-bold text-blue-light-500 md:text-2xl">
            Wi-Fi
          </h2>
          <div className="flex flex-col gap-4">
            <p>
              会場ではWi-Fiをご利用いただけます。接続には下記の情報をご使用ください。
            </p>
            <div className="flex flex-col gap-1">
              <p>
                <span className="font-bold">SSID：</span>TSKaigi2026
              </p>
              <p>
                <span className="font-bold">パスワード：</span>i-love-typescript
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="text-xl font-bold text-blue-light-500 md:text-2xl">
            ランチ
          </h2>
          <ul className="flex flex-col gap-4 list-disc list-outside pl-5">
            <li>
              レバレジーズトラック後方・UPSIDERトラック後方・休憩ルーム内でお弁当または食券（ランチチケット）を配布します。
            </li>
            <li>
              お弁当は各セッションルームまたは休憩ルーム内でお召し上がりいただけます。
            </li>
            <li>
              食券（ランチチケット）は会場外のグランドホワイエ内の飲食店でご利用いただけます。詳しくは券面に記載のQRコードからご確認ください。
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
