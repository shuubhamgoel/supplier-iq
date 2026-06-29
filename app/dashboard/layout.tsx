'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/utils/supabase/client'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
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
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
  }

  if (!user) return null

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white shadow-sm border-r border-gray-200">
        <div className="p-6 border-b border-gray-200"><h1 className="text-2xl font-bold text-gray-900">SupplierIQ</h1></div>
        <nav className="p-4 space-y-2">
          <Link href="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded-md hover:text-indigo-600 font-medium">📊 Dashboard</Link>
          <Link href="/dashboard/suppliers" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded-md hover:text-indigo-600 font-medium">🏭 Suppliers</Link>
          <Link href="/dashboard/alerts" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded-md hover:text-indigo-600 font-medium">🚨 Alerts</Link>
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white w-64">
          <div className="text-sm text-gray-600 mb-3 truncate">{user.email}</div>
          <button onClick={handleSignOut} disabled={isSigningOut} className="w-full px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:bg-gray-300 transition">
            {isSigningOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
