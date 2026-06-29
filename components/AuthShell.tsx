import Link from 'next/link'
import Logo from '@/components/Logo'

export default function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode
  title: string
  subtitle: string
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* ── brand panel ── */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink-950 p-12 text-white lg:flex">
        <div className="absolute inset-0 -z-10 bg-mesh opacity-70" />
        <div className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="absolute -bottom-24 -left-24 -z-10 h-72 w-72 rounded-full bg-grad-brand opacity-30 blur-[100px]" />

        <Link href="/">
          <Logo light />
        </Link>

        <div className="max-w-md">
          <div className="mb-6 flex gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01Z" />
              </svg>
            ))}
          </div>
          <p className="text-2xl font-semibold leading-snug">
            “We caught a supplier sliding toward critical six weeks before it
            would have hit our shelves. SupplierIQ paid for itself in one alert.”
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-grad-brand text-sm font-bold">
              PN
            </div>
            <div>
              <div className="text-sm font-bold">Priya Nair</div>
              <div className="text-xs text-indigo-200/70">Category Lead, National Retail</div>
            </div>
          </div>
        </div>

        <div className="flex gap-8 text-sm text-indigo-200/70">
          <div>
            <div className="text-2xl font-extrabold text-white">50K+</div>
            suppliers monitored
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white">99.9%</div>
            uptime
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white">8 wk</div>
            trend visibility
          </div>
        </div>
      </div>

      {/* ── form panel ── */}
      <div className="flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link href="/">
              <Logo />
            </Link>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">{title}</h1>
          <p className="mt-1.5 text-sm text-gray-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  )
}
