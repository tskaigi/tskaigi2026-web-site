const fs = require("fs");

module.exports = async ({ github, context, core }) => {
  const issueBody = context.payload.issue.body;

  // GitHubフォームの出力をパースする関数
  function parseFormField(body, fieldName) {
    const regex = new RegExp(
      `### ${fieldName}\\s*\\n\\s*([\\s\\S]*?)(?=\\n###|$)`,
      "i"
    );
    const match = body.match(regex);
    if (match) {
      return match[1].trim();
    }
    return "";
  }

  const date = parseFormField(issueBody, "開催日");
  const name = parseFormField(issueBody, "イベント名");
  const link = parseFormField(issueBody, "イベントURL");
  const thumbnail = parseFormField(issueBody, "サムネイルURL");
  const detail = parseFormField(issueBody, "イベント詳細");
  const tagsRaw = parseFormField(issueBody, "タグ（カンマ区切り）");
  const sponsorsRaw = parseFormField(issueBody, "スポンサー（カンマ区切り）");
  const finishedAt = parseFormField(issueBody, "終了日時（ISO形式）");

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
  if (!date) errors.push("開催日が入力されていません");
  if (!name) errors.push("イベント名が入力されていません");
  if (!link) errors.push("イベントURLが入力されていません");
  if (!thumbnail) errors.push("サムネイルURLが入力されていません");
  if (!detail) errors.push("イベント詳細が入力されていません");
  if (sponsors.length === 0) errors.push("スポンサーが入力されていません");
  if (!finishedAt) errors.push("終了日時が入力されていません");

  if (errors.length > 0) {
    core.setFailed(`入力エラー:\n${errors.join("\n")}`);
    return;
  }

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

  const newEvent = `  {
    date: "${date}",
    name: "${name}",
    link: "${link}",
    thumbnail:
      "${thumbnail}",
    detail: \`${escapeString(detail)}\`,${tagsCode}
    sponsors: [${sponsors.map((s) => `"${s}"`).join(", ")}],
    finishedAt: new Date("${finishedAt}"),
  },`;

  // 現在のファイルを読み込む
  const filePath = "src/constants/sideEventList.ts";
  const currentContent = fs.readFileSync(filePath, "utf8");

  // 配列の最後（];の前）に新しいイベントを追加
  const updatedContent = currentContent.replace(
    /(\];\s*)$/,
    `${newEvent}\n$1`
  );

  // ファイルに書き込む
  fs.writeFileSync(filePath, updatedContent);

  console.log("Updated sideEventList.ts with new event:");
  console.log({ date, name, link, thumbnail, detail, tags, sponsors, finishedAt });
};
