'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { JobModality, JobStatus, JobRequirements } from '@/lib/supabase/types'

// ── Validation schema ────────────────────────────────────────────────────────

const CreateJobSchema = z.object({
  title:       z.string().min(3, 'El título debe tener al menos 3 caracteres').max(200),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  department:  z.string().max(100).optional(),
  location:    z.string().max(200).optional(),
  modality:    z.enum(['on-site', 'remote', 'hybrid']),
  status:      z.enum(['draft', 'open', 'paused', 'closed', 'archived']),
  salary_min:  z.coerce.number().positive().optional(),
  salary_max:  z.coerce.number().positive().optional(),
  // Requirements parsed from comma-separated inputs
  skills:      z.string().optional(),
  languages:   z.string().optional(),
  education:   z.string().optional(),
  experience_years: z.coerce.number().min(0).max(30).optional(),
})

export type CreateJobFormState = {
  errors?: Record<string, string[]>
  message?: string | null
}

// ── Server Action ────────────────────────────────────────────────────────────

export async function createJobAction(
  _prevState: CreateJobFormState,
  formData: FormData,
): Promise<CreateJobFormState> {
  const supabase = await createClient()

  // 1. Get the authenticated recruiter's profile
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { message: 'No autenticado. Por favor inicia sesión.' }
  }

  // 2. Look up recruiter by auth_user_id to get the recruiter UUID (FK constraint)
  // Cast to any: known SDK inference issue when selecting a single column via .single()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: recruiter } = await (supabase as any)
    .from('recruiters')
    .select('id')
    .eq('auth_user_id', user.id)
    .single() as { data: { id: string } | null; error: unknown }

  if (!recruiter) {
    return { message: 'No se encontró un perfil de reclutador para tu cuenta. Contacta al administrador.' }
  }

  // 3. Parse and validate form data
  const raw = {
    title:            formData.get('title'),
    description:      formData.get('description'),
    department:       formData.get('department') || undefined,
    location:         formData.get('location')   || undefined,
    modality:         formData.get('modality'),
    status:           formData.get('status'),
    salary_min:       formData.get('salary_min') || undefined,
    salary_max:       formData.get('salary_max') || undefined,
    skills:           formData.get('skills')     || undefined,
    languages:        formData.get('languages')  || undefined,
    education:        formData.get('education')  || undefined,
    experience_years: formData.get('experience_years') || undefined,
  }

  const parsed = CreateJobSchema.safeParse(raw)

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const v = parsed.data

  // 4. Build requirements JSONB
  const requirements: JobRequirements = {
    skills:           v.skills  ? v.skills.split(',').map((s) => s.trim()).filter(Boolean)  : [],
    languages:        v.languages ? v.languages.split(',').map((s) => s.trim()).filter(Boolean) : [],
    education:        v.education ?? '',
    experience_years: v.experience_years ?? 0,
  }

  // 5. Insert into jobs table
  // Cast to any: known postgrest-js/Supabase SDK bug where tables containing pgvector
  // or complex JSONB columns cause the Insert generic to collapse to never[].
  // All data is already fully validated by Zod above.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('jobs').insert({
    created_by:  recruiter.id,
    title:       v.title,
    description: v.description,
    department:  v.department  ?? null,
    location:    v.location    ?? null,
    modality:    v.modality    as JobModality,
    status:      v.status      as JobStatus,
    salary_min:  v.salary_min  ?? null,
    salary_max:  v.salary_max  ?? null,
    salary_currency: 'EUR',
    requirements,
  })

  if (error) {
    return { message: `Error al crear la vacante: ${error.message}` }
  }

  // 6. On success, redirect back to the jobs list
  redirect('/jobs')
}

// ── Update ───────────────────────────────────────────────────────────────────

export async function updateJobAction(
  jobId: string,
  _prevState: CreateJobFormState,
  formData: FormData,
): Promise<CreateJobFormState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { message: 'No autenticado.' }

  const raw = {
    title:            formData.get('title'),
    description:      formData.get('description'),
    department:       formData.get('department') || undefined,
    location:         formData.get('location')   || undefined,
    modality:         formData.get('modality'),
    status:           formData.get('status'),
    salary_min:       formData.get('salary_min') || undefined,
    salary_max:       formData.get('salary_max') || undefined,
    skills:           formData.get('skills')     || undefined,
    languages:        formData.get('languages')  || undefined,
    education:        formData.get('education')  || undefined,
    experience_years: formData.get('experience_years') || undefined,
  }

  const parsed = CreateJobSchema.safeParse(raw)
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const v = parsed.data

  const requirements: JobRequirements = {
    skills:           v.skills ? v.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
    languages:        v.languages ? v.languages.split(',').map(s => s.trim()).filter(Boolean) : [],
    education:        v.education ?? '',
    experience_years: v.experience_years ?? 0,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('jobs').update({
    title:       v.title,
    description: v.description,
    department:  v.department  ?? null,
    location:    v.location    ?? null,
    modality:    v.modality    as JobModality,
    status:      v.status      as JobStatus,
    salary_min:  v.salary_min  ?? null,
    salary_max:  v.salary_max  ?? null,
    requirements,
  }).eq('id', jobId)

  if (error) return { message: `Error al actualizar la vacante: ${error.message}` }

  redirect(`/jobs/${jobId}`)
}

// ── Delete ───────────────────────────────────────────────────────────────────

export async function deleteJobAction(jobId: string): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado.' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('jobs').update({
    status: 'archived' as JobStatus,
  }).eq('id', jobId)

  if (error) return { error: error.message }

  redirect('/jobs')
}
