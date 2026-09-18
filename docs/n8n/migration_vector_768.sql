-- ============================================================================
-- Migration: resize embedding vector from 1536 → 768 dims
-- Required because text-embedding-004 (Google Gemini) outputs 768 dimensions.
-- Run this in the Supabase SQL Editor before activating the new n8n workflow.
-- ============================================================================

-- 1. Drop the old IVFFlat index on candidates (can't ALTER a vector column in-place)
DROP INDEX IF EXISTS public.candidates_embedding_idx;

-- 2. Recreate the embedding column with 768 dimensions
--    NOTE: PostgreSQL does not support ALTER COLUMN TYPE for pgvector directly.
--    We drop and re-add the column (existing embeddings are lost — they must be
--    re-ingested via the new Gemini workflow anyway).
ALTER TABLE public.candidates
  DROP COLUMN IF EXISTS embedding;

ALTER TABLE public.candidates
  ADD COLUMN embedding vector(768);

-- 3. Same for the jobs table (job-description embeddings)
DROP INDEX IF EXISTS public.jobs_embedding_idx;

ALTER TABLE public.jobs
  DROP COLUMN IF EXISTS embedding;

ALTER TABLE public.jobs
  ADD COLUMN embedding vector(768);

-- 4. Recreate the IVFFlat HNSW indexes for ANN similarity search
CREATE INDEX candidates_embedding_idx
  ON public.candidates
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

CREATE INDEX jobs_embedding_idx
  ON public.jobs
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- 5. Reset embedding_status for all existing candidates so they get re-queued
UPDATE public.candidates
SET    embedding_status     = 'pending',
       embedding_updated_at = NULL
WHERE  embedding_status IN ('ready', 'failed');
