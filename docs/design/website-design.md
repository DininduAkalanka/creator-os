# Website design: research, system and quality bar

Status: v2 of the pre-launch site (`apps/www`), 21 Nov 2026. Read this before changing how the site looks or behaves.

## 1. What we learned from production sites

We studied adobe.com, canva.com and grammarly.com (Nov 2026). Adobe and Grammarly were read as page text; Canva and Adobe block automated browsers (Cloudflare check, "Access Denied"), so visual review of them was not possible and we did not try to get around that.

| Pattern | Seen at | What we took |
| --- | --- | --- |
| Show the product working above the fold | Grammarly (suggestion animations right after the hero), Canva (a prompt box as the hero) | An **interactive cut demo** in the hero: visitors accept or keep suggested cuts and watch the clip shrink |
| One feature = short headline + one line + a visual | Grammarly ("Paragraph rewrites. Improve clarity and flow with one click.") | Bento feature grid: each card has a drawn example, a title and one sentence |
| Short, benefit-led headlines; one CTA per block | Adobe ("Get work done. Faster.") | One primary CTA everywhere: "Join early access" |
| Data promise next to the sign-up | Grammarly ("We do not sell or monetize user content…") | "Your footage. Your channel. Your call." section with only promises the ADRs support |
| Pause control and screen-reader notes for moving content | Adobe (autoplay carousel with pause) | No looping motion. The load animation runs once and is under 5 s (WCAG 2.2.2); everything respects reduced motion |
| Design tokens as the single source of styling | Adobe Spectrum 2 | Semantic CSS tokens (`--bg`, `--fg`, `--accent`…) with a dark and a paper theme |

What we deliberately did **not** copy, because it only works at their scale or would be dishonest for us: logo walls, user counts, ROI claims and case-study metrics (we have none, and AGENTS.md forbids inventing them); mega-menus; discount banners and countdowns; enterprise sales tiers.

Supporting research (vendor sources, treat as directional): pages with an interactive demo convert better than static ones, the first screen gets most of the attention, and the primary CTA should be visible without scrolling on every device.

## 2. Design direction: "the editing suite at night"

The product lives next to Premiere Pro, DaVinci Resolve and Final Cut Pro, which are dark, precise tools. The site borrows that world instead of the generic SaaS look:

- **The headline demonstrates the product.** "Your raw recording, ~~um,~~ rough-cut and captioned in minutes." The filler word is struck through on load. Screen readers get the clean sentence.
- **Timecode details.** Section markers (`01 — The problem`), mono labels, a ruler, waveforms and a playhead.
- **One hot accent.** "Cut" orange for anything that is removed or is a call to action; mint "keep" green for what stays.
- **Rhythm.** Dark sections alternate with warm "paper" sections (Who it's for, FAQ, legal pages) so a long page doesn't feel like one block.
- **Texture.** A faint film-grain overlay and soft orange glows; no stock photos.

## 3. System

### Tokens (`apps/www/src/app/globals.css`)

| Token | Dark (default) | Paper (`.theme-paper`) | Use |
| --- | --- | --- | --- |
| `--bg` / `--raised` / `--panel` | #0c0b0a / #141210 / #1b1916 | #f3ede2 / #fbf8f2 / #ebe3d5 | Page, cards, insets |
| `--fg` / `--muted` / `--faint` | #f4efe6 / #a8a095 / #8c8478 | #15120f / #5f574c / #6b6256 | Text, from strongest to weakest |
| `--accent` | #ff5a1f | #b0390a | Cuts, CTAs, links |
| `--keep` | #7ee0b5 | #0f7a55 | Kept content, ticks |
| `--line` / `--line-strong` | 9% / 18% warm white | 12% / 24% ink | Borders |

Every text token meets WCAG AA (4.5:1) on `--bg`, `--raised` and `--panel` in both themes; the axe tests check this on every page. (`#c2410c` was rejected for paper: it measured 4.44:1.)

### Type (self-hosted, OFL, Latin subset, about 127 KB in total)

- **Bricolage Grotesque** (display): headlines, with optical sizing. Class `.display`.
- **Instrument Sans** (body and UI).
- **Martian Mono** (labels, timecodes, file names). Class `.label-mono`.

No requests to Google Fonts or any other third party.

### Motion

- On load: the headline strike (0.8 s), staggered rise of hero elements, and a one-time playhead sweep that raises the cut flags. All CSS, all under 5 s, all off with `prefers-reduced-motion`.
- On scroll: sections rise in with CSS scroll-driven animations where supported; elsewhere content is simply visible.
- Animate only `transform` and `opacity` (the playhead was moved off `left` for this reason).

### Components

`SectionIntro`, `CutDemo` (client), `WaitlistForm` (client), `MobileMenu` (client), `feature-visuals` (pure HTML/SVG illustrations), `DocPage` (paper theme for long text), `PreviewNotice`, `DraftNotice`, `MissingValue`. All copy lives in `src/content/`.

## 4. Engineering quality bar

| Area | Bar | Status (21 Nov 2026) |
| --- | --- | --- |
| Accessibility | WCAG 2.2 AA; axe finds nothing on any page; keyboard and screen-reader use of the demo, form and menu | axe: 0 violations on /, /privacy, /terms, /about (desktop and phone). Lighthouse accessibility 100 |
| Performance | Core Web Vitals "good": LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms; Lighthouse mobile ≥ 90 | Lighthouse mobile 90–96 (median 92), desktop 100. LCP ≈ 0.93 s, CLS 0 (local runs; expect variance) |
| Best practices | No third-party requests; security headers | Lighthouse 100. CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy, nosniff, HSTS; no `X-Powered-By` |
| SEO | Indexable only at launch | Lighthouse SEO 63 on previews **by design** (`noindex`, `Disallow: /`). Set `SITE_INDEXABLE=true` at launch |
| Tests | Unit (Vitest) + end-to-end (Playwright) + accessibility (axe) in CI | 41 unit, 31 end-to-end (desktop and phone) |

Lessons recorded here so nobody repeats them:

- `content-visibility: auto` on sections cut layout time, but made Lighthouse, PageSpeed and axe measure wrong backgrounds and report false contrast failures. Not used.
- Drawing a waveform as one SVG `<path>` instead of one element per bar removed about 230 DOM nodes and lifted mobile performance from the high 80s to the 90s.
- A button style that sets `display` (`inline-flex`) overrides `hidden`. Hide the wrapper, not the button.

## 5. Next design work

- Replace the hero illustration's role as "demo" with a real 30–60 s demo video from the founder's own footage (keep the interactive demo next to it).
- Final brand: product name, logo and the social card depend on it.
- Pricing page, Channel Audit page and comparison pages come in the beta phase (pre-launch plan).
