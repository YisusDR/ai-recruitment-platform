#!/usr/bin/env sh
# .husky/pre-push — installed and managed by qa-skill / qa-agent
# Runs full Vitest suite and SQL migration linter before any push.

set -e

echo "🧪 [qa-skill] Running Vitest suite…"
npx vitest run --reporter=verbose

echo "🗄️  [qa-skill] Linting SQL migrations…"
node .agents/plugins/recruitment-plugin/hooks/migration-lint.mjs

echo "✅ [qa-skill] pre-push passed."
