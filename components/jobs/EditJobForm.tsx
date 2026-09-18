'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { updateJobAction, type CreateJobFormState } from '@/lib/actions/jobs'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { JobRow } from '@/lib/supabase/types'

// ── Submit button ────────────────────────────────────────────────────────────

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="primary" size="md" isLoading={pending} id="btn-submit-edit-job">
      {pending ? 'Guardando…' : 'Guardar cambios'}
    </Button>
  )
}

// ── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label, name, required, errors, hint, children,
}: {
  label: string; name: string; required?: boolean
  errors?: string[]; hint?: string; children: React.ReactNode
}) {
  const hasError = errors && errors.length > 0
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {hint && !hasError && <p className="text-xs text-slate-400">{hint}</p>}
      {hasError && <p className="text-xs text-red-600">{errors[0]}</p>}
    </div>
  )
}

// ── Primitives ───────────────────────────────────────────────────────────────

const inputBase =
  'block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50'

const inputError = 'border-red-400 focus:border-red-500 focus:ring-red-500/20'

function Input({
  name, id, type = 'text', hasError, ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }) {
  return <input id={id ?? name} name={name} type={type} className={cn(inputBase, hasError && inputError)} {...rest} />
}

function Textarea({
  name, id, rows = 5, hasError, ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { hasError?: boolean }) {
  return <textarea id={id ?? name} name={name} rows={rows} className={cn(inputBase, 'resize-none', hasError && inputError)} {...rest} />
}

function Select({
  name, id, hasError, children, ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { hasError?: boolean }) {
  return <select id={id ?? name} name={name} className={cn(inputBase, 'cursor-pointer appearance-none', hasError && inputError)} {...rest}>{children}</select>
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">{title}</h2>
      {children}
    </div>
  )
}

// ── Form ─────────────────────────────────────────────────────────────────────

interface EditJobFormProps {
  job: JobRow
}

const initialState: CreateJobFormState = { errors: undefined, message: null }

export function EditJobForm({ job }: EditJobFormProps) {
  const boundAction = updateJobAction.bind(null, job.id)
  const [state, formAction] = useActionState(boundAction, initialState)
  const e = state.errors ?? {}

  const req = job.requirements ?? { skills: [], languages: [], education: '', experience_years: 0 }

  return (
    <form action={formAction} className="space-y-8">
      {state.message && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      )}

      <Section title="Información básica">
        <Field label="Título de la vacante" name="title" required errors={e.title}>
          <Input name="title" placeholder="Senior Full-Stack Engineer" hasError={!!e.title} required defaultValue={job.title} />
        </Field>

        <Field label="Descripción" name="description" required errors={e.description}>
          <Textarea name="description" rows={6} placeholder="Descripción del rol…" hasError={!!e.description} required defaultValue={job.description} />
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Departamento" name="department" errors={e.department}>
            <Input name="department" placeholder="Ingeniería" defaultValue={job.department ?? ''} />
          </Field>
          <Field label="Ubicación" name="location" errors={e.location}>
            <Input name="location" placeholder="Madrid, España" defaultValue={job.location ?? ''} />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Modalidad" name="modality" required errors={e.modality}>
            <Select name="modality" defaultValue={job.modality} hasError={!!e.modality}>
              <option value="on-site">Presencial</option>
              <option value="remote">Remoto</option>
              <option value="hybrid">Híbrido</option>
            </Select>
          </Field>
          <Field label="Estado" name="status" required errors={e.status}>
            <Select name="status" defaultValue={job.status} hasError={!!e.status}>
              <option value="draft">Borrador</option>
              <option value="open">Abierta</option>
              <option value="paused">Pausada</option>
              <option value="closed">Cerrada</option>
              <option value="archived">Archivada</option>
            </Select>
          </Field>
        </div>
      </Section>

      <Section title="Salario (opcional)">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Salario mínimo (€)" name="salary_min" errors={e.salary_min}>
            <Input name="salary_min" type="number" placeholder="30000" min={0} defaultValue={job.salary_min ?? ''} />
          </Field>
          <Field label="Salario máximo (€)" name="salary_max" errors={e.salary_max}>
            <Input name="salary_max" type="number" placeholder="60000" min={0} defaultValue={job.salary_max ?? ''} />
          </Field>
        </div>
      </Section>

      <Section title="Requisitos">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Habilidades técnicas" name="skills" hint="Separadas por coma">
            <Input name="skills" placeholder="React, TypeScript" defaultValue={req.skills?.join(', ') ?? ''} />
          </Field>
          <Field label="Años de experiencia" name="experience_years" errors={e.experience_years}>
            <Input name="experience_years" type="number" placeholder="3" min={0} max={30} defaultValue={req.experience_years ?? ''} />
          </Field>
          <Field label="Idiomas" name="languages" hint="Separados por coma">
            <Input name="languages" placeholder="Español, Inglés" defaultValue={req.languages?.join(', ') ?? ''} />
          </Field>
          <Field label="Nivel educativo" name="education">
            <Input name="education" placeholder="Grado en Informática" defaultValue={req.education ?? ''} />
          </Field>
        </div>
      </Section>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
        <Link href={`/jobs/${job.id}`} id="btn-cancel-edit-job">
          <Button type="button" variant="ghost" size="md">Cancelar</Button>
        </Link>
        <SubmitButton />
      </div>
    </form>
  )
}
