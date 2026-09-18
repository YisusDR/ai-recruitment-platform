-- =============================================================================
-- Seed: supabase/seed.sql
-- Description: Local dev / CI fixture data for the ATS.
--              Populates one admin recruiter, two jobs, three candidates,
--              applications, and interviews. Safe to re-run (DELETE + INSERT).
-- IMPORTANT: This seed does NOT create auth.users rows — Supabase Auth manages
--            those. Use `supabase auth admin create-user` or the Studio UI first,
--            then copy the resulting UUIDs into the auth_user_id fields below.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Wipe existing fixture data (order respects FK constraints)
-- ---------------------------------------------------------------------------
DELETE FROM public.interviews    WHERE id IN (
  '11111111-0000-0000-0000-000000000001',
  '11111111-0000-0000-0000-000000000002'
);
DELETE FROM public.applications  WHERE id IN (
  '22222222-0000-0000-0000-000000000001',
  '22222222-0000-0000-0000-000000000002',
  '22222222-0000-0000-0000-000000000003'
);
DELETE FROM public.candidates    WHERE id IN (
  '33333333-0000-0000-0000-000000000001',
  '33333333-0000-0000-0000-000000000002',
  '33333333-0000-0000-0000-000000000003'
);
DELETE FROM public.jobs          WHERE id IN (
  '44444444-0000-0000-0000-000000000001',
  '44444444-0000-0000-0000-000000000002'
);
DELETE FROM public.recruiters    WHERE id IN (
  '55555555-0000-0000-0000-000000000001',
  '55555555-0000-0000-0000-000000000002'
);

-- ---------------------------------------------------------------------------
-- Recruiters
-- NOTE: Replace auth_user_id values with real UUIDs from auth.users
-- ---------------------------------------------------------------------------
INSERT INTO public.recruiters (id, auth_user_id, full_name, email, role)
VALUES
  (
    '55555555-0000-0000-0000-000000000001',
    'df2c4632-361a-4e0e-a808-91ee670017e5',  -- ← replace with real auth.users.id
    'Admin Dev',
    'admin@ats.local',
    'admin'
  ),
  (
    '55555555-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',  -- ← replace with real auth.users.id
    'María Reclutadora',
    'maria@ats.local',
    'recruiter'
  );

-- ---------------------------------------------------------------------------
-- Jobs
-- ---------------------------------------------------------------------------
INSERT INTO public.jobs (id, created_by, title, description, department, modality, status, requirements)
VALUES
  (
    '44444444-0000-0000-0000-000000000001',
    '55555555-0000-0000-0000-000000000001',
    'Senior Full-Stack Engineer',
    'Build and maintain scalable Next.js + Supabase features for the ATS platform. You will own full feature cycles from DB schema to UI.',
    'Engineering',
    'remote',
    'open',
    '{"skills":["Next.js","TypeScript","PostgreSQL","Tailwind CSS"],"experience_years":4,"education":"Bachelor in CS or equivalent","languages":["English","Spanish"]}'::jsonb
  ),
  (
    '44444444-0000-0000-0000-000000000002',
    '55555555-0000-0000-0000-000000000002',
    'AI/ML Engineer — Recruitment',
    'Design and deploy embedding pipelines and ranking models to automate CV scoring and candidate matching using pgvector.',
    'AI Research',
    'hybrid',
    'open',
    '{"skills":["Python","PyTorch","OpenAI API","PostgreSQL","pgvector"],"experience_years":3,"education":"Master in AI/ML or equivalent","languages":["English"]}'::jsonb
  );

-- ---------------------------------------------------------------------------
-- Candidates (embedding left NULL — set by n8n cv.ingested webhook)
-- ---------------------------------------------------------------------------
INSERT INTO public.candidates (id, full_name, email, phone, location, resume_url, embedding_status, metadata)
VALUES
  (
    '33333333-0000-0000-0000-000000000001',
    'Carlos Pérez',
    'carlos.perez@email.com',
    '+34 600 111 222',
    'Madrid, Spain',
    'https://storage.example.com/cvs/carlos-perez.pdf',
    'pending',
    '{"skills":["Next.js","React","TypeScript","PostgreSQL"],"years_experience":5,"languages":["Spanish","English"]}'::jsonb
  ),
  (
    '33333333-0000-0000-0000-000000000002',
    'Laura Gómez',
    'laura.gomez@email.com',
    '+34 600 333 444',
    'Barcelona, Spain',
    'https://storage.example.com/cvs/laura-gomez.pdf',
    'pending',
    '{"skills":["Python","TensorFlow","OpenAI","pgvector","FastAPI"],"years_experience":4,"languages":["Spanish","English","French"]}'::jsonb
  ),
  (
    '33333333-0000-0000-0000-000000000003',
    'John Smith',
    'john.smith@email.com',
    '+1 555 987 6543',
    'New York, USA',
    'https://storage.example.com/cvs/john-smith.pdf',
    'pending',
    '{"skills":["React","Node.js","Tailwind CSS","TypeScript"],"years_experience":3,"languages":["English"]}'::jsonb
  );

-- ---------------------------------------------------------------------------
-- Applications
-- ---------------------------------------------------------------------------
INSERT INTO public.applications (id, candidate_id, job_id, assigned_to, stage, source)
VALUES
  (
    '22222222-0000-0000-0000-000000000001',
    '33333333-0000-0000-0000-000000000001',  -- Carlos → Senior Full-Stack
    '44444444-0000-0000-0000-000000000001',
    '55555555-0000-0000-0000-000000000002',  -- assigned to María
    'screening',
    'linkedin'
  ),
  (
    '22222222-0000-0000-0000-000000000002',
    '33333333-0000-0000-0000-000000000002',  -- Laura → AI/ML Engineer
    '44444444-0000-0000-0000-000000000002',
    '55555555-0000-0000-0000-000000000002',
    'interview',
    'website'
  ),
  (
    '22222222-0000-0000-0000-000000000003',
    '33333333-0000-0000-0000-000000000003',  -- John → Senior Full-Stack
    '44444444-0000-0000-0000-000000000001',
    '55555555-0000-0000-0000-000000000002',
    'applied',
    'indeed'
  );

-- ---------------------------------------------------------------------------
-- Interviews
-- ---------------------------------------------------------------------------
INSERT INTO public.interviews (id, application_id, interviewer_id, interview_type, scheduled_at, duration_minutes, result)
VALUES
  (
    '11111111-0000-0000-0000-000000000001',
    '22222222-0000-0000-0000-000000000001',  -- Carlos screening interview
    '55555555-0000-0000-0000-000000000002',
    'phone_screen',
    NOW() + INTERVAL '2 days',
    45,
    'pending'
  ),
  (
    '11111111-0000-0000-0000-000000000002',
    '22222222-0000-0000-0000-000000000002',  -- Laura technical interview
    '55555555-0000-0000-0000-000000000001',
    'technical',
    NOW() + INTERVAL '5 days',
    90,
    'pending'
  );
