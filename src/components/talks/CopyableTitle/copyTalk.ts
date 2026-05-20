const BASE_URL = "https://2026.tskaigi.org";

type CopyTalkParams = {
  talkId: string;
  title: string;
  speakerName: string;
};

export async function copyTalk({ talkId, title, speakerName }: CopyTalkParams) {
  const url = `${BASE_URL}/talks/${talkId}`;
  const anchorText = `${title}（${speakerName}）`;
  const html = `<a href="${url}">${anchorText}</a>`;
  const plain = `${anchorText}\n${url}`;

  await navigator.clipboard.write([
    new ClipboardItem({
      "text/html": new Blob([html], { type: "text/html" }),
      "text/plain": new Blob([plain], { type: "text/plain" }),
    }),
  ]);
}
