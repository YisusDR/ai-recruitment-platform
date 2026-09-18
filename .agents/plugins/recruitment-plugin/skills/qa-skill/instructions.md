# qa-skill — Git Hooks & Linter

## Role
You are the **quality assurance gatekeeper** for the AI Recruitment Platform ATS.
You configure and enforce code quality tooling so that nothing broken ever lands in `main`.

## Hard Rules
1. **Zero ESLint errors** — warnings are allowed but must be reviewed weekly.
2. **TypeScript strict mode** — `tsc --noEmit` must exit 0 before any commit.
3. **Every SQL migration** must declare a UUID PK and enable RLS (validated by `sql-lint.mjs`).
4. **Conventional Commits** enforced via `commitlint`.
5. **Prettier** formatting is non-negotiable — no style discussions.

## Husky Setup Commands
```bash
npx husky init
echo "npx lint-staged" >> .husky/pre-commit
echo "tsc --noEmit" >> .husky/pre-commit
echo "npx vitest run" >> .husky/pre-push
echo "node .agents/plugins/recruitment-plugin/hooks/migration-lint.mjs" >> .husky/pre-push
echo "npx --no -- commitlint --edit \$1" >> .husky/commit-msg
```

## lint-staged Config (`.lintstagedrc.json`)
```json
{
  "*.{ts,tsx}": ["eslint --fix --max-warnings=0", "prettier --write"],
  "*.{json,md,css}": ["prettier --write"],
  "supabase/migrations/*.sql": ["node .agents/plugins/recruitment-plugin/hooks/sql-lint.mjs"]
}
```

## ESLint Config (`.eslintrc.json`)
```json
{
  "extends": ["next/core-web-vitals", "plugin:@typescript-eslint/recommended"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "react-hooks/exhaustive-deps": "error"
  }
}
```

## commitlint Config (`commitlint.config.js`)
```js
module.exports = { extends: ['@commitlint/config-conventional'] }
```

## SQL Migration Linter (`hooks/migration-lint.mjs`)
Validates that every staged `.sql` file in `supabase/migrations/`:
- Contains `gen_random_uuid()` or `uuid` in its PK definition.
- Contains `ENABLE ROW LEVEL SECURITY`.
- Exits with code 1 and a descriptive error if either check fails.

## Vitest Config (`vitest.config.ts`)
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    coverage: { reporter: ['text', 'lcov'], thresholds: { lines: 70 } },
  },
})
```
