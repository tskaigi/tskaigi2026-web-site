// import { AddToMyTimetableButton } from "@/components/talks/AddToMyTimetableButton";
import Link from "next/link";
import { ProfileImage } from "@/components/talks/FallbackImage";
import { getSessionMasterBySessionId } from "@/constants/sessionMaster";
import { TALK_TYPE, TRACK_STYLE } from "@/constants/timetable";
import { cn } from "@/lib/utils";
import type { SessionContent, TrackKey } from "@/types/timetable-api";

function TriangleBadge({ cssVar }: { cssVar: string }) {
  return (
    <div
      className="hidden md:block"
      style={{
        width: 0,
        height: 0,
        borderStyle: "solid",
        borderWidth: "0 24px 24px 0",
        borderColor: `transparent ${cssVar} transparent transparent`,
        position: "absolute",
        top: 0,
        right: 0,
      }}
    />
  );
}

function SessionTypeLabel({
  sessionType,
}: {
  sessionType: SessionContent["sessionType"];
}) {
  const { name, color } = TALK_TYPE[sessionType];
  return (
    <span
      className="inline-block rounded px-2 py-0.5 text-xs font-bold text-white"
      style={{ backgroundColor: color }}
    >
      {name}
    </span>
  );
}

export function SessionCard({
  content,
  trackKey,
  trackName,
  id,
}: {
  content: SessionContent;
  trackKey: TrackKey;
  trackName: string;
  id?: string;
}) {
  const style = TRACK_STYLE[trackKey];
  return (
    <div
      id={id}
      className="bg-white px-5 pt-10 pb-4 md:py-5 min-h-32 h-full flex flex-col gap-2 items-start justify-start text-black-700 relative"
    >
      <div
        className={cn(
          style.bg,
          style.text,
          "block md:hidden py-1 px-2 absolute top-0 left-0 text-xs font-bold",
        )}
      >
        {trackName}
      </div>
      <TriangleBadge cssVar={style.cssVar} />
      <div className="flex items-center justify-between w-full">
        <SessionTypeLabel sessionType={content.sessionType} />
        {/* <AddToMyTimetableButton
          talkId={content.sessions[0].id}
          talkIds={content.sessions.map((s) => s.id)}
          withCheckbox
        /> */}
      </div>
      <div className="flex flex-col gap-5">
        {content.sessions.map((ref) => {
          const master = getSessionMasterBySessionId(ref.id);
          const title = master?.title ?? "";
          const speakerName = master?.speaker.name ?? "";
          return (
            <div key={ref.id} className="flex flex-col gap-1">
              <Link
                href={`/talks/${ref.id}`}
                className="underline hover:text-blue-purple-500"
              >
                <p className="text-[16px]">{title}</p>
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-[14px]">{speakerName}</span>
                <div className="relative h-6 w-6 rounded-full shrink-0 overflow-hidden">
                  <ProfileImage
                    speakerName={speakerName}
                    profileImageUrl={master?.speaker.profileImageUrl}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
