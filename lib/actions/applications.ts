'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { CandidateStage } from '@/lib/supabase/types'

// ── Update stage ─────────────────────────────────────────────────────────────

export async function updateApplicationStageAction(
  applicationId: string,
  stage: CandidateStage,
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado.' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('applications').update({
    stage,
    ...(stage === 'rejected' ? { rejection_reason: 'Rechazado por reclutador' } : {}),
  }).eq('id', applicationId)

  if (error) return { error: error.message }

  revalidatePath('/candidates')
  revalidatePath('/jobs')
  return {}
}

// ── Toggle star ──────────────────────────────────────────────────────────────

export async function toggleStarAction(
  applicationId: string,
  currentStarred: boolean,
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado.' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('applications').update({
    is_starred: !currentStarred,
  }).eq('id', applicationId)

  if (error) return { error: error.message }

  revalidatePath('/candidates')
  return {}
}
