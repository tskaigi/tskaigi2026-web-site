/**
 * X投稿用の hashtags クエリは "#" 抜きのカンマ区切り。
 * 例: hashtags=TSKaigi,TSKaigi2026,tskaigi_leverages
 */
function buildHashtagsParam(trackHashtag: string): string {
  const trackTag = trackHashtag.replace(/^#/, "");
  return ["TSKaigi", "TSKaigi2026", trackTag].join(",");
}

/** トラックのハッシュタグのみで X 投稿画面を開く URL を生成する */
export function buildXTrackIntentUrl(trackHashtag: string): string {
  const hashtags = buildHashtagsParam(trackHashtag);
  return `https://x.com/intent/post?hashtags=${encodeURIComponent(hashtags)}`;
}
