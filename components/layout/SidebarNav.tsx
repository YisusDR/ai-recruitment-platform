/**
 * components/layout/SidebarNav.tsx
 * 'use client' — uses usePathname() for active-link detection.
 * Responsive: hidden on mobile, shows via hamburger toggle.
 */
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'

// ── Icons ────────────────────────────────────────────────────────────────────

function DashboardIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
    </svg>
  )
}

function BriefcaseIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  )
}

// ── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: '/',           label: 'Dashboard',   icon: <DashboardIcon />, exact: true },
  { href: '/jobs',       label: 'Vacantes',    icon: <BriefcaseIcon /> },
  { href: '/candidates', label: 'Candidatos',  icon: <UsersIcon /> },
  { href: '/interviews', label: 'Entrevistas', icon: <CalendarIcon /> },
] as const

// ── Logo ─────────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-5">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 shadow-brand">
        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m9 12.75 2.25 2.25 4.5-4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-bold text-slate-900 leading-none">ATS Platform</p>
        <p className="text-[11px] text-slate-400 mt-0.5">Recruitment Hub</p>
      </div>
    </div>
  )
}

// ── Sidebar ──────────────────────────────────────────────────────────────────

export function SidebarNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  const navContent = (
    <>
      <Logo />
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 scrollbar-thin">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Navegación
        </p>
        {NAV_ITEMS.map(({ href, label, icon, ...rest }) => {
          const active = isActive(href, ('exact' in rest) ? rest.exact : false)
          return (
            <Link
              key={href}
              href={href}
              id={`nav-${href === '/' ? 'dashboard' : href.replace('/', '')}`}
              className={cn('nav-link', active && 'active')}
              onClick={() => setOpen(false)}
            >
              {icon}
              {label}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-600" />
              )}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-slate-100 px-4 py-3">
        <p className="text-[11px] text-slate-400 text-center">
          AI Recruitment Platform v1.0
        </p>
      </div>
    </>
  )

  return (
    <>
      {/* ── Mobile hamburger ── */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm text-slate-600 hover:bg-slate-50 transition-colors"
        aria-label="Abrir menú"
      >
        <MenuIcon />
      </button>

      {/* ── Mobile overlay ── */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
          aria-label="Cerrar menú"
        >
          <XIcon />
        </button>
        {navContent}
      </aside>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-slate-200 bg-white">
        {navContent}
      </aside>
    </>
  )
}
