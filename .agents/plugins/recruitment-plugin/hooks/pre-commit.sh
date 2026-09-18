#!/usr/bin/env sh
# .husky/pre-commit — installed and managed by qa-skill / qa-agent
# Runs lint-staged (ESLint + Prettier) and TypeScript strict check.

set -e

echo "🔍 [qa-skill] Running lint-staged…"
npx lint-staged

echo "🔷 [qa-skill] Running TypeScript strict check…"
npx tsc --noEmit

echo "✅ [qa-skill] pre-commit passed."
