import Link from "next/link";

export const NewsSection = () => {
  return (
    <section id="news" className="w-full bg-blue-light-100">
      <div className="bg-white md:rounded-2xl mx-auto grid max-w-[940px] gap-2 p-4 sm:grid-cols-[max-content_1fr] sm:p-6">
        <div>2026.04.23. </div>
        <div>現地参加チケット販売終了しました</div>
        <div>2026.04.22. </div>
        <div>
          <Link
            href="/talks"
            className="text-link-light underline underline-offset-3 hover:no-underline"
          >
            タイムテーブル
          </Link>
          を公開しました
        </div>
        <div>2026.04.18. </div>
        <div>チケット販売第二弾を開始しました</div>
        <div>2026.04.08. </div>
        <div>
          <Link
            href="/sponsors"
            className="text-link-light underline underline-offset-3 hover:no-underline"
          >
            スポンサー情報
          </Link>
          を公開しました
        </div>
        <div>2026.03.26. </div>
        <div>
          <Link
            href="#keynote"
            className="text-link-light underline underline-offset-3 hover:no-underline"
          >
            基調講演
          </Link>
          を公開しました
        </div>
      </div>
    </section>
  );
};
