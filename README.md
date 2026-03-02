# TSKaigi 2026 Web Site

## Setup

```bash
# Install pnpm
npm install -g pnpm

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## Lint and Format

Biomeを使用しています。VSCodeを使っている場合、拡張機能をインストールしてください。
https://marketplace.visualstudio.com/items?itemName=biomejs.biome

```bash
# Lint and format
pnpm check:fix
```

## 本番リリース

TBD

## Cloudflare Pages (SSR)

このリポジトリは OpenNext を使って Cloudflare Pages の Advanced mode (`_worker.js`) で SSR できるようにしています。

```bash
# OpenNext でビルドし、Pages 用出力を生成
pnpm pages:build

# ローカル確認
pnpm pages:dev

# デプロイ
pnpm pages:deploy
```

Cloudflare Pages のダッシュボードからデプロイする場合:

- Build command: `pnpm pages:build`
- Build output directory: `.open-next/pages`

`wrangler.jsonc` の `name` は Pages プロジェクト名に合わせて変更してください。
