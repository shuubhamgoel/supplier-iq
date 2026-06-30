'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/utils/supabase/client'
import { Header, SeverityBadge, StatusDot } from '@/components/DashboardUI'

const filters = [
  { key: 'all', label: 'All' },
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Medium' },
  { key: 'low', label: 'Low' },
]

const sideAccent: Record<string, string> = {
  high: 'border-l-rose-500',
  medium: 'border-l-amber-500',
  low: 'border-l-sky-500',
}

export default function AlertsPage() {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return
    fetchAlerts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filter])

  const fetchAlerts = async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const userSuppliers = await supabase.from('suppliers').select('id').eq('user_id', user.id)
      const supplierIds = userSuppliers.data?.map((s) => s.id) || []
      let query = supabase.from('alerts').select('*, suppliers(name, status)').in('supplier_id', supplierIds).eq('resolved', false)
      if (filter !== 'all') { query = query.eq('severity', filter) }
      const { data, error: queryError } = await query.order('created_at', { ascending: false })
      if (queryError) throw queryError
      setAlerts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts')
    } finally {
      setLoading(false)
    }
  }

  const handleResolveAlert = async (alertId: string) => {
    setResolvingId(alertId)
    try {
      const { error } = await supabase.from('alerts').update({ resolved: true }).eq('id', alertId)
      if (error) throw error
      setAlerts((prev) => prev.filter((a) => a.id !== alertId))
    } catch (err) {
      console.error('Error resolving alert:', err)
    } finally {
      setResolvingId(null)
    }
  }

  return (
    <div className="min-h-full">
      <Header
        title="Alerts"
        subtitle={loading ? 'Loading…' : `${alerts.length} active alert${alerts.length === 1 ? '' : 's'} need review`}
        action={
          <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                  filter === f.key ? 'bg-grad-brand text-white shadow-glow' : 'text-gray-500 hover:text-ink-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8">
        {error && (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <span>{error}</span>
            <button onClick={() => fetchAlerts()} className="font-semibold underline">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl border border-gray-100 bg-white shadow-card" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-20 text-center shadow-card">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>
            </div>
            <p className="text-lg font-semibold text-ink-900">All clear</p>
            <p className="mt-1 text-sm text-gray-500">No active alerts{filter !== 'all' ? ' at this severity' : ''}. You’re on top of it.</p>
          </div>
        ) : (
          <div className="reveal space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex flex-col gap-3 rounded-2xl border border-gray-100 border-l-4 bg-white p-4 shadow-card transition hover:shadow-card-hover sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:p-5 ${sideAccent[alert.severity] || 'border-l-gray-300'}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
                    <span className="flex items-center gap-2">
                      <StatusDot status={alert.suppliers?.status || 'critical'} />
                      <span className="font-bold text-ink-900">{alert.suppliers?.name || 'Unknown supplier'}</span>
                    </span>
                    <SeverityBadge severity={alert.severity} />
                  </div>
                  <p className="text-sm leading-relaxed text-gray-700">{alert.message}</p>
                  <p className="mt-1.5 text-xs text-gray-400">
                    Raised {new Date(alert.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={() => handleResolveAlert(alert.id)}
                  disabled={resolvingId === alert.id}
                  className="flex flex-none items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-semibold text-gray-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50 sm:w-auto"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m20 6-11 11-5-5" /></svg>
                  {resolvingId === alert.id ? 'Resolving…' : 'Resolve'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
