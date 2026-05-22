/**
 * X 投稿画面の本文として埋め込むテキスト。
 * 先頭に空行を入れて、ハッシュタグの上にユーザーがコメントを書き足せる余白を作る。
 */
function buildPostMessage(trackHashtag: string): string {
  const trackTag = trackHashtag.replace(/^#/, "");
  const hashtags = ["#TSKaigi", "#TSKaigi2026", `#${trackTag}`].join(" ");
  // "\n\n" で1行分の空行を作り、その下にハッシュタグを並べる
  return `\n\n${hashtags}`;
}

/** トラックのハッシュタグ入りで X 投稿画面を開く Web URL を生成する */
export function buildXTrackIntentUrl(trackHashtag: string): string {
  const text = buildPostMessage(trackHashtag);
  return `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
}

/**
 * X アプリ用の deep link を生成する。
 * `twitter://post?message=...` は iOS/Android の X アプリで投稿画面を開く。
 */
export function buildXTrackDeepLinkUrl(trackHashtag: string): string {
  const message = buildPostMessage(trackHashtag);
  return `twitter://post?message=${encodeURIComponent(message)}`;
}

const MOBILE_UA_REGEX = /iPhone|iPad|iPod|Android/i;

function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return MOBILE_UA_REGEX.test(navigator.userAgent);
}

/**
 * X の投稿画面を開く。
 * - モバイル: `twitter://` deep link を試し、開けなければ Web Intent にフォールバック
 * - PC: Web Intent を新しいタブで開く
 *
 * deep link で X アプリが起動した場合、ページが非表示になることを `visibilitychange` で検知して
 * フォールバックを抑止する。一定時間内にページが非表示にならなければアプリ未インストールと判断する。
 */
export function openXPostIntent({
  deepLink,
  webFallback,
}: {
  deepLink: string;
  webFallback: string;
}): void {
  if (!isMobileDevice()) {
    window.open(webFallback, "_blank", "noopener,noreferrer");
    return;
  }

  let appOpened = false;
  const onVisibilityChange = () => {
    if (document.hidden) {
      appOpened = true;
    }
  };
  document.addEventListener("visibilitychange", onVisibilityChange);

  // deep link を発火
  window.location.href = deepLink;

  // 一定時間内に visibility が hidden にならなければ Web Intent にフォールバック
  window.setTimeout(() => {
    document.removeEventListener("visibilitychange", onVisibilityChange);
    if (!appOpened && !document.hidden) {
      window.location.href = webFallback;
    }
  }, 1200);
}
