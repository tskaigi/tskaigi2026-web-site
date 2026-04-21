"use client";

import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { ExternalLink, Github, Twitter, X } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { ProfileImage } from "@/components/talks/FallbackImage";
import { TalkStatus } from "@/components/talks/TalkStatus";
import { Button } from "@/components/ui/button";
import { TALK_TYPE, TRACK, TRACK_STYLE } from "@/constants/timetable";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { getSession } from "@/utils/getSession";
import type { TalkWithMinutes } from "@/utils/myTimetable";

function SpeakerSection({ talk }: { talk: TalkWithMinutes }) {
  const { speaker } = talk;
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-bold text-black-700">スピーカー</h3>
      <div className="flex items-start gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0">
          <ProfileImage
            speakerName={speaker.name}
            profileImageUrl={speaker.profileImageUrl}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="font-bold text-black-700">{speaker.name}</p>
          {speaker.affiliation && (
            <p className="text-xs text-black-500">{speaker.affiliation}</p>
          )}
          {speaker.position && (
            <p className="text-xs text-black-500">{speaker.position}</p>
          )}
          <div className="flex items-center gap-3">
            {speaker.xId && (
              <Link
                href={`https://x.com/${speaker.xId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-black-400 hover:text-black-700"
                aria-label={`${speaker.name} のXプロフィール`}
              >
                <Twitter size={14} />
              </Link>
            )}
            {speaker.githubId && (
              <Link
                href={`https://github.com/${speaker.githubId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-black-400 hover:text-black-700"
                aria-label={`${speaker.name} のGitHubプロフィール`}
              >
                <Github size={14} />
              </Link>
            )}
            {speaker.additionalLink && (
              <Link
                href={speaker.additionalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-black-400 hover:text-black-700"
                aria-label={`${speaker.name} の追加リンク`}
              >
                <ExternalLink size={14} />
              </Link>
            )}
          </div>
        </div>
      </div>
      {speaker.bio && (
        <p className="text-sm text-black-600 whitespace-pre-line">
          {speaker.bio}
        </p>
      )}
    </div>
  );
}

function DrawerContent({ talk }: { talk: TalkWithMinutes }) {
  const sessionDetail = getSession(talk.id);
  const typeLabel = sessionDetail
    ? TALK_TYPE[sessionDetail.sessionType].name
    : null;

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-6">
      <div className="flex items-center gap-2 flex-wrap">
        {typeLabel && (
          <span className="text-sm text-black-500">{typeLabel}</span>
        )}
        <TalkStatus talkId={talk.id} />
      </div>

      <div>
        <h3 className="text-xl font-bold text-black-700 leading-snug">
          {talk.title}
        </h3>
        <div className="mt-2 flex items-center gap-2 flex-wrap text-sm text-black-500">
          <span
            className={cn(
              "inline-block w-2.5 h-2.5 rounded-full shrink-0",
              TRACK_STYLE[talk.track].bg,
            )}
          />
          <span>
            {talk.eventDate} / {talk.time} / {TRACK[talk.track].name}
          </span>
        </div>
      </div>

      <SpeakerSection talk={talk} />

      <div>
        <h3 className="text-sm font-bold text-black-700 mb-2">概要</h3>
        <p className="text-sm text-black-500">（概要は後日公開予定です）</p>
      </div>

      <div className="mt-auto pt-4">
        <Button asChild variant="outline" className="w-full gap-2">
          <Link href={`/talks/${talk.id}`}>
            <ExternalLink size={16} />
            詳細ページで見る
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function TalkDetailDrawer({
  talk,
  onClose,
}: {
  talk: TalkWithMinutes | null;
  onClose: () => void;
}) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const dragControls = useDragControls();

  // オーバーレイクリック以外の閉じ手段として Esc キーに対応する
  useEffect(() => {
    if (!talk) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [talk, onClose]);

  // ドロワー表示中にページ本体をスクロールさせない
  useEffect(() => {
    document.body.style.overflow = talk ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [talk]);

  return (
    <AnimatePresence>
      {talk && (
        <>
          <motion.div
            key="talk-drawer-overlay"
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {isDesktop ? (
            <motion.div
              key="talk-drawer-panel"
              role="dialog"
              aria-modal="true"
              aria-label="トーク詳細"
              className="fixed inset-y-0 right-0 z-50 w-full max-w-[480px] bg-white shadow-xl flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-black-200 shrink-0">
                <h2 className="text-base font-bold text-black-700">
                  トーク詳細
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-black-500 hover:text-black-700 cursor-pointer"
                  aria-label="閉じる"
                >
                  <X size={20} />
                </button>
              </div>
              <DrawerContent talk={talk} />
            </motion.div>
          ) : (
            <motion.div
              key="talk-drawer-panel"
              role="dialog"
              aria-modal="true"
              aria-label="トーク詳細"
              className="fixed inset-x-0 bottom-0 z-50 h-[60vh] bg-white rounded-t-2xl shadow-xl flex flex-col"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              drag="y"
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ top: 0 }}
              dragElastic={{ top: 0, bottom: 0.3 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100 || info.velocity.y > 500) {
                  onClose();
                }
              }}
            >
              <div
                className="flex justify-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing touch-none"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="w-10 h-1.5 bg-black-200 rounded-full" />
              </div>
              <DrawerContent talk={talk} />
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
