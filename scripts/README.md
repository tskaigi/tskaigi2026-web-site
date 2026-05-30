# scripts/

セッションデータの管理・画像生成のためのコマンド群。

## CLI

`citty` ベースの単一 CLI に集約している。TypeScript は `tsx` でそのまま実行するため、ビルド不要。

```bash
pnpm cli --help                # コマンド一覧
pnpm cli <command> --help      # 各コマンドの詳細
```

| ライブラリ | 役割 |
|-----------|------|
| `citty` | サブコマンド・引数・ヘルプ |
| `tsx` | TS/TSX をそのまま実行（`tsconfig.json` の `paths` を自動解決） |
| `c12` | 共通設定の読み込み（`scripts/config.ts`） |
| `consola` | 色付きログ統一 |
| `log-update` | 取得・生成ループの進捗表示 |

エントリは `scripts/cli.ts`（citty メイン）。各コマンドは `scripts/commands/` 配下。

主要コマンドには短縮名と短縮フラグがある:

| 正式名 | 短縮名 |
|--------|--------|
| `fetch-icons` | `icons` |
| `fetch-sponsors` | `sponsors` |
| `staff-list` | `staff` |
| `build-pages` | `pages` |

| フラグ | 短縮 |
|--------|------|
| `--force` | `-f` |
| `--manifest-only` | `-m` |
| `--skip-fix` | `-s` |
| `--dry-run` | `-n` |

例: `pnpm cli icons -fm` / `pnpm cli session build -s`

### 設定 (`scripts/config.ts`)

入出力パス・スポンサーAPI URL・スロットル間隔などの既定値を `defaultConfig` に集約している。リポジトリ直下に `tskaigi-scripts.config.ts` を置くと c12 が読み込み、既定値を上書きできる。

## データパイプライン

`speakers.json` を起点に、セッション情報の組み立て → フロントエンド用JSON出力 → 整合性チェックを行う。

```
speakers.json → session-master.json → src/constants/session-master.json
```

### 実行方法

```bash
pnpm session:build            # = pnpm cli session build（パイプライン一括実行）
pnpm cli session build --skip-fix   # 事前の pnpm check:fix を省略
```

### パイプラインの各ステップ

`pnpm cli session <step>` で個別実行できる。

| 順序 | コマンド | 説明 |
|------|---------|------|
| 1 | `session init` | `speakers.json` → `session-master.json` を生成。`speakerId` へのリネーム、`profileImageUrl` の書き換えを行う |
| 2 | `session inject` | `session-id-speaker.json` を使って `id` と `ogpTitle` を挿入 |
| 3 | `session export` | `session-master.json` を `src/constants/session-master.json` に ID:value 形式で出力 |
| 4 | `session check` | アイコン・bio・ID・OGPタイトルなどの整合性チェック。結果を `data-completeness.json` に出力 |

`session build` は上記 1〜4 を順に実行する（既定で先頭に `pnpm check:fix`）。

### ユーティリティ

| コマンド | 説明 |
|---------|------|
| `session sync-id` | `speakers.json` から `session-id-speaker.json` を更新。ID 1 = ハンズオン固定、新規スピーカーは末尾に追番 |

```bash
pnpm cli session sync-id
```

## 画像生成

### スピーカーアイコン取得

```bash
pnpm fetch:icons                     # 差分のみ取得
pnpm cli fetch-icons --force          # 全件再取得
pnpm cli fetch-icons --manifest-only  # マニフェストのみ生成（画像取得なし）
```

`session-master.json` の `userIcon`/`xId`/`githubId` をもとに X または GitHub からアイコンを取得し、`public/speakers/{speakerId}.png` に保存する。

マニフェスト（`.icon-fetch-manifest.json`）で前回の状態を記録し、変更があったスピーカーのみ再取得する。

### OGP画像生成

```bash
pnpm generate:ogp              # 未生成分のみ
pnpm cli ogp --force           # 全件再生成
pnpm cli ogp path/to/master.json   # マスターJSONを指定
```

セッションごとの OGP 画像を `public/talks/{sessionId}.png` に生成する。

### スポンサー情報取得

```bash
pnpm fetch:sponsors                     # 差分のみ取得
pnpm cli fetch-sponsors --force          # 全件再取得
pnpm cli fetch-sponsors --manifest-only  # マニフェストのみ生成（画像取得なし）
```

tskaigi-cms の `/api/sponsors` からスポンサー情報を取得し、画像（logo / OGP / jobboard）を `public/sponsors/{slug}/{logo|ogp|jobboard}.{ext}` に保存する。画像URLをローカルパスに書き換えた正規化済みJSONを `src/constants/sponsors.json` に出力する（フロントから直接 import される想定）。

マニフェスト（`.sponsors-fetch-manifest.json`）で前回の URL を記録し、URL に差分があったスポンサーの画像のみ再取得する（CMS 側で画像を再アップすると URL のタイムスタンプが変わる仕様を利用）。

## スタッフ一覧・Pages 出力

`generate-staff-list.mjs` と `build-pages-output.mjs` は依存パッケージを使わない純 Node スクリプト（CI で `pnpm install` 前に実行されるため）。CLI からも実行できる。

```bash
pnpm generate:staff-list       # = node scripts/generate-staff-list.mjs
pnpm cli staff-list            # CLI 経由
pnpm cli build-pages           # OpenNext 出力を Cloudflare Pages 用に整える
```

## SVG → PNG 変換

```bash
pnpm cli svg-to-png input.svg                       # input.png に出力
pnpm cli svg input.svg -o out.png                   # 短縮形 + 出力指定
pnpm cli svg input.svg -w 1200 --height 630         # サイズ指定
pnpm cli svg input.svg --background "#ffffff" -f    # 白背景・上書き
```

sharp で SVG をラスタライズして PNG を出力する汎用コマンド。引数:

| フラグ | 短縮 | 説明 |
|--------|------|------|
| `--output` | `-o` | 出力 PNG パス（既定: 入力の `.svg` を `.png` に置換） |
| `--width` | `-w` | 出力幅 (px) |
| `--height` | | 出力高さ (px) |
| `--density` | `-d` | SVG ラスタライズの DPI（既定 72） |
| `--background` | | 背景色（CSS color。`transparent` で透過維持） |
| `--force` | `-f` | 出力先が存在しても上書きする |

## 生成物のクリーンアップ

```bash
pnpm cli clean              # 削除
pnpm cli clean --dry-run    # 削除予定の表示のみ
```

`scripts/data/` の gitignored 生成物（`session-master.json` / `data-completeness.json` / `.icon-fetch-manifest.json` / `.sponsors-fetch-manifest.json`）のみを対象とする。`public/speakers/` 等の追跡対象には触れない。

## テスト

```bash
pnpm test
```

`scripts/lib/session/__tests__/session.test.ts` で `lib/session/*` の各関数（initMaster / injectSessionInfo / exportForFrontend / syncSessionIdSpeaker / checkDataCompleteness）を tmpdir + フィクスチャでテストする。CI（`code-quality.yml`）でも実行される。

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

`lib/session/types.ts` に `Speaker`, `MasterEntry`, `SpeakerSource`, `UserIcon` を定義。パイプライン内の全コマンドで共有。
