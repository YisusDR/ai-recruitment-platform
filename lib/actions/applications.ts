'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { mockStore } from '@/lib/mock/store'
import type { CandidateStage } from '@/lib/supabase/types'

// ── Update stage ─────────────────────────────────────────────────────────────

export async function updateApplicationStageAction(
  applicationId: string,
  stage: CandidateStage,
): Promise<{ error?: string }> {
  let dbSaved = false
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('applications').update({
      stage,
      ...(stage === 'rejected' ? { rejection_reason: 'Rechazado por reclutador' } : {}),
    }).eq('id', applicationId)
    if (!error) dbSaved = true
  } catch (_err) {
    // Supabase unreachable
  }

  if (!dbSaved) {
    mockStore.updateApplicationStage(applicationId, stage)
  }

  revalidatePath('/candidates')
  revalidatePath('/jobs')
  return {}
}

// ── Toggle star ──────────────────────────────────────────────────────────────

export async function toggleStarAction(
  applicationId: string,
  currentStarred: boolean,
): Promise<{ error?: string }> {
  let dbSaved = false
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('applications').update({
      is_starred: !currentStarred,
    }).eq('id', applicationId)
    if (!error) dbSaved = true
  } catch (_err) {
    // Supabase unreachable
  }

  if (!dbSaved) {
    mockStore.toggleStar(applicationId)
  }

  revalidatePath('/candidates')
  return {}
}
