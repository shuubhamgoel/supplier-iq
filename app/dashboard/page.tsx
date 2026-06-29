'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { Header, StatusDot, StatusBadge, scoreColor } from '@/components/DashboardUI'

interface Supplier {
  id: string
  name: string
  category: string | null
  status: string
  health_score: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [activeAlerts, setActiveAlerts] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return
    fetchStats()
  }, [user])

  const fetchStats = async () => {
    if (!user) return
    setLoading(true)
    try {
      const suppliersRes = await supabase
        .from('suppliers')
        .select('id, name, category, status, health_score')
        .eq('user_id', user.id)
      const list = (suppliersRes.data as Supplier[]) || []
      setSuppliers(list)

      const ids = list.map((s) => s.id)
      if (ids.length) {
        const alertsRes = await supabase
          .from('alerts')
          .select('id', { count: 'exact', head: true })
          .eq('resolved', false)
          .in('supplier_id', ids)
        setActiveAlerts(alertsRes.count || 0)
      } else {
        setActiveAlerts(0)
      }
    } finally {
      setLoading(false)
    }
  }

  const total = suppliers.length
  const critical = suppliers.filter((s) => s.status === 'critical').length
  const atRisk = suppliers.filter((s) => s.status === 'at_risk').length
  const healthy = suppliers.filter((s) => s.status === 'healthy').length
  const avgHealth = total
    ? Math.round(suppliers.reduce((a, s) => a + s.health_score, 0) / total)
    : 0
  const attention = suppliers
    .filter((s) => s.status !== 'healthy')
    .sort((a, b) => a.health_score - b.health_score)
    .slice(0, 5)

  return (
    <div className="min-h-full">
      <Header title="Dashboard" subtitle="Your supplier health at a glance" />

      <div className="p-8">
        {loading ? (
          <DashboardSkeleton />
        ) : (
          <div className="reveal space-y-6">
            {/* stat cards */}
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
              <StatCard
                label="Total suppliers" value={total} accent="brand"
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M3 21V8l6-4 6 4v13" /><path d="M15 21V11l6 4v6" /></svg>}
              />
              <StatCard
                label="Critical" value={critical} accent="rose"
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>}
              />
              <StatCard
                label="At risk" value={atRisk} accent="amber"
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="12" cy="12" r="9" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>}
              />
              <StatCard
                label="Active alerts" value={activeAlerts} accent="violet"
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* health overview */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
                <h2 className="text-base font-bold text-ink-900">Portfolio health</h2>
                <p className="text-sm text-gray-500">Average score across all suppliers</p>

                <div className="mt-6 flex items-center justify-center">
                  <HealthRing value={avgHealth} />
                </div>

                <div className="mt-6 space-y-3">
                  <DistRow label="Healthy" count={healthy} total={total} color="bg-emerald-500" />
                  <DistRow label="At risk" count={atRisk} total={total} color="bg-amber-500" />
                  <DistRow label="Critical" count={critical} total={total} color="bg-rose-500" />
                </div>
              </div>

              {/* needs attention */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card lg:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-ink-900">Needs your attention</h2>
                    <p className="text-sm text-gray-500">Lowest-scoring suppliers right now</p>
                  </div>
                  <Link href="/dashboard/suppliers" className="text-sm font-semibold text-brand-600 hover:underline">
                    View all →
                  </Link>
                </div>

                <div className="mt-5 space-y-2">
                  {attention.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl bg-emerald-50 py-10 text-center">
                      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m20 6-11 11-5-5" /></svg>
                      </div>
                      <p className="text-sm font-medium text-emerald-700">Everything’s healthy. Nice work.</p>
                    </div>
                  ) : (
                    attention.map((s) => (
                      <Link
                        key={s.id}
                        href="/dashboard/suppliers"
                        className="flex items-center gap-4 rounded-xl border border-gray-100 px-4 py-3 transition hover:border-brand-200 hover:bg-brand-50/40"
                      >
                        <StatusDot status={s.status} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-ink-900">{s.name}</div>
                          <div className="text-xs text-gray-400">{s.category || '—'}</div>
                        </div>
                        <StatusBadge status={s.status} />
                        <div className="flex w-28 items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                            <div className={`h-full rounded-full ${scoreColor(s.health_score)}`} style={{ width: `${s.health_score}%` }} />
                          </div>
                          <span className="w-7 text-right text-sm font-bold text-ink-900">{s.health_score}</span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ───────── shared bits ───────── */

const accents: Record<string, string> = {
  brand: 'from-brand-500 to-violet-500',
  rose: 'from-rose-500 to-red-500',
  amber: 'from-amber-400 to-orange-500',
  violet: 'from-violet-500 to-fuchsia-500',
}

function StatCard({ label, value, icon, accent }: { label: string; value: number; icon: React.ReactNode; accent: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${accents[accent]} text-white shadow-glow`}>
        {icon}
      </div>
      <div className="text-3xl font-extrabold tracking-tight text-ink-900">{value}</div>
      <div className="mt-0.5 text-sm text-gray-500">{label}</div>
    </div>
  )
}

function HealthRing({ value }: { value: number }) {
  const r = 64
  const c = 2 * Math.PI * r
  const offset = c - (value / 100) * c
  const stroke = value >= 70 ? '#10b981' : value >= 40 ? '#f59e0b' : '#f43f5e'
  return (
    <div className="relative h-44 w-44">
      <svg className="h-44 w-44 -rotate-90" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={r} fill="none" stroke="#f1f1f5" strokeWidth="14" />
        <circle
          cx="80" cy="80" r={r} fill="none" stroke={stroke} strokeWidth="14"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.21,0.6,0.35,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-extrabold tracking-tight text-ink-900">{value}</span>
        <span className="text-xs font-medium text-gray-400">avg health</span>
      </div>
    </div>
  )
}

function DistRow({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total ? Math.round((count / total) * 100) : 0
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-ink-900">{count}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
            <div className="skeleton h-10 w-10 rounded-xl" />
            <div className="skeleton mt-4 h-7 w-16 rounded" />
            <div className="skeleton mt-2 h-3 w-24 rounded" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-80 rounded-2xl border border-gray-100 bg-white shadow-card" />
        <div className="h-80 rounded-2xl border border-gray-100 bg-white shadow-card lg:col-span-2" />
      </div>
    </div>
  )
}
