'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { InterviewType, InterviewResult } from '@/lib/supabase/types'

// ── Validation schemas ───────────────────────────────────────────────────────

const ScheduleInterviewSchema = z.object({
  application_id:   z.string().uuid('Application ID inválido'),
  interviewer_id:   z.string().uuid('Interviewer ID inválido'),
  interview_type:   z.enum(['phone_screen', 'technical', 'cultural_fit', 'panel', 'final', 'offer_call']),
  scheduled_at:     z.string().min(1, 'Fecha requerida'),
  duration_minutes: z.coerce.number().min(15).max(480),
  meeting_url:      z.string().url('URL inválida').optional().or(z.literal('')),
  location_notes:   z.string().max(300).optional(),
})

const UpdateInterviewResultSchema = z.object({
  result:  z.enum(['pending', 'passed', 'failed', 'no_show', 'rescheduled', 'cancelled']),
  rating:  z.coerce.number().min(1).max(5).optional(),
  notes:   z.string().optional(),
})

export type InterviewFormState = {
  errors?: Record<string, string[]>
  message?: string | null
}

// ── Schedule ─────────────────────────────────────────────────────────────────

export async function scheduleInterviewAction(
  _prevState: InterviewFormState,
  formData: FormData,
): Promise<InterviewFormState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { message: 'No autenticado.' }

  const raw = {
    application_id:   formData.get('application_id'),
    interviewer_id:   formData.get('interviewer_id'),
    interview_type:   formData.get('interview_type'),
    scheduled_at:     formData.get('scheduled_at'),
    duration_minutes: formData.get('duration_minutes') || '60',
    meeting_url:      formData.get('meeting_url') || undefined,
    location_notes:   formData.get('location_notes') || undefined,
  }

  const parsed = ScheduleInterviewSchema.safeParse(raw)
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const v = parsed.data

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('interviews').insert({
    application_id:   v.application_id,
    interviewer_id:   v.interviewer_id,
    interview_type:   v.interview_type as InterviewType,
    scheduled_at:     v.scheduled_at,
    duration_minutes: v.duration_minutes,
    meeting_url:      v.meeting_url || null,
    location_notes:   v.location_notes ?? null,
    result:           'pending' as InterviewResult,
  })

  if (error) return { message: `Error al programar entrevista: ${error.message}` }

  redirect('/interviews')
}

// ── Update result ────────────────────────────────────────────────────────────

export async function updateInterviewResultAction(
  interviewId: string,
  _prevState: InterviewFormState,
  formData: FormData,
): Promise<InterviewFormState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { message: 'No autenticado.' }

  const raw = {
    result: formData.get('result'),
    rating: formData.get('rating') || undefined,
    notes:  formData.get('notes') || undefined,
  }

  const parsed = UpdateInterviewResultSchema.safeParse(raw)
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const v = parsed.data

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('interviews').update({
    result:       v.result as InterviewResult,
    rating:       v.rating ?? null,
    notes:        v.notes ?? null,
    conducted_at: v.result !== 'pending' ? new Date().toISOString() : null,
  }).eq('id', interviewId)

  if (error) return { message: `Error al actualizar entrevista: ${error.message}` }

  redirect(`/interviews/${interviewId}`)
}
