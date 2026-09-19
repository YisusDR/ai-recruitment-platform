'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

// ── Icons ────────────────────────────────────────────────────────────────────

function EmailIcon() {
  return (
    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

// ── Form ─────────────────────────────────────────────────────────────────────

function LoginForm() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)
  const router       = useRouter()
  const searchParams = useSearchParams()

  const handleDemoLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/demo', { method: 'POST' })
      if (res.ok) {
        const redirectTo = searchParams.get('redirectTo') ?? '/'
        window.location.href = redirectTo
        return
      }
    } catch (_err) {
      // ignore
    }
    setLoading(false)
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // ── Step 1: Authenticate with Supabase Auth ──────────────────────────────
    try {
      const supabase = createClient()
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        // If Supabase host is unreachable or user wants demo credentials
        if (
          email.toLowerCase().includes('ats.local') ||
          signInError.message.toLowerCase().includes('fetch') ||
          signInError.message.toLowerCase().includes('network')
        ) {
          await handleDemoLogin()
          return
        }
        setError(signInError.message)
        setLoading(false)
        return
      }

      const user = signInData.user
      if (!user) {
        setError('No se pudo autenticar. Inténtalo de nuevo.')
        setLoading(false)
        return
      }

      // ── Step 2: Verify recruiter profile exists in public.recruiters ─────────
      // Cast to any: documented SDK workaround for pgvector/JSONB type constraints.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: recruiter, error: recruiterError } = await (supabase as any)
        .from('recruiters')
        .select('id, role, is_active')
        .eq('auth_user_id', user.id)
        .maybeSingle() as {
          data: { id: string; role: string; is_active: boolean } | null
          error: { message: string } | null
        }

      if (recruiterError) {
        setError(`Error al verificar el perfil: ${recruiterError.message}`)
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      if (!recruiter) {
        setError(
          'No existe un perfil de reclutador asociado a este correo. ' +
          '¿Necesitas crear una cuenta?',
        )
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      if (!recruiter.is_active) {
        setError('Tu cuenta ha sido desactivada. Contacta al administrador.')
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      // ── Step 3: All checks passed — navigate to dashboard ───────────────────
      const redirectTo = searchParams.get('redirectTo') ?? '/'
      window.location.href = redirectTo
    } catch (err: any) {
      if (
        email.toLowerCase().includes('ats.local') ||
        err?.message?.toLowerCase().includes('fetch')
      ) {
        await handleDemoLogin()
        return
      }
      setError('Error al conectar con el servicio de autenticación.')
      setLoading(false)
    }
  }

  const inputBase =
    'focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2 border transition-colors text-slate-900'

  return (
    <form className="space-y-6" onSubmit={handleLogin} id="form-login">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md" role="alert">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          Correo electrónico
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <EmailIcon />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputBase}
            placeholder="admin@empresa.com"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
          Contraseña
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LockIcon />
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputBase}
            placeholder="••••••••"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="space-y-3">
        <button
          id="btn-login"
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <SpinnerIcon />
              Verificando…
            </>
          ) : (
            'Iniciar sesión'
          )}
        </button>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-xs text-slate-400 uppercase font-medium">o desarrollo</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <button
          id="btn-demo-login"
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full flex justify-center items-center py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          ✨ Probar con Cuenta Demo (Modo Mock)
        </button>
      </div>

      <p className="text-center text-sm text-slate-500">
        ¿Sin cuenta?{' '}
        <Link
          href="/signup"
          id="link-to-signup"
          className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
        >
          Regístrate aquí
        </Link>
      </p>
    </form>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand mark */}
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-lg">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
          </div>
        </div>

        <h1 className="mt-5 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          AI Recruitment Platform
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Accede a tu panel de reclutamiento
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-slate-200">
          <Suspense fallback={<div className="text-center text-slate-500 py-4">Cargando…</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
