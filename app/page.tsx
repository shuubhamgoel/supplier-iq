'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import Logo from '@/components/Logo'

/* ---------- tiny inline icon set ---------- */
const Icon = {
  gauge: (c = '') => (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" /><path d="m13.4 12.6 3.1-3.1" /><path d="M2 18a10 10 0 1 1 20 0" /></svg>
  ),
  bell: (c = '') => (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
  ),
  sparkles: (c = '') => (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z" /><path d="M19 14v4" /><path d="M21 16h-4" /><path d="M5 4v3" /><path d="M6.5 5.5h-3" /></svg>
  ),
  trend: (c = '') => (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8" /><path d="M17 7h4v4" /></svg>
  ),
  layers: (c = '') => (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 17 9 5 9-5" /></svg>
  ),
  shield: (c = '') => (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>
  ),
  check: (c = '') => (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m20 6-11 11-5-5" /></svg>
  ),
  arrow: (c = '') => (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
  ),
  star: (c = '') => (
    <svg className={c} viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01Z" /></svg>
  ),
}

const features = [
  { icon: Icon.gauge, title: 'Health scores, 0–100', body: 'Every supplier distilled into one number you can trust at a glance. Color-coded the instant something turns.' },
  { icon: Icon.bell, title: 'Real-time risk alerts', body: 'Return rates spiking? Fill rates slipping? You hear about it the moment it happens — not at quarter-end.' },
  { icon: Icon.sparkles, title: 'AI executive briefs', body: 'One click turns weeks of metrics into a board-ready summary. Walk into every review fully prepared.' },
  { icon: Icon.trend, title: '8-week trend analytics', body: 'See return and fill-rate trajectories per supplier, so you catch the slide while you can still fix it.' },
  { icon: Icon.layers, title: 'Built for 50,000+', body: 'Server-side search and filtering keep it instant whether you watch 50 suppliers or fifty thousand.' },
  { icon: Icon.shield, title: 'Bank-grade isolation', body: 'Row-level security means your supplier data is provably yours alone. Compliance teams love it.' },
]

const steps = [
  { n: '01', title: 'Connect your suppliers', body: 'Import in minutes. Every supplier lands with status, category, and a live health score.' },
  { n: '02', title: 'Let SupplierIQ watch', body: 'We track returns, fill rates, and activity around the clock — and score risk continuously.' },
  { n: '03', title: 'Act before it costs you', body: 'Get alerted, open a brief, make the call. Protect your margins while the problem is still small.' },
]

const testimonials = [
  { quote: 'We caught a supplier sliding toward critical six weeks before it would have hit our shelves. SupplierIQ paid for itself in one alert.', name: 'Priya Nair', role: 'Category Lead, National Retail' },
  { quote: 'I used to spend Mondays building supplier reports. Now I click Generate Brief and I’m done. It’s genuinely changed how my team works.', name: 'Marcus Hale', role: 'Head of Sourcing, Apparel Group' },
  { quote: 'Fifty thousand suppliers, one screen, zero lag. I don’t know how we operated before this.', name: 'Sofia Reyes', role: 'VP Supply Chain, Mehta Exports' },
]

const plans = [
  {
    name: 'Starter', price: '$0', cadence: 'forever',
    blurb: 'For trying it on your real data.',
    features: ['Up to 50 suppliers', 'Health scores & status', 'Weekly trend metrics', 'Email support'],
    cta: 'Start free', highlight: false,
  },
  {
    name: 'Pro', price: '$49', cadence: 'per month',
    blurb: 'For category managers who run the show.',
    features: ['Up to 50,000 suppliers', 'Real-time risk alerts', 'AI executive briefs', 'Server-side search at scale', 'Priority support'],
    cta: 'Start 14-day trial', highlight: true,
  },
  {
    name: 'Enterprise', price: 'Custom', cadence: 'let’s talk',
    blurb: 'For teams with serious volume.',
    features: ['Unlimited suppliers', 'SSO & audit logs', 'Custom integrations', 'Dedicated success manager', 'SLA & onboarding'],
    cta: 'Contact sales', highlight: false,
  },
]

