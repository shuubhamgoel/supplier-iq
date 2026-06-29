import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SupplierIQ — Supplier intelligence that protects your margins',
  description:
    'Turn 50,000 suppliers into one clear signal. AI-powered health scores, real-time risk alerts, and executive briefs — so you act before problems cost you.',
  openGraph: {
    title: 'SupplierIQ — Know which suppliers to trust',
    description:
      'AI-powered supplier health scores, real-time alerts, and executive briefs at the scale of 50,000+ suppliers.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
