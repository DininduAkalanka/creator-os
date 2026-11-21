# Website design: research, system and quality bar

Status: v6.1 of the pre-launch site (`apps/www`), 22 Nov 2026: **light first** (§11), **adobe.com-style type and icons** (§12). Read this before changing how the site looks or behaves. Sections 2 to 10 record earlier versions; where they disagree with §11, §11 wins.

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

## 2. Design direction (v2 to v5.1): "the editing suite at night"

**Superseded in v6 (§11):** the page is now white by default and dark only on purpose. What stays from this direction: timecode labels, the struck-out filler word, and a dark editor screen for the demo (video editors are dark).

The product lives next to Premiere Pro, DaVinci Resolve and Final Cut Pro, which are dark, precise tools. The site borrows that world instead of the generic SaaS look:

- **The headline demonstrates the product.** "Your raw recording, ~~um,~~ rough-cut and captioned in minutes." The filler word is struck through on load. Screen readers get the clean sentence.
- **Timecode details.** Section markers (`01 — The problem`), mono labels, a ruler, waveforms and a playhead.
- **One hot accent.** "Cut" orange for anything that is removed or is a call to action; mint "keep" green for what stays.
- **Rhythm.** Dark sections alternate with warm "paper" sections (Who it's for, FAQ, legal pages) so a long page doesn't feel like one block.
- **Texture.** Soft orange glows. (The film-grain overlay was removed in v5 for a cleaner look, see §8.)

## 3. System

### Tokens (`apps/www/src/app/globals.css`)

v6 values (the v2 to v5.1 dark and paper values are gone; see §11 for why).

| Token | Light (default, `:root` and `.theme-light`) | Dark (`.theme-dark`, on purpose only) | Use |
| --- | --- | --- | --- |
| `--bg` / `--raised` / `--panel` | #ffffff / #f5f5f7 / #ebebf0 | #000000 / #141418 / #1d1d23 | Page, cards, insets |
| `--fg` / `--muted` / `--faint` | #0e0d1c / #4b4a5e / #5d5c70 | #ffffff / #b8b7c6 / #9a99ab | Text, from strongest to weakest |
| `--ink` / `--on-ink` | #0b0a47 (logo navy) / #ffffff | #ffffff / #0b0a47 | Buttons (navy pill on light, white pill on dark) |
| `--accent` | #c8261d (text-safe red) | #ff6f69 | Small red text, beta status, links |
| `--brand` | #fe4d49 (logo red) | #fe4d49 | Graphics only: the cut strike, progress lines, dots |
| `--keep` | #0a6e4a | #7ee0b5 | Kept content, first-release status, ticks |
| `--line` / `--line-strong` | 9% / 18% ink | 10% / 20% white | Borders |
| `navy` (fixed) | #0b0a47 | #0b0a47 | Highlight cards (the open service card, "with CreatorOS", the founding plan) |

Every text token meets WCAG AA (4.5:1) on `--bg`, `--raised` and `--panel` in both themes; the axe tests check this on every page. `--brand` is 3.3:1 on white, enough for graphics (WCAG 1.4.11) but not for small text, which uses `--accent`. Shadows (`shadow-soft`, `shadow-float`, `shadow-lift`) take their colour from `--shadow`, so they stay soft on white and deep on black.

### Type (self-hosted, OFL, Latin subset; since v6.1, see §12)

- **Source Sans 3** for headlines, text and UI: one family, as adobe.com uses one. Weights 200 to 900; headlines 800 (`.display`), the hero and page titles 900. 29 KB upright, 29 KB italic (the italic loads only when italic text is on screen).
- **Detail labels** (`.detail`): Source Sans 3, 12 px, bold, uppercase, as adobe.com's "detail" text (eyebrows on media, status badges, small labels).
- **Martian Mono** only inside the product screens (the editor demo, the previews, a video timecode). Class `.label-mono`.
- Until v6, Bricolage Grotesque (display) and Instrument Sans (text) were used; both are gone.

No requests to Google Fonts or any other third party.

### Motion

- On load: the headline strike (0.8 s), staggered rise of hero elements, and a one-time playhead sweep that raises the cut flags. All CSS, all under 5 s, all off with `prefers-reduced-motion`.
- On scroll: see §8 (v5) and §11 (v6). Content rises in once as it arrives, the hero message lifts while the media stage opens, large media settle, the "Later" band opens like a garage door and its grid lands column by column.
- Animate only `transform` and `opacity` (the playhead was moved off `left` for this reason).

### Components

`SectionIntro` (optionally centred), `ServiceRail` (client, v6), `AppIcon` and the line icons in `icons.tsx` (v6.1), `CutDemo` (client), `WaitlistForm` (client), `MobileMenu` (client), `feature-visuals` (pure HTML/SVG illustrations), `DocPage` (white, one readable column), `PreviewNotice`, `DraftNotice`, `MissingValue`. All copy lives in `src/content/`.

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

**Colour:** the navy "ink" is drawn in the current text colour. Since v6 the header, the 404 page and the social card are white, so the logo appears in its own navy there (`text-navy`); in the black footer it is white. The red accent always stays the logo's red.

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

## 11. v6: light first, adobe.com's white page (21 Nov 2026)

**Why:** the founder compared the site with adobe.com and asked for a professional white page: a dark page as the default reads badly, and dark should be used on purpose, never as the default. They also asked for more modern motion, loading, scrolling and swapper work.

**Research.** This time adobe.com's homepage could be read as page text (the server's HTML, not a rendered view; no bot check was involved and none was worked around). Its block names and style values match what the founder's screenshots show:

