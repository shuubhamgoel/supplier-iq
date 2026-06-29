'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/utils/supabase/client'

interface SupplierDetailProps {
  supplier: any
  onGenerateBrief: (supplierId: string) => void
}

export default function SupplierDetail({ supplier, onGenerateBrief }: SupplierDetailProps) {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [briefs, setBriefs] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingBrief, setGeneratingBrief] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!supplier || !user) return
    fetchSupplierData()
  }, [supplier, user])

  const fetchSupplierData = async () => {
    if (!supplier || !user) return
    setLoading(true)
    try {
      const [metricsRes, activitiesRes, briefsRes, alertsRes] = await Promise.all([
        supabase.from('metrics').select('*').eq('supplier_id', supplier.id).order('week', { ascending: false }).limit(8),
        supabase.from('activities').select('*').eq('supplier_id', supplier.id).order('date', { ascending: false }).limit(5),
        supabase.from('briefs').select('*').eq('supplier_id', supplier.id).order('created_at', { ascending: false }).limit(1),
        supabase.from('alerts').select('*').eq('supplier_id', supplier.id).eq('resolved', false),
      ])
      setMetrics(metricsRes.data || [])
      setActivities(activitiesRes.data || [])
      setBriefs(briefsRes.data || [])
      setAlerts(alertsRes.data || [])
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateBrief = async () => {
    setGeneratingBrief(true)
    await onGenerateBrief(supplier.id)
    setGeneratingBrief(false)
    await new Promise((resolve) => setTimeout(resolve, 500))
    fetchSupplierData()
  }

  const statusColors = { critical: 'text-red-600 bg-red-50', at_risk: 'text-yellow-600 bg-yellow-50', healthy: 'text-green-600 bg-green-50' }
  const alertColors = { high: 'text-red-600 bg-red-50', medium: 'text-yellow-600 bg-yellow-50', low: 'text-blue-600 bg-blue-50' }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{supplier.name}</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>Category:</strong> {supplier.category || '—'}</p>
          <p><strong>Status:</strong> <span className={`inline-block px-2 py-1 rounded text-xs font-semibold capitalize ${statusColors[supplier.status as keyof typeof statusColors]}`}>{supplier.status}</span></p>
          <p><strong>Health Score:</strong> {supplier.health_score}/100</p>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="px-6 py-4 bg-red-50 border-b border-red-200">
          <h3 className="font-semibold text-red-900 mb-3">Active Alerts</h3>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div key={alert.id} className={`text-xs p-2 rounded ${alertColors[alert.severity as keyof typeof alertColors]}`}>
                <span className="font-semibold capitalize">{alert.severity}:</span> {alert.message}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-6 space-y-6">
        <div>
          <button onClick={handleGenerateBrief} disabled={generatingBrief} className="w-full py-2 px-4 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 disabled:bg-gray-400 transition">
            {generatingBrief ? 'Generating...' : 'Generate Brief'}
          </button>
        </div>

        {briefs.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Latest Brief</h3>
            <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-700 max-h-48 overflow-y-auto">
              <pre className="whitespace-pre-wrap font-sans text-xs">{briefs[0].content}</pre>
            </div>
          </div>
        )}

        {metrics.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Recent Metrics</h3>
            <div className="space-y-2 text-sm">
              {metrics.slice(0, 3).map((m) => (
                <div key={m.id} className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-600">{m.week}</span>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Return: {(m.return_rate * 100).toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">Fill: {(m.fill_rate * 100).toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activities.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Recent Activities</h3>
            <div className="space-y-2 text-sm max-h-40 overflow-y-auto">
              {activities.map((a) => (
                <div key={a.id} className="p-2 bg-gray-50 rounded">
                  <p className="font-medium text-gray-700 capitalize">{a.type}</p>
                  <p className="text-gray-600 text-xs">{a.description}</p>
                  <p className="text-gray-500 text-xs">{a.date}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
