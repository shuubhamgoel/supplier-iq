'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import AuthShell from '@/components/AuthShell'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) { setError(signInError.message); setLoading(false); return }
      router.push('/dashboard')
    } catch (err) { setError('An unexpected error occurred'); setLoading(false) }
  }

  const fillDemo = () => {
    setEmail('demo@supplieriq.app')
    setPassword('Demo123456')
  }

  return (
    <AuthShell title="Welcome back" subtitle="Log in to your SupplierIQ workspace.">
      {error && (
        <div className="mb-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700">
          <svg className="mt-0.5 h-4 w-4 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-ink-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
            placeholder="you@company.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
          <input
            id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-ink-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit" disabled={loading}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-grad-brand py-3 text-sm font-semibold text-white shadow-glow transition hover:shadow-glow-lg disabled:opacity-60"
        >
          {loading ? (
            <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Logging in…</>
          ) : (
            <>Log in
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
            </>
          )}
        </button>
      </form>

      <button
        onClick={fillDemo}
        className="mt-3 w-full rounded-xl border border-dashed border-brand-300 bg-brand-50/50 py-2.5 text-sm font-medium text-brand-700 transition hover:bg-brand-50"
      >
        ✨ Use demo credentials
      </button>

      <p className="mt-8 text-center text-sm text-gray-500">
        New to SupplierIQ?{' '}
        <Link href="/auth/signup" className="font-semibold text-brand-600 hover:underline">Create an account</Link>
      </p>
    </AuthShell>
  )
}
