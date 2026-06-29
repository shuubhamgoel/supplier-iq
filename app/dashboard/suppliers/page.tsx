'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/utils/supabase/client'
import SupplierDetail from '@/components/SupplierDetail'

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
  }, [user, statusFilter, searchTerm, page])

  const fetchSuppliers = async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      let query = supabase.from('suppliers').select('*', { count: 'exact' }).eq('user_id', user.id)
      if (statusFilter !== 'all') { query = query.eq('status', statusFilter) }
      if (searchTerm) { query = query.ilike('name', `%${searchTerm}%`) }
      const { data, count, error: queryError } = await query.order('created_at', { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1)
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
      if (selectedSupplier?.id === supplierId) { setSelectedSupplier({ ...selectedSupplier }); await new Promise((resolve) => setTimeout(resolve, 300)); fetchSuppliers() }
    } catch (err) {
      console.error('Error generating brief:', err)
    }
  }

  const statusColors = { critical: 'bg-red-100 text-red-800', at_risk: 'bg-yellow-100 text-yellow-800', healthy: 'bg-green-100 text-green-800' }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Suppliers</h1>
        <div className="flex gap-4 mb-6">
          <input type="text" placeholder="Search suppliers..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }} className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
            <option value="all">All Status</option>
            <option value="critical">Critical</option>
            <option value="at_risk">At Risk</option>
            <option value="healthy">Healthy</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
          <button onClick={() => fetchSuppliers()} className="mt-2 text-red-600 hover:underline text-sm font-medium">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
      ) : suppliers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 text-lg">No suppliers found</p>
          {searchTerm && (<button onClick={() => { setSearchTerm(''); setPage(1) }} className="mt-2 text-indigo-600 hover:underline text-sm font-medium">Clear search</button>)}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2">
            <div className="bg-white rounded-lg shadow">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {suppliers.map((supplier) => (
                    <tr key={supplier.id} onClick={() => setSelectedSupplier(supplier)} className={`cursor-pointer hover:bg-indigo-50 transition ${selectedSupplier?.id === supplier.id ? 'bg-indigo-50' : ''}`}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{supplier.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{supplier.category || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[supplier.status as keyof typeof statusColors]}`}>{supplier.status}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{supplier.health_score}/100</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-100">Previous</button>
                  <button onClick={() => { const maxPage = Math.ceil(totalCount / pageSize); setPage(Math.min(maxPage, page + 1)) }} disabled={page * pageSize >= totalCount} className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-100">Next</button>
                </div>
              </div>
            </div>
          </div>
          <div>
            {selectedSupplier ? (<SupplierDetail supplier={selectedSupplier} onGenerateBrief={handleGenerateBrief} />) : (<div className="bg-white rounded-lg shadow p-6 text-center text-gray-500"><p>Select a supplier to view details</p></div>)}
          </div>
        </div>
      )}
    </div>
  )
}
