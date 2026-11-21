/**
 * Placeholder mark until the final brand exists: two clips on a timeline with the gap of a cut
 * between them, and the playhead passing through.
 */
export function LogoMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="9" className="fill-accent" />
      <rect x="6" y="11" width="8" height="10" rx="2" className="fill-on-accent" />
      <rect x="18" y="11" width="8" height="10" rx="2" className="fill-on-accent" opacity="0.55" />
      <rect x="15.25" y="6" width="1.5" height="20" rx="0.75" className="fill-on-accent" />
    </svg>
  );
}
