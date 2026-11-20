/** Placeholder mark until the final brand exists: two clips with a cut between them. */
export function LogoMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="8" className="fill-accent" />
      <rect x="7" y="10" width="7" height="12" rx="2" className="fill-on-accent" />
      <rect x="18" y="10" width="7" height="12" rx="2" className="fill-on-accent" opacity="0.6" />
    </svg>
  );
}
