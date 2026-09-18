#!/usr/bin/env node
/**
 * migration-lint.mjs
 * qa-skill — SQL Migration Linter
 *
 * Validates every *.sql file in supabase/migrations/ to ensure:
 *   1. A UUID primary key is declared (gen_random_uuid() or ::uuid cast).
 *   2. ROW LEVEL SECURITY is enabled on every created table.
 *
 * Exits with code 1 and a descriptive error message on any violation.
 */

import { readFileSync, readdirSync } from 'fs'
import { join, resolve } from 'path'

const MIGRATIONS_DIR = resolve(process.cwd(), 'supabase/migrations')

const UUID_PK_PATTERN = /gen_random_uuid\(\)|uuid_generate_v4\(\)|::uuid/i
const RLS_PATTERN = /ENABLE\s+ROW\s+LEVEL\s+SECURITY/i

let hasErrors = false

let files
try {
  files = readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql'))
} catch {
  console.warn('[migration-lint] No supabase/migrations directory found — skipping.')
  process.exit(0)
}

for (const file of files) {
  const filePath = join(MIGRATIONS_DIR, file)
  const content = readFileSync(filePath, 'utf-8')
  const errors = []

  if (!UUID_PK_PATTERN.test(content)) {
    errors.push('Missing UUID primary key (gen_random_uuid() or equivalent).')
  }

  if (!RLS_PATTERN.test(content)) {
    errors.push('Missing ENABLE ROW LEVEL SECURITY declaration.')
  }

  if (errors.length > 0) {
    console.error(`\n❌ [migration-lint] ${file}:`)
    errors.forEach(e => console.error(`   • ${e}`))
    hasErrors = true
  } else {
    console.log(`✅ [migration-lint] ${file} — OK`)
  }
}

if (hasErrors) {
  console.error('\n[migration-lint] Fix the above migration issues before pushing.')
  process.exit(1)
}

console.log('\n[migration-lint] All migrations passed.')
