import type { Metadata } from "next";
import { SESSION_IDS } from "@/constants/timetable";
import { getSession } from "@/utils/getSession";
import { OstContent } from "./OstContent";
import { TalkContent } from "./TalkContent";

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
      images: [{ url: `/talks/${id}.png` }],
    },
    openGraph: {
      title: session.title,
      description,
      images: [{ url: `/talks/${id}.png` }],
    },
  };
}

export default async function TalkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = getSession(id);

  if (detail.sessionType === "OST") {
    return <OstContent id={id} detail={detail} />;
  }

  return <TalkContent id={id} detail={detail} />;
}
