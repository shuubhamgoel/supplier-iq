'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/utils/supabase/client'
import { StatusBadge, SeverityBadge } from '@/components/DashboardUI'

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
        <div className="space-y-4">
          <div className="skeleton h-6 w-40 rounded" />
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-24 w-full rounded-xl" />
          <div className="skeleton h-10 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  // chronological (oldest → newest) for sparklines
  const chrono = [...metrics].reverse()
  const returnSeries = chrono.map((m) => Number(m.return_rate))
  const fillSeries = chrono.map((m) => Number(m.fill_rate))
  const latest = chrono[chrono.length - 1]
  const first = chrono[0]

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card">
      {/* header */}
      <div className="relative overflow-hidden bg-ink-950 p-6 text-white">
        <div className="absolute inset-0 bg-mesh opacity-50" />
        <div className="relative">
          <div className="mb-3 flex items-start justify-between gap-3">
            <h2 className="text-xl font-extrabold tracking-tight">{supplier.name}</h2>
            <StatusBadge status={supplier.status} />
          </div>
          <div className="flex items-end gap-4">
            <div>
              <div className="text-4xl font-extrabold leading-none">{supplier.health_score}</div>
              <div className="text-xs text-indigo-200/70">health score</div>
            </div>
            <div className="mb-1 text-sm text-indigo-100/80">{supplier.category || 'Uncategorized'}</div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${supplier.health_score}%` }}
            />
          </div>
        </div>
      </div>

      {/* alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2 border-b border-gray-100 bg-rose-50/40 px-6 py-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400">Active alerts</h3>
          {alerts.map((a) => (
            <div key={a.id} className="flex items-start gap-2 rounded-lg bg-white p-2.5 shadow-sm ring-1 ring-gray-100">
              <SeverityBadge severity={a.severity} />
              <span className="text-xs leading-relaxed text-gray-700">{a.message}</span>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-6 p-6">
        {/* metric trends */}
        {chrono.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              label="Return rate" series={returnSeries}
              current={Number(latest?.return_rate)} previous={Number(first?.return_rate)}
              lowerIsBetter format={(v) => `${(v * 100).toFixed(1)}%`} color="#f43f5e"
            />
            <MetricCard
              label="Fill rate" series={fillSeries}
              current={Number(latest?.fill_rate)} previous={Number(first?.fill_rate)}
              format={(v) => `${(v * 100).toFixed(1)}%`} color="#10b981"
            />
          </div>
        )}

        {/* generate brief */}
        <button
          onClick={handleGenerateBrief}
          disabled={generatingBrief}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-grad-brand py-3 text-sm font-semibold text-white shadow-glow transition hover:shadow-glow-lg disabled:opacity-60"
        >
          {generatingBrief ? (
            <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Generating…</>
          ) : (
            <>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z" /></svg>
              Generate brief
            </>
          )}
        </button>

        {/* latest brief */}
        {briefs.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">Latest brief</h3>
            <div className="max-h-48 overflow-y-auto rounded-xl bg-gray-50 p-4 ring-1 ring-gray-100">
              <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-gray-600">{briefs[0].content}</pre>
            </div>
          </div>
        )}

        {/* activity timeline */}
        {activities.length > 0 && (
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">Recent activity</h3>
            <ol className="relative space-y-4 border-l border-gray-200 pl-5">
              {activities.map((a) => (
                <li key={a.id} className="relative">
                  <span className="absolute -left-[1.42rem] top-1 h-2.5 w-2.5 rounded-full bg-brand-500 ring-4 ring-brand-100" />
                  <p className="text-sm font-semibold capitalize text-ink-900">{a.type}</p>
                  <p className="text-xs leading-relaxed text-gray-600">{a.description}</p>
                  <p className="mt-0.5 text-[0.7rem] text-gray-400">{a.date}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── metric card with sparkline ── */
function MetricCard({
  label, series, current, previous, lowerIsBetter = false, format, color,
}: {
  label: string
  series: number[]
  current: number
  previous: number
  lowerIsBetter?: boolean
  format: (v: number) => string
  color: string
}) {
  const delta = current - previous
  const improved = lowerIsBetter ? delta < 0 : delta > 0
  const deltaPct = previous ? Math.abs((delta / previous) * 100) : 0

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3.5">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="mt-0.5 flex items-baseline gap-1.5">
        <span className="text-lg font-extrabold text-ink-900">{format(current)}</span>
        {series.length > 1 && (
          <span className={`text-[0.7rem] font-semibold ${improved ? 'text-emerald-600' : 'text-rose-600'}`}>
            {improved ? '↓' : '↑'} {deltaPct.toFixed(0)}%
          </span>
        )}
      </div>
      <div className="mt-2">
        <Sparkline data={series} color={color} />
      </div>
    </div>
  )
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return <div className="h-8" />
  const w = 100, h = 32, pad = 2
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2)
    const y = h - pad - ((v - min) / range) * (h - pad * 2)
    return [x, y]
  })
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const area = `${d} L${pts[pts.length - 1][0].toFixed(1)},${h} L${pts[0][0].toFixed(1)},${h} Z`
  const id = `g-${color.replace('#', '')}`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.5" fill={color} />
    </svg>
  )
}
