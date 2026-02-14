const fs = require("node:fs");

import type * as core from "@actions/core";
import type { context } from "@actions/github";
import type {
  IssuesEditedEvent,
  IssuesOpenedEvent,
} from "@octokit/webhooks-types";

type Args = {
  core: typeof core;
  context: typeof context;
};

module.exports = async ({ core, context }: Args) => {
  const payload = context.payload as IssuesOpenedEvent | IssuesEditedEvent;
  const issueBody = context.payload.issue?.body ?? "";
  const githubUserId = payload.issue.user.id;
  const githubAvatarUrl = payload.issue.user.avatar_url;

  const name = parseFormField(issueBody, "表示名").split("\n")[0];
  const imageUrl =
    parseFormField(issueBody, "アイコン画像 URL").split("\n")[0] ||
    githubAvatarUrl;
  const href = parseFormField(issueBody, "遷移先 URL").split("\n")[0];

  const errors: string[] = [];
  if (!name) errors.push("表示名が入力されていません");
  if (!imageUrl) errors.push("アイコン画像 URLが入力されていません");
  if (!href) errors.push("遷移先 URLが入力されていません");

  if (errors.length > 0) {
    core.setFailed(`入力エラー:\n${errors.join("\n")}`);
    return;
  }

  if (!URL.canParse(imageUrl)) {
    core.setFailed(`アイコン画像 URL が不正です: ${imageUrl}`);
    return;
  }

  // アイコン画像をダウンロードして保存
  const imageBytes = await (await fetch(imageUrl)).bytes();
  const imagePath = `/staff/${githubUserId}.png`;
  fs.writeFileSync(`public${imagePath}`, imageBytes);

  // 出力を設定（PR用）
  core.setOutput("name", name);
  core.setOutput("image", imagePath);
  core.setOutput("href", href);

  const userData = {
    name,
    image: imagePath,
    href,
  };

  // ファイルに書き込む
  const filePath = `src/constants/staff/${githubUserId}.json`;
  fs.writeFileSync(filePath, JSON.stringify(userData));

  console.log("Updated userData:");
  console.log(userData);
};

/** GitHubフォームの出力をパースする関数 */
function parseFormField(body: string, fieldName: string) {
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
