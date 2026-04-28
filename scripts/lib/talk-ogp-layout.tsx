type TalkOgpLayoutProps = {
  baseImageUrl: string;
  title: string;
  profileImageUrl: string;
  speakerName: string;
  trackName: string;
  sessionType: string;
  dayNumber: 1 | 2;
  timeRange: string;
};

/**
 * トークOGPレイアウトコンポーネント
 * OGP-talk.pngをベースに、セッション情報を配置
 * 1200×630サイズを基準にスタイリング
 */
export default function TalkOgpLayout({
  baseImageUrl,
  title,
  profileImageUrl,
  speakerName,
  trackName,
  sessionType,
  dayNumber,
  timeRange,
}: TalkOgpLayoutProps) {
  const dayLabel = dayNumber === 1 ? "DAY1" : "DAY2";

  return (
    <div
      style={{
        width: "1200px",
        height: "630px",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        fontFamily: "sans-serif",
        backgroundColor: "#FFFFFF",
      }}
    >
      {/* ベース画像 */}
      <img
        src={baseImageUrl}
        alt="OGPベース画像"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "1200px",
          height: "630px",
        }}
      />

      {/* コンテンツレイアウト */}
      <div
        style={{
          position: "relative",
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "40px",
        }}
      >
        {/* 上部: メタ情報 */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
          }}
        >
          {/* トラック名バッジ */}
          <div
            style={{
              backgroundColor: "#00D4AA",
              color: "#FFFFFF",
              padding: "8px 16px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            {trackName}
          </div>

          {/* セッションタイプバッジ */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              color: "#333333",
              padding: "8px 16px",
              border: "2px solid #333333",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            {sessionType}
          </div>

          {/* DAYバッジ */}
          <div
            style={{
              backgroundColor: "#0066FF",
              color: "#FFFFFF",
              padding: "8px 16px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            {dayLabel}
          </div>

          {/* 時刻 */}
          <div
            style={{
              color: "#333333",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            {timeRange}
          </div>
        </div>

        {/* 中央: タイトル */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "52px",
              fontWeight: 700,
              color: "#1A1A1A",
              lineHeight: 1.3,
              maxWidth: "900px",
            }}
          >
            {title}
          </h1>
        </div>

        {/* 下部: 登壇者情報 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          {/* プロフィール画像 */}
          <img
            src={profileImageUrl}
            alt={speakerName}
            style={{
              width: "80px",
              height: "80px",
            }}
          />

          {/* 登壇者名 */}
          <p
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: 600,
              color: "#1A1A1A",
            }}
          >
            {speakerName}
          </p>
        </div>
      </div>
    </div>
  );
}
