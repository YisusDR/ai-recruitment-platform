-- =============================================================================
-- Migration: 20260614061500_initial_ats_schema
-- Description: Baseline schema for the AI Recruitment Platform ATS.
--              Creates recruiters, jobs, candidates (with pgvector embedding),
--              and interviews with strict UUID PKs, FKs, CHECK constraints,
--              moddatetime triggers, and Row Level Security on every table.
-- Depends on: NONE
-- Agent: db-agent (db-skill v1.0.0)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";       -- gen_random_uuid() fallback
CREATE EXTENSION IF NOT EXISTS "vector";           -- pgvector 1536-dim embeddings
CREATE EXTENSION IF NOT EXISTS "moddatetime";      -- auto-update updated_at
CREATE EXTENSION IF NOT EXISTS "pg_trgm";          -- fuzzy-text search on names/titles

-- ---------------------------------------------------------------------------
-- 1. Custom ENUM types
-- ---------------------------------------------------------------------------

-- Recruiter / internal user roles
DO $$ BEGIN
  CREATE TYPE public.recruiter_role AS ENUM (
    'admin',
    'recruiter',
    'interviewer',
    'viewer'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Job lifecycle states
DO $$ BEGIN
  CREATE TYPE public.job_status AS ENUM (
    'draft',
    'open',
    'paused',
    'closed',
    'archived'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Employment modality
DO $$ BEGIN
  CREATE TYPE public.job_modality AS ENUM (
    'on-site',
    'remote',
    'hybrid'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Candidate journey stages (matches Kanban board columns)
DO $$ BEGIN
  CREATE TYPE public.candidate_stage AS ENUM (
    'applied',
    'screening',
    'technical_test',
    'interview',
    'offer',
    'hired',
    'rejected',
    'withdrawn'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Interview outcomes
DO $$ BEGIN
  CREATE TYPE public.interview_result AS ENUM (
    'pending',
    'passed',
    'failed',
    'no_show',
    'rescheduled',
    'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Interview types
DO $$ BEGIN
  CREATE TYPE public.interview_type AS ENUM (
    'phone_screen',
    'technical',
    'cultural_fit',
    'panel',
    'final',
    'offer_call'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------------
-- 2. Shared trigger function: auto-update updated_at via moddatetime
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- 3. TABLE: recruiters
--    Internal platform users (linked to Supabase Auth via auth.users).
--    Managed by db-agent; auth.users row is created by Supabase Auth.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.recruiters (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Supabase Auth link (1-to-1). ON DELETE CASCADE: removing auth user removes recruiter.
  auth_user_id     UUID        NOT NULL UNIQUE
                               REFERENCES auth.users (id) ON DELETE CASCADE,

  -- Profile data
  full_name        TEXT        NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 120),
  email            TEXT        NOT NULL UNIQUE
                               CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  avatar_url       TEXT,
  phone            TEXT        CHECK (phone IS NULL OR char_length(phone) BETWEEN 7 AND 30),
  department       TEXT        CHECK (department IS NULL OR char_length(department) <= 80),

  -- Role-based access
  role             public.recruiter_role NOT NULL DEFAULT 'recruiter',

  -- Soft-delete / deactivation
  is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
  deactivated_at   TIMESTAMPTZ,

  -- Audit timestamps
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER recruiters_updated_at
  BEFORE UPDATE ON public.recruiters
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

COMMENT ON TABLE  public.recruiters IS 'Internal ATS users (admins, recruiters, interviewers). Linked 1-to-1 to auth.users.';
COMMENT ON COLUMN public.recruiters.auth_user_id IS 'FK to auth.users.id — Supabase Auth identity.';
COMMENT ON COLUMN public.recruiters.role         IS 'RBAC role: admin > recruiter > interviewer > viewer.';

-- ---------------------------------------------------------------------------
-- 4. TABLE: jobs
--    Open positions with requirements, embedding for semantic matching,
--    and full lifecycle status management.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.jobs (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership
  created_by       UUID        NOT NULL
                               REFERENCES public.recruiters (id) ON DELETE RESTRICT,

  -- Core fields
  title            TEXT        NOT NULL CHECK (char_length(title) BETWEEN 3 AND 200),
  description      TEXT        NOT NULL CHECK (char_length(description) >= 20),
  department       TEXT        CHECK (department IS NULL OR char_length(department) <= 80),
  location         TEXT        CHECK (location IS NULL OR char_length(location) <= 120),
  modality         public.job_modality  NOT NULL DEFAULT 'hybrid',
  status           public.job_status    NOT NULL DEFAULT 'draft',

  -- Compensation (nullable — some orgs don't publish salary)
  salary_min       NUMERIC(12,2) CHECK (salary_min IS NULL OR salary_min >= 0),
  salary_max       NUMERIC(12,2) CHECK (salary_max IS NULL OR salary_max >= 0),
  salary_currency  CHAR(3)       DEFAULT 'USD'
                                 CHECK (salary_currency IS NULL OR salary_currency ~ '^[A-Z]{3}$'),

  -- Structured requirements (skills, experience years, education, etc.)
  requirements     JSONB        NOT NULL DEFAULT '{}',

  -- Semantic embedding of job description (used for candidate ranking)
  embedding        VECTOR(1536),

  -- Publishing window
  published_at     TIMESTAMPTZ,
  closes_at        TIMESTAMPTZ,

  -- Audit timestamps
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Business rule: salary_max must be >= salary_min when both are present
  CONSTRAINT jobs_salary_range_check
    CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_max >= salary_min)
);

CREATE INDEX IF NOT EXISTS jobs_status_idx
  ON public.jobs (status)
  WHERE status IN ('open', 'paused');

CREATE INDEX IF NOT EXISTS jobs_created_by_idx
  ON public.jobs (created_by);

-- IVFFlat index for cosine-similarity job↔candidate matching
CREATE INDEX IF NOT EXISTS jobs_embedding_ivfflat_idx
  ON public.jobs USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

COMMENT ON TABLE  public.jobs IS 'Open positions posted on the ATS. Includes pgvector embedding for semantic candidate matching.';
COMMENT ON COLUMN public.jobs.embedding     IS 'OpenAI text-embedding-3-small (1536-dim) of title + description. Used for cosine similarity ranking.';
COMMENT ON COLUMN public.jobs.requirements  IS 'Structured JSONB: { skills: [], experience_years: int, education: string, languages: [] }';

-- ---------------------------------------------------------------------------
-- 5. TABLE: candidates
--    Applicant profiles with CV storage reference, contact data,
--    and a 1536-dim pgvector embedding of the parsed CV content.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.candidates (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contact & identity
  full_name        TEXT        NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 150),
  email            TEXT        NOT NULL UNIQUE
                               CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone            TEXT        CHECK (phone IS NULL OR char_length(phone) BETWEEN 7 AND 30),
  linkedin_url     TEXT        CHECK (linkedin_url IS NULL OR linkedin_url ~* '^https?://'),
  portfolio_url    TEXT        CHECK (portfolio_url IS NULL OR portfolio_url ~* '^https?://'),
  location         TEXT        CHECK (location IS NULL OR char_length(location) <= 120),
  nationality      TEXT        CHECK (nationality IS NULL OR char_length(nationality) <= 80),

  -- CV storage
  resume_url       TEXT        CHECK (resume_url IS NULL OR resume_url ~* '^https?://'),
  resume_filename  TEXT,

  -- Parsed CV content (plain text — fed to embedding model)
  resume_text      TEXT,

  -- Semantic embedding of parsed CV (1536-dim, OpenAI text-embedding-3-small)
  embedding        VECTOR(1536),

  -- Embedding ingestion status (used by n8n cv.ingested webhook)
  embedding_status TEXT        NOT NULL DEFAULT 'pending'
                               CHECK (embedding_status IN ('pending','processing','ready','failed')),
  embedding_updated_at TIMESTAMPTZ,

  -- Extra structured data (certifications, languages, skills, etc.)
  metadata         JSONB       NOT NULL DEFAULT '{}',

  -- Soft-delete
  deleted_at       TIMESTAMPTZ,

  -- Audit timestamps
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast lookup by email (unique index already created via UNIQUE constraint)
CREATE INDEX IF NOT EXISTS candidates_full_name_trgm_idx
  ON public.candidates USING gin (full_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS candidates_embedding_status_idx
  ON public.candidates (embedding_status)
  WHERE embedding_status IN ('pending', 'processing');

-- IVFFlat cosine-similarity index for CV↔Job semantic ranking
CREATE INDEX IF NOT EXISTS candidates_embedding_ivfflat_idx
  ON public.candidates USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE TRIGGER candidates_updated_at
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

COMMENT ON TABLE  public.candidates IS 'Applicant profiles. CV text is embedded (1536-dim) for semantic ranking against job descriptions.';
COMMENT ON COLUMN public.candidates.embedding         IS 'OpenAI text-embedding-3-small (1536-dim) of resume_text. NULL until n8n cv.ingested webhook completes.';
COMMENT ON COLUMN public.candidates.embedding_status  IS 'Pipeline state: pending → processing → ready | failed.';
COMMENT ON COLUMN public.candidates.metadata          IS 'Flexible JSONB: { skills: [], languages: [], certifications: [], years_experience: int }';

-- ---------------------------------------------------------------------------
-- 6. TABLE: applications
--    Junction between candidates and jobs. Tracks stage progression,
--    semantic match score, and recruiter assignments.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.applications (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  candidate_id     UUID        NOT NULL
                               REFERENCES public.candidates (id) ON DELETE CASCADE,
  job_id           UUID        NOT NULL
                               REFERENCES public.jobs (id)       ON DELETE CASCADE,
  assigned_to      UUID        -- recruiter managing this application
                               REFERENCES public.recruiters (id)  ON DELETE SET NULL,

  -- Kanban stage
  stage            public.candidate_stage NOT NULL DEFAULT 'applied',

  -- Semantic similarity score (0.0–1.0, computed by n8n application-scored webhook)
  score            NUMERIC(4,3)
                               CHECK (score IS NULL OR (score >= 0 AND score <= 1)),

  -- Recruiter notes and internal flags
  notes            TEXT,
  is_starred       BOOLEAN     NOT NULL DEFAULT FALSE,
  rejection_reason TEXT        CHECK (rejection_reason IS NULL OR char_length(rejection_reason) <= 500),

  -- Source tracking
  source           TEXT        NOT NULL DEFAULT 'manual'
                               CHECK (source IN ('manual','linkedin','indeed','referral','website','n8n')),

  -- One candidate can apply to the same job only once (per active application)
  CONSTRAINT applications_unique_candidate_job UNIQUE (candidate_id, job_id),

  -- Audit timestamps
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS applications_candidate_id_idx ON public.applications (candidate_id);
CREATE INDEX IF NOT EXISTS applications_job_id_idx       ON public.applications (job_id);
CREATE INDEX IF NOT EXISTS applications_stage_idx        ON public.applications (stage);
CREATE INDEX IF NOT EXISTS applications_assigned_to_idx  ON public.applications (assigned_to);
CREATE INDEX IF NOT EXISTS applications_score_idx        ON public.applications (score DESC NULLS LAST);

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

COMMENT ON TABLE  public.applications IS 'Tracks each candidate↔job application: stage, semantic score, and recruiter assignment.';
COMMENT ON COLUMN public.applications.score          IS 'Cosine similarity [0,1] between candidate.embedding and job.embedding. Set by n8n.';
COMMENT ON COLUMN public.applications.stage          IS 'Kanban column: applied → screening → technical_test → interview → offer → hired | rejected.';

-- ---------------------------------------------------------------------------
-- 7. TABLE: interviews
--    Scheduled interview sessions linking an application to an interviewer,
--    with type, result, and structured feedback storage.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.interviews (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Application being evaluated
  application_id   UUID        NOT NULL
                               REFERENCES public.applications (id) ON DELETE CASCADE,

  -- Internal recruiter/interviewer conducting the session
  interviewer_id   UUID        NOT NULL
                               REFERENCES public.recruiters (id)   ON DELETE RESTRICT,

  -- Scheduling
  interview_type   public.interview_type   NOT NULL DEFAULT 'phone_screen',
  scheduled_at     TIMESTAMPTZ NOT NULL,
  duration_minutes SMALLINT    NOT NULL DEFAULT 60
                               CHECK (duration_minutes BETWEEN 15 AND 480),
  meeting_url      TEXT        CHECK (meeting_url IS NULL OR meeting_url ~* '^https?://'),
  location_notes   TEXT        CHECK (location_notes IS NULL OR char_length(location_notes) <= 300),

  -- Outcome
  result           public.interview_result NOT NULL DEFAULT 'pending',
  conducted_at     TIMESTAMPTZ,

  -- Structured feedback (criterion → score → comment)
  feedback         JSONB       NOT NULL DEFAULT '[]',
  -- e.g. [{ "criterion": "communication", "score": 4, "comment": "Clear and concise" }, …]

  -- Overall numeric rating (1-5, set by interviewer after session)
  rating           SMALLINT    CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),

  -- Free-form interviewer notes
  notes            TEXT,

  -- n8n automation flag: has interview.scheduled event been fired?
  n8n_notified     BOOLEAN     NOT NULL DEFAULT FALSE,

  -- Audit timestamps
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS interviews_application_id_idx  ON public.interviews (application_id);
CREATE INDEX IF NOT EXISTS interviews_interviewer_id_idx  ON public.interviews (interviewer_id);
CREATE INDEX IF NOT EXISTS interviews_scheduled_at_idx    ON public.interviews (scheduled_at);
CREATE INDEX IF NOT EXISTS interviews_result_idx          ON public.interviews (result)
  WHERE result IN ('pending', 'rescheduled');

CREATE TRIGGER interviews_updated_at
  BEFORE UPDATE ON public.interviews
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

COMMENT ON TABLE  public.interviews IS 'Interview sessions linking an application to a recruiter/interviewer. Stores structured feedback and n8n notification state.';
COMMENT ON COLUMN public.interviews.feedback       IS 'JSONB array of { criterion: string, score: 1-5, comment: string }.';
COMMENT ON COLUMN public.interviews.n8n_notified   IS 'TRUE after n8n interview.scheduled webhook has been fired successfully.';

-- ---------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY — every table
-- ---------------------------------------------------------------------------

ALTER TABLE public.recruiters   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews   ENABLE ROW LEVEL SECURITY;

-- Helper: check if the authenticated user is an active recruiter with a given role
CREATE OR REPLACE FUNCTION public.auth_has_role(required_roles public.recruiter_role[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.recruiters r
    WHERE r.auth_user_id = auth.uid()
      AND r.is_active     = TRUE
      AND r.role          = ANY(required_roles)
  );
$$;

-- ── recruiters ──────────────────────────────────────────────────────────────
-- Admins see all rows; every recruiter can read/update their own row.
CREATE POLICY "recruiters_admin_all"
  ON public.recruiters FOR ALL TO authenticated
  USING  (public.auth_has_role(ARRAY['admin']::public.recruiter_role[]))
  WITH CHECK (public.auth_has_role(ARRAY['admin']::public.recruiter_role[]));

CREATE POLICY "recruiters_self_read"
  ON public.recruiters FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "recruiters_self_update"
  ON public.recruiters FOR UPDATE TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- ── jobs ────────────────────────────────────────────────────────────────────
-- Admins & recruiters manage jobs; interviewers & viewers can only read open ones.
CREATE POLICY "jobs_manage_by_recruiter"
  ON public.jobs FOR ALL TO authenticated
  USING  (public.auth_has_role(ARRAY['admin','recruiter']::public.recruiter_role[]))
  WITH CHECK (public.auth_has_role(ARRAY['admin','recruiter']::public.recruiter_role[]));

CREATE POLICY "jobs_read_by_interviewer_viewer"
  ON public.jobs FOR SELECT TO authenticated
  USING (
    status = 'open'
    AND public.auth_has_role(ARRAY['interviewer','viewer']::public.recruiter_role[])
  );

-- ── candidates ──────────────────────────────────────────────────────────────
-- Admins & recruiters see all; interviewers see only candidates assigned to their interviews.
CREATE POLICY "candidates_manage_by_recruiter"
  ON public.candidates FOR ALL TO authenticated
  USING  (public.auth_has_role(ARRAY['admin','recruiter']::public.recruiter_role[]))
  WITH CHECK (public.auth_has_role(ARRAY['admin','recruiter']::public.recruiter_role[]));

CREATE POLICY "candidates_read_by_interviewer"
  ON public.candidates FOR SELECT TO authenticated
  USING (
    public.auth_has_role(ARRAY['interviewer']::public.recruiter_role[])
    AND EXISTS (
      SELECT 1
      FROM public.interviews    i
      JOIN public.applications  a ON a.id = i.application_id
      WHERE a.candidate_id = candidates.id
        AND i.interviewer_id = (
          SELECT id FROM public.recruiters WHERE auth_user_id = auth.uid() LIMIT 1
        )
    )
  );

-- ── applications ────────────────────────────────────────────────────────────
CREATE POLICY "applications_manage_by_recruiter"
  ON public.applications FOR ALL TO authenticated
  USING  (public.auth_has_role(ARRAY['admin','recruiter']::public.recruiter_role[]))
  WITH CHECK (public.auth_has_role(ARRAY['admin','recruiter']::public.recruiter_role[]));

CREATE POLICY "applications_read_by_interviewer"
  ON public.applications FOR SELECT TO authenticated
  USING (
    public.auth_has_role(ARRAY['interviewer']::public.recruiter_role[])
    AND EXISTS (
      SELECT 1
      FROM public.interviews i
      WHERE i.application_id = applications.id
        AND i.interviewer_id = (
          SELECT id FROM public.recruiters WHERE auth_user_id = auth.uid() LIMIT 1
        )
    )
  );

-- ── interviews ───────────────────────────────────────────────────────────────
-- Admins & recruiters see all; interviewers see only sessions they own.
CREATE POLICY "interviews_manage_by_recruiter"
  ON public.interviews FOR ALL TO authenticated
  USING  (public.auth_has_role(ARRAY['admin','recruiter']::public.recruiter_role[]))
  WITH CHECK (public.auth_has_role(ARRAY['admin','recruiter']::public.recruiter_role[]));

CREATE POLICY "interviews_own_by_interviewer"
  ON public.interviews FOR SELECT TO authenticated
  USING (
    interviewer_id = (
      SELECT id FROM public.recruiters WHERE auth_user_id = auth.uid() LIMIT 1
    )
  );

CREATE POLICY "interviews_update_own_by_interviewer"
  ON public.interviews FOR UPDATE TO authenticated
  USING (
    interviewer_id = (
      SELECT id FROM public.recruiters WHERE auth_user_id = auth.uid() LIMIT 1
    )
  )
  WITH CHECK (
    interviewer_id = (
      SELECT id FROM public.recruiters WHERE auth_user_id = auth.uid() LIMIT 1
    )
  );

-- ---------------------------------------------------------------------------
-- 9. Service-role bypass (n8n / server-side embeddings pipeline)
--    Service role key bypasses RLS by default in Supabase — no extra policy needed.
--    Documented here for clarity.
-- ---------------------------------------------------------------------------
-- NOTE: n8n automation uses SUPABASE_SERVICE_ROLE_KEY (server-side only).
--       Never expose this key to the browser client.

-- =============================================================================
-- End of migration: 20260614061500_initial_ats_schema
-- Tables created: recruiters, jobs, candidates, applications, interviews
-- RLS: ENABLED on all 5 tables
-- Indexes: 12 (including 2 IVFFlat pgvector indexes)
-- ENUMs: recruiter_role, job_status, job_modality, candidate_stage,
--        interview_result, interview_type
-- =============================================================================
