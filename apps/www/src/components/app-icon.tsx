/*
 * Service icons in the spirit of app icons: adobe.com puts a product icon next to every product
 * name (cards, menus, the footer), so the eye learns them. Ours are an original family: a rounded
 * tile in the logo's navy with the service's two-letter mark in its own colour and a thin inner
 * line of the same colour. Planned ("later") items use a quieter grey.
 *
 * Decorative only: the service name is always written next to the icon.
 */

/** Letter colour per mark. All are at least 6:1 on the navy tile. */
const TONES: Record<string, string> = {
  Rc: "#ff6b66", // AI rough cut: the logo's red family
  Cc: "#ffc24b", // captions, chapters and titles
  Ex: "#62cbff", // export to your editor
  Rv: "#b9adff", // editor review
  Au: "#4fe2a9", // free Channel Audit
  Nx: "#ff92d4", // what to film next
};
const LATER_TONE = "#b3b2c6";

const SIZES = {
  xs: "size-4 rounded-[0.3rem] text-[0.5rem]",
  sm: "size-7 rounded-[0.45rem] text-[0.7rem]",
  md: "size-9 rounded-[0.6rem] text-[0.875rem]",
  lg: "size-10 rounded-[0.65rem] text-base",
  xl: "size-14 rounded-[0.9rem] text-[1.375rem]",
} as const;

export function AppIcon({
  mark,
  size = "md",
  className = "",
}: {
  mark: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const tone = TONES[mark] ?? LATER_TONE;
  return (
    <span
      aria-hidden="true"
      style={{
        color: tone,
        boxShadow: `inset 0 0 0 1.5px ${tone}8c, 0 1px 2px rgb(14 13 28 / 0.2)`,
      }}
      className={`inline-flex shrink-0 items-center justify-center bg-navy leading-none font-bold tracking-[-0.02em] normal-case select-none ${SIZES[size]} ${className}`}
    >
      {mark}
    </span>
  );
}
