# scripts/

セッションデータの管理・画像生成のためのスクリプト群。

## データパイプライン

`speakers.json` を起点に、セッション情報の組み立て → フロントエンド用JSON出力 → 整合性チェックを行う。

```
speakers.json → session-master.json → src/constants/session-master.json
```

### 実行方法

```bash
bash scripts/build-session-master.sh
```

### パイプラインの各ステップ

| 順序 | スクリプト | 説明 |
|------|-----------|------|
| 1 | `lib/session/init-master.ts` | `speakers.json` → `session-master.json` を生成。`speakerId` へのリネーム、`profileImageUrl` の書き換えを行う |
| 2 | `lib/session/inject-session-info.ts` | `session-id-speaker.json` を使って `id` と `ogpTitle` を挿入 |
| 3 | `lib/session/export-for-frontend.ts` | `session-master.json` を `src/constants/session-master.json` に ID:value 形式で出力 |
| 4 | `lib/session/check-data-completeness.ts` | アイコン・bio・ID・OGPタイトルなどの整合性チェック。結果を `data-completeness.json` に出力 |

### ユーティリティ

| スクリプト | 説明 |
|-----------|------|
| `lib/session/sync-session-id-speaker.ts` | `speakers.json` から `session-id-speaker.json` を更新。ID 1 = ハンズオン固定、新規スピーカーは末尾に追番 |

```bash
npx tsx scripts/lib/session/sync-session-id-speaker.ts
```

## 画像生成

### スピーカーアイコン取得

```bash
npx tsx scripts/fetch-speaker-icons.ts              # 差分のみ取得
npx tsx scripts/fetch-speaker-icons.ts --force       # 全件再取得
npx tsx scripts/fetch-speaker-icons.ts --manifest-only  # マニフェストのみ生成（画像取得なし）
```

`session-master.json` の `userIcon`/`xId`/`githubId` をもとに X または GitHub からアイコンを取得し、`public/speakers/{speakerId}.png` に保存する。

マニフェスト（`.icon-fetch-manifest.json`）で前回の状態を記録し、変更があったスピーカーのみ再取得する。

### OGP画像生成

```bash
npx tsx scripts/generate-talk-ogp.ts            # 未生成分のみ
npx tsx scripts/generate-talk-ogp.ts --force    # 全件再生成
```

セッションごとの OGP 画像を `public/talks/{sessionId}.png` に生成する。

### スポンサー情報取得

```bash
npx tsx scripts/fetch-sponsors.ts                   # 差分のみ取得
npx tsx scripts/fetch-sponsors.ts --force           # 全件再取得
npx tsx scripts/fetch-sponsors.ts --manifest-only   # マニフェストのみ生成（画像取得なし）
```

tskaigi-cms の `/api/sponsors` からスポンサー情報を取得し、画像（logo / OGP / jobboard）を `public/sponsors/{slug}/{logo|ogp|jobboard}.{ext}` に保存する。画像URLをローカルパスに書き換えた正規化済みJSONを `src/constants/sponsors.json` に出力する（フロントから直接 import される想定）。

マニフェスト（`.sponsors-fetch-manifest.json`）で前回の URL を記録し、URL に差分があったスポンサーの画像のみ再取得する（CMS 側で画像を再アップすると URL のタイムスタンプが変わる仕様を利用）。

## データファイル (`scripts/data/`)

| ファイル | git管理 | 説明 |
|---------|---------|------|
| `speakers.json` | o | 登壇者データ（マスター） |
| `session-id-speaker.json` | o | セッションID ↔ スピーカー名のマッピング |
| `ogp-title-overrides.json` | o | OGP用タイトル上書き定義 |
| `session-master.json` | x | パイプライン生成物 |
| `data-completeness.json` | x | パイプライン生成物 |
| `.icon-fetch-manifest.json` | x | アイコン取得のキャッシュ |
| `.sponsors-fetch-manifest.json` | x | スポンサー画像取得のキャッシュ |

## 共通型定義

`lib/session/types.ts` に `Speaker`, `MasterEntry`, `SpeakerSource`, `UserIcon` を定義。パイプライン内の全スクリプトで共有。
