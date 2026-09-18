/**
 * lib/supabase/server.ts
 * ─────────────────────
 * Supabase client for Server Components, Server Actions, and Route Handlers.
 * Uses @supabase/ssr createServerClient with Next.js cookies().
 * Never import this in 'use client' components.
 *
 * Next.js 15: cookies() is now async — must be awaited.
 */
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(
          cookiesToSet: { name: string; value: string; options?: CookieOptions }[],
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // setAll called from a Server Component — safe to ignore
          }
        },
      },
    },
  )
}

/**
 * Creates a Supabase client with admin privileges (bypassing RLS) using the service role key.
 * This should ONLY be used in secure, server-only contexts like webhooks or background jobs.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase admin environment variables')
  }

  return createServerClient<Database>(
    supabaseUrl,
    serviceRoleKey,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // Service role operations do not write or read client cookies
        },
      },
    },
  )
}





