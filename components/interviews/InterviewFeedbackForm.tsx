'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { updateInterviewResultAction, type InterviewFormState } from '@/lib/actions/interviews'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

// ── Submit button ────────────────────────────────────────────────────────────

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="primary" size="md" isLoading={pending} id="btn-submit-feedback">
      {pending ? 'Guardando…' : 'Guardar resultado'}
    </Button>
  )
}

// ── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label, name, required, errors, children,
}: {
  label: string; name: string; required?: boolean; errors?: string[]; children: React.ReactNode
}) {
  const hasError = errors && errors.length > 0
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {hasError && <p className="text-xs text-red-600">{errors[0]}</p>}
    </div>
  )
}

// ── Primitives ───────────────────────────────────────────────────────────────

const inputBase =
  'block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'

const inputError = 'border-red-400 focus:border-red-500 focus:ring-red-500/20'

function Select({
  name, id, hasError, children, ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { hasError?: boolean }) {
  return <select id={id ?? name} name={name} className={cn(inputBase, 'cursor-pointer appearance-none', hasError && inputError)} {...rest}>{children}</select>
}

function Textarea({
  name, id, rows = 4, hasError, ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { hasError?: boolean }) {
  return <textarea id={id ?? name} name={name} rows={rows} className={cn(inputBase, 'resize-none', hasError && inputError)} {...rest} />
}

// ── Form ─────────────────────────────────────────────────────────────────────

interface InterviewFeedbackFormProps {
  interviewId:  string
  currentResult: string
  currentRating: number | null
  currentNotes: string | null
}

const initialState: InterviewFormState = { errors: undefined, message: null }

export function InterviewFeedbackForm({
  interviewId, currentResult, currentRating, currentNotes,
}: InterviewFeedbackFormProps) {
  const boundAction = updateInterviewResultAction.bind(null, interviewId)
  const [state, formAction] = useActionState(boundAction, initialState)
  const e = state.errors ?? {}

  return (
    <form action={formAction} className="space-y-6">
      {state.message && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      )}

      <Field label="Resultado" name="result" required errors={e.result}>
        <Select name="result" defaultValue={currentResult} hasError={!!e.result}>
          <option value="pending">Pendiente</option>
          <option value="passed">Aprobado</option>
          <option value="failed">No aprobado</option>
          <option value="no_show">No asistió</option>
          <option value="rescheduled">Reprogramado</option>
          <option value="cancelled">Cancelado</option>
        </Select>
      </Field>

      <Field label="Valoración (1-5)" name="rating" errors={e.rating}>
        <Select name="rating" defaultValue={currentRating?.toString() ?? ''}>
          <option value="">Sin valoración</option>
          <option value="1">1 — Insuficiente</option>
          <option value="2">2 — Mejorable</option>
          <option value="3">3 — Adecuado</option>
          <option value="4">4 — Bueno</option>
          <option value="5">5 — Excelente</option>
        </Select>
      </Field>

      <Field label="Notas" name="notes" errors={e.notes}>
        <Textarea name="notes" placeholder="Observaciones de la entrevista…" defaultValue={currentNotes ?? ''} />
      </Field>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
        <Link href={`/interviews/${interviewId}`}>
          <Button type="button" variant="ghost" size="md">Cancelar</Button>
        </Link>
        <SubmitButton />
      </div>
    </form>
  )
}
