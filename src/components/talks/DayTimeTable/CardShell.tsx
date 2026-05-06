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

function MobileTrackBadges({ tracks }: { tracks: Track[] }) {
  return (
    <div className="block md:hidden absolute top-0 left-0 flex gap-1">
      {tracks.map((t) => {
        const style = TRACK_STYLE[t.id];
        return (
          <div
            key={t.id}
            className={cn(style.bg, style.text, "py-1 px-2 text-xs font-bold")}
          >
            {t.name}
          </div>
        );
      })}
    </div>
  );
}

/**
 * セルを囲む共通シェル。
 * - variant: "closed" → グレー小箱 / "card" → 白カード
 * - align: 子要素の揃え (start: SessionCard, center: ラベル系)
 * - withTriangle: 右上の三角(SessionCard 専用)
 * - tracks: モバイル時に左上に並べるトラック名バッジの元データ
 */
export function CardShell({
  variant,
  align = "center",
  tracks,
  withTriangle = false,
  id,
  children,
}: {
  variant: "closed" | "card";
  align?: "start" | "center";
  tracks: Track[];
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
      <MobileTrackBadges tracks={tracks} />
      {withTriangle && <TriangleBadge track={tracks[0]} />}
      {children}
    </div>
  );
}
