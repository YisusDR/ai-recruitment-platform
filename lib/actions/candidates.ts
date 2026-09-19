'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { mockStore } from '@/lib/mock/store'

// ── Validation schemas ───────────────────────────────────────────────────────

const CreateCandidateSchema = z.object({
  full_name:     z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(150),
  email:         z.string().email('Email inválido'),
  phone:         z.string().max(30).optional(),
  linkedin_url:  z.string().url('URL inválida').optional().or(z.literal('')),
  portfolio_url: z.string().url('URL inválida').optional().or(z.literal('')),
  location:      z.string().max(120).optional(),
  nationality:   z.string().max(80).optional(),
  skills:        z.string().optional(),
  languages:     z.string().optional(),
  years_experience: z.coerce.number().min(0).max(50).optional(),
})

export type CandidateFormState = {
  errors?: Record<string, string[]>
  message?: string | null
}

// ── Create ───────────────────────────────────────────────────────────────────

export async function createCandidateAction(
  _prevState: CandidateFormState,
  formData: FormData,
): Promise<CandidateFormState> {
  const raw = {
    full_name:        formData.get('full_name'),
    email:            formData.get('email'),
    phone:            formData.get('phone') || undefined,
    linkedin_url:     formData.get('linkedin_url') || undefined,
    portfolio_url:    formData.get('portfolio_url') || undefined,
    location:         formData.get('location') || undefined,
    nationality:      formData.get('nationality') || undefined,
    skills:           formData.get('skills') || undefined,
    languages:        formData.get('languages') || undefined,
    years_experience: formData.get('years_experience') || undefined,
  }

  const parsed = CreateCandidateSchema.safeParse(raw)
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const v = parsed.data
  const metadata = {
    skills:         v.skills ? v.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
    languages:      v.languages ? v.languages.split(',').map(s => s.trim()).filter(Boolean) : [],
    certifications: [] as string[],
    years_experience: v.years_experience ?? 0,
  }

  let dbSaved = false
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('candidates').insert({
      full_name:       v.full_name,
      email:           v.email.trim().toLowerCase(),
      phone:           v.phone ?? null,
      linkedin_url:    v.linkedin_url || null,
      portfolio_url:   v.portfolio_url || null,
      location:        v.location ?? null,
      nationality:     v.nationality ?? null,
      embedding_status: 'pending',
      metadata,
    })
    if (!error) dbSaved = true
  } catch (_err) {
    // Supabase unreachable
  }

  if (!dbSaved) {
    mockStore.createCandidate({
      full_name:       v.full_name,
      email:           v.email.trim().toLowerCase(),
      phone:           v.phone ?? null,
      linkedin_url:    v.linkedin_url || null,
      portfolio_url:   v.portfolio_url || null,
      location:        v.location ?? null,
      nationality:     v.nationality ?? null,
      metadata,
    })
  }

  redirect('/candidates')
}

// ── Update ───────────────────────────────────────────────────────────────────

export async function updateCandidateAction(
  candidateId: string,
  _prevState: CandidateFormState,
  formData: FormData,
): Promise<CandidateFormState> {
  const raw = {
    full_name:        formData.get('full_name'),
    email:            formData.get('email'),
    phone:            formData.get('phone') || undefined,
    linkedin_url:     formData.get('linkedin_url') || undefined,
    portfolio_url:    formData.get('portfolio_url') || undefined,
    location:         formData.get('location') || undefined,
    nationality:      formData.get('nationality') || undefined,
    skills:           formData.get('skills') || undefined,
    languages:        formData.get('languages') || undefined,
    years_experience: formData.get('years_experience') || undefined,
  }

  const parsed = CreateCandidateSchema.safeParse(raw)
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const v = parsed.data
  const metadata = {
    skills:         v.skills ? v.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
    languages:      v.languages ? v.languages.split(',').map(s => s.trim()).filter(Boolean) : [],
    certifications: [] as string[],
    years_experience: v.years_experience ?? 0,
  }

  let dbSaved = false
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('candidates').update({
      full_name:     v.full_name,
      email:         v.email.trim().toLowerCase(),
      phone:         v.phone ?? null,
      linkedin_url:  v.linkedin_url || null,
      portfolio_url: v.portfolio_url || null,
      location:      v.location ?? null,
      nationality:   v.nationality ?? null,
      metadata,
    }).eq('id', candidateId)
    if (!error) dbSaved = true
  } catch (_err) {
    // Supabase unreachable
  }

  if (!dbSaved) {
    mockStore.updateCandidate(candidateId, {
      full_name:     v.full_name,
      email:         v.email.trim().toLowerCase(),
      phone:         v.phone ?? null,
      linkedin_url:  v.linkedin_url || null,
      portfolio_url: v.portfolio_url || null,
      location:      v.location ?? null,
      nationality:   v.nationality ?? null,
      metadata,
    })
  }

  redirect(`/candidates/${candidateId}`)
}

// ── Delete ───────────────────────────────────────────────────────────────────

export async function deleteCandidateAction(candidateId: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('candidates').update({
      deleted_at: new Date().toISOString(),
    }).eq('id', candidateId)
  } catch (_err) {
    // Supabase unreachable
  }

  mockStore.deleteCandidate(candidateId)
  redirect('/candidates')
}
