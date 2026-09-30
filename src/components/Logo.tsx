// The AOM Tech mark, redrawn from the brand sheet: three stacked
// left-pointing triangles (violet, lilac, pink) beside a white bar.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 46 100" className={className} aria-hidden>
      <path d="M0 21 L35 1 L35 41 Z" fill="#8c52ff" />
      <path d="M0 50 L35 30 L35 70 Z" fill="#e2a9f1" />
      <path d="M0 79 L35 59 L35 99 Z" fill="#ff66c4" />
      <rect x="41.5" y="1" width="3" height="98" fill="#ffffff" />
    </svg>
  );
}

// Full lockup: mark + "AOM" in the brand gradient + "Tech" in white.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark className="h-[1.9em] w-auto" />
      <span className="font-display font-medium leading-none tracking-tight">
        <span className="text-brand">AOM</span>
        <span>Tech</span>
      </span>
    </span>
  );
}
