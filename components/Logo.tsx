interface LogoProps {
  className?: string
  size?: number
  light?: boolean
}

export default function Logo({ className = '', size = 32, light = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span className="relative inline-flex" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366f1" />
              <stop offset="0.5" stopColor="#8b5cf6" />
              <stop offset="1" stopColor="#d946ef" />
            </linearGradient>
          </defs>
          <rect width="40" height="40" rx="11" fill="url(#logoGrad)" />
          {/* abstract upward signal bars = supplier health rising */}
          <rect x="11" y="22" width="4.5" height="7" rx="2" fill="white" opacity="0.95" />
          <rect x="17.75" y="17" width="4.5" height="12" rx="2" fill="white" opacity="0.95" />
          <rect x="24.5" y="11" width="4.5" height="18" rx="2" fill="white" />
        </svg>
      </span>
      <span
        className={`text-[1.15rem] font-bold tracking-tight ${
          light ? 'text-white' : 'text-ink-900'
        }`}
      >
        Supplier<span className="text-gradient">IQ</span>
      </span>
    </div>
  )
}
