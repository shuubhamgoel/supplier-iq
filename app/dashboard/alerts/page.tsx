'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function AlertsPage() {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const supabase = createClient()

  useEffect(() => {
    if (!user) return
    fetchAlerts()
  }, [user, filter])

  const fetchAlerts = async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const userSuppliers = await supabase.from('suppliers').select('id').eq('user_id', user.id)
      const supplierIds = userSuppliers.data?.map((s) => s.id) || []
      let query = supabase.from('alerts').select('*, suppliers(name, status)').in('supplier_id', supplierIds)
      if (filter !== 'all') { query = filter === 'unresolved' ? query.eq('resolved', false) : query.eq('severity', filter) } else { query = query.eq('resolved', false) }
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
    try {
      const { error } = await supabase.from('alerts').update({ resolved: true }).eq('id', alertId)
      if (error) throw error
      fetchAlerts()
    } catch (err) {
      console.error('Error resolving alert:', err)
    }
  }

  const severityColors = { high: 'bg-red-100 text-red-800 border-red-300', medium: 'bg-yellow-100 text-yellow-800 border-yellow-300', low: 'bg-blue-100 text-blue-800 border-blue-300' }
  const severityBadgeColors = { high: 'bg-red-100 text-red-700', medium: 'bg-yellow-100 text-yellow-700', low: 'bg-blue-100 text-blue-700' }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Alerts</h1>
      <div className="mb-6">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
          <option value="all">All Active Alerts</option>
          <option value="high">High Severity</option>
          <option value="medium">Medium Severity</option>
          <option value="low">Low Severity</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
          <button onClick={() => fetchAlerts()} className="mt-2 text-red-600 hover:underline text-sm font-medium">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200"><p className="text-gray-500 text-lg">No alerts found</p></div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className={`rounded-lg border-l-4 p-6 ${severityColors[alert.severity as keyof typeof severityColors]}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link href={`/dashboard/suppliers?selected=${alert.supplier_id}`} className="text-lg font-bold hover:underline">{alert.suppliers?.name || 'Unknown Supplier'}</Link>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${severityBadgeColors[alert.severity as keyof typeof severityBadgeColors]}`}>{alert.severity}</span>
                  </div>
                  <p className="text-gray-700 mb-2">{alert.message}</p>
                  <p className="text-sm text-gray-600">Created on {new Date(alert.created_at).toLocaleDateString()}</p>
                </div>
                <button onClick={() => handleResolveAlert(alert.id)} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 font-medium text-sm">Resolve</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
