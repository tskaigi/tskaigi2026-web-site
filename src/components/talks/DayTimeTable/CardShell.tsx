import { TRACK_STYLE } from "@/constants/timetable";
import { cn } from "@/lib/utils";
import type { Track } from "@/types/timetable-api";

function TriangleBadge({ track }: { track: Track }) {
  const style = TRACK_STYLE[track.id];
  return (
    <div
      className={cn(
        "hidden md:block absolute top-0 right-0 w-6 h-6 [clip-path:polygon(0_0,100%_0,100%_100%)]",
        style.bg,
      )}
    />
  );
}

function MobileTrackBadge({ track }: { track: Track }) {
  const style = TRACK_STYLE[track.id];
  return (
    <div
      className={cn(
        style.bg,
        style.text,
        "block md:hidden py-1 px-2 absolute top-0 left-0 text-xs font-bold",
      )}
    >
      {track.name}
    </div>
  );
}

/**
 * セルを囲む共通シェル。
 * - variant: "closed" → グレー小箱 / "card" → 白カード
 * - align: 子要素の揃え (start: SessionCard, center: ラベル系)
 * - withTriangle: 右上の三角(SessionCard 専用)
 * - isSingleTrack のときだけモバイル用のトラック名バッジを表示
 */
export function CardShell({
  variant,
  align = "center",
  track,
  isSingleTrack,
  withTriangle = false,
  id,
  children,
}: {
  variant: "closed" | "card";
  align?: "start" | "center";
  track: Track;
  isSingleTrack: boolean;
  withTriangle?: boolean;
  id?: string;
  children: React.ReactNode;
}) {
  const sizeCls =
    variant === "closed"
      ? "bg-gray-50 min-h-16"
      : "bg-white pt-10 pb-4 md:py-5 min-h-32";
  const alignCls =
    align === "start"
      ? "items-start justify-start"
      : "items-center justify-center";
  return (
    <div
      id={id}
      className={cn(
        sizeCls,
        alignCls,
        "px-5 h-full flex flex-col gap-2 text-black-700 relative",
      )}
    >
      {isSingleTrack && <MobileTrackBadge track={track} />}
      {withTriangle && <TriangleBadge track={track} />}
      {children}
    </div>
  );
}
