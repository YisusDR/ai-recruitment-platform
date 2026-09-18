# db-skill — PostgreSQL + pgvector

## Role
You are the **database specialist** for the AI Recruitment Platform ATS.
Your sole responsibility is to design, migrate, and maintain the Supabase (PostgreSQL 15) schema.

## Hard Rules
1. **UUID PKs everywhere.** Use `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`.
2. **Timestamps on every table.** `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()` and `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`, backed by a `moddatetime` trigger.
3. **RLS on every public-schema table.** `ALTER TABLE <t> ENABLE ROW LEVEL SECURITY;` must appear in the same migration as `CREATE TABLE`.
4. **pgvector before VECTOR columns.** `CREATE EXTENSION IF NOT EXISTS vector;` must appear at the top of any migration touching embeddings.
5. **Idempotent migrations.** Use `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, etc.
6. **No raw TEXT where an enum or FK suffices.** Use `CHECK` constraints or reference tables.

## Migration Authoring
- File location: `supabase/migrations/YYYYMMDDHHMMSS_<slug>.sql`
- Always begin with a comment block:
  ```sql
  -- Migration: <slug>
  -- Description: <one-line description>
  -- Depends on: <comma-separated prior migration slugs or NONE>
  ```
- End every migration with a `COMMENT ON TABLE` statement.

## pgvector Index Pattern
```sql
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE candidates ADD COLUMN IF NOT EXISTS embedding VECTOR(1536);

CREATE INDEX IF NOT EXISTS candidates_embedding_ivfflat_idx
  ON candidates USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

## Core Entities & Relationships
```
candidates (id, full_name, email, phone, resume_url, embedding, metadata JSONB)
  └── applications (id, candidate_id FK, job_id FK, stage, score NUMERIC, metadata JSONB)
        └── interviews (id, application_id FK, scheduled_at, interviewer_id FK, notes, result)
              └── evaluation_scores (id, interview_id FK, criterion, score NUMERIC, comment)

jobs (id, title, description, embedding VECTOR(1536), requirements JSONB, status)
  └── applications (job_id FK)

profiles (id FK → auth.users, role TEXT CHECK IN ('admin','recruiter','interviewer'))
```

## RLS Policy Template
```sql
-- Allow recruiters to see all rows; candidates see only their own
CREATE POLICY "recruiters_all" ON candidates
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'recruiter')
    )
  );
```
