export function Header({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <header className="sticky top-0 z-10 flex flex-col gap-3 border-b border-gray-200/70 bg-white/80 px-4 py-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-5 lg:px-8">
      <div>
        <h1 className="text-lg font-extrabold tracking-tight text-ink-900 sm:text-xl">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      {action && <div className="-mx-1 overflow-x-auto px-1 sm:mx-0 sm:overflow-visible sm:px-0">{action}</div>}
    </header>
  )
}

export function StatusDot({ status }: { status: string }) {
  const color =
    status === 'healthy' ? 'bg-emerald-500' : status === 'at_risk' ? 'bg-amber-500' : 'bg-rose-500'
  return (
    <span className="relative flex h-2.5 w-2.5 flex-none">
      <span className={`absolute inline-flex h-full w-full rounded-full ${color} opacity-40 ${status === 'critical' ? 'animate-ping' : ''}`} />
      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${color}`} />
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    healthy: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    at_risk: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    critical: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  }
  const label: Record<string, string> = { healthy: 'Healthy', at_risk: 'At risk', critical: 'Critical' }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${styles[status] || ''}`}>
      {label[status] || status}
    </span>
  )
}

export function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    high: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    medium: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    low: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset ${styles[severity] || ''}`}>
      {severity}
    </span>
  )
}

export function scoreColor(score: number) {
  return score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-500' : 'bg-rose-500'
}

export function HealthBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${scoreColor(score)}`} style={{ width: `${score}%` }} />
      </div>
      <span className="w-7 text-right text-sm font-bold text-ink-900">{score}</span>
    </div>
  )
}
