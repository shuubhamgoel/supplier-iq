'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/utils/supabase/client'
import SupplierDetail from '@/components/SupplierDetail'
import { Header, StatusBadge, StatusDot, HealthBar } from '@/components/DashboardUI'

const filters = [
  { key: 'all', label: 'All' },
  { key: 'critical', label: 'Critical' },
  { key: 'at_risk', label: 'At risk' },
  { key: 'healthy', label: 'Healthy' },
]

export default function SuppliersPage() {
  const { user } = useAuth()
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 20
  const supabase = createClient()

  useEffect(() => {
    if (!user) return
    fetchSuppliers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, statusFilter, searchTerm, page])

  const fetchSuppliers = async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      let query = supabase.from('suppliers').select('*', { count: 'exact' }).eq('user_id', user.id)
      if (statusFilter !== 'all') { query = query.eq('status', statusFilter) }
      if (searchTerm) { query = query.ilike('name', `%${searchTerm}%`) }
      const { data, count, error: queryError } = await query
        .order('health_score', { ascending: true })
        .range((page - 1) * pageSize, page * pageSize - 1)
      if (queryError) throw queryError
      setSuppliers(data || [])
      setTotalCount(count || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch suppliers')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateBrief = async (supplierId: string) => {
    if (!user) return
    try {
      const supplier = suppliers.find((s) => s.id === supplierId)
      if (!supplier) return
      const briefContent = `Executive Summary for ${supplier.name}\nStatus: ${supplier.status.toUpperCase()}\nHealth Score: ${supplier.health_score}/100\nCategory: ${supplier.category || 'N/A'}\n\nKey Metrics:\n- The supplier is currently in "${supplier.status}" status\n- Overall health score stands at ${supplier.health_score}%\n- Further action may be required based on current performance trends\n\nGenerated on: ${new Date().toLocaleDateString()}`
      const { error } = await supabase.from('briefs').insert({ supplier_id: supplierId, content: briefContent })
      if (error) throw error
      if (selectedSupplier?.id === supplierId) { setSelectedSupplier({ ...selectedSupplier }); await new Promise((r) => setTimeout(r, 300)); fetchSuppliers() }
    } catch (err) {
      console.error('Error generating brief:', err)
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  return (
    <div className="min-h-full">
      <Header title="Suppliers" subtitle={`${totalCount} supplier${totalCount === 1 ? '' : 's'} in your workspace`} />

      <div className="p-8">
        {/* toolbar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            <input
              type="text" placeholder="Search suppliers…" value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-ink-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
            />
          </div>

          <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => { setStatusFilter(f.key); setPage(1) }}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                  statusFilter === f.key ? 'bg-grad-brand text-white shadow-glow' : 'text-gray-500 hover:text-ink-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <span>{error}</span>
            <button onClick={() => fetchSuppliers()} className="font-semibold underline">Retry</button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* table */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card">
              <div className="grid grid-cols-[1.8fr_1fr_0.9fr_1fr] gap-3 border-b border-gray-100 bg-gray-50/70 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                <span>Supplier</span><span>Category</span><span>Status</span><span>Health</span>
              </div>

              {loading ? (
                [...Array(8)].map((_, i) => (
                  <div key={i} className="grid grid-cols-[1.8fr_1fr_0.9fr_1fr] items-center gap-3 border-b border-gray-50 px-5 py-4 last:border-0">
                    <div className="skeleton h-4 w-32 rounded" />
                    <div className="skeleton h-4 w-20 rounded" />
                    <div className="skeleton h-5 w-16 rounded-full" />
                    <div className="skeleton h-4 w-20 rounded" />
                  </div>
                ))
              ) : suppliers.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                  </div>
                  <p className="font-medium text-ink-900">No suppliers match</p>
                  <p className="mt-1 text-sm text-gray-500">Try a different search or filter.</p>
                  {(searchTerm || statusFilter !== 'all') && (
                    <button onClick={() => { setSearchTerm(''); setStatusFilter('all'); setPage(1) }} className="mt-3 text-sm font-semibold text-brand-600 hover:underline">
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                suppliers.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSupplier(s)}
                    className={`grid w-full grid-cols-[1.8fr_1fr_0.9fr_1fr] items-center gap-3 border-b border-gray-50 px-5 py-4 text-left transition last:border-0 hover:bg-brand-50/40 ${
                      selectedSupplier?.id === s.id ? 'bg-brand-50/60' : ''
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <StatusDot status={s.status} />
                      <span className="truncate text-sm font-semibold text-ink-900">{s.name}</span>
                    </span>
                    <span className="truncate text-sm text-gray-500">{s.category || '—'}</span>
                    <span><StatusBadge status={s.status} /></span>
                    <span><HealthBar score={s.health_score} /></span>
                  </button>
                ))
              )}

              {!loading && suppliers.length > 0 && (
                <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/70 px-5 py-3">
                  <p className="text-xs text-gray-500">
                    Showing <span className="font-semibold text-ink-900">{(page - 1) * pageSize + 1}</span>–
                    <span className="font-semibold text-ink-900">{Math.min(page * pageSize, totalCount)}</span> of{' '}
                    <span className="font-semibold text-ink-900">{totalCount}</span>
                  </p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-white disabled:opacity-40">Prev</button>
                    <span className="px-2 text-sm text-gray-500">{page} / {totalPages}</span>
                    <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-white disabled:opacity-40">Next</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* detail panel */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            {selectedSupplier ? (
              <SupplierDetail supplier={selectedSupplier} onGenerateBrief={handleGenerateBrief} />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center shadow-card">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6" /><path d="M10 22h4" /><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" /></svg>
                </div>
                <p className="font-medium text-ink-900">Select a supplier</p>
                <p className="mt-1 text-sm text-gray-500">Click any row to see metrics, activity, and generate a brief.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