| On adobe.com | Block and style value | Here |
| --- | --- | --- |
| White page with light-grey cards; dark only for one band near the end, then a black footer with the giant wordmark | `all-products-card`: `three-up, container, dark, parallax stagger ltr`, `background: #000` | White page. `.theme-dark` only for the "Later" band, the waitlist and the footer, plus media and product screens (the hero stage, the editor demo) |
| The hero's media moves up faster than the page | `starting-marquee`: `parallax-move-up-fast` (five autoplay videos) | The message on white lifts faster than the page and fades once it has mostly left the screen (`.hero-lift`, tablets and up: on phones the message is tall and still being read); the stage below opens from 92% to its full size (`.hero-open`) |
| "Tools that work for you." photo band revealed while scrolling | `brand-concierge`: `parallax-garage-door-reveal` | The "Later" band opens out of the white page: a rounded photo window widens to the full width (`.door`, the one clip-path animation) while the picture settles (`.door-media`) |
| Product grid on black whose columns arrive left to right | `parallax stagger ltr` | Three-column dark grid: each column starts lower than the one before and they land together (`.lag`) |
| "Everything you need to make anything.": one wide black card, the others narrow with photos | fragment `everything-you-need` | `ServiceRail`: the card the mouse rests on, or keyboard focus reaches, opens wide and turns navy; on phones and tablets a row that swipes sideways with snap points |
| "Explore what's new.": a large rounded video, pause button inside, floating UI chips | fragment `explore-whats-new` | The hero stage: rounded media with pause and next inside, floating product previews, tab cards underneath |
| Floating white header bar that looks frosted over dark sections | (screenshots) | White rounded bar on every page; translucent with blur once the page scrolls |
| Adobe Express: light page, light-grey band (`Background: rgb(248, 248, 248)`), white cards | (page text) | Light-grey bands for the demo, the Audit and the plans |

**Brand:** buttons use the logo's navy, brand moments the logo's red (this answers PROGRESS Q14; the orange `#ff5a1f` is gone). Headings are heavier and tighter (700 to 800, -0.032em to -0.048em), as on adobe.com.

**Page, top to bottom:** hero (white; dark media stage) → everything it does (white) → you know this night (white; the "with CreatorOS" card is navy) → try it (light grey; the demo is a dark editor screen) → what you get (white) → Channel Audit (light grey) → what to film next (white) → who it's for (white; photo slides) → plans (light grey; the founding plan is navy) → questions (white) → **dark from here:** later (garage door, black grid) → waitlist (photo, white form card) → footer (black). The roadmap moved from the middle to just before the sign-up, so the page ends in one dark stretch as adobe.com's does; sections were renumbered.

**Motion added (rules unchanged):** only `transform` and `opacity` move, except the one clip-path above. Everything is off for reduced motion, and without CSS scroll timelines (Firefox today) the page is static. Nothing on the first screen is hidden on load: the headline is the first paint and only the "um," strike animates.

- Hero lift and stage opening (scroll-linked); the slide text rises in and the picture settles on each change (v5).
- Services row: cards open with a 700 ms `ease-out-expo` on `flex-grow`, after a 90 ms pause so a mouse sweeping across doesn't flick every card open.
- Garage door and staggered grid (scroll-linked).
- Story slider: neighbours wash out (a white layer, not a dark scrim, on a white page) and shrink to 94%; they come forward as they reach the centre.
- FAQ answers open and close smoothly where the browser can animate to `height: auto` (`interpolate-size`, `::details-content`).

**Loading:** photos below the fold show a tiny blurred preview until they arrive (`placeholder="blur"` on static imports). The hero poster stays eager with no placeholder: it competes with nothing.

**Accessibility decisions**

- The services row's opening is visual only: every card is a link with all its text in the page, so assistive technology gets the same list whichever card is open.
- No sideways-scrolling box without something focusable inside (axe `scrollable-region-focusable`): the services row has links; the loop strip wraps instead, and the "Later" cards stack on phones.
- The struck-out "um," fades to 72% opacity, not 55%: on white, 55% left 2.6:1, below the 3:1 large text needs; 72% gives 3.6:1.

**Measured (local Lighthouse 13.6, valid runs; three other runs failed with the known `NO_NAVSTART` trace error):** mobile performance 98-99 (v5: median 82), desktop 100, accessibility 100, best practices 100; mobile LCP 1.4 s. CLS is 0.047-0.058, under the 0.1 "good" line: the font swap on the hero text (§8) is counted again now that the text is not inside an animated layer. The fix (fallback-font metrics) is still open.

