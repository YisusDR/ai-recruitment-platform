import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import type { CandidateStage, Database } from '@/lib/supabase/types'

// ---------------------------------------------------------------------------
// 1. Authorization Utility
// ---------------------------------------------------------------------------

/**
 * Validates that the request has the correct n8n API secret key.
 * Checks the 'x-n8n-api-key' header first, falling back to 'Authorization: Bearer <secret>'.
 */
export function verifyAuth(req: NextRequest): boolean {
  const secret = process.env.N8N_WEBHOOK_SECRET
  if (!secret) {
    console.warn('WARNING: N8N_WEBHOOK_SECRET is not configured in environment variables.')
    // In strict mode, we should fail closed if the secret is not defined in production
    if (process.env.NODE_ENV === 'production') {
      return false
    }
    return true // Allow in dev if not configured
  }

  const apiKeyHeader = req.headers.get('x-n8n-api-key')
  if (apiKeyHeader === secret) {
    return true
  }

  const authHeader = req.headers.get('authorization')
  if (authHeader) {
    const [type, token] = authHeader.split(' ')
    if (type?.toLowerCase() === 'bearer' && token === secret) {
      return true
    }
  }

  return false
}

// ---------------------------------------------------------------------------
// 2. Validation Schemas
// ---------------------------------------------------------------------------

export const CvIngestedSchema = z.object({
  candidate_id: z.string().uuid(),
  resume_url: z.string().url(),
  resume_filename: z.string().optional().nullable(),
  resume_text: z.string().optional().nullable(),
  // text-embedding-004 (Google Gemini) → 768 dimensions
  embedding: z.array(z.number()).length(768, 'Vector embedding must be exactly 768 dimensions (text-embedding-004)'),
})

export type CvIngestedPayload = z.infer<typeof CvIngestedSchema>

export const ApplicationScoredSchema = z.object({
  application_id: z.string().uuid(),
  score: z.number().min(0).max(1),
})

export type ApplicationScoredPayload = z.infer<typeof ApplicationScoredSchema>

const candidateStages: [CandidateStage, ...CandidateStage[]] = [
  'applied',
  'screening',
  'technical_test',
  'interview',
  'offer',
  'hired',
  'rejected',
  'withdrawn'
]

export const StageAdvancedSchema = z.object({
  application_id: z.string().uuid(),
  stage: z.enum(candidateStages),
})

export type StageAdvancedPayload = z.infer<typeof StageAdvancedSchema>

export const InterviewScheduledSchema = z.object({
  interview_id: z.string().uuid(),
})

export type InterviewScheduledPayload = z.infer<typeof InterviewScheduledSchema>

// ---------------------------------------------------------------------------
// 3. Database Event Handlers
// ---------------------------------------------------------------------------

/**
 * Handler for cv.ingested
 * Updates candidates resume URL, filename, text, vector embedding, and status.
 */
export async function handleCvIngested(payload: CvIngestedPayload) {
  // Cast to any is required due to a known type constraint bug in postgrest-js/Supabase SDK
  // where tables with pgvector or custom types fail internal GenericTable checks.
  const supabase = createAdminClient() as any

  const { data, error } = await supabase
    .from('candidates')
    .update({
      resume_url: payload.resume_url,
      resume_filename: payload.resume_filename ?? null,
      resume_text: payload.resume_text ?? null,
      embedding: payload.embedding,
      embedding_status: 'ready' as const,
      embedding_updated_at: new Date().toISOString(),
    })
    .eq('id', payload.candidate_id)
    .select('id, full_name, email, embedding_status')
    .single()


  if (error) {
    throw new Error(`Failed to update candidate CV ingestion: ${error.message}`)
  }

  return data
}

/**
 * Handler for application.scored
 * Updates application semantic similarity score.
 */
export async function handleApplicationScored(payload: ApplicationScoredPayload) {
  // Cast to any is required due to a known type constraint bug in postgrest-js/Supabase SDK
  const supabase = createAdminClient() as any

  const { data, error } = await supabase
    .from('applications')
    .update({
      score: payload.score,
    })
    .eq('id', payload.application_id)
    .select('id, candidate_id, job_id, score')
    .single()

  if (error) {
    throw new Error(`Failed to update application score: ${error.message}`)
  }

  return data
}

/**
 * Handler for stage.advanced
 * Changes the Kanban stage of the application.
 */
export async function handleStageAdvanced(payload: StageAdvancedPayload) {
  // Cast to any is required due to a known type constraint bug in postgrest-js/Supabase SDK
  const supabase = createAdminClient() as any

  const { data, error } = await supabase
    .from('applications')
    .update({
      stage: payload.stage,
    })
    .eq('id', payload.application_id)
    .select('id, candidate_id, job_id, stage')
    .single()

  if (error) {
    throw new Error(`Failed to update application stage: ${error.message}`)
  }

  return data
}

/**
 * Handler for interview.scheduled
 * Sets the n8n_notified flag of the interview to true.
 */
export async function handleInterviewScheduled(payload: InterviewScheduledPayload) {
  // Cast to any is required due to a known type constraint bug in postgrest-js/Supabase SDK
  const supabase = createAdminClient() as any

  const { data, error } = await supabase
    .from('interviews')
    .update({
      n8n_notified: true,
    })
    .eq('id', payload.interview_id)
    .select('id, application_id, n8n_notified')
    .single()

  if (error) {
    throw new Error(`Failed to update interview notification status: ${error.message}`)
  }

  return data
}
