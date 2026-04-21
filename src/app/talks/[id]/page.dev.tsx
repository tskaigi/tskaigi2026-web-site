import type { Metadata } from "next";
import Link from "next/link";
import type { ComponentProps } from "react";
import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";
// import { AddToMyTimetableButton } from "@/components/talks/AddToMyTimetableButton";
import { OgpImage, ProfileImage } from "@/components/talks/FallbackImage";
import { TalkStatus } from "@/components/talks/TalkStatus";
import { SESSION_IDS, TALK_TYPE } from "@/constants/timetable";
import { getSession } from "@/utils/getSession";
import { myTimetable } from "@/utils/myTimetable";

export async function generateStaticParams() {
  return SESSION_IDS.map((id) => ({ id }));
}

const description = "TSKaigi 2026 のスピーカー、トーク情報です。";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { session } = getSession(id);

  return {
    title: session.title,
    description,
    twitter: {
      title: session.title,
      description,
      images: [{ url: `/ogp/talks/${session.speaker.name}.png` }],
    },
    openGraph: {
      title: session.title,
      description,
      images: [{ url: `/ogp/talks/${session.speaker.name}.png` }],
    },
  };
}

const components: ComponentProps<typeof Markdown>["components"] = {
  h1: ({ node, ...props }) => (
    <h1 className="text-2xl font-bold text-blue-light-500" {...props} />
  ),
  h2: ({ node, ...props }) => (
    <h2 className="text-xl font-bold text-blue-light-500" {...props} />
  ),
  h3: ({ node, ...props }) => (
    <h3 className="text-lg font-bold text-blue-light-500" {...props} />
  ),
  a: ({ node, href, ...props }) => {
    if (!href) return null;
    return (
      <Link
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-link-light hover:underline"
        href={href}
        {...props}
      />
    );
  },
  ul: ({ node, ...props }) => (
    <ul className="text-gray-700 list-disc list-inside pl-6" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="text-gray-700 list-decimal list-inside pl-6" {...props} />
  ),
  pre: ({ node, ...props }) => (
    <pre className="bg-gray-100 p-4 rounded-lg text-wrap" {...props} />
  ),
};

export default async function TalkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = getSession(id);
  const { session, sessionType, trackName, startTime, endTime } = detail;
  const timeRange = myTimetable.formatTimeRange(startTime, endTime);
  const typeLabel = TALK_TYPE[sessionType].name;
  const overview = "（概要は後日公開予定です）";

  return (
    <main className="bg-blue-light-100 pt-16 pb-10 md:py-16 md:px-8 lg:px-10">
      <h1 className="text-2xl font-bold text-blue-light-500 text-center py-10 md:py-16 md:text-3xl lg:text-4xl">
        トーク
      </h1>

      <div className="bg-white flex flex-col gap-6 max-w-screen-xl mx-auto md:rounded-xl pb-6 md:pb-8 lg:pb-10">
        {/* トーク OGP */}
        <div className="bg-black-100 flex justify-center md:mt-8 md:mx-8 lg:mt-10 lg:mx-10">
          <OgpImage speakerName={session.speaker.name} title={session.title} />
        </div>

        <div className="px-6 md:px-8 lg:px-10 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="text-lg">{typeLabel}</div>
            <TalkStatus talkId={session.id} />
          </div>
          <div className="text-2xl font-bold">{session.title}</div>
          <div className="text-lg font-bold">
            {detail.day} / {timeRange} （{trackName}）
          </div>
          {/* <div className="mt-2">
            <AddToMyTimetableButton talkId={session.id} />
          </div> */}
        </div>

        {/* トーク説明文 */}
        <div className="px-6 md:px-8 lg:px-10 gap-6 flex flex-col md:text-lg">
          <Markdown components={components} remarkPlugins={[remarkBreaks]}>
            {overview}
          </Markdown>
        </div>

        {/* スピーカー情報 */}
        <div className="mt-4 px-6 md:px-8 lg:px-10">
          <div className="bg-blue-light-200 p-6 rounded-xl">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* アイコン */}
              <div className="relative w-[180px] md:w-[220px] aspect-square shrink-0 rounded-full overflow-hidden">
                <ProfileImage
                  speakerName={session.speaker.name}
                  profileImageUrl={session.speaker.profileImageUrl}
                />
              </div>

              <div className="flex flex-col gap-4">
                {/* 名前 */}
                <p className="font-bold text-22">{session.speaker.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