export default function Landing() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!loading && user) router.push('/dashboard')
  }, [user, loading, router])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // a solid nav background whenever scrolled OR the mobile menu is open
  const solidNav = scrolled || menuOpen
  const navLink = solidNav ? 'text-gray-600 hover:text-ink-900' : 'text-white/80 hover:text-white'

  return (
    <div className="min-h-screen bg-white text-ink-900 overflow-x-hidden">
      {/* ───────── NAV ───────── */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          solidNav ? 'border-b border-gray-100 bg-white/90 shadow-sm backdrop-blur-xl' : 'bg-transparent'
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6">
          <Logo light={!solidNav} />
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className={`text-sm font-medium transition ${navLink}`}>Features</a>
            <a href="#how" className={`text-sm font-medium transition ${navLink}`}>How it works</a>
            <a href="#pricing" className={`text-sm font-medium transition ${navLink}`}>Pricing</a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/auth/login" className={`hidden text-sm font-semibold transition sm:block ${navLink}`}>
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="group inline-flex items-center gap-1.5 rounded-full bg-grad-brand px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:shadow-glow-lg sm:px-5"
            >
              Get started
              {Icon.arrow('h-4 w-4 transition-transform group-hover:translate-x-0.5')}
            </Link>
            {/* hamburger (mobile only) */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              className={`flex h-10 w-10 items-center justify-center rounded-lg transition md:hidden ${solidNav ? 'text-ink-900 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}
            >
              {menuOpen ? (
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              ) : (
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18" /><path d="M3 6h18" /><path d="M3 18h18" /></svg>
              )}
            </button>
          </div>
        </nav>

        {/* mobile menu panel */}
        {menuOpen && (
          <div className="border-t border-gray-100 bg-white px-5 pb-5 pt-2 md:hidden">
            <div className="flex flex-col">
              <a href="#features" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">Features</a>
              <a href="#how" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">How it works</a>
              <a href="#pricing" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">Pricing</a>
              <Link href="/auth/login" className="mt-2 rounded-xl border border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50">Log in</Link>
            </div>
          </div>
        )}
      </header>

      {/* ───────── HERO ───────── */}
      <section className="relative isolate overflow-hidden bg-ink-950 pt-36 pb-24 text-white sm:pt-44">
        <div className="absolute inset-0 -z-10 bg-mesh opacity-80" />
        <div className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="absolute -top-24 left-1/2 -z-10 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-grad-brand opacity-30 blur-[120px]" />

        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="reveal mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-indigo-200 backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Live supplier intelligence — now in real time
            </div>

            <h1 className="reveal text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl" style={{ animationDelay: '0.05s' }}>
              Know which suppliers to trust —{' '}
              <span className="text-gradient">before it costs you.</span>
            </h1>

            <p className="reveal mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-indigo-100/80" style={{ animationDelay: '0.12s' }}>
              SupplierIQ turns 50,000 suppliers into one clear signal. Spot risk early,
              act fast, and protect your margins with AI-powered health scores and
              real-time alerts.
            </p>

            <div className="reveal mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row" style={{ animationDelay: '0.18s' }}>
              <Link
                href="/auth/signup"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-ink-900 shadow-glow-lg transition hover:scale-[1.02] sm:w-auto"
              >
                Start free — no card needed
                {Icon.arrow('h-5 w-5 transition-transform group-hover:translate-x-0.5')}
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10 sm:w-auto"
              >
                See the live demo
              </Link>
            </div>

            <p className="reveal mt-4 text-sm text-indigo-200/60" style={{ animationDelay: '0.24s' }}>
              Try it instantly — demo login{' '}
              <span className="font-semibold text-indigo-100">demo@supplieriq.app</span> /{' '}
              <span className="font-semibold text-indigo-100">Demo123456</span>
            </p>
          </div>

          {/* dashboard mockup */}
          <div className="reveal mx-auto mt-16 max-w-5xl" style={{ animationDelay: '0.3s' }}>
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* ───────── STATS BAR ───────── */}
      <section className="border-b border-gray-100 bg-white py-12">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 sm:grid-cols-4">
          {[
            ['50,000+', 'Suppliers per workspace'],
            ['< 200ms', 'Search at any scale'],
            ['8 weeks', 'Trend visibility'],
            ['99.9%', 'Platform uptime'],
          ].map(([stat, label]) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">{stat}</div>
              <div className="mt-1 text-sm text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── FEATURES ───────── */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-brand-600">Everything you need</span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            One screen between you and a supply-chain surprise
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Stop stitching together spreadsheets. SupplierIQ watches every supplier so you can lead, not react.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-7 shadow-card transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-card-hover"
            >
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-grad-brand opacity-0 blur-2xl transition duration-300 group-hover:opacity-20" />
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-grad-brand text-white shadow-glow">
                {f.icon('h-6 w-6')}
              </div>
              <h3 className="text-lg font-bold text-ink-900">{f.title}</h3>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-gray-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── HOW IT WORKS ───────── */}
      <section id="how" className="relative overflow-hidden bg-ink-950 py-24 text-white">
        <div className="absolute inset-0 -z-10 bg-mesh opacity-40" />
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-indigo-300">How it works</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Live in an afternoon. Useful on day one.</h2>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="glass relative rounded-2xl p-8">
                <div className="text-5xl font-extrabold text-gradient">{s.n}</div>
                <h3 className="mt-4 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-indigo-100/70">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── TESTIMONIALS ───────── */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 flex items-center justify-center gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => <span key={i}>{Icon.star('h-5 w-5')}</span>)}
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            Trusted by the people who answer for supply
          </h2>
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-8 shadow-card">
              <div className="mb-5 flex gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => <span key={i}>{Icon.star('h-4 w-4')}</span>)}
              </div>
              <blockquote className="text-[1.05rem] leading-relaxed text-ink-800">“{t.quote}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-grad-brand text-sm font-bold text-white">
                  {t.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <div className="text-sm font-bold text-ink-900">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ───────── PRICING ───────── */}
      <section id="pricing" className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-brand-600">Pricing</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
              Simple pricing that scales with you
            </h2>
            <p className="mt-4 text-lg text-gray-600">Start free. Upgrade the day it saves you a shipment.</p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-6 lg:grid-cols-3 lg:items-center">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`relative rounded-3xl p-8 ${
                  p.highlight
                    ? 'bg-ink-950 text-white shadow-glow-lg ring-2 ring-brand-500 lg:scale-[1.05]'
                    : 'border border-gray-200 bg-white text-ink-900 shadow-card'
                }`}
              >
                {p.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-grad-brand px-4 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-glow">
                    Most popular
                  </div>
                )}
                <h3 className={`text-lg font-bold ${p.highlight ? 'text-white' : 'text-ink-900'}`}>{p.name}</h3>
                <p className={`mt-1 text-sm ${p.highlight ? 'text-indigo-200/80' : 'text-gray-500'}`}>{p.blurb}</p>
                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold tracking-tight">{p.price}</span>
                  <span className={`text-sm ${p.highlight ? 'text-indigo-200/70' : 'text-gray-500'}`}>/ {p.cadence}</span>
                </div>
                <Link
                  href="/auth/signup"
                  className={`mt-7 flex w-full items-center justify-center gap-1.5 rounded-full px-5 py-3 text-sm font-semibold transition ${
                    p.highlight
                      ? 'bg-white text-ink-900 hover:scale-[1.02]'
                      : 'bg-grad-brand text-white shadow-glow hover:shadow-glow-lg'
                  }`}
                >
                  {p.cta}
                  {Icon.arrow('h-4 w-4')}
                </Link>
                <ul className="mt-8 space-y-3">
                  {p.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3 text-sm">
                      <span className={`mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full ${p.highlight ? 'bg-brand-500/30 text-brand-200' : 'bg-brand-50 text-brand-600'}`}>
                        {Icon.check('h-3 w-3')}
                      </span>
                      <span className={p.highlight ? 'text-indigo-100/90' : 'text-gray-700'}>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── FINAL CTA ───────── */}
      <section className="relative overflow-hidden bg-grad-brand py-20">
        <div className="absolute inset-0 -z-10 bg-grid opacity-30" />
        <div className="mx-auto max-w-4xl px-6 text-center text-white">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            Your next supplier surprise is already forming.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/85">
            See it before it reaches your shelves. Set up SupplierIQ in minutes — free.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/auth/signup"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-ink-900 shadow-glow-lg transition hover:scale-[1.03]"
            >
              Get started free
              {Icon.arrow('h-5 w-5 transition-transform group-hover:translate-x-0.5')}
            </Link>
            <Link href="/auth/login" className="text-base font-semibold text-white/90 underline-offset-4 hover:underline">
              or try the live demo →
            </Link>
          </div>
        </div>
      </section>

      {/* ───────── FOOTER ───────── */}
      <footer className="bg-ink-950 py-12 text-indigo-200/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
          <Logo light />
          <p className="text-sm">© {new Date().getFullYear()} SupplierIQ. Supplier intelligence that protects your margins.</p>
          <div className="flex gap-6 text-sm">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <Link href="/auth/login" className="hover:text-white transition">Log in</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ---------- hero product mockup ---------- */
function DashboardMockup() {
  const rows = [
    { name: 'Mehta Exports', cat: 'Sportswear', status: 'healthy', score: 91 },
    { name: 'Kapoor Stitching Co.', cat: 'Denim', status: 'at_risk', score: 55 },
    { name: 'Sharma Textiles', cat: 'Apparel', status: 'critical', score: 24 },
    { name: 'Joshi Knitting', cat: 'Knitwear', status: 'healthy', score: 88 },
  ]
  const badge: Record<string, string> = {
    healthy: 'bg-emerald-100 text-emerald-700',
    at_risk: 'bg-amber-100 text-amber-700',
    critical: 'bg-rose-100 text-rose-700',
  }
  const bar: Record<string, string> = {
    healthy: 'bg-emerald-500',
    at_risk: 'bg-amber-500',
    critical: 'bg-rose-500',
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl ring-1 ring-black/5">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-rose-400" />
        <span className="h-3 w-3 rounded-full bg-amber-400" />
        <span className="h-3 w-3 rounded-full bg-emerald-400" />
        <div className="ml-3 flex-1 rounded-md bg-white px-3 py-1 text-xs text-gray-400 ring-1 ring-gray-200">
          app.supplieriq.app/dashboard
        </div>
      </div>

      <div className="grid grid-cols-1 gap-0 sm:grid-cols-[180px_1fr]">
        {/* mini sidebar */}
        <div className="hidden flex-col gap-1 border-r border-gray-100 bg-white p-4 sm:flex">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-grad-brand" />
            <span className="text-sm font-bold text-ink-900">SupplierIQ</span>
          </div>
          {['Dashboard', 'Suppliers', 'Alerts'].map((m, i) => (
            <div key={m} className={`rounded-lg px-3 py-2 text-sm ${i === 0 ? 'bg-brand-50 font-semibold text-brand-700' : 'text-gray-500'}`}>{m}</div>
          ))}
        </div>

        {/* content */}
        <div className="bg-gray-50/60 p-4 text-left sm:p-5">
          {/* stat cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              ['Suppliers', '10', 'text-ink-900'],
              ['Critical', '3', 'text-rose-600'],
              ['Active alerts', '6', 'text-amber-600'],
            ].map(([label, val, color]) => (
              <div key={label} className="rounded-xl border border-gray-100 bg-white p-2.5 shadow-sm sm:p-3">
                <div className="text-[0.65rem] text-gray-400 sm:text-[0.7rem]">{label}</div>
                <div className={`text-xl font-extrabold sm:text-2xl ${color}`}>{val}</div>
              </div>
            ))}
          </div>

          {/* table */}
          <div className="mt-4 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-2 border-b border-gray-100 bg-gray-50 px-3 py-2.5 text-[0.65rem] font-semibold uppercase tracking-wide text-gray-400 sm:grid-cols-[1.6fr_1fr_0.9fr_1fr] sm:px-4">
              <span>Supplier</span><span className="hidden sm:block">Category</span><span>Status</span><span>Health</span>
            </div>
            {rows.map((r) => (
              <div key={r.name} className="grid grid-cols-[1.5fr_1fr_1fr] items-center gap-2 border-b border-gray-50 px-3 py-3 text-xs last:border-0 sm:grid-cols-[1.6fr_1fr_0.9fr_1fr] sm:px-4">
                <span className="truncate font-semibold text-ink-900">{r.name}</span>
                <span className="hidden text-gray-500 sm:block">{r.cat}</span>
                <span><span className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold capitalize ${badge[r.status]}`}>{r.status.replace('_', ' ')}</span></span>
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-10 overflow-hidden rounded-full bg-gray-100 sm:w-12">
                    <span className={`block h-full rounded-full ${bar[r.status]}`} style={{ width: `${r.score}%` }} />
                  </span>
                  <span className="font-bold text-ink-900">{r.score}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
