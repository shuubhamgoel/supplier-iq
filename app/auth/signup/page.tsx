'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import AuthShell from '@/components/AuthShell'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) {
        const msg = /invalid/i.test(signUpError.message)
          ? 'That email looks invalid to our provider. Please use a real email domain (e.g. gmail.com).'
          : signUpError.message
        setError(msg)
        setLoading(false)
        return
      }
      if (data.user) { await seedUserData(data.user.id); router.push('/dashboard') }
    } catch (err) { setError('An unexpected error occurred'); setLoading(false) }
  }

  const seedUserData = async (userId: string) => {
    try { await supabase.rpc('seed_demo_data', { p_user_id: userId }) } catch (err) { console.error('Error seeding data:', err) }
  }

  const strong = password.length >= 6
  const match = confirmPassword.length > 0 && password === confirmPassword

  return (
    <AuthShell title="Start free" subtitle="Create your workspace — no credit card required.">
      {error && (
        <div className="mb-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700">
          <svg className="mt-0.5 h-4 w-4 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">Work email</label>
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
            placeholder="At least 6 characters"
          />
          {password.length > 0 && (
            <p className={`mt-1.5 text-xs ${strong ? 'text-emerald-600' : 'text-gray-400'}`}>
              {strong ? '✓ Looks good' : 'Use at least 6 characters'}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-gray-700">Confirm password</label>
          <input
            id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-ink-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
            placeholder="••••••••"
          />
          {confirmPassword.length > 0 && (
            <p className={`mt-1.5 text-xs ${match ? 'text-emerald-600' : 'text-rose-500'}`}>
              {match ? '✓ Passwords match' : 'Passwords don’t match yet'}
            </p>
          )}
        </div>

        <button
          type="submit" disabled={loading}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-grad-brand py-3 text-sm font-semibold text-white shadow-glow transition hover:shadow-glow-lg disabled:opacity-60"
        >
          {loading ? (
            <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Creating account…</>
          ) : (
            <>Create account
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
            </>
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-gray-400">
        By signing up you get a fully-loaded demo workspace — 10 suppliers, live metrics & alerts.
      </p>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/auth/login" className="font-semibold text-brand-600 hover:underline">Log in</Link>
      </p>
    </AuthShell>
  )
}