**Tests:** 72 end-to-end tests pass, 12 skipped by design (device-only). New: white by default with dark only in the marked sections (home and legal pages); the services row opens on hover and on keyboard focus and is several times wider when open; phones scroll it sideways; an FAQ question opens; the garage-door photo is never clipped with reduced motion; the faded "um," keeps its contrast with motion on (written first, and it failed on the build before the fix). The hero's swipe and mouse-rest tests now act on the stage, since the message above it is text to read.

**Lessons**

- A colour inside a Tailwind arbitrary gradient list (`bg-[radial-gradient(...),#0e0d1c]`) is invalid CSS: a colour can't be a background-image layer, so the browser drops the whole declaration. The old dark page hid this; on white the card went see-through. Set the colour and the gradient as two classes.
- The quality gates run axe with reduced motion, so states that exist only with motion on are not checked there. Lighthouse found the faded word; it now has its own test.
- On a white page, dark scrims on carousel neighbours look heavy; a white wash plus a slight scale reads as depth.

## 12. v6.1: adobe.com-style type and icons (22 Nov 2026)

**Why:** the founder asked for adobe.com's fonts and icons too, not only its white page.

**Research (adobe.com's public Milo library: `libs/styles/styles.css`, `libs/blocks/marquee/marquee.css`):**

| adobe.com (Milo) | Value |
| --- | --- |
| Font | `'Adobe Clean', adobe-clean, 'Trebuchet MS', sans-serif` for everything; there is no separate heading font |
| Headings | Weight 700 (800 on the newer mobile-web pages); desktop sizes 80 / 44 / 36 / 28 / 24 px; line height about 1.1 to 1.25 |
| Text | 18 px / 27 px by default; 16 px / 24 px for smaller text |
| Detail (eyebrow) text | Weight 700, uppercase, 12 to 16 px |
| Buttons | Pill-shaped (radius 16 to 30 px), 2 px border, weight 700, 15 to 22 px; outline buttons fill with the text colour on hover |
| Icons | Sizes 16, 24, 32, 40, 56, 64, 80 px; a product icon next to each product name |
| Colours | Text `#2c2c2c`, greys `#F8F8F8` to `#242424`, accent blue `rgb(59, 99, 251)` |

**What we can't copy:** Adobe Clean is Adobe's own typeface, licensed only to Adobe, and Adobe's product icons are its trademarks. We use their system, not their assets.

**Type:** **Source Sans 3** is Adobe's open-source humanist sans (Paul D. Hunt, Adobe Type; SIL Open Font License), the closest relative of Adobe Clean that anyone may ship. Like adobe.com, the site now uses one family for everything: headlines 800 with slightly tight spacing (-0.025em), the hero and page titles 900 (black), text 18 to 20 px with relaxed line height, the navigation and buttons bold. Section eyebrows are plain sentence-case text above the heading (adobe.com: "Features and Releases" above "Explore what's new."), and sections are no longer numbered. Small labels use `.detail`: bold uppercase, as on adobe.com. The timecode mono font stays only where it belongs: inside the product screens.

**Buttons:** bold pills with a 2 px border. The primary one is navy (our colour where adobe.com uses blue or black); the outline one fills with the text colour on hover, as adobe.com's does.

**App icons (`AppIcon`):** an original family in the spirit of adobe.com's product icons. Each service has a rounded tile in the logo's navy with its two-letter mark in its own colour and a thin inner line of the same colour: Rc (AI rough cut) red, Cc (captions) amber, Ex (export) blue, Rv (editor review) violet, Au (Channel Audit) green, Nx (what to film next) pink. Planned items have quieter grey marks. Every letter colour is at least 6.5:1 on the navy. Sizes follow Milo's scale (16 to 56 px). The icons appear wherever adobe.com shows a product icon: on the services cards, in the Product menu, on the hero tabs and slides, on the "Later" cards, and in a new footer "Product" column (adobe.com's "Featured products"). They are decorative (`aria-hidden`): the name is always written next to them.

**UI icons (`icons.tsx`):** one line family on a 20 px grid with rounded ends (chevrons, arrows, plus, close, menu, loop, play, pause, check, cross). They replace the text characters → › ↺ + and the one-off drawings, so every icon has the same weight in every browser and font. Arrows and chevrons flip in right-to-left text. The video and slideshow pause buttons inside media became rounded squares, like adobe.com's.

**Performance:** the fonts got smaller (one 29 KB file on most pages, instead of 40 KB for the display font plus the text font). Lighthouse on this machine varied a lot this session because Docker was running alongside; alternating runs of the previous build (v6, in Docker) and this build under the same conditions gave v6 82-87 and v6.1 98 (mobile performance), with accessibility and best practices at 100. Several runs failed with the known `NO_NAVSTART` trace error and were discarded.

**Tests:** all 74 end-to-end tests pass (12 skipped by design). New: the footer lists every service, each linked to its section.
