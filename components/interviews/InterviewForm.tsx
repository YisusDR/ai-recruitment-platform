'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { scheduleInterviewAction, type InterviewFormState } from '@/lib/actions/interviews'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

// ── Submit button ────────────────────────────────────────────────────────────

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="primary" size="md" isLoading={pending} id="btn-submit-interview">
      {pending ? 'Programando…' : 'Programar entrevista'}
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

// ── Types ────────────────────────────────────────────────────────────────────

interface ApplicationOption {
  id: string
  candidateName: string
  jobTitle: string
}

interface RecruiterOption {
  id: string
  fullName: string
}

interface InterviewFormProps {
  applications: ApplicationOption[]
  recruiters:   RecruiterOption[]
}

const initialState: InterviewFormState = { errors: undefined, message: null }

// ── Form ─────────────────────────────────────────────────────────────────────

export function InterviewForm({ applications, recruiters }: InterviewFormProps) {
  const [state, formAction] = useActionState(scheduleInterviewAction, initialState)
  const e = state.errors ?? {}

  return (
    <form action={formAction} className="space-y-8">
      {state.message && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      )}

      <Section title="Candidato y entrevistador">
        <Field label="Aplicación (Candidato → Vacante)" name="application_id" required errors={e.application_id}>
          <Select name="application_id" hasError={!!e.application_id}>
            <option value="">Selecciona una aplicación</option>
            {applications.map(app => (
              <option key={app.id} value={app.id}>
                {app.candidateName} → {app.jobTitle}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Entrevistador" name="interviewer_id" required errors={e.interviewer_id}>
          <Select name="interviewer_id" hasError={!!e.interviewer_id}>
            <option value="">Selecciona un entrevistador</option>
            {recruiters.map(r => (
              <option key={r.id} value={r.id}>
                {r.fullName}
              </option>
            ))}
          </Select>
        </Field>
      </Section>

      <Section title="Detalles de la entrevista">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Tipo" name="interview_type" required errors={e.interview_type}>
            <Select name="interview_type" defaultValue="phone_screen" hasError={!!e.interview_type}>
              <option value="phone_screen">Llamada inicial</option>
              <option value="technical">Técnica</option>
              <option value="cultural_fit">Cultural fit</option>
              <option value="panel">Panel</option>
              <option value="final">Final</option>
              <option value="offer_call">Oferta</option>
            </Select>
          </Field>

          <Field label="Duración (min)" name="duration_minutes" errors={e.duration_minutes}>
            <Input name="duration_minutes" type="number" defaultValue={60} min={15} max={480} />
          </Field>
        </div>

        <Field label="Fecha y hora" name="scheduled_at" required errors={e.scheduled_at}>
          <Input name="scheduled_at" type="datetime-local" hasError={!!e.scheduled_at} />
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="URL de reunión" name="meeting_url" errors={e.meeting_url} hint="Google Meet, Zoom, Teams…">
            <Input name="meeting_url" type="url" placeholder="https://meet.google.com/..." />
          </Field>
          <Field label="Notas de ubicación" name="location_notes" errors={e.location_notes}>
            <Input name="location_notes" placeholder="Sala B, piso 3" />
          </Field>
        </div>
      </Section>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
        <Link href="/interviews" id="btn-cancel-interview">
          <Button type="button" variant="ghost" size="md">Cancelar</Button>
        </Link>
        <SubmitButton />
      </div>
    </form>
  )
}
