const fs = require("fs");

module.exports = async ({ github, context, core }) => {
  const issueBody = context.payload.issue.body;

  // GitHubフォームの出力をパースする関数
  function parseFormField(body, fieldName) {
    const regex = new RegExp(
      `### ${fieldName}\\s*\\n\\s*([\\s\\S]*?)(?=\\n###|$)`,
      "i",
    );
    const match = body.match(regex);
    if (match) {
      return match[1].trim();
    }
    return "";
  }

  // YYYY-MM-DD → "M/D (曜日)" 形式に変換
  function formatDate(dateStr) {
    // 文字列から直接パースしてタイムゾーン問題を回避
    const [year, month, day] = dateStr.split("-").map(Number);
    // 曜日計算用にUTC日付を作成
    const date = new Date(Date.UTC(year, month - 1, day));
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    const weekday = weekdays[date.getUTCDay()];
    return `${month}/${day} (${weekday})`;
  }

  // 開催日の翌日0:00を終了日時とする（日本時間）
  function calcFinishedAt(dateStr) {
    // 文字列から直接パースしてタイムゾーン問題を回避
    const [year, month, day] = dateStr.split("-").map(Number);
    const nextDay = new Date(Date.UTC(year, month - 1, day + 1));
    const y = nextDay.getUTCFullYear();
    const m = String(nextDay.getUTCMonth() + 1).padStart(2, "0");
    const d = String(nextDay.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}T00:00:00+09:00`;
  }

  const link = parseFormField(issueBody, "ConnpassイベントURL");
  const thumbnail = parseFormField(issueBody, "ConnpassサムネイルURL");
  const sponsorsRaw = parseFormField(issueBody, "主催スポンサー");
  const dateRaw = parseFormField(issueBody, "開催日");
  const name = parseFormField(issueBody, "イベント名");
  const detail = parseFormField(issueBody, "イベント詳細");
  const tagsRaw = parseFormField(issueBody, "タグ（任意）");

  // タグとスポンサーを配列に変換
  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t)
    : [];
  const sponsors = sponsorsRaw
    ? sponsorsRaw
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s)
    : [];

  // バリデーション
  const errors = [];
  if (!link) errors.push("ConnpassイベントURLが入力されていません");
  if (!thumbnail) errors.push("ConnpassサムネイルURLが入力されていません");
  if (sponsors.length === 0) errors.push("主催スポンサーが入力されていません");
  if (!dateRaw) errors.push("開催日が入力されていません");
  if (dateRaw && !/^\d{4}-\d{2}-\d{2}$/.test(dateRaw)) {
    errors.push("開催日はYYYY-MM-DD形式で入力してください");
  }
  if (!name) errors.push("イベント名が入力されていません");

  if (errors.length > 0) {
    core.setFailed(`入力エラー:\n${errors.join("\n")}`);
    return;
  }

  // 日付を変換
  const date = formatDate(dateRaw);
  const finishedAt = calcFinishedAt(dateRaw);

  // 出力を設定（PR用）
  core.setOutput("name", name);
  core.setOutput("date", date);
  core.setOutput("link", link);

  // 新しいイベントオブジェクトを生成
  const escapeString = (str) =>
    str.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");

  const tagsCode =
    tags.length > 0
      ? `\n    tags: [${tags.map((t) => `"${t}"`).join(", ")}],`
      : "";

  const eventDetail = detail || "イベント詳細をここに入力してください";

  const newEvent = `  {
    date: "${date}",
    name: "${name}",
    link: "${link}",
    thumbnail:
      "${thumbnail}",
    detail: \`${escapeString(eventDetail)}\`,${tagsCode}
    sponsors: [${sponsors.map((s) => `"${s}"`).join(", ")}],
    finishedAt: new Date("${finishedAt}"),
  },`;

  // 現在のファイルを読み込む
  const filePath = "src/constants/sideEventList.ts";
  const currentContent = fs.readFileSync(filePath, "utf8");

  // rawSideEventList配列の最後（];の前）に新しいイベントを追加
  // 行頭の ]; を探す（型定義内の string[]; などにマッチしないように）
  const updatedContent = currentContent.replace(
    /^(\];\s*\n)/m,
    `${newEvent}\n$1`,
  );

  // ファイルに書き込む
  fs.writeFileSync(filePath, updatedContent);

  console.log("Updated sideEventList.ts with new event:");
  console.log({
    date,
    name,
    link,
    thumbnail,
    detail: eventDetail,
    tags,
    sponsors,
    finishedAt,
  });
};
