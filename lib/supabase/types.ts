/**
 * lib/supabase/types.ts
 * ─────────────────────
 * Hand-crafted Database type scaffold matching the ATS schema.
 * Replace this file with the generated output of:
 *   npx supabase gen types typescript --local
 *
 * All types are derived from supabase/migrations/20260614061500_initial_ats_schema.sql
 */

// ── Enum types ───────────────────────────────────────────────────────────────

export type RecruiterRole = 'admin' | 'recruiter' | 'interviewer' | 'viewer'
export type JobStatus     = 'draft' | 'open' | 'paused' | 'closed' | 'archived'
export type JobModality   = 'on-site' | 'remote' | 'hybrid'
export type CandidateStage =
  | 'applied' | 'screening' | 'technical_test' | 'interview'
  | 'offer'   | 'hired'     | 'rejected'        | 'withdrawn'
export type InterviewResult =
  | 'pending' | 'passed' | 'failed' | 'no_show' | 'rescheduled' | 'cancelled'
export type InterviewType =
  | 'phone_screen' | 'technical' | 'cultural_fit' | 'panel' | 'final' | 'offer_call'
export type EmbeddingStatus = 'pending' | 'processing' | 'ready' | 'failed'

// ── Row types (SELECT * result shape) ────────────────────────────────────────

export type RecruiterRow = {
  id:              string
  auth_user_id:    string
  full_name:       string
  email:           string
  avatar_url:      string | null
  phone:           string | null
  department:      string | null
  role:            RecruiterRole
  is_active:       boolean
  deactivated_at:  string | null
  created_at:      string
  updated_at:      string
}

export type JobRequirements = {
  skills:           string[]
  experience_years: number
  education:        string
  languages:        string[]
  [key: string]:     unknown
}

export type JobRow = {
  id:               string
  created_by:       string
  title:            string
  description:      string
  department:       string | null
  location:         string | null
  modality:         JobModality
  status:           JobStatus
  salary_min:       number | null
  salary_max:       number | null
  salary_currency:  string | null
  requirements:     JobRequirements
  embedding:        number[] | null
  published_at:     string | null


  closes_at:        string | null
  created_at:       string
  updated_at:       string
}

export type CandidateMetadata = {
  skills:            string[]
  languages:         string[]
  certifications:    string[]
  years_experience:  number
  [key: string]:     unknown
}

export type CandidateRow = {
  id:                   string
  full_name:            string
  email:                string
  phone:                string | null
  linkedin_url:         string | null
  portfolio_url:        string | null
  location:             string | null
  nationality:          string | null
  resume_url:           string | null
  resume_filename:      string | null
  resume_text:          string | null
  embedding:            number[] | null
  embedding_status:     EmbeddingStatus


  embedding_updated_at: string | null
  metadata:             CandidateMetadata
  deleted_at:           string | null
  created_at:           string
  updated_at:           string
}

export type ApplicationRow = {
  id:               string
  candidate_id:     string
  job_id:           string
  assigned_to:      string | null
  stage:            CandidateStage
  score:            number | null
  notes:            string | null
  is_starred:       boolean
  rejection_reason: string | null
  source:           'manual' | 'linkedin' | 'indeed' | 'referral' | 'website' | 'n8n'
  created_at:       string
  updated_at:       string
}

export type FeedbackItem = {
  criterion: string
  score:     1 | 2 | 3 | 4 | 5
  comment:   string
}

export type InterviewRow = {
  id:               string
  application_id:   string
  interviewer_id:   string
  interview_type:   InterviewType
  scheduled_at:     string
  duration_minutes: number
  meeting_url:      string | null
  location_notes:   string | null
  result:           InterviewResult
  conducted_at:     string | null
  feedback:         FeedbackItem[]
  rating:           number | null
  notes:            string | null
  n8n_notified:     boolean
  created_at:       string
  updated_at:       string
}

// ── Insert types (omit server-generated fields) ───────────────────────────────

export type RecruiterInsert = Omit<RecruiterRow, 'id' | 'created_at' | 'updated_at'>
export type JobInsert       = Omit<JobRow,       'id' | 'created_at' | 'updated_at'>
export type CandidateInsert = Omit<CandidateRow, 'id' | 'created_at' | 'updated_at'>
export type ApplicationInsert = Omit<ApplicationRow, 'id' | 'created_at' | 'updated_at'>
export type InterviewInsert  = Omit<InterviewRow,   'id' | 'created_at' | 'updated_at'>

// ── Update types (all fields optional except PK) ─────────────────────────────

export type RecruiterUpdate   = Partial<RecruiterInsert>
export type JobUpdate         = Partial<JobInsert>
export type CandidateUpdate   = Partial<CandidateInsert>
export type ApplicationUpdate = Partial<ApplicationInsert>
export type InterviewUpdate   = Partial<InterviewInsert>

export type Database = {
  public: {
    Tables: {
      recruiters:   { Row: RecruiterRow;   Insert: RecruiterInsert;   Update: RecruiterUpdate; Relationships: [] }
      jobs:         { Row: JobRow;         Insert: JobInsert;         Update: JobUpdate; Relationships: [
        {
          foreignKeyName: "jobs_created_by_fkey"
          columns: ["created_by"]
          isOneToOne: false
          referencedRelation: "recruiters"
          referencedColumns: ["id"]
        }
      ] }
      candidates:   { Row: CandidateRow;   Insert: CandidateInsert;   Update: CandidateUpdate; Relationships: [] }
      applications: { Row: ApplicationRow; Insert: ApplicationInsert; Update: ApplicationUpdate; Relationships: [
        {
          foreignKeyName: "applications_candidate_id_fkey"
          columns: ["candidate_id"]
          isOneToOne: false
          referencedRelation: "candidates"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "applications_job_id_fkey"
          columns: ["job_id"]
          isOneToOne: false
          referencedRelation: "jobs"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "applications_assigned_to_fkey"
          columns: ["assigned_to"]
          isOneToOne: false
          referencedRelation: "recruiters"
          referencedColumns: ["id"]
        }
      ] }
      interviews:   { Row: InterviewRow;   Insert: InterviewInsert;   Update: InterviewUpdate; Relationships: [
        {
          foreignKeyName: "interviews_application_id_fkey"
          columns: ["application_id"]
          isOneToOne: false
          referencedRelation: "applications"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "interviews_interviewer_id_fkey"
          columns: ["interviewer_id"]
          isOneToOne: false
          referencedRelation: "recruiters"
          referencedColumns: ["id"]
        }
      ] }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      recruiter_role:   RecruiterRole
      job_status:       JobStatus
      job_modality:     JobModality
      candidate_stage:  CandidateStage
      interview_result: InterviewResult
      interview_type:   InterviewType
      embedding_status: EmbeddingStatus
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}



