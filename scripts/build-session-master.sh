#!/bin/bash
set -euo pipefail

echo "pnpm check:fix"
pnpm check:fix

echo "📋 speakers.json → session-master.json にコピー"
npx tsx scripts/lib/session/init-master.ts

echo "🔧 id / ogpTitle を挿入"
npx tsx scripts/lib/session/inject-session-info.ts

echo "📦 src/constants/session-master.json に出力 (ID:value形式)"
npx tsx scripts/lib/session/export-for-frontend.ts

echo "🔍 データ整合性チェック"
npx tsx scripts/lib/session/check-data-completeness.ts
