import Image from "next/image";
import Link from "next/link";
import { AddToMyTimetableButton } from "@/components/talks/AddToMyTimetableButton";
import { EventWrapper } from "@/components/talks/EventWrapper";
import type { Talk } from "@/constants/talkList";

type Props = {
  talks: Talk[];
};

export function LtWrapper({ talks }: Props) {
  return (
    <EventWrapper talkType="LT" textAlign="left" track={talks[0]?.track}>
      <div className="flex flex-col gap-5">
        {talks.map((talk) => (
          <div key={talk.id} className="flex flex-col gap-1">
            <Link
              href={`/talks/${talk.id}`}
              className="underline hover:text-blue-purple-500"
            >
              <p className="text-16">{talk.title}</p>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-14">{talk.speaker.name}</span>
              {talk.speaker.profileImagePath && (
                <Image
                  src={`/talks/speaker/${talk.speaker.profileImagePath}`}
                  alt={`${talk.speaker.name}のプロフィール画像`}
                  width={24}
                  height={24}
                  className="h-6 w-6 rounded-full aspect-square shrink-0 object-cover"
                />
              )}
            </div>
            <div>
              <AddToMyTimetableButton talkId={talk.id} iconOnly />
            </div>
          </div>
        ))}
      </div>
    </EventWrapper>
  );
}
