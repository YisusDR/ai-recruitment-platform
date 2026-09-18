/**
 * lib/utils.ts
 * ────────────
 * Shared utility helpers used across the app.
 */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes safely, resolving conflicts. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/** Format ISO date string to human-readable locale string. */
export function formatDate(
  iso: string | null | undefined,
  opts: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('es-ES', opts).format(new Date(iso))
}

/** Format ISO datetime string to locale date + time. */
export function formatDateTime(iso: string | null | undefined): string {
  return formatDate(iso, { dateStyle: 'medium', timeStyle: 'short' })
}

/** Clamp a numeric score [0,1] to a percentage string. */
export function scoreToPercent(score: number | null | undefined): string {
  if (score == null) return '—'
  return `${Math.round(score * 100)}%`
}

/** Truncate long strings for display. */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return `${str.slice(0, maxLength - 1)}…`
}
