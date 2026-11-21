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

What we deliberately did **not** copy, because it only works at their scale or would be dishonest for us: logo walls, user counts, ROI claims and case-study metrics (we have none, and AGENTS.md forbids inventing them); mega-menus (changed in v5.1 at the founder's request: one Adobe-style "Product" menu that lists only our real services, with their status, see §9); discount banners and countdowns; enterprise sales tiers.

Supporting research (vendor sources, treat as directional): pages with an interactive demo convert better than static ones, the first screen gets most of the attention, and the primary CTA should be visible without scrolling on every device.

## 2. Design direction: "the editing suite at night"

The product lives next to Premiere Pro, DaVinci Resolve and Final Cut Pro, which are dark, precise tools. The site borrows that world instead of the generic SaaS look:

- **The headline demonstrates the product.** "Your raw recording, ~~um,~~ rough-cut and captioned in minutes." The filler word is struck through on load. Screen readers get the clean sentence.
- **Timecode details.** Section markers (`01 — The problem`), mono labels, a ruler, waveforms and a playhead.
- **One hot accent.** "Cut" orange for anything that is removed or is a call to action; mint "keep" green for what stays.
- **Rhythm.** Dark sections alternate with warm "paper" sections (Who it's for, FAQ, legal pages) so a long page doesn't feel like one block.
- **Texture.** Soft orange glows. (The film-grain overlay was removed in v5 for a cleaner look, see §8.)

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
- On scroll: see §8 (v5). Content rises in once as it arrives, the hero drifts and dims, large media settle.
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

## 6. v3: photography, video and loading (22 Nov 2026)

v3 moves from drawn illustrations to a photo- and video-led page, modelled on adobe.com's product pages (Premiere: short verb-led headlines, stacked feature blocks with one strong visual each) while keeping our own system and voice.

**Page story:** video hero (the problem, felt) → "You know this night" (the usual evening vs. the same evening with the product) → hands-on demo → four stacked feature blocks with photos and UI overlays → who it's for (three photo cards, second person, no quotes) → founding pass → creator-worry FAQ → waitlist over the "evening back" photo.

**Voice:** one creator talking to another. Specific ("so, basically", "upload day is Thursday"), never hype. Illustrative times are labelled as examples.

**Honesty rules for media**

- All photos and videos are AI-generated and carry an "AI-generated image/video" label on the page (EU AI Act Art. 50 transparency; AGENTS.md: label mock-ups). An end-to-end test fails if a photo loses its label.
- Generated people never get names or quotes. Testimonials only from real people, with permission.
- The product demo is never AI video: it is the interactive demo now and a real screen recording later.

**Media workflow**

1. Put originals in `apps/www/media-src/` (git-ignored) with clean names.
2. Run `pnpm --filter @creatoros/www media`: sharp writes web-ready JPEGs (max 2000 px, about 80-330 KB) to `src/assets/media/`. Next.js `<Image>` serves AVIF/WebP at the needed size.
3. Videos go in `public/videos/` (an explicit exception to the repo's "no .mp4" rule, in `.gitignore` and `.dockerignore`). Each has a poster from its first frame in `media-src/`.

**Loading rules (from adobe.com / aem.live "Keeping it 100", verified here with Lighthouse)**

| Rule | How it is applied |
| --- | --- |
| Keep the bytes before the main paint small | Hero poster is about 20 KB (AVIF, phone crop); fonts are **not** preloaded (`preload: false`), the display font uses the 40 KB weight-only file |
| The hero image paints first; video never competes | `BackgroundVideo` starts after `load` + idle, only when on screen; never for reduced-motion or data-saver visitors |
| Lazy-load everything below the fold | Photos lazy-load; the second video downloads only when scrolled to (tested) |
| No expensive effects on the first screen | No `backdrop-filter` over the playing video; no blurred-SVG image placeholders (a solid panel colour instead) |
| Motion is optional | Every looping video has a pause button (WCAG 2.2.2) |

**Measured (local Lighthouse, 22 Nov 2026):** mobile performance 89-91 (median 91), accessibility 100, best practices 100; desktop performance 99. Real (observed) LCP about 0.86 s on the simulated phone; Lighthouse's simulated LCP is about 3.2 s because the hero is now an image, which is the main remaining performance gap. 39 end-to-end tests pass, including axe on every page.

Spare generated assets not used yet: `talking-to-lens.jpg` (good for a future captions page) and the original mobile hero photo.

## 7. v4: every service, Adobe-style structure (22 Nov 2026)

**Why:** v3 only showed the Production Copilot, so the product looked like another cutting tool. The docs describe a loop (cut → review → learn → next idea), and that loop is the difference. v4 shows every planned service with an honest status.

**Services and status (from the docs):**

| Service | Status label | Source |
| --- | --- | --- |
| AI rough cut, captions/chapters/titles/thumbnail ideas, export to the creator's editor | First release | ADR-001, ADR-015 |
| Editor review (seats, time-coded comments, approvals) | Beta | ADR-002, Implementation Plan Step 4 |
| Free Channel Audit (read-only; own-channel baselines at day 7/28; topic groups; 5-8 rule-based insights with evidence; High/Medium/Low confidence; feedback buttons; auto creator profile) | Beta | ADR-001, ADR-004, ADR-009, ADR-019, Step 3 |
| What to film next (recommendations built on Audit evidence; accept/dismiss/already planned) | Beta | Core loop; ADR-004 |
| Publishing, Shorts, B-roll, outcome tracking, creator memory, cloud render | Later | "After the beta" list; ADR-001 Phase 2 |

Also stated on the page, because the docs rule them out: no analytics chatbot, no title/thumbnail A/B tests, no comparisons with other creators' private data (ADR-017), and plans differ only by footage hours, seats and channels (ADR-014).

**Adobe patterns adopted (from adobe.com screenshots and the Premiere page):**

- Hero "swapper": five full-bleed slides (one per service) with tab cards along the bottom; the active tab turns white with a progress line; auto-advance every 8 s; next arrow. Built as a WAI-ARIA tabbed carousel: arrow/Home/End keys, inactive slides `inert`, rotation pauses on hover/focus, one pause button for slideshow and video (WCAG 2.2.2), no motion for reduced-motion or data-saver visitors.
- Header transparent over the hero, then a floating, frosted, rounded bar once the page scrolls.
- The first section is a rounded "sheet" that slides over the hero.
- "Everything you need" card rail: label bar with status on top, large visual below.
- Full-width story slider (scroll-snap, arrows, dots) for who it's for, with no quotes or names.
- Section-by-section loading: only slide 1's poster loads eagerly; other slides' media mount after the page loads; videos download only when played; the demo's code downloads only when scrolled near.

**Product previews** (Channel Audit, recommendation) are drawn in code, labelled "Preview with example data", and aria-hidden because the section text says the same thing.

**Measured (local Lighthouse, final build):** mobile performance 88-91 over five runs (median 89), accessibility 100, best practices 100; desktop 99. Scroll-reveal animations were removed: they cost about 3 mobile points on the longer page. 45 end-to-end tests pass, including against the Docker container.

## 8. v5: Adobe-style motion and a hero swapper that keeps moving (21 Nov 2026)

**Why:** the founder asked for adobe.com's feel: a hero "swapper" that works, animation while scrolling, and a very clean page. Source: a 27-second screen recording of adobe.com (`Screen Recordings/`, git-ignored), studied frame by frame (22 frames).

**What adobe.com does, and what we took**

| Seen in the recording | Here |
| --- | --- |
| Hero slides keep rotating while the mouse rests on them; tab cards along the bottom with a progress line | Rotation no longer stops on hover over the slide. It holds only while the pointer is on the tab bar or keyboard focus is inside, then continues where it stopped (the progress line pauses instead of restarting) |
| New slide crossfades in | Plus: its text rises in line by line and its picture settles from 106% to 100% (slide 1's first paint is left exactly as loaded) |
| While scrolling, the hero moves up at about half speed and dims as a rounded sheet slides over it | CSS scroll timeline on the hero (`.hero-drift`, `.hero-dim`) |
| Card rows and grids rise in one after another as they arrive | `ScrollReveal` (one IntersectionObserver): `.reveal` elements below the first screen rise in once, 90 ms apart, capped |
| Large media start slightly larger and shrink into place as they enter | CSS view timeline (`.settle`) on the feature media and the story slider |
| Testimonial slider: current slide centred, neighbours peeking at both edges, white round arrows on the edges, dots inside | Story slider rebuilt that way (still no testimonials, names or quotes); dots are real buttons (24 px targets) |
| A giant wordmark closes the page | `BRAND.name` sized from its length (any final name fits), rising from a clipped edge as the page ends |

Also new: **swipe** between hero slides on touch screens (sideways drags only, so vertical scrolling is untouched), and on phones the sideways-scrolling tab bar follows the active slide.

**Clean:** the full-page film-grain overlay is gone (it made photos look noisy, and it was a fixed layer composited on every scroll frame).

**Rules kept:** only `transform` and `opacity` move. Everything is off for reduced motion (the hero video and rotation also stay off for data-saver visitors). Nothing on the first screen is ever hidden, and without JavaScript nothing is hidden at all. Slide changes are announced to screen readers only while rotation is off (APG). Browsers without CSS scroll timelines (Firefox today) get the reveal and the slideshow, just not the scroll-linked effects.

**Lessons (measured, so nobody repeats them)**

- A full-screen hero must not pause on hover: the mouse is nearly always over it, so v4's slideshow never moved for most desktop visitors (reproduced: 11 s with the mouse on the slide, no change). A click on a tab must not hold it either: hold on keyboard focus only (`:focus-visible`).
- **Read, then write.** The first `ScrollReveal` read `window.scrollY` after hiding each element. Reading the scroll position or page height makes Chrome lay out the page again, so it ran 54 forced layouts during load and the Lighthouse mobile median fell from 80 to 72. Now positions come from the observer's first report and each callback reads before it writes (trace: 0 forced layouts).
- `overflow: hidden` makes a box a scroll container, so CSS view timelines inside it attach to that box and never move. Use `overflow-x: clip` / `overflow: clip` where a scroll-linked element needs clipping.
- An element at the very end of the page can never cross a reveal line set above the bottom edge; `ScrollReveal` leaves such elements visible.
- Shorthand `animation` resets `animation-timeline`; scroll-linked rules use longhands.

**Measured (local Lighthouse 13.6, simulated phone, same machine and session, previous version vs v5):** mobile performance median 81 → 82 (five runs each: 72-84 vs 74-89), desktop 98-99 → 99-100, accessibility 100, best practices 100. This machine was noisier than for the v4 numbers in §7, so compare only within one session. Layout shift: the previous version showed CLS 0.055 in most runs, caused by the web fonts swapping in on the hero text (not preloaded on purpose, see §6). v5 reads CLS 0, but the swap still happens; the hero now sits in a transform-animated layer, which the metric does not count. Fixing the swap itself (fallback-font metrics) is a separate task.

**Tests:** 8 new unit tests (`src/lib/motion.ts`: swipe direction, stagger). New end-to-end tests: the slideshow keeps going with the mouse on a slide; it holds on the tab bar and resumes; swipe on touch; the tab bar follows the active slide; story dots and arrows (wrapping); scroll reveal (hidden below the fold, shown when scrolled to, attribute removed afterwards, nothing hidden on the first screen); nothing hidden with reduced motion.

## 9. v5.1: full-screen story slider and an Adobe-style Product menu (21 Nov 2026)

**Why:** the founder compared screenshots of adobe.com with our page. Our story slider was boxed in (it stopped at 90rem, so neighbours were cut off by the box, not by the screen), had an empty gap on the left of the first story and did not move by itself; and "Product" was a plain link where Adobe opens a large menu.

**Story slider (rebuilt, `StoryCarousel`)**

- **Size like adobe.com:** full screen width; the current story is about 84% of the width (Adobe: 1582 of 1911 px; ours: 1585 of 1887 px on the same screen) and nearly the full height (`clamp(38rem, 100svh - 9rem, 54rem)` on large screens); neighbours peek in from the screen's edges.
- **Goes round forever:** slides are placed with transforms around an unbounded position (story = position mod 3), two on each side, so there is always a neighbour on both sides and moving past the last story is just one more step.
- **Moves by itself** every 7 s; the active dot fills up to show the time, and a pause button sits next to the dots (WCAG 2.2.2). Like the hero, it holds while the pointer is on the arrows or dots and while keyboard focus is inside, never while the mouse merely rests on the picture. It also holds while less than half of it is on screen, and it never starts for reduced-motion visitors.
- **Drag and swipe:** the slides follow the finger or mouse and glide on from where they are let go; a vertical drag is left to the page (`touch-action: pan-y`); a click on a neighbour moves to it; the click at the end of a drag never opens a link.
- **Assistive technology:** only the current story is exposed (neighbours and copies are `inert` and `aria-hidden`); changes are announced only while rotation is off.

**Product menu (`ProductMenu`)**

- Laid out like adobe.com's Products menu: area pills on the left (Featured, Edit faster, Work with your editor, Grow your channel, Coming later, plus "See everything"), cards on the right (a two-letter tile in the status colour, the status pill, title and one line), the page behind dims and the header turns solid.
- Honest by construction: the menu is built from the same `services.cards` and `roadmap.items` as the page (`productMenu` in `src/content/services.ts`), so it can only show what the page shows, with the same status.
- APG disclosure navigation: button with `aria-expanded`; the areas are a vertical tablist (arrow keys, Home, End); Escape, a click outside or tabbing out closes it, and Escape returns focus to the button. Large screens only; on phones "Product" stays a link in the menu.
- The dim layer is rendered in a portal: inside the floating header, its `backdrop-filter` would make a fixed overlay cover only the header.

**Testing lessons**

- A slider that moves by itself races any test that assumes where it starts. On a slow machine it had moved on before the test clicked (seen in an event log: the timer moved to story 2, then "Previous" correctly went back to story 1 while the test expected story 3). Tests now pause it and pick a known story first, or only check that the story changed.
- `html { scroll-behavior: smooth }` makes Playwright's own scrolling animate; a click measured mid-scroll can miss. The slider tests scroll instantly (`scrollIntoView({ behavior: "instant" })`).
- Wait for something that only exists after hydration (the pause button) before clicking client-side controls.

**Verified:** 59 end-to-end tests pass (9 skipped by design: touch-only or mouse-only), the slider group 84 times in a row under parallel load; axe finds nothing on the open menu; no horizontal overflow at 1887, 1280, 1024 and 412 px.

## 10. Brand logo (21 Nov 2026)

**Source:** the founder's two logo PNGs (repo folder `logo/`): the symbol with the name, and the symbol only. Both are 2000 x 2000, navy `#0b0a47` and red `#fe4d49` on a flat near-white background (not transparent), so they cannot be placed on the dark site as they are.

**Pipeline:** copies live in `apps/www/media-src/brand/` (git-ignored, like the photos) as `logo-full.png` and `logo-symbol.png`. `pnpm --filter @creatoros/www logo` traces each colour separately into SVG paths (coverage field per colour, 50% contours with sub-pixel marching squares, light pre-blur against the PNGs' soft edges, Ramer-Douglas-Peucker at 0.3 px) and writes:

| Output | Use |
| --- | --- |
| `src/components/brand-paths.ts` | `<Logo>` (symbol and name, 7 KB), `<LogoSymbol>` (5.5 KB), `<Wordmark>` (the name only, 4 KB) |
| `src/app/icon.svg` | Favicon: the symbol on a white rounded tile |
| `src/app/apple-icon.png` | 180 x 180 home-screen icon |

The traces follow the PNGs faithfully, including their slightly uneven edges (visible only far above any size the site uses). When the designer's original vector files exist, they should replace these traces.

**Colour:** the navy "ink" is drawn in the current text colour, so on the dark site the logo is warm white; the red accent always stays the logo's red. On white (favicon, app icon) the logo keeps its navy.

**Where it is used, and why**

| Place | Drawing | Size |
| --- | --- | --- |
| Header, every page | Symbol and name (introduces the brand, links home; accessible name "CreatorOS") | 28 px tall on phones, 36 px on larger screens |
| Footer brand column | Symbol and name | 36 px |
| Closing wordmark at the very end | The name as set in the logo, not re-typed in our display font | Full content width, rises in at the end of the page |
| 404 page | Symbol only | 80 px |
| Browser tab, home screen | Symbol on a white tile, so it reads on light and dark tabs | 16-180 px |
| Social preview card | Symbol and name, light | 72 px |

Deliberately **not** used: in the hero (the header already shows it), on the AI-generated photos, or inside the product previews. Don't stretch it, don't recolour the red, and keep the full logo at least 24 px tall (the symbol at least 16 px).
