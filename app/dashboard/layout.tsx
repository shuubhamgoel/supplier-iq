'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/utils/supabase/client'
import Logo from '@/components/Logo'

const nav = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (c: string) => (
      <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>
    ),
  },
  {
    href: '/dashboard/suppliers',
    label: 'Suppliers',
    icon: (c: string) => (
      <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21V8l6-4 6 4v13" /><path d="M15 21V11l6 4v6" /><path d="M9 9v.01" /><path d="M9 13v.01" /><path d="M9 17v.01" /></svg>
    ),
  },
  {
    href: '/dashboard/alerts',
    label: 'Alerts',
    icon: (c: string) => (
      <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
    ),
  },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!loading && !user) { router.push('/auth/login') }
  }, [user, loading, router])

  const handleSignOut = async () => {
    setIsSigningOut(true)
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-600" />
      </div>
    )
  }

  if (!user) return null

  const initials = (user.email || 'U').slice(0, 2).toUpperCase()

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="flex w-64 flex-none flex-col border-r border-gray-200/70 bg-white">
        <div className="px-6 py-5">
          <Link href="/dashboard"><Logo /></Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {nav.map((item) => {
            const active =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'bg-grad-brand text-white shadow-glow'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-ink-900'
                }`}
              >
                {item.icon(`h-5 w-5 ${active ? 'text-white' : 'text-gray-400 group-hover:text-brand-600'}`)}
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-gray-100 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-grad-brand text-xs font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-ink-900">{user.email}</div>
              <div className="text-xs text-gray-400">Pro workspace</div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:opacity-60"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></svg>
            {isSigningOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
