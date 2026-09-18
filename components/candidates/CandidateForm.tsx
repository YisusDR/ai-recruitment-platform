'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { createCandidateAction, updateCandidateAction, type CandidateFormState } from '@/lib/actions/candidates'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { CandidateRow } from '@/lib/supabase/types'

// ── Submit button ────────────────────────────────────────────────────────────

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="primary" size="md" isLoading={pending} id="btn-submit-candidate">
      {pending ? 'Guardando…' : label}
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

// ── Input primitives ─────────────────────────────────────────────────────────

const inputBase =
  'block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50'

const inputError = 'border-red-400 focus:border-red-500 focus:ring-red-500/20'

function Input({
  name, id, type = 'text', placeholder, hasError, defaultValue, ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }) {
  return (
    <input
      id={id ?? name}
      name={name}
      type={type}
      placeholder={placeholder}
      defaultValue={defaultValue}
      className={cn(inputBase, hasError && inputError)}
      {...rest}
    />
  )
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

interface CandidateFormProps {
  candidate?: CandidateRow  // if provided, we're in edit mode
}

const initialState: CandidateFormState = { errors: undefined, message: null }

export function CandidateForm({ candidate }: CandidateFormProps) {
  const isEdit = !!candidate

  const boundAction = isEdit
    ? updateCandidateAction.bind(null, candidate!.id)
    : createCandidateAction

  const [state, formAction] = useActionState(boundAction, initialState)
  const e = state.errors ?? {}

  // Extract default values from metadata for edit mode
  const defaultSkills = candidate?.metadata?.skills?.join(', ') ?? ''
  const defaultLangs  = candidate?.metadata?.languages?.join(', ') ?? ''
  const defaultYears  = candidate?.metadata?.years_experience ?? ''

  return (
    <form action={formAction} className="space-y-8">
      {state.message && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      )}

      <Section title="Datos personales">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Nombre completo" name="full_name" required errors={e.full_name}>
            <Input name="full_name" placeholder="Carlos Pérez" hasError={!!e.full_name} required defaultValue={candidate?.full_name} />
          </Field>
          <Field label="Email" name="email" required errors={e.email}>
            <Input name="email" type="email" placeholder="carlos@email.com" hasError={!!e.email} required defaultValue={candidate?.email} />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Teléfono" name="phone" errors={e.phone}>
            <Input name="phone" type="tel" placeholder="+34 600 111 222" defaultValue={candidate?.phone ?? ''} />
          </Field>
          <Field label="Ubicación" name="location" errors={e.location}>
            <Input name="location" placeholder="Madrid, España" defaultValue={candidate?.location ?? ''} />
          </Field>
        </div>

        <Field label="Nacionalidad" name="nationality" errors={e.nationality}>
          <Input name="nationality" placeholder="Española" defaultValue={candidate?.nationality ?? ''} />
        </Field>
      </Section>

      <Section title="Links profesionales">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="LinkedIn" name="linkedin_url" errors={e.linkedin_url}>
            <Input name="linkedin_url" type="url" placeholder="https://linkedin.com/in/username" defaultValue={candidate?.linkedin_url ?? ''} />
          </Field>
          <Field label="Portfolio / Web" name="portfolio_url" errors={e.portfolio_url}>
            <Input name="portfolio_url" type="url" placeholder="https://portfolio.dev" defaultValue={candidate?.portfolio_url ?? ''} />
          </Field>
        </div>
      </Section>

      <Section title="Perfil profesional">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Habilidades" name="skills" hint="Separadas por coma: React, TypeScript, Node.js">
            <Input name="skills" placeholder="React, TypeScript, PostgreSQL" defaultValue={defaultSkills} />
          </Field>
          <Field label="Años de experiencia" name="years_experience" errors={e.years_experience}>
            <Input name="years_experience" type="number" placeholder="5" min={0} max={50} defaultValue={defaultYears} />
          </Field>
        </div>
        <Field label="Idiomas" name="languages" hint="Separados por coma: Español, Inglés">
          <Input name="languages" placeholder="Español, Inglés B2" defaultValue={defaultLangs} />
        </Field>
      </Section>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
        <Link href="/candidates" id="btn-cancel-candidate">
          <Button type="button" variant="ghost" size="md">Cancelar</Button>
        </Link>
        <SubmitButton label={isEdit ? 'Guardar cambios' : 'Añadir candidato'} />
      </div>
    </form>
  )
}
