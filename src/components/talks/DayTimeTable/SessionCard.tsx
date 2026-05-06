// import { AddToMyTimetableButton } from "@/components/talks/AddToMyTimetableButton";
import Link from "next/link";
import { ProfileImage } from "@/components/talks/FallbackImage";
import { getSessionMasterBySessionId } from "@/constants/sessionMaster";
import { TALK_TYPE } from "@/constants/timetable";
import type { SessionContent, Track } from "@/types/timetable-api";
import { CardShell } from "./CardShell";

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
  track,
  id,
}: {
  content: SessionContent;
  track: Track;
  id?: string;
}) {
  return (
    <CardShell
      variant="card"
      align="start"
      tracks={[track]}
      withTriangle
      id={id}
    >
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
    </CardShell>
  );
}
