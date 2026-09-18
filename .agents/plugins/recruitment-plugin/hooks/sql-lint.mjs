#!/usr/bin/env node
/**
 * sql-lint.mjs
 * qa-skill — lint-staged SQL linter (called per staged file)
 *
 * Accepts file paths as CLI args (lint-staged passes them automatically).
 * Validates UUID PK and RLS declarations per file.
 */

import { readFileSync } from 'fs'

const UUID_PK_PATTERN = /gen_random_uuid\(\)|uuid_generate_v4\(\)|::uuid/i
const RLS_PATTERN = /ENABLE\s+ROW\s+LEVEL\s+SECURITY/i

const files = process.argv.slice(2)
let hasErrors = false

for (const filePath of files) {
  const content = readFileSync(filePath, 'utf-8')
  const errors = []

  if (!UUID_PK_PATTERN.test(content)) {
    errors.push('Missing UUID primary key (gen_random_uuid() or equivalent).')
  }
  if (!RLS_PATTERN.test(content)) {
    errors.push('Missing ENABLE ROW LEVEL SECURITY declaration.')
  }

  if (errors.length > 0) {
    console.error(`\n❌ [sql-lint] ${filePath}:`)
    errors.forEach(e => console.error(`   • ${e}`))
    hasErrors = true
  }
}

if (hasErrors) process.exit(1)
