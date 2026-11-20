> **Copy of the live plan doc, 20 Nov 2026.** The live version is the "CreatorOS — CTO Review & Step-by-Step Implementation Plan" doc in Claude. If the two differ, ask which is newer. The Decision Log still wins over both.
>
> **ADR-020 (worldwide focus) overrides every South Asia item below:** the Mumbai/Singapore region (now US East), the 50% regional price (now one USD price list), the Sinhala/Tamil/Hindi benchmark and gate check (now an English benchmark; the gate is 4 of 5 including time saved), the language risk and launch pages, and "public beta and India" (now "public beta").

# CreatorOS — CTO Review & Step-by-Step Implementation Plan

Nov 20, 2026 · @Dinidu

## Summary

The vision is strong and the research is honest, but the docs are not ready to code from yet. Fix the conflicts in one week, then build the **Production Copilot first**: an AI first-pass editor and review workspace that turns raw footage into a rough cut, captions and packaging, exported to the creator's own editor. A free Channel Audit brings creators in, and YouTube publishing waits for Google's audit.

A solo founder with AI coding tools can reach a 20–50 creator private beta in about 12 weeks if the scope below holds.

**The plan in five lines**

1. **Week 0:** lock 19 decisions in the decision log (now on the repo's docs branch). Open the Google Cloud project and start OAuth verification.
2. **Weeks 1–4, in parallel:** validate with 15–20 interviews, a speech-to-text benchmark on mixed-language clips, a concierge test on 10 real videos, and founding pre-sales.
3. **Weeks 1–3:** foundation: monorepo, auth, organizations with row-level security, schema v1, CI/CD, observability.
4. **Weeks 3–8:** Production Copilot (audio-first upload → transcript → cut suggestions → review → captions → titles and thumbnail ideas → export to Premiere, Resolve or Final Cut). It needs no YouTube login, so it doesn't wait for Google.
5. **Weeks 6–12:** free Channel Audit, editor seats, footage-hour metering and billing, then a paid private beta.

**Biggest changes from the docs:** take the generated-video path out of the MVP (script → AI voice → assembled video, Doc 19), because it costs the most and is the most exposed to YouTube's "inauthentic content" rule. Put editing before analytics, and price by hours of raw footage instead of credits. YouTube now gives creators free A/B testing and a free analytics assistant, so editing time is where they will pay.

**Can it make money?** Yes, if creators adopt it. Cost is about $0.31–0.88 per footage hour, typical gross margin is about 80%, and break-even is about 24 paying customers working solo, or about 180 with a $3,000-a-month team.

## Revised SaaS foundation (Nov 2026)

Build CreatorOS first as an **AI first-pass editor and review workspace** for talking-head and screen-recording YouTube videos. The creator drops in raw footage and gets back a rough cut, captions, chapters, title options and thumbnail ideas. They or their editor review it, then export a timeline that opens in Premiere Pro, DaVinci Resolve or Final Cut Pro. The full version is in the repo's new Document 26 and the Decision Log (ADR-014 to 019).

### Four limits that changed the plan

| Limit (checked Nov 2026) | Our answer |
| --- | --- |
| Unverified Google apps that ask for sensitive scopes show a warning and are limited to 100 new users ([Google](https://support.google.com/cloud/answer/7454865)) | The paid product needs no YouTube login. Only the free Channel Audit does, and it can live with the cap while verification runs |
| YouTube Studio has free A/B testing for up to 3 titles and thumbnails, with the winner picked by watch time ([YouTube Help](https://support.google.com/youtube/answer/16391400)) | Don't build A/B testing. Generate better variants for creators to test there |
| Ask Studio, YouTube's free AI assistant, explains a channel's analytics and comments ([Search Engine Journal](https://www.searchenginejournal.com/youtube-introduces-ask-studio-ai-for-channel-analytics/559399/)) | Don't sell analytics chat. Keep the Channel Audit free and link it to the next video |
| Uploading 20–40 GB of 4K footage per video is slow on many Sri Lankan and Indian connections | Audio-first upload. Originals stay on the creator's disk, and the exported timeline points to them |

### Options compared

| Option | Verdict |
| --- | --- |
| A. The full CreatorOS loop at once | No: too wide for one founder, and publishing is blocked by the audit |
| B. Channel Intelligence only | The free front door, not the paid core: YouTube's free tools cover much of it |
| **C. Production Copilot + export to the creator's editor** | **The paid core** |
| D. Editor and agency review workspace | The Studio tier, on top of C |

### What creators get

| Creator need | What CreatorOS does |
| --- | --- |
| Editing takes 4+ hours a video (Doc 02) | Suggests cuts for silences, filler words and retakes; the creator accepts or rejects each one |
| "I already use Premiere, Resolve or Final Cut" | Exports FCPXML, Premiere XML and EDL timelines with the cuts in place |
| Captions in my language | Captions with word timing, using the best speech-to-text for each language (ADR-016) |
| Titles, descriptions and chapters take time | 3 titles with reasons, a description and chapters, from the transcript and the creator's past style |
| Working with an editor is messy | Shared review: time-coded comments, approvals and versions |
| "What should I make next?" | The free Channel Audit, linked to the next video |

### What we won't build

- Title and thumbnail A/B testing (YouTube has it free).
- Generic "chat with your analytics" (Ask Studio does it).
- Generated "faceless" video, auto-publishing before the audit, or cross-creator benchmarks from private analytics.
- A full timeline editor, or our own speech and language models.

### Pricing: by hours of raw footage

Creators know how much they record, and speech-to-text is charged per minute, so footage hours are both clear to creators and true to our cost. Prices are about 50% lower in South Asia (ADR-018).

| Plan | Price a month | Footage a month | Seats |
| --- | --- | --- | --- |
| Free | $0 | 30 minutes | 1 (includes the Channel Audit) |
| Creator | $19 | 5 hours | 1 |
| Pro | $39 | 15 hours | 2 (creator + editor) |
| Studio | $99 | 40 hours | 5, up to 5 channels |
| Extra footage | $3 an hour | — | — |

### Cost per hour of raw footage

| Item | Low | High | Basis |
| --- | --- | --- | --- |
| Speech-to-text | $0.26 | $0.40 | Deepgram Nova-3 batch is about $0.0043/min for one language and $0.0052/min multilingual ([Activepieces](https://www.activepieces.com/blog/deepgram-pricing-2026-per-minute-rates-and-add-ons)); the high case leaves room for a pricier Sinhala or Tamil provider |
| LLM passes | $0.02 | $0.20 | About 75K input and 10K output tokens per footage hour |
| Compute | $0.02 | $0.10 | Waveform, silence detection, proxy frames, export; no 4K transcoding |
| Storage | $0.01 | $0.03 | R2 at $0.015 per GB-month, no egress fees; audio + proxy is under 0.5 GB an hour |
| Thumbnail ideas | $0.00 | $0.15 | Frame scoring with a vision model |
| **Total** | **$0.31** | **$0.88** | Middle case about $0.59 |

### Margin per plan

Payment fees are modelled as 7% + $0.50 per charge, a cautious all-in figure for a merchant of record.

| Plan | Worst case (100% use, high cost) | Typical (50% use, middle cost) |
| --- | --- | --- |
| Creator $19 | 67% | 83% |
| Pro $39 | 58% | 80% |
| Studio $99 | 57% | 80% |

### Can it make money?

Yes on the numbers. Blended revenue is about $24.75 per paying customer, with a 60/30/10 plan mix and half of customers on South Asia prices. After AI and media cost, fees, 10 free users each and support, about **$16.70 (67%)** is left.

- **Break-even:** about **24 paying customers** solo ($400 a month fixed cost), or about **180** with a 2-person team ($3,000 a month).
- **$10,000 MRR** needs about 400 paying customers and leaves about $3,750 a month profit with that team.
- **Customer value:** at 7% monthly churn, one customer is worth about $240, so winning one must cost under about $80. That means founder-led sales, communities, editor referrals and the free audit, not paid ads.
- **The real risk is adoption, not cost:** the copilot must save 2+ hours a video, and at least half of revenue should come from global English-speaking creators by month 9.

### Competition and how CreatorOS wins

Gling is the closest competitor: it removes silences, fillers and bad takes, and exports to Premiere, Final Cut and Resolve ([Gling](https://www.gling.ai/save-time)). CreatorOS has to win on fit, not on the core idea.

| Competitor | Strength | Our edge |
| --- | --- | --- |
| [Gling](https://www.gling.ai/save-time) | Focused YouTube rough cut with NLE export, titles and chapters | Mixed South Asian languages (if the benchmark proves it), creator + editor review, a web app that works on slow connections, and creator memory |
| Descript | Text-based editing, recording, podcasts | We are YouTube-specific, faster to a rough cut, and hand off to the creator's own editor |
| YouTube Studio (free) | A/B testing, Ask Studio, auto-captions | We don't compete; we feed it better variants and captions |
| Clip tools (Opus Clip and others) | Shorts from long videos | Not in the MVP; Phase 2 only if beta users ask |

**Pivot signal:** if interviews show creators are happy with Gling or Descript and the mixed-language edge doesn't hold up, switch the paid core to option D, the editor and agency review workspace.

## Brand and official website (before code)

Launch a website before writing product code, but a focused **pre-launch site**, not a Grammarly- or Adobe-size site. Those sites serve millions of users and many products. Yours has three jobs: pass Google's verification, collect a qualified waitlist, and test whether creators will pay. Plan 3–5 days for version 1, in week 0.

### Fix the name first

"CreatorOS" is already used by other creator products. Viral Nation launched a talent platform called [Viral Nation\_CreatorOS™](https://www.viralnation.com/resources/news-press-releases/viral-nation-sets-itself-apart-in-the-rapidly-growing-creator-economy), and a UK company runs a creator-collaboration platform at [creatoros.xyz](https://creatoros.xyz/). Launching under the same name risks a trademark dispute and confused customers.

1. Keep "CreatorOS" as the internal code name.
2. Shortlist 5 product names that say what it does (editing, cuts, captions), not "OS".
3. Check each in the WIPO Global Brand Database, Sri Lanka's and India's trademark registers and the USPTO; then the .com domain and YouTube, X and Instagram handles.
4. Have a lawyer confirm the winner, then register the business, domain and handles.

### What the site must do

| Job | What it needs |
| --- | --- |
| Pass Google's brand verification | A homepage on a verified domain you own that describes what the app does, not only a login page. A privacy policy on the same domain, linked from the homepage, and the same one linked on the OAuth consent screen ([Google](https://support.google.com/cloud/answer/13464321)) |
| Meet YouTube API rules | The privacy policy says what YouTube data you access, store and share; links YouTube's Terms of Service and Google's Privacy Policy; explains how users revoke access in their Google security settings; and gives a contact for privacy questions ([YouTube Developer Policies](https://developers.google.com/youtube/terms/developer-policies)) |
| Collect a qualified waitlist | Email, channel link, long videos a month, editing hours per video, and language |
| Test willingness to pay | A founding-plan pre-order through the merchant-of-record checkout |
| Earn trust | A real demo video made from your own footage, a real name and company, a contact address. No invented logos, testimonials or user counts; label any mock-up as a preview |

### Pages by phase

| Phase | When | Pages |
| --- | --- | --- |
| Pre-launch | Weeks 0–1 | Home (one long page), Privacy policy, Terms, About and contact |
| Beta | Weeks 6–12 | Adds Pricing, Free Channel Audit, Help center, Changelog, Security and privacy, Status page |
| Public launch | After the beta | Adds comparison pages (vs Gling, vs Descript), guides and blog, real customer stories, an editor partner page, and Sinhala, Tamil and Hindi pages |

### Home page, top to bottom

1. **Hero:** one promise, such as "Your raw recording, rough-cut and captioned in minutes. Finish in Premiere, Resolve or Final Cut." One button: Join early access. A 30–60 second real demo video beside it.
2. **The problem:** hours lost to cutting silences and retakes, in creators' own words once interviews give you quotes you may use.
3. **How it works:** three steps: upload your recording → review the suggested cuts → export to your editor.
4. **What you get:** rough cut, captions in your language, titles and chapters, thumbnail ideas, review with your editor.
5. **Who it's for:** tutorial, talking-head and podcast creators, and creators who work with an editor.
6. **Founding offer:** the price, locked for 12 months, what's included, and the refund rule.
7. **Your data:** what happens to footage, when it is deleted, and that YouTube access is optional and read-only. Promise only what the providers' settings make true.
8. **FAQ:** languages, supported editors, YouTube access, data, cancellation.
9. **Final call to action and footer:** legal links, contact, company name and address.

### Stack and setup

- Marketing site on the root domain, the app on app.\<domain>. Build it as a static Next.js app (apps/www) in the monorepo, with MDX for legal pages and the changelog. Use Framer instead if design speed matters more than code.
- Domain email with SPF, DKIM and DMARC, plus support@ and privacy@ addresses.
- Privacy-friendly analytics (Plausible or PostHog), with a cookie notice if you set cookies.
- Waitlist stored in your own database, with a welcome email from a transactional email service.
- Mobile Lighthouse score of 90+, basic WCAG AA accessibility, social preview images, a sitemap.
- A lawyer reviews the privacy policy and terms, including Sri Lanka's Personal Data Protection Act and India's DPDP Act.

### Website numbers for the week-4 gate

Track visitors → waitlist sign-ups → interviews booked → founding pre-orders, by traffic source. Set the targets before launch, and feed the results into the validation gate.

## What CreatorOS is

CreatorOS is an AI workflow and channel-intelligence layer for serious YouTube creators. It runs the repetitive production work, keeps the creator in control of creative decisions, then learns from channel results to recommend the next video.

| Item | What the docs say |
| --- | --- |
| Customer | Growing and professional solo YouTubers: 1K–100K+ subscribers, long-form, 4+ hours per video, already paying for tools. Tech, education and business niches first (Docs 02, 05). |
| Core problem | Production takes too long, tools are fragmented, AI output needs correcting, and analytics are hard to act on (Doc 02). |
| Promise | Save time without losing quality or creative control (Doc 03). |
| Core loop | Idea → plan → produce → QA → human review → publish → analyze → recommend → next idea (Docs 05–08). |
| Moat | Creator memory, workflow history, performance feedback and routing data. Not the AI models (Docs 03, 13, 25). |
| Business model | Free / $19 / $49 / $99 / $249+ hypotheses, subscription plus credits. Target 70–85% gross margin and about $1.60 AI + media cost per video (Doc 04). |
| North star | Successful workflows completed, and creator hours saved per video (Docs 05, 06). |
| Go-to-market | Sri Lanka → India → Southeast Asia → global. Founder-led, community, free tools, referrals (Docs 04, 05). |
| Proposed stack | Next.js, NestJS, PostgreSQL, Redis + BullMQ, S3-style storage, FFmpeg, provider-agnostic AI gateway, modular monolith (Docs 10, 17). |

The repository has a README and 19 docs, but no code yet. Docs 15 (DevOps) and 16 (Data) are referenced but missing, and so are the coding-standards, repository-architecture and workflow-architecture docs.

## What the docs get right

Keep all of these principles. They are the right instincts for a production AI SaaS.

- **Integrate, don't rebuild.** No Premiere clone, no foundation model (Docs 01, 03).
- **Human-in-the-loop by default.** Auto-publish is off (Docs 07, 12).
- **Quality over volume.** Measure correction time, not how many AI outputs were made (Doc 02).
- **Cost tracking on every AI call from day one**, with usage limits and no unlimited storage (Doc 04).
- **Modular monolith plus queue workers**, with PostgreSQL as the system of record (Docs 09, 10, 17).
- **Provider abstraction** and capability-based routing (Docs 13, 25).
- **Honest claims.** No "viral" or growth guarantees; facts, analysis and predictions are kept apart (Docs 07, 25).
- **Structured edit operations.** AI proposes an edit list; deterministic software applies it (Docs 19, 25).

## Problems to fix before coding

Thirteen conflicts or gaps would make different developers (or AI coding agents) build different things. Doc 11 says "code from contracts", but today the contracts contradict each other. Each one below has my decision.

| # | Problem | Where | Decision |
| --- | --- | --- | --- |
| 1 | The MVP wedge is defined three ways | Doc 03: raw footage → rough cut. Doc 05: metadata + analytics, editing "later". Doc 19: script → AI voice → assembled video | Production Copilot (footage in, export to the creator's editor) as the paid core, with a free Channel Audit. Generated video moves to Phase 3 as an opt-in. |
| 2 | Three tenant models | Doc 09: creator\_id. Doc 12: workspace. Docs 17, 22: organization | organization\_id on every tenant row. A personal organization is created at sign-up. Roles in MVP: OWNER, EDITOR, REVIEWER (ADR-002). |
| 3 | "Project" means two things | Docs 09, 11: one video. Docs 18, 22: a series that holds many contents | Content = one video (the unit of work). Project = optional series or folder. Change Doc 11 routes to /contents/:id/… |
| 4 | State machines disagree | Content (07, 08, 09, 17, 22), workflow (08, 11), task (06, 11), job (19, 22, 25), approval (07, 08, 19), publishing (09, 11, 22), recommendation (09, 11, 17) | One canonical set in packages/contracts (see Key decisions), used by the database checks, API and UI. |
| 5 | Two API response formats | Doc 11: {success, data, meta}. Doc 17: {data, meta} | {data, meta} on success, {error: {code, message, requestId, details}} on failure. The HTTP status says success or failure. |
| 6 | Approval table missing | Doc 09 has reviews; Doc 22 has none. Also missing: QA results, transcripts, edit lists, idempotency keys, outbox | Add them (see Data model v1). |
| 7 | Fake precision | Mockups show "Confidence 82%", but Doc 07 §63 says not to show a number you cannot calculate | Show High / Medium / Low from sample size and effect size. Never an LLM-made percentage. |
| 8 | Examples rely on CTR | Docs 02, 05, 06 | CTR comes only from the bulk Reporting API and arrives late. Design first insights around views and retention. |
| 9 | Numbering and missing docs | Docs 14, 17, 18 number the series differently. Docs 15, 16 and the standards docs are missing | Done on the repo's docs branch: a docs/README.md index and docs/00\_Decision\_Log.md. This plan covers DevOps basics for now. |
| 10 | Validation gate not recorded | Docs 01–05: don't build until 20–30 interviews and a concierge test | Run validation in parallel with foundation work (weeks 1–4). Gate before the expensive media work. |
| 11 | "Intelligent tool routing" oversold for MVP | Docs 03, 10, 19 call it a differentiator | In MVP the router is a config table with a fallback. Learned routing needs months of acceptance data. |
| 12 | Sinhala and Tamil quality unknown | Doc 05 starts with Sinhala and Tamil creators | Benchmark speech-to-text in week 1. If it is weak, start the beta with English-speaking Sri Lankan and Indian creators. |
| 13 | Auth is inconsistent | Doc 11: Bearer token. Doc 12: HttpOnly cookies. Doc 08: Google login "future" | Managed auth with Google sign-in from day one, HttpOnly session cookie, and YouTube as a separate OAuth grant. |

## Platform reality check

YouTube's rules set the build order more than any doc does. Uploads from CreatorOS will be locked to private for real creators until Google audits the app, so publishing has to come last and an export package has to come first.

| Fact (checked November 2026) | What it means for the plan |
| --- | --- |
| Default quota per project: 100 videos.insert calls a day, 100 search.list calls a day, and 10,000 units a day for all other endpoints. thumbnails.set costs 50 units and captions.insert costs 400 ([quota calculator](https://developers.google.com/youtube/v3/determine_quota_cost)). | Enough for a beta. Request an extension before reaching about 50 publishes a day. Don't build features on search.list. |
| Videos uploaded through videos.insert from unverified API projects created after 28 July 2020 are restricted to private ([videos resource](https://developers.google.com/youtube/v3/docs/videos)). Locked videos cannot be appealed; the creator must re-upload ([YouTube Help](https://support.google.com/youtube/answer/7300965)). | Do not offer "Publish to YouTube" to beta users until the audit passes. Ship export first. |
| Sensitive scopes need Google's OAuth verification, with a privacy policy and a demo video ([Google](https://developers.google.com/identity/protocols/oauth2/production-readiness/sensitive-scope-verification)). YouTube user-data scopes are treated as sensitive, and asking for overlapping scopes is a known rejection cause ([Phyllo](https://www.getphyllo.com/post/youtube-oauth-scopes)). | Ask for read-only scopes at connect and the upload scope later, through incremental consent. Start verification in week 1. |
| Most stored API data must be refreshed or deleted within 30 days ([policy guide](https://developers.google.com/youtube/terms/developer-policies-guide)). After you accept the derived-metrics amendment (Analytics & Reporting use case), statistics can be kept up to 36 months. Titles, names and descriptions still follow the 30-day rule, and your own metrics must be shown as yours ([derived metrics policy](https://developers.google.com/youtube/terms/derived-metrics-policy)). | Add a 30-day refresh job and refreshed\_at tracking. Accept the amendment before storing history. Label scores as "CreatorOS score". |
| Compiled authorized data may be shown only to the channel owner or their representatives ([policy guide](https://developers.google.com/youtube/terms/developer-policies-guide)). | No cross-creator benchmarks built from private analytics. |
| Thumbnail impressions and impressions CTR are in the Reporting API's bulk reach reports for channels ([metrics](https://developers.google.com/youtube/reporting/v1/reports/metrics), [API comparison](https://developers.google.com/youtube/analytics/metrics-explained)). | Create the reporting job when a channel connects. Day-one insights use views and retention; packaging advice comes later. |
| The videos resource has a containsSyntheticMedia status field ([videos resource](https://developers.google.com/youtube/v3/docs/videos)). | Ask the AI-disclosure question in the publish step. |
| On 15 July 2025 YouTube renamed "repetitious content" to "inauthentic content"; mass-produced videos are not eligible for monetization, while AI used in original work is ([eWeek](https://www.eweek.com/news/youtube-responds-to-ai-concerns/)). | Supports a footage-first MVP. Avoid "faceless video factory" positioning. |
| Stripe does not operate in Sri Lanka ([Dodo Payments](https://dodopayments.com/blogs/merchant-of-record-in-srilanka)). Polar, a merchant of record, lists Sri Lanka for payouts ([Polar](https://polar.sh/docs/merchant-of-record/supported-countries)). Paddle lists Sri Lanka as a buyer country ([Paddle](https://developer.paddle.com/concepts/sell/supported-countries-locales)). | Use a merchant of record. Confirm seller eligibility with the provider before the paid beta. |

## Key decisions

These 13 decisions, plus ADR-014 to 019 at the end of the table, are now in docs/00\_Decision\_Log.md on the repo's docs branch. Merge it before the first line of product code. Where an older doc disagrees, this log wins.

| ADR | Decision | Why |
| --- | --- | --- |
| 001 MVP scope | Revised: a footage-in Production Copilot (AI first-pass editor + review workspace) for talking-head and screen-recording videos is the paid core. A free, read-only Channel Audit brings creators in. Export first, YouTube publishing after the audit. | Strongest pain in Doc 02. The paid core needs no YouTube login, is safe under YouTube policy, and doesn't compete with YouTube's free analytics tools. |
| 002 Tenancy | organizations + memberships. organization\_id on every tenant table. PostgreSQL row-level security from migration 001. Roles: OWNER, EDITOR, REVIEWER. The app connects as a non-owner role and sets the org per transaction in both API and workers. | A cross-tenant leak is a P0 (Docs 11, 12, 14). RLS is cheap now and painful to add later. |
| 003 Domain | Content = one video. Project = optional series. Content has versions, workflow runs, approvals and publications. | Matches Doc 22 and the UI; fixes the Doc 09/11 drift. |
| 004 States | One canonical set of state enums in packages/contracts (listed below this table). | Every layer uses the same states. |
| 005 API | REST under /api/v1, the envelope from Problem 5, cursor pagination, an Idempotency-Key on publish, workflow start and billing. Zod schemas generate OpenAPI and a typed client. | One contract, no drift (Doc 11 §86–88). |
| 006 Stack | pnpm + Turborepo monorepo. Next.js (App Router) with TanStack Query, Tailwind and shadcn/ui. NestJS API plus a separate worker process from the same code. PostgreSQL 16+ with pgvector. Redis + BullMQ. S3-compatible storage (Cloudflare R2 for zero egress fees). FFmpeg. | Keeps the Doc 10/17 choices and closes their open items. |
| 007 ORM | Drizzle. | First-class RLS policies, pgvector and raw SQL for analytics. Prisma also works; decide once and don't switch. |
| 008 Workflow execution | PostgreSQL holds workflow and step state as the source of truth. BullMQ runs steps. A transactional outbox enqueues jobs. "Waiting for review" is a database state, not a sleeping job. | Durable, resumable, partial re-runs (Doc 19 §46–47). Re-evaluate Temporal or Trigger.dev if workflows grow long or complex. |
| 009 Auth | Managed auth (Clerk, WorkOS, Auth0 or self-hosted Better Auth) with Google and email. HttpOnly cookies. YouTube is a separate OAuth grant with minimal, incremental scopes, PKCE and state. Tokens are encrypted with a KMS-managed key in their own table. | Docs 12 and 17. Never build password auth yourself. |
| 010 AI gateway | Your own AiGateway interface over an existing multi-provider SDK. A capability → model config table, zod structured outputs, prompts versioned in git, and an ai\_generations row for every call. | Provider independence without writing every adapter. |
| 011 Python | No Python service in MVP; FFmpeg and APIs cover it. Add an ml-service (FastAPI) in Phase 3 for ranking, scene detection and alignment. | One language, one deploy, faster delivery. |
| 012 Billing | Merchant of record (Polar, Paddle or another; confirm Sri Lanka seller support). An entitlements table drives limits, metered in footage minutes. Billing can stay off in the private beta. | Handles global tax; Stripe is not available directly. |
| 013 Hosting | Vercel for web. A container platform (Render, Railway, Fly.io or AWS ECS) for API and workers. Managed PostgreSQL (Neon, Supabase or RDS), managed Redis with fixed pricing, R2 for media. A region near users (Mumbai or Singapore). Docker everywhere. | Managed first (Doc 04 §40), portable later. |
| 014 Pricing unit | Plans priced by hours of raw footage: Free 30 min, Creator $19 for 5 h, Pro $39 for 15 h, Studio $99 for 40 h; extra hours $3. Usage is metered before the expensive steps run. | Clear for creators, follows the real per-minute cost, about 80% typical gross margin. |
| 015 Audio-first media | Upload the audio (and an optional small proxy) first; originals stay on the creator's disk. Exports (FCPXML, Premiere XML, EDL, SRT) point to them. Full-resolution cloud render is a Phase 2 add-on. | Slow uploads in the first markets, lower cost, and creators finish in their own editor. |
| 016 Speech-to-text router | An SttGateway that routes by language: the cheapest good model for English, and the week-1 benchmark winner for Sinhala–, Tamil– and Hindi–English. | Mixed-language quality may be our edge, and it is not measured yet. |
| 017 Do-not-build list | No A/B testing, analytics chat, generated faceless video, auto-publish before the audit, cross-creator benchmarks, full timeline editor, or own models. | YouTube gives some of these free; the rest carry cost or policy risk. |
| 018 Regional pricing | About 50% lower prices in South Asia, through the merchant of record. | Fits local budgets. Guardrail: half of revenue from global creators by month 9. |
| 019 Build order | Copilot (weeks 3–8) before the Channel Audit (weeks 6–9). Start OAuth verification in week 0 anyway. | The paid product doesn't wait on Google's review, so revenue and learning start sooner. |

**Canonical states (ADR-004)**

- **Content:** DRAFT → PLANNING → PRODUCING → IN\_REVIEW → APPROVED → PUBLISHING → PUBLISHED → ARCHIVED.
- **Workflow run:** AWAITING\_PLAN\_APPROVAL → QUEUED → RUNNING → WAITING\_FOR\_REVIEW → COMPLETED, or FAILED / CANCELLED.
- **Step:** PENDING, READY, RUNNING, WAITING\_FOR\_REVIEW, SUCCEEDED, FAILED, SKIPPED, CANCELLED, STALE (an upstream step changed).
- **Approval:** PENDING, APPROVED, CHANGES\_REQUESTED, REJECTED.
- **Publication:** DRAFT, QUEUED, UPLOADING, PROCESSING, SCHEDULED, PUBLISHED, FAILED, CANCELLED.
- **Recommendation:** NEW, VIEWED, ACCEPTED, DISMISSED, EXPIRED. Feedback is separate (USEFUL, NOT\_USEFUL, ALREADY\_PLANNED, NOT\_RELEVANT), and so is the measured outcome.

## MVP architecture

- **Web app (Next.js, Vercel)** → calls the **API (NestJS)** over REST /api/v1, signs in with **managed auth**, and uploads the audio track (plus an optional small proxy) and previews it in **object storage (R2)** through signed URLs.
- **API** → verifies the session, reads and writes **PostgreSQL + pgvector** (system of record, RLS, workflow state, outbox) in one transaction.
- **Outbox** → **Redis + BullMQ** → jobs for three **workers** (same codebase, scaled separately):
    - **Media worker (FFmpeg):** probe, waveform, silence detection; builds the **export package** (FCPXML, Premiere XML, EDL, SRT, metadata, thumbnail frames).
    - **AI worker:** AI gateway (router, budget, cost log) → **AI providers** (LLM, speech-to-text, vision).
    - **YouTube worker:** channel and analytics sync for the Channel Audit; publishing stays off until the audit → **YouTube APIs**.
- Workers write results and step state back to PostgreSQL.

(The live doc has the drawn diagram.)

The browser uploads the audio track (and an optional small proxy) straight to storage; originals stay on the creator's disk. The API only writes state and an outbox row in one transaction, and workers pick up the slow jobs. Publishing stays behind a flag until the YouTube audit passes.

## Step-by-step implementation plan

Seven steps take CreatorOS from docs to a private beta. Validation (Track A) runs alongside Steps 1–2, and its gate (end of week 4) decides whether the copilot (Step 2) continues at full scope. The copilot now comes before the Channel Audit (ADR-019). Each step ends with an exit test you can check.

### Step 0 — Decide and set up (week 0, 3–5 days)

1. Merge the repo's docs branch: docs/00\_Decision\_Log.md (ADR-001 to 019), Document 26 and the docs index. It already marks the superseded parts of 15 docs.
2. Write packages/contracts first: state enums, error codes, the response envelope and core zod schemas.
3. Register the business and the domain for the final product name. Create the Google Cloud project, enable the YouTube Data, Analytics and Reporting APIs, and set up the OAuth consent screen.
4. Publish the pre-launch website: homepage with waitlist, privacy policy, terms and contact (see Brand and official website). Google verification needs them (Doc 12 §51–52).
5. Set up the GitHub organization, branch protection and an issue tracker loaded with this plan.

**Exit:** decision log merged, Google project created, privacy policy live.

### Track A — Validate in parallel (weeks 1–4)

1. Run 15–20 creator interviews and 5 with freelance editors, using Doc 02's script. Log each statement's evidence level, 1 to 6 (Doc 02 §44).
2. Concierge test with 5 creators: run 10 of their real videos through simple scripts (speech-to-text → cut list → FCPXML → captions → titles → thumbnail ideas). Measure hours saved and correction time. These scripts become version 0 of the pipeline.
3. Benchmark speech-to-text on 20 clips (5 each of English, Sinhala–English, Tamil–English and Hindi–English): word error rate, timestamps, and filler and retake detection.
4. Measure the real AI + media cost per footage hour against the $1.00 limit.
5. Ask for money: pre-sell the founding Creator plan ($19, or the South Asia price), locked for 12 months.

**Gate (end of week 4):** pass 5 of these 6, including time saved. 5+ creators ask to use it on their next video; 2+ hours or 40%+ saved per video; 70%+ of cuts accepted; cost at or under $1.00 per footage hour; 5+ paid or committed founding customers; mixed-language captions clearly better than YouTube's on 3 of 4 language sets (if not, launch English-first). If it fails, narrow the product or pivot to the editor workspace.

### Step 1 — Foundation (weeks 1–3)

1. Monorepo: apps/web, apps/api, apps/worker; packages/contracts, db, ai, media, ui, config.
2. CI: lint, type check, unit tests, integration tests on real Postgres and Redis (Testcontainers), build, secret scan and dependency scan.
3. Environments: local (Docker Compose with Postgres + pgvector, Redis, MinIO), staging and production.
4. Auth, organizations and memberships. RLS on every tenant table and a cross-tenant test suite from day one.
5. Schema v1, versioned migrations and deterministic seed data (Doc 22 §97).
6. API conventions: envelope, error codes, request IDs, validation, rate limits, OpenAPI and a generated client.
7. Observability: OpenTelemetry traces, structured logs with no tokens, Sentry, /health and /ready, and audit\_logs.
8. Feature flags and the app shell (navigation from Doc 07 §5).

**Exit:** a user signs up, gets an organization, and automated tests prove they cannot read another organization's rows. Staging deploys on every merge.

### Step 2 — Workflow engine and Production Copilot (weeks 3–8)

1. Content (one video) and intent parsing (topic, audience, length, tone) with "Looks correct / Edit".
2. Workflow templates: talking-head tutorial, screen-recording tutorial, podcast-style. The LLM picks a template and fills its parameters; the creator approves the plan and its cost estimate.
3. Engine: a step graph, retries with backoff, a dead-letter queue, idempotency keys, the outbox, cancel, and partial re-runs that mark downstream steps STALE.
4. Upload, audio first: the browser extracts the audio track and uploads it through a presigned URL, with an optional 360p–540p proxy. Full-file multipart upload is the fallback. ffprobe validation runs in a sandboxed worker.
5. Transcript with word timestamps; SRT/VTT captions with an editor.
6. Cut suggestions as an Edit Decision List: silences, filler words and retakes. Preview in the browser by skipping the cut ranges on the proxy, so nothing is rendered. The creator accepts or rejects each cut.
7. Export: FCPXML, Premiere XML, CMX3600 EDL, SRT and metadata, pointing to the creator's original files. A full-resolution MP4 render is a Phase 2 add-on.
8. Metadata: 3 titles with reasons, a description and chapters from the transcript. Thumbnail concepts from the best frames plus text templates.
9. QA checks (Doc 08 §27) and the Review Center: approve, request changes or reject, with reason codes.

**Exit:** on 5 real videos, the creator's hands-on time drops by at least 40% versus their usual process, and at least 70% of suggested cuts are accepted, and the export opens with cuts intact in Premiere, Resolve and Final Cut.

### Step 3 — Free Channel Audit: YouTube connect and Channel Intelligence v0 (weeks 6–9)

1. OAuth connect with read-only scopes, encrypted token storage, refresh, revoke and disconnect.
2. Import the channel and its last 50–200 videos. Daily analytics sync: views, watch time, average view percentage, subscribers gained and the retention curve. Create the Reporting API job for reach data (CTR) at connect.
3. A 30-day refresh job for titles and descriptions. Accept the derived-metrics amendment before storing history.
4. Baselines: per-channel median and spread, with views normalized by video age (day 7 and day 28).
5. Topic clusters from embeddings of titles and descriptions, stored in pgvector.
6. 5–8 rule-based insights, each with an evidence object. The LLM writes the explanation only from that evidence.
7. An auto-drafted creator profile (niche, length, cadence, language) with "Looks good / Edit" (Doc 07 §14).
8. Feedback buttons: Useful, Not useful, Already planned, Not relevant.

**Exit:** a beta creator connects and sees a correct first insight in under 5 minutes, and the first 10 creators rate at least 70% of insights useful. It runs as the free Channel Audit, inside Google's 100-user cap until verification passes.

### Step 4 — Editor seats and publishing prep (weeks 8–11)

1. Editor seats: invites, the EDITOR and REVIEWER roles, time-coded comments and approvals, so a creator and their editor finish a video together.
2. Submit the YouTube API compliance audit and quota form as soon as the publish flow works on test channels.
3. Behind a feature flag that stays off until the audit passes: resumable upload, private or scheduled by default, caption upload, thumbnail set, the AI-disclosure question, an explicit confirm screen, an Idempotency-Key and status polling.
4. Link each content to its YouTube video, its analytics and the outcome of the recommendation behind it.

**Exit:** a creator and an editor finish one video together, publishing is tested end to end on internal channels, and the audit is submitted.

### Step 5 — Limits, billing and hardening (weeks 10–12)

1. Usage metering in footage minutes (ADR-014), plus plan entitlements. A budget check runs before every expensive step (Doc 12 §39).
2. An internal cost dashboard: cost per workflow, per creator and per video.
3. Billing through the merchant of record. It can stay off for the private beta.
4. Storage lifecycle: delete proxies and temporary files after a set number of days; keep originals according to the plan.
5. Security pass: OWASP checks, prompt-injection tests, signed URL expiry, a token-leak scan and a backup restore drill.
6. Runbooks for a failed job, a revoked YouTube token, a provider outage and an exhausted quota.

**Exit:** the P0 items of Doc 14's release gate pass.

### Step 6 — Private beta (week 12 onward)

1. Invite 20–50 creators personally and onboard each one live.
2. Review the beta metrics every week and fix the top 3 issues.
3. Turn on paid plans for creators who reach the aha moments (paid beta, Doc 05 §44).

**After the beta:** YouTube publishing once the audit passes, full-resolution MP4 render, Shorts from long videos, B-roll suggestions, recommendation outcome tracking, creator memory v2, learned routing, the Python ml-service and teams. Generated "faceless" video comes only later, as an opt-in.

## 12-week timeline

| Step | Weeks |
| --- | --- |
| 0 · Decide and set up | week 0 |
| A · Validate (parallel) | weeks 1–4 |
| Validation gate | end of week 4 |
| 1 · Foundation | weeks 1–3 |
| 2 · Copilot + export | weeks 3–8 |
| 3 · Channel Audit | weeks 6–9 |
| 4 · Seats + publishing | weeks 8–11 |
| 5 · Limits + billing | weeks 10–12 |
| 6 · Private beta | week 12 onward |

(The live doc has the drawn timeline.)

Validation and the foundation run together in weeks 1–4. The copilot starts in week 3 and continues at full scope only if the gate passes, and YouTube publishing waits for Google's audit.

## AI/ML design

Build the AI layer as normal software that calls models, not as autonomous agents. That means deterministic workflows, structured outputs and an evidence trail for every claim. Docs 08, 13 and 25 already rule out agent swarms and custom models for the MVP; this section makes that concrete.

### AI gateway (build first, in Step 2)

```ts
interface AiRequest<T> {
  orgId: string;
  workflowStepId?: string;
  capability: 'intent.parse' | 'metadata.titles' | 'edit.retakes' | 'insight.explain' | string;
  promptId: string;
  promptVersion: string;
  input: unknown;
  outputSchema: ZodType<T>;
  tier: 'fast' | 'standard' | 'premium';
  maxCostUsd: number;
}

interface AiResult<T> {
  output: T;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  latencyMs: number;
  fallbackUsed: boolean;
}
```

- **Router v1 is a config table:** capability + tier → primary model and fallback model. Models change without a deploy. Learned routing comes later, from ai\_generations plus creator acceptance data.
- **Every call:** schema validation, one repair retry, then the fallback model. Every call writes an ai\_generations row.
- **Privacy:** use provider settings that don't retain or train on creator data where they exist (Doc 12 §27).

### Planner

The LLM picks one of a few workflow templates and fills its parameters; code validates the step graph. No free-form agent plans in the MVP (Doc 08 §57, Doc 13 §29).

### Production Copilot pipeline

1. Speech-to-text with word timestamps, routed by language (ADR-016).
2. Silences: gaps longer than a creator-tunable threshold (start around 0.7 seconds).
3. Filler words: a word list per language.
4. Retakes: the LLM reads transcript windows and marks repeated attempts, returning time ranges and a reason.
5. Merge into an Edit Decision List in the Doc 25 §30 format. Validate it: no overlaps, a minimum clip length and a maximum share of the video cut.
6. Browser preview on the proxy by skipping cut ranges.
7. Export the EDL as FCPXML, Premiere XML and CMX3600 EDL. An FFmpeg render with short audio crossfades comes in Phase 2.
8. Captions uploaded as a caption track; burned-in captions only when the creator asks.

AI proposes; deterministic code executes (Doc 25 §28–29). Every step is testable and repeatable.

### Metadata and thumbnails

- **Titles and descriptions:** retrieve the creator's best-performing past titles (pgvector, filtered by tenant) as style examples. Generate 3 options with reasons, and never invent numbers.
- **Thumbnails v1:** score frames for expression and clarity with a vision model, then compose them with brand text templates rendered by code. Check mobile readability and text length. Generative images stay optional. This is cheaper and keeps the creator's real face.

### Recommendations v0

- **Statistics, not ML:** robust baselines (median and spread) on age-normalized metrics, topic clusters, and 5–8 rules. Examples: a topic outperforming the channel, an early retention drop, a length sweet spot, a gap in publishing cadence, and packaging advice once CTR arrives.
- **Evidence:** each recommendation stores video IDs, metric, effect size and sample size.
- **Explanation:** the LLM writes the "why" from that evidence only. A check rejects any number that is not in the evidence.
- **Confidence:** High / Medium / Low from sample size and effect size, not a percentage.
- **Outcomes:** track results against the baseline, and never claim cause (Doc 25 §60).
- **ML ranking** (learning-to-rank, bandits) only after thousands of feedback events.

### Creator memory v1

A structured profile (typed JSON) the creator can edit, plus preference signals from rejection reasons, plus content embeddings in pgvector. No separate vector database (Doc 22 §103). Row-level security covers retrieval too, so one creator's context can never reach another's prompt.

### Evaluation

- **Golden dataset:** 30–50 cases per capability, built from concierge videos with the creators' consent.
- **Scoring:** a judge model with a rubric plus a weekly human spot-check. It runs in CI whenever a prompt, model or router entry changes, and a regression blocks the release (Doc 14 §53, §86).
- **Product metrics:** cut acceptance rate, title pick rate, caption edit distance and correction minutes per video.

### Guardrails

Untrusted text (descriptions, comments, transcripts, web pages) is passed as data, never as instructions. Models have no tool that publishes, deletes or bills. Output schemas are validated, and personal data is minimized before any provider call (Docs 12, 25).

### Cost model

Every step estimates its cost before it runs, and the workflow shows the total before the creator approves it. Each workflow has a hard budget. The limit is $1.00 per hour of raw footage, with about $0.59 expected (ADR-014). The biggest lever is audio-first processing: the 4K original is never uploaded or processed in the MVP.

## Data model v1

Start from Doc 22's table list and make the changes below. Every tenant table gets organization\_id NOT NULL, an RLS policy and an (organization\_id, created\_at) index. Use time-ordered UUIDs (v7) for IDs.

| Table | Purpose |
| --- | --- |
| approvals | Who approved or rejected which content version or asset, with reason codes and a comment. Replaces Doc 09's reviews. |
| content\_intents | The structured idea: topic, audience, length, tone, constraints (Doc 09's ContentRequirement). |
| workflow\_runs, workflow\_steps (changed) | Add template\_id, template\_version, cost\_estimate, actual\_cost, idempotency\_key, depends\_on and the STALE status. |
| transcripts, transcript\_words | Word timestamps for captions, cuts and search (JSONB per asset is fine to start). |
| edit\_decision\_lists | A versioned edit list per content version, with accepted or rejected per operation. |
| qa\_results | Check name, severity, pass/fail and message per content version. |
| outbox\_events | Transactional outbox for enqueueing jobs and domain events. |
| idempotency\_keys | Key, organization, request hash, stored response and expiry. |
| oauth\_credentials | Encrypted tokens, scopes and expiry, in a separate table behind a restricted database role. |
| youtube\_reporting\_jobs | The reach-report job per channel and the last report fetched. |
| refreshed\_at columns | Prove the 30-day refresh rule on every stored YouTube record. |
| recommendation\_evidence | Metric, values, video IDs and sample size per recommendation. |
| recommendation\_feedback, recommendation\_outcomes | Creator feedback, and the measured outcome against the baseline. |
| entitlements | Plan limits per organization, read by the budget check. |
| ai\_generations (changed) | Add prompt\_version, tier, fallback\_used and cost\_usd. |
| prompt\_versions (optional) | Only if prompts move out of git. |
| media\_assets | Each uploaded file (audio, proxy, original): duration, size, storage key, checksum, original file name for relinking, and a retention date. |
| review\_comments | Time-coded comments by the creator, editor or reviewer, with a resolved flag. |
| export\_jobs | Format (FCPXML, PREMIERE\_XML, EDL, SRT, METADATA), status, file key and expiry. |
| usage\_ledger | Footage minutes used per organization and period, linked to the job that used them. Drives entitlements and billing (ADR-014). |
| creator\_style\_profiles | Creator memory v1: silence threshold, filler list, cut types the creator usually rejects, preferred title patterns. |
| channel\_audits | Each free Channel Audit run, with its evidence and insights, under the 30-day refresh rule. |

## Engineering standards and quality gates

Keep Docs 06, 14 and 17's Definition of Done, and add these rules so quality is enforced by the pipeline, not by memory.

- **Contracts first:** change packages/contracts in its own PR before the code that uses it (Doc 11 §89).
- **Test stack:** Vitest for unit tests, Testcontainers for Postgres and Redis integration, Playwright for the 5 journeys in Doc 14 §23. Use recorded YouTube fixtures, never real creator channels.
- **Always-on suites:** cross-tenant isolation, idempotency (double publish, double start), prompt injection and invalid state transitions.
- **CI gate:** lint, type check, unit, integration, build, secret scan and dependency scan on every PR. E2E runs nightly and before each release.
- **Definition of Done addition:** any AI or media step logs its cost.
- **Operations:** start with modest targets (99.5% API availability, Doc 08 §61). Alert on queue backlog, job failure rate, AI cost spikes and YouTube quota use.
- **Security:** no secrets in code, KMS-encrypted tokens, FFmpeg in a sandboxed container with timeouts and no network beyond storage, and signed URLs that expire within 15 minutes.
- **AI coding agents:** follow Doc 11 §88. Give them packages/contracts and the decision log as context, keep PRs small, and have a human review every migration.

## Beta success metrics and go/no-go gates

Move to a public beta and India only if the private beta hits at least 6 of these 9 targets, including time saved and second-video return. Missing either of those two means fixing the copilot before adding features.

| Metric | Target to go | Based on |
| --- | --- | --- |
| Sign-ups who upload their first footage | 60% or more | This plan (ADR-019) |
| First insights rated useful | 70% or more | This plan |
| Creators who upload and finish a production workflow | 50% or more | Doc 05 §69 |
| Creator hands-on time saved per video | 2+ hours or 40%+ | Docs 02, 03 |
| Cuts and metadata approved without major edits | 70% or more | Doc 05 §72 |
| Creators who return for a 2nd video within 30 days | 40% or more | Doc 02 §53 |
| "Very disappointed" if CreatorOS disappeared | 40% or more | Doc 05 §49 (Sean Ellis test) |
| AI + media cost per footage hour | $1.00 or less | ADR-014 |
| Paying founding creators by the end of beta | 10 or more | Doc 05 §50 |

## Top risks and mitigations

The two risks most likely to sink the first year are a slow YouTube audit and a copilot that does not save enough time. The plan is ordered so that neither one blocks learning.

| Risk | What happens | Mitigation |
| --- | --- | --- |
| YouTube audit is slow or rejected | No public publishing from CreatorOS | Export-first product, minimal scopes, policy-compliant data handling from day one, apply early. |
| The copilot doesn't save enough time | Creators try it once and leave | Measure in the concierge test before building. Focus on talking-head videos. FCPXML export so it fits existing editors. |
| Scope creep toward "everything" | The MVP never ships | Decision log; every feature must pass Doc 08 §69's questions; a written cut list. |
| AI and media costs overrun | Margins disappear | Proxy-first processing, a budget per workflow, the cost dashboard and a storage lifecycle. |
| YouTube Studio, Descript or Adobe ship the same thing | The differentiation shrinks | Own the full loop and creator memory, move fast with niche creators, integrate with their tools. |
| Cross-tenant data leak | Loss of trust, possible legal exposure | RLS, application checks and automated tests on every PR. |
| Weak Sinhala or Tamil speech-to-text | Bad captions for local creators | Benchmark in week 1, start in English, add languages when quality passes. |
| Solo-founder bandwidth | Everything slips | Managed services, one language (TypeScript), AI coding agents with strict contracts. First hire after the validation gate: a backend engineer with FFmpeg experience. |
| Payments from Sri Lanka | Cannot charge globally | Merchant of record; confirm seller eligibility before the paid beta. |
| Gling or Descript already meet the need | Creators see no reason to switch | Ask about them in every interview. Win on mixed-language captions, creator + editor review and audio-first upload. If the edge doesn't hold, pivot the paid core to the editor and agency workspace. |
| Browser audio extraction fails on big files | Audio-first upload (ADR-015) doesn't work | Spike it in week 1 on a 1-hour 4K file. Fallback: full resumable upload, with originals deleted after 7 days. |
| The name "CreatorOS" is already used | Trademark dispute or customer confusion after launch | Choose the final name in week 0, check trademark databases, domains and social handles, and have a lawyer confirm before building the brand. |

## Your first 10 actions this week

These ten tasks finish Step 0 and start Track A and Step 1 at the same time.

- [ ] Install the Claude GitHub app on creator-os (or apply the patch yourself), then merge the docs/revised-saas-foundation branch: Document 26, the Decision Log (ADR-001 to 019) and the docs index.
- [ ] Book 10 creator interviews for next week and write the concierge offer message.
- [ ] Create the Google Cloud project, enable the YouTube Data, Analytics and Reporting APIs, and set up the OAuth consent screen.
- [ ] Run the name and trademark check, then publish the pre-launch website with a waitlist, privacy policy and terms.
- [ ] Scaffold the monorepo (pnpm + Turborepo) with apps/web, apps/api, apps/worker and packages/contracts.
- [ ] Write packages/contracts: state enums, error codes, the response envelope and core zod schemas.
- [ ] Add Docker Compose for Postgres with pgvector, Redis and MinIO, plus the first migration with organizations and RLS.
- [ ] Pick and wire the auth provider so that sign-up creates a personal organization.
- [ ] Run a speech-to-text benchmark on 20 clips: 5 each of English, Sinhala–English, Tamil–English and Hindi–English.
- [ ] Write the concierge scripts (transcribe → cut list → FCPXML → captions → titles) and run them on one of your own videos, extracting the audio in the browser to test ADR-015.

## Sources

- [CreatorOS docs folder (Docs 01–14, 17–19, 22, 25)](https://github.com/DininduAkalanka/creator-os/tree/main/docs)
- [YouTube Data API — Quota calculator](https://developers.google.com/youtube/v3/determine_quota_cost)
- [YouTube Data API — Videos resource](https://developers.google.com/youtube/v3/docs/videos)
- [YouTube Help — Videos locked as private](https://support.google.com/youtube/answer/7300965)
- [Complying with YouTube's Developer Policies](https://developers.google.com/youtube/terms/developer-policies-guide)
- [YouTube derived metrics policy](https://developers.google.com/youtube/terms/derived-metrics-policy)
- [YouTube Reporting API — Metrics](https://developers.google.com/youtube/reporting/v1/reports/metrics)
- [YouTube Analytics vs Reporting API](https://developers.google.com/youtube/analytics/metrics-explained)
- [Google — Sensitive scope verification](https://developers.google.com/identity/protocols/oauth2/production-readiness/sensitive-scope-verification)
- [Phyllo — YouTube OAuth scopes explained](https://www.getphyllo.com/post/youtube-oauth-scopes)
- [eWeek — YouTube's July 2025 inauthentic content update](https://www.eweek.com/news/youtube-responds-to-ai-concerns/)
- [Dodo Payments — Merchant of record in Sri Lanka](https://dodopayments.com/blogs/merchant-of-record-in-srilanka)
- [Polar — Supported countries](https://polar.sh/docs/merchant-of-record/supported-countries)
- [Paddle — Supported countries](https://developer.paddle.com/concepts/sell/supported-countries-locales)

Added for the revised foundation (Nov 2026):

- [Google — Unverified apps (100-user cap)](https://support.google.com/cloud/answer/7454865)
- [Google — OAuth app verification requirements](https://support.google.com/cloud/answer/13464321)
- [YouTube API Services — Developer Policies](https://developers.google.com/youtube/terms/developer-policies)
- [YouTube Help — A/B test titles & thumbnails](https://support.google.com/youtube/answer/16391400)
- [Search Engine Journal — YouTube introduces Ask Studio](https://www.searchenginejournal.com/youtube-introduces-ask-studio-ai-for-channel-analytics/559399/)
- [Social Media Today — Ask Studio on mobile, AI clip suggestions](https://socialmediatoday.com/news/youtube-expands-ai-powered-creative-chatbot-to-all-mobile-users/874802)
- [Activepieces — Deepgram pricing 2026](https://www.activepieces.com/blog/deepgram-pricing-2026-per-minute-rates-and-add-ons)
- [Cloudflare R2 pricing](https://developers.cloudflare.com/r2/pricing/)
- [Polar — pricing comparison (Starter 5% + 50¢)](https://polar.sh/resources/comparison/lemon-squeezy)
- [Gling — features](https://www.gling.ai/save-time)
- [Gling review 2026 (aisotools)](https://aisotools.com/blog/gling-review-2026)
- [AssemblyAI — Sinhala speech-to-text](https://www.assemblyai.com/languages/sinhala)
- [Gladia — Sinhala speech-to-text](https://www.gladia.io/product/languages/sinhala)
- [Viral Nation — Viral Nation\_CreatorOS™ launch](https://www.viralnation.com/resources/news-press-releases/viral-nation-sets-itself-apart-in-the-rapidly-growing-creator-economy)
- [CreatorOS (creatoros.xyz) — UK creator-collaboration platform](https://creatoros.xyz/)
