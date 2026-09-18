/**
 * components/layout/TopBar.tsx
 * Top navigation bar: page title + user info + logout button.
 * 'use client' needed for usePathname, useRouter, and Supabase signOut.
 */
'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const ROUTE_TITLES: Record<string, string> = {
  '/jobs':        'Vacantes',
  '/candidates':  'Candidatos',
  '/interviews':  'Entrevistas',
}

function getTitle(pathname: string): string {
  for (const [route, title] of Object.entries(ROUTE_TITLES)) {
    if (pathname.startsWith(route)) return title
  }
  return 'Dashboard'
}

function LogoutIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
    </svg>
  )
}

export function TopBar() {
  const pathname  = usePathname()
  const router    = useRouter()
  const title     = getTitle(pathname)
  const supabase  = createClient()
  const [loggingOut, setLoggingOut] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [userInitial, setUserInitial] = useState('U')

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Try to get recruiter name
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: recruiter } = await (supabase as any)
          .from('recruiters')
          .select('full_name')
          .eq('auth_user_id', user.id)
          .maybeSingle() as { data: { full_name: string } | null }

        const name = recruiter?.full_name ?? user.user_metadata?.full_name ?? user.email ?? 'Usuario'
        setUserName(name)
        setUserInitial(name.charAt(0).toUpperCase())
      }
    }
    loadUser()
  }, [supabase])

  const handleLogout = async () => {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-sm px-6">
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>

      <div className="flex items-center gap-3">
        {/* User info */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white shadow-sm">
            {userInitial}
          </div>
          {userName && (
            <span className="text-sm font-medium text-slate-700 max-w-[150px] truncate">
              {userName}
            </span>
          )}
        </div>

        {/* Logout button */}
        <button
          id="btn-logout"
          onClick={handleLogout}
          disabled={loggingOut}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          title="Cerrar sesión"
        >
          <LogoutIcon />
          {loggingOut ? 'Saliendo…' : 'Cerrar sesión'}
        </button>
      </div>
    </header>
  )
}
