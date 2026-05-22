import { CopyableTitle } from "@/components/talks/CopyableTitle";
import { OgpImage } from "@/components/talks/FallbackImage";
import { TrackHashtagActions } from "@/components/talks/TrackHashtagActions";
import { TALK_TYPE } from "@/constants/timetable";
import type { SessionDetail } from "@/utils/getSession";
import { myTimetable } from "@/utils/myTimetable";

const THEME_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdZ1OK-_pbUETXpZo2z-yHKk7k4YBwTRlB6CgMaEVqrd1FQpg/viewform?usp=dialog";

// 当日スライドURLをここに設定する（空文字のままだとセクション非表示）
const SLIDES_URL = "";

export function OstContent({
  id,
  detail,
}: {
  id: string;
  detail: SessionDetail;
}) {
  const { session, sessionType, name, startTime, endTime } = detail;
  const timeRange = myTimetable.formatTimeRange(startTime, endTime);

  return (
    <main className="bg-blue-light-100 pt-16 pb-10 md:py-16 md:px-8 lg:px-10">
      <h1 className="text-2xl font-bold text-blue-light-500 text-center py-10 md:py-16 md:text-3xl lg:text-4xl">
        OST (Open Space Technology)
      </h1>

      <div className="bg-white flex flex-col gap-6 max-w-screen-xl mx-auto md:rounded-xl pb-6 md:pb-8 lg:pb-10">
        <div className="bg-black-100 flex justify-center md:mt-8 md:mx-8 lg:mt-10 lg:mx-10">
          <OgpImage id={id} title={session.title} />
        </div>

        <div className="px-6 md:px-8 lg:px-10 flex flex-col gap-6 text-lg">
          <section className="flex flex-col gap-1">
            <div>
              <span
                className="inline-block rounded px-2 py-0.5 text-sm font-bold text-white"
                style={{ backgroundColor: TALK_TYPE[sessionType].color }}
              >
                {TALK_TYPE[sessionType].name}
              </span>
            </div>
            <CopyableTitle
              talkId={session.id}
              title="現地参加者向け企画"
              speakerName={session.speaker.name}
            />
            <div className="text-lg font-bold">
              {detail.day} / {timeRange}（{name}）
            </div>
            <TrackHashtagActions
              track={{
                id: detail.id,
                name: detail.name,
                hashtag: detail.hashtag,
              }}
              variant="compact"
              className="mt-2"
            />
          </section>

          <section className="flex flex-col gap-2">
            <p>
              OST（Open Space
              Technology）は、参加者全員が主役となり、自由にテーマを提案しながら議論を進める形式のイベントです。
              TypeScriptユーザー同士で自由に議論し、学び合える貴重な機会ですので、ぜひご参加ください。
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-xl font-bold">参加方法</h2>
            <p>
              事前申し込みは不要です。当日、会場（RightTouchトラック）へお越しください。
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-xl font-bold">テーマ募集</h2>
            <p>
              会場に掲載しているGoogleフォームのQRコードにてOSTのテーマを募集します。
              TypeScriptについて「話したい」「聞きたい」テーマをぜひお寄せください。
              集まったテーマは運営チームが確認し、議題決定の参考にします。
            </p>
            <a
              href={THEME_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-light-500 underline hover:opacity-80 transition-opacity"
            >
              テーマ募集フォームはこちら
            </a>
          </section>

          {SLIDES_URL && (
            <section className="flex flex-col gap-2">
              <h2 className="text-xl font-bold">スライド</h2>
              <p>
                OSTセッションのスライドを公開しています。手元でご覧いただけます。
              </p>
              <a
                href={SLIDES_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-light-500 underline hover:opacity-80 transition-opacity"
              >
                スライドを開く
              </a>
            </section>
          )}

          <section className="flex flex-col gap-2">
            <h2 className="text-xl font-bold">注意事項</h2>
            <ul className="list-disc pl-6 py-2 flex flex-col gap-1">
              <li>本企画は現地参加者のみを対象としています。</li>
              <li>
                テーマの提案はどなたでも歓迎します。お気軽にご参加ください。
              </li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
