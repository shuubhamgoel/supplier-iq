'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ totalSuppliers: 0, criticalCount: 0, atRiskCount: 0, healthyCount: 0, activeAlerts: 0 })
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
      const suppliersRes = await supabase.from('suppliers').select('status', { count: 'exact' }).eq('user_id', user.id)
      const suppliers = suppliersRes.data || []
      const critical = suppliers.filter((s) => s.status === 'critical').length
      const atRisk = suppliers.filter((s) => s.status === 'at_risk').length
      const healthy = suppliers.filter((s) => s.status === 'healthy').length
      const alertsRes = await supabase.from('alerts').select('*', { count: 'exact' }).eq('resolved', false)
      setStats({ totalSuppliers: suppliers.length, criticalCount: critical, atRiskCount: atRisk, healthyCount: healthy, activeAlerts: alertsRes.count || 0 })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
  }

  const StatCard = ({ icon, label, value, color }: any) => (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div><p className="text-gray-600 text-sm">{label}</p><p className="text-3xl font-bold text-gray-900 mt-2">{value}</p></div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  )

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard icon="🏭" label="Total Suppliers" value={stats.totalSuppliers} color="border-blue-500" />
        <StatCard icon="🔴" label="Critical" value={stats.criticalCount} color="border-red-500" />
        <StatCard icon="🟠" label="At Risk" value={stats.atRiskCount} color="border-yellow-500" />
        <StatCard icon="🟢" label="Healthy" value={stats.healthyCount} color="border-green-500" />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🚨 Active Alerts</h2>
          <p className="text-3xl font-bold text-red-600">{stats.activeAlerts}</p>
          <Link href="/dashboard/alerts" className="mt-4 inline-block text-indigo-600 hover:underline font-medium">View all alerts →</Link>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Supplier Overview</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Health Score Average</span>
              <span className="text-lg font-bold text-gray-900">{Math.round(stats.totalSuppliers > 0 ? 100 - (stats.criticalCount * 40 + stats.atRiskCount * 20) / stats.totalSuppliers : 0)}%</span>
            </div>
          </div>
          <Link href="/dashboard/suppliers" className="mt-4 inline-block text-indigo-600 hover:underline font-medium">View all suppliers →</Link>
        </div>
      </div>
    </div>
  )
}
