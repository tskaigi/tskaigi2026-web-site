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

## Cloudflare Pages (SSG)

Next.js の `output: "export"` で静的書き出しを行い、`out/` を Cloudflare Pages にデプロイします。

```bash
# 静的サイトを out/ に書き出し
pnpm build
```

Cloudflare Pages のダッシュボードからデプロイする場合

- Build command: `pnpm build`
- Build output directory: `out`
