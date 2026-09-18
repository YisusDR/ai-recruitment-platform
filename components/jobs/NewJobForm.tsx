'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { createJobAction, type CreateJobFormState } from '@/lib/actions/jobs'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

// ── Submit button — reads pending state from react-dom ──────────────────────

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="primary" size="md" isLoading={pending} id="btn-submit-job">
      {pending ? 'Guardando…' : 'Crear vacante'}
    </Button>
  )
}

// ── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  name,
  required,
  errors,
  children,
  hint,
}: {
  label:    string
  name:     string
  required?: boolean
  errors?:  string[]
  hint?:    string
  children: React.ReactNode
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
      {hasError && (
        <p className="text-xs text-red-600">{errors[0]}</p>
      )}
    </div>
  )
}

// ── Input / Textarea / Select primitives ────────────────────────────────────

const inputBase =
  'block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50'

const inputError =
  'border-red-400 focus:border-red-500 focus:ring-red-500/20'

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

function Textarea({
  name, id, placeholder, rows = 5, hasError, defaultValue, ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { hasError?: boolean }) {
  return (
    <textarea
      id={id ?? name}
      name={name}
      rows={rows}
      placeholder={placeholder}
      defaultValue={defaultValue}
      className={cn(inputBase, 'resize-none', hasError && inputError)}
      {...rest}
    />
  )
}

function Select({
  name, id, hasError, children, defaultValue, ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { hasError?: boolean }) {
  return (
    <select
      id={id ?? name}
      name={name}
      defaultValue={defaultValue}
      className={cn(inputBase, 'cursor-pointer appearance-none', hasError && inputError)}
      {...rest}
    >
      {children}
    </select>
  )
}

// ── Section divider ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">{title}</h2>
      {children}
    </div>
  )
}

// ── Form ─────────────────────────────────────────────────────────────────────

const initialState: CreateJobFormState = { errors: undefined, message: null }

export function NewJobForm() {
  const [state, formAction] = useActionState(createJobAction, initialState)
  const e = state.errors ?? {}

  return (
    <form action={formAction} className="space-y-8">

      {/* Global error banner */}
      {state.message && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      )}

      {/* ── Basic info ── */}
      <Section title="Información básica">
        <Field label="Título de la vacante" name="title" required errors={e.title}>
          <Input name="title" id="title" placeholder="Senior Full-Stack Engineer" hasError={!!e.title} required />
        </Field>

        <Field label="Descripción" name="description" required errors={e.description}>
          <Textarea
            name="description"
            id="description"
            rows={6}
            placeholder="Describe las responsabilidades, el equipo y el impacto del rol…"
            hasError={!!e.description}
            required
          />
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Departamento" name="department" errors={e.department}>
            <Input name="department" id="department" placeholder="Ingeniería" />
          </Field>
          <Field label="Ubicación" name="location" errors={e.location}>
            <Input name="location" id="location" placeholder="Madrid, España" />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Modalidad" name="modality" required errors={e.modality}>
            <Select name="modality" id="modality" defaultValue="hybrid" hasError={!!e.modality}>
              <option value="on-site">Presencial</option>
              <option value="remote">Remoto</option>
              <option value="hybrid">Híbrido</option>
            </Select>
          </Field>

          <Field label="Estado inicial" name="status" required errors={e.status}>
            <Select name="status" id="status" defaultValue="draft" hasError={!!e.status}>
              <option value="draft">Borrador</option>
              <option value="open">Abierta</option>
              <option value="paused">Pausada</option>
            </Select>
          </Field>
        </div>
      </Section>

      {/* ── Salary ── */}
      <Section title="Salario (opcional)">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Salario mínimo (€)" name="salary_min" errors={e.salary_min}>
            <Input name="salary_min" id="salary_min" type="number" placeholder="30000" min={0} />
          </Field>
          <Field label="Salario máximo (€)" name="salary_max" errors={e.salary_max}>
            <Input name="salary_max" id="salary_max" type="number" placeholder="60000" min={0} />
          </Field>
        </div>
      </Section>

      {/* ── Requirements ── */}
      <Section title="Requisitos">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field
            label="Habilidades técnicas"
            name="skills"
            hint="Separadas por coma: React, TypeScript, Node.js"
          >
            <Input name="skills" id="skills" placeholder="React, TypeScript, PostgreSQL" />
          </Field>

          <Field
            label="Años de experiencia"
            name="experience_years"
            errors={e.experience_years}
          >
            <Input
              name="experience_years"
              id="experience_years"
              type="number"
              placeholder="3"
              min={0}
              max={30}
            />
          </Field>

          <Field label="Idiomas" name="languages" hint="Separados por coma: Español, Inglés">
            <Input name="languages" id="languages" placeholder="Español, Inglés B2" />
          </Field>

          <Field label="Nivel educativo" name="education">
            <Input name="education" id="education" placeholder="Grado en Informática o similar" />
          </Field>
        </div>
      </Section>

      {/* ── Actions ── */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
        <Link href="/jobs" id="btn-cancel-job">
          <Button type="button" variant="ghost" size="md">
            Cancelar
          </Button>
        </Link>
        <SubmitButton />
      </div>
    </form>
  )
}
