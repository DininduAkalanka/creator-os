> **Status update — 20 Nov 2026 (ADR-020, worldwide focus).** The customers are English-speaking creators and their editors worldwide (mainly the USA, Canada, the UK and Europe, Australia and the UAE). Superseded here:
>
> - customer group 3 (§4.2) and the language routing in §5.1 item 3;
> - regional pricing (§7) and the South Asia assumption in §8.3 (with one global price, contribution is **$24.38 (74%)** and break-even is about **16** customers solo or **123** with a team);
> - the "danger zone" (§9) and the language edge (§10);
> - the benchmark clips, the regional price and the mixed-language gate check in §11 (the gate is now 4 of 5, including time saved).
>
> **Read instead:** [Decision Log ADR-020](./00_Decision_Log.md).

---

# CreatorOS
## Document 26 — Revised SaaS Foundation & Unit Economics

**Document:** 26 — Revised SaaS Foundation & Unit Economics
**Version:** 1.0
**Date:** 20 November 2026
**Status:** Accepted for the MVP. Where an older document disagrees, this document and [the Decision Log](./00_Decision_Log.md) win.
**Replaces:** the MVP wedge in Docs 03, 05, 06 and 19, and the pricing and per-video cost model in Doc 04. See section 13 for the full list.

---

## 1. Summary

CreatorOS keeps its vision: an AI workflow layer that saves serious YouTube creators time and learns from their channel. What changes is **where we start and what we charge for**.

**The foundation:** an **AI first-pass editor and review workspace** for talking-head and screen-recording YouTube videos.

- The creator drops in raw footage.
- CreatorOS returns a rough cut, captions, chapters, title and description options, and thumbnail ideas.
- The creator (or their editor) reviews everything in one place, accepts or rejects each cut, then exports a timeline that opens in Premiere Pro, DaVinci Resolve or Final Cut Pro.
- A free, read-only **Channel Audit** brings creators in.
- Publishing to YouTube comes later, after Google's audit.

**We charge per hour of raw footage**, not per video or per AI credit.

**Can it make a profit?** Yes, on paper, and the numbers are not tight:

- Our cost is about **$0.31–0.88 per footage hour**.
- Typical gross margin is about **80%**. The worst case (every customer uses 100% of their plan at the highest cost) is still about **57%**.
- **Break-even:** about **24 paying customers** if you work alone, or about **180** with a small team that costs $3,000 a month.
- The real risk is not cost. It is whether creators pick us over Gling, Descript and YouTube's own free tools. Sections 10 and 11 cover that.

---

## 2. Why the original plan had to change

The research in Docs 01–05 is good. The problem is that the MVP was too wide, and some of it runs straight into platform limits. These are the limits we now design around.

| Limit (checked November 2026) | What it means for us | Our design response |
| --- | --- | --- |
| Unverified Google apps that ask for sensitive scopes show an "unverified app" warning, and can only get **100 new users** until verified ([Google](https://support.google.com/cloud/answer/7454865)). All YouTube scopes are sensitive. | Any feature that needs YouTube login has a 100-user cap and a scary warning until Google verifies us. | The **paid product needs no YouTube login at all**: footage in, files out. Only the free Channel Audit uses YouTube login, and it can live with the cap while verification runs. |
| Uploads through the API from unverified projects are locked to **private**. Locked videos can't be appealed; the creator must re-upload ([videos resource](https://developers.google.com/youtube/v3/docs/videos), [YouTube Help](https://support.google.com/youtube/answer/7300965)). | "Publish to YouTube" can't be a launch feature. | Export first. Publishing is Phase 2, after the audit passes. |
| Most stored YouTube data must be refreshed or deleted within 30 days. Statistics can be kept up to 36 months only after accepting the derived-metrics amendment ([policy guide](https://developers.google.com/youtube/terms/developer-policies-guide), [derived metrics](https://developers.google.com/youtube/terms/derived-metrics-policy)). | Analytics products carry ongoing compliance work. | Keep the analytics side small (Channel Audit). Put the paid value in editing, which uses the creator's own files. |
| Private analytics may only be shown to the channel owner or their representatives. | No "compare yourself with other creators" feature built from private data. | Benchmarks only from the creator's own history. |
| CTR and impressions come only from bulk Reporting API reports, and arrive late. | Packaging advice can't be in the first session. | First insights use views and retention. |
| YouTube Studio now has free **A/B testing** for up to 3 titles and thumbnails, with the winner picked by watch time ([YouTube Help](https://support.google.com/youtube/answer/16391400)). | A paid A/B testing feature would compete with a free built-in one. | We don't build A/B testing. We generate good variants, and the creator tests them in YouTube. |
| YouTube Studio has **Ask Studio**, a free AI assistant that answers questions about a channel's analytics and comments ([Search Engine Journal](https://www.searchenginejournal.com/youtube-introduces-ask-studio-ai-for-channel-analytics/559399/)). It is now on mobile ([Social Media Today](https://socialmediatoday.com/news/youtube-expands-ai-powered-creative-chatbot-to-all-mobile-users/874802)). | "Chat with your analytics" is no longer a paid feature. | Don't sell generic analytics chat. Channel Audit stays free and is linked to what to film and edit next. |
| Since July 2025, mass-produced, repetitive videos are not eligible for monetization ("inauthentic content") ([eWeek](https://www.eweek.com/news/youtube-responds-to-ai-concerns/)). | A "faceless AI video factory" puts creators' income at risk. | Footage-first product. Generated video stays out of the MVP. |
| Stripe doesn't operate in Sri Lanka. Merchants of record cost about 4–5% + $0.40–0.50, plus extra for international cards and subscriptions ([Polar](https://polar.sh/resources/comparison/lemon-squeezy), [Polar fees](https://docs.polar.sh/documentation/polar-as-merchant-of-record/fees)). | Payment fees are bigger than usual and must be in the model. | We model 7% + $0.50 per charge, all-in (section 8). |
| Sri Lanka and India upload speeds can make 20–40 GB of 4K footage per video impractical. | Full-file upload hurts activation in our first markets. | **Audio-first upload**: send the audio (and an optional small proxy). Originals stay on the creator's disk; the exported timeline points to them. |

---

## 3. Options we compared

We scored four foundations against the limits above, real creator pain (Doc 02), cost and speed to revenue.

| Option | What it is | Main problem | Verdict |
| --- | --- | --- | --- |
| A. Original CreatorOS (full loop) | Idea → plan → produce → publish → analyze → recommend, all at once | Too wide for one founder. Publishing is blocked by the audit. Analytics overlaps with free YouTube tools | No, too big to ship well |
| B. Channel Intelligence only | Analytics insights and recommendations | YouTube's free Ask Studio and A/B testing cover much of it. 100-user cap until verified. Low willingness to pay | No as the paid core. Yes as the free acquisition tool |
| **C. Production Copilot + NLE export** | Footage in → rough cut, captions, chapters, metadata, thumbnail ideas → review → export to the creator's editor | Strong competitors (Gling, Descript). We must win on fit and focus | **Yes: the paid core** |
| D. Editor / agency workspace | Review, approvals and client links for creators who work with freelance editors | Smaller market at the start. Needs option C to be useful | Yes, as the Studio tier on top of C |

**Decision:** C as the paid core, B as the free front door, D as the expansion tier. Generated video and auto-publishing come later.

---

## 4. The recommended foundation

### 4.1 One-line positioning

> **CreatorOS turns your raw recording into a ready-to-finish edit, captions and packaging in minutes, so you or your editor only do the creative part.**

### 4.2 Who it is for (first customers)

1. **Talking-head and screen-recording creators** (tutorials, education, tech, business, commentary, podcasts on YouTube) who post at least 2 long videos a month and edit themselves. 1K–100K subscribers. This is Doc 02's main pain group.
2. **Creators who work with a freelance editor**, and the editors themselves. This is common in Sri Lanka and India. The editor can be a sales channel: one editor brings several creators.
3. **South Asian creators who speak in mixed languages** (Sinhala–English, Tamil–English, Hindi–English). This is a **hypothesis**: if our captions and cuts work well on mixed speech, it is a real edge, because most tools are tuned for English. We test it in week 1 (section 11).

### 4.3 Creator needs we solve

| Need | Evidence | What CreatorOS does | Why free YouTube tools don't cover it |
| --- | --- | --- | --- |
| Editing takes too long | Doc 02: production time is the top pain; 4+ hours per video | Removes silences, filler words and retakes automatically; the creator accepts or rejects each cut | YouTube Studio is not an editor for raw footage |
| AI output needs too much fixing | Doc 02: creators distrust "one-click" AI | Every cut is a suggestion you can see and undo. Nothing is final until you approve | n/a |
| "I already use Premiere / Resolve / Final Cut" | Docs 01, 03: integrate, don't replace | Exports a timeline (FCPXML / Premiere XML / EDL) that opens in their editor with cuts intact | n/a |
| Captions in my language | Doc 05: Sri Lanka and India first | Captions with word timing, editable, exported as SRT. Language routing to the best speech-to-text for that language | YouTube auto-captions are weaker for code-mixed speech (to be measured) |
| Titles, descriptions, chapters take time | Doc 02 | 3 title options with reasons, description, chapters, all from the transcript and the creator's past style | Ask Studio gives ideas, but not from your raw recording before upload |
| Thumbnails | Doc 02 | Best-frame picks and text-layout ideas; the creator tests them with YouTube's free A/B testing | YouTube tests thumbnails, it doesn't make them |
| Working with an editor is messy | Doc 02 (agency/editor interviews) | Shared review: time-coded comments, approvals, versions | n/a |
| "What should I make next?" | Docs 02, 13 | Free Channel Audit: your best topics, length and retention patterns, linked to your next video | Ask Studio answers questions, but doesn't connect to your production work |

### 4.4 What we will not build (and why)

| Not building | Why |
| --- | --- |
| Title / thumbnail A/B testing | YouTube Studio does it for free, judged by watch time |
| Generic "chat with your analytics" | Ask Studio does it for free |
| AI-generated "faceless" videos (script → AI voice → stock clips) | Highest cost, and highest risk under YouTube's inauthentic-content rule. Phase 3 opt-in at most |
| Auto-publish to YouTube in the MVP | Uploads are locked private until the audit passes |
| Cross-creator benchmarks from private analytics | Not allowed by YouTube policy |
| A full video editor (timeline, effects, colour) | Creators already have one. We hand off to it |
| Our own speech or language models | Buy the best API per language; build only the workflow and the data |

---

## 5. MVP scope (v1)

### 5.1 In the MVP

1. **Sign-up** with Google or email (managed auth). This does **not** need YouTube scopes.
2. **Upload, audio first.**
   - In the browser, extract the audio track (WebCodecs or ffmpeg.wasm) and upload it first, so the transcript starts within minutes.
   - Optionally upload a 360p–540p proxy for preview and frame picks.
   - Fallback: full-file resumable upload, with originals deleted after 7 days.
3. **Transcript** with word timestamps and speaker labels. Language routing: English to the cheapest good model; Sinhala, Tamil and Hindi to whichever provider wins the week-1 benchmark.
4. **Rough-cut suggestions** as an Edit Decision List (EDL):
   - silences, with a threshold the creator can tune;
   - filler words, from a word list per language;
   - retakes, where the LLM marks repeated attempts with a reason.

   Preview in the browser by skipping the cut ranges, so nothing is rendered.
5. **Review workspace.**
   - Transcript-based editing: delete text to cut.
   - Accept or reject per cut, plus "accept all of this type".
   - Time-coded comments.
   - Approve, or request changes.
6. **Captions** editor, with SRT/VTT export.
7. **Packaging:** 3 titles with reasons, a description, chapters, and thumbnail ideas (best frames from the proxy plus text layouts).
8. **Export package:**
   - **FCPXML** (Final Cut Pro and DaVinci Resolve);
   - **Premiere Pro XML**;
   - CMX3600 **EDL**;
   - SRT;
   - metadata as .txt and .json;
   - thumbnail frames as PNG.

   Timelines point to the creator's original files, and a relink guide is included.
9. **Creator memory v1.**
   - Remember the silence threshold, filler list, and which cut types this creator usually rejects.
   - Use past accepted titles as style examples.
10. **Free Channel Audit** (read-only YouTube scopes): baselines, top topics, length and retention patterns, 5–8 evidence-based insights, and "film this next" suggestions.
11. **Seats and roles:** OWNER, EDITOR, REVIEWER (comment and approve only).
12. **Metering and billing:** footage minutes per organization per month, plan entitlements, merchant of record.

### 5.2 Not in the MVP (later phases)

| Phase | Feature | Gate |
| --- | --- | --- |
| 2 | YouTube upload and scheduling (private or scheduled by default, AI-disclosure question) | Google audit passed |
| 2 | Full-resolution cloud render to MP4 (for creators without an editor app) | Demand from beta users; priced as an add-on |
| 2 | Shorts candidates from long videos | YouTube is also adding AI clip suggestions in some countries ([Social Media Today](https://socialmediatoday.com/news/youtube-expands-ai-powered-creative-chatbot-to-all-mobile-users/874802)). Build only if beta users still ask |
| 2 | CTR-based packaging advice (Reporting API) | Reporting job data has arrived for the channel |
| 3 | Agency client portal, white-label reports | 10+ Studio customers |
| 3 | B-roll suggestions, learned routing, Python ml-service | Enough acceptance data |
| 3 | Generated video (opt-in) | Policy review; strong demand |

---

## 6. How a video flows through CreatorOS

1. **Upload:** audio (and optional proxy) → R2 storage through a signed URL.
2. **API:** creates the content, then writes the workflow run and an outbox row in one transaction.
3. **Worker, media:** probes the file, builds the waveform, detects silences.
4. **Worker, AI:** speech-to-text → retake detection → merge into the EDL → titles, description, chapters → thumbnail ideas.
5. **Review:** the creator and editor review in the browser; every decision is saved.
6. **Export:** the worker builds FCPXML / XML / EDL / SRT / metadata → a download link.
7. **Learn:** accepted and rejected decisions update creator memory and the evaluation data.

The stack in the Decision Log (ADR-006) is unchanged. The changes are audio-first media (ADR-015), metering by footage minutes (ADR-014) and the STT language router (ADR-016).

---

## 7. Pricing and packaging

The price unit is **hours of raw footage per month**. It is simple for creators to understand ("I record about 4 hours a month"), and it follows our real cost (speech-to-text is charged per minute).

| Plan | Price (global) | Footage per month | Seats | Includes |
| --- | --- | --- | --- | --- |
| Free | $0 | 30 minutes | 1 | Channel Audit, rough cut, captions, 1 export a month with a "Made with CreatorOS" note in the metadata file |
| Creator | $19/mo | 5 hours | 1 | Everything for one creator: all exports, packaging, creator memory |
| Pro | $39/mo | 15 hours | 2 (creator + editor) | Review workspace, comments, approvals, priority processing |
| Studio | $99/mo | 40 hours | 5, up to 5 channels | Editor/agency workspace, client review links, shared presets |
| Extra footage | $3 per hour | — | — | Any paid plan |

- **Regional pricing:** about **50% lower in South Asia** (Sri Lanka, India and neighbours), through the merchant of record's regional pricing or discount codes. Test the exact LKR and INR price points during pre-sales (section 11).
- **Annual plans:** 2 months free.
- **Founding offer:** for the first 50 paying creators, a locked price for 12 months.
- **Why not credits:** creators find credits confusing (Doc 02). Hours are clear, and they make our cost predictable.
- **Changes from Doc 04:**
  - Pro moves from $49 to $39, because Gling and Descript set the price expectation for this kind of tool.
  - The per-video cost target is replaced by a per-footage-hour target.

---

## 8. Unit economics

All numbers come from the small model in [models/unit_economics.py](./models/unit_economics.py) (run `python3 docs/models/unit_economics.py`), using prices checked in November 2026. The arithmetic is also in the appendix. **Re-check prices before launch**; they change often.

### 8.1 Cost per hour of raw footage

| Cost item | Low | High | Basis |
| --- | --- | --- | --- |
| Speech-to-text | $0.26 | $0.40 | Deepgram Nova-3 batch is about $0.0043/min (~$0.26/hr) for one language, and about $0.0052/min (~$0.31/hr) multilingual ([Activepieces](https://www.activepieces.com/blog/deepgram-pricing-2026-per-minute-rates-and-add-ons)). The high case leaves room for a pricier provider for Sinhala/Tamil |
| LLM (retakes, titles, chapters, description) | $0.02 | $0.20 | About 5 passes × 15K input + 2K output tokens per footage hour. That is about $0.01 on a small model ($0.10/$0.50 per million tokens) and about $0.13 on a standard one ($1/$5) |
| Compute (waveform, silence detection, proxy frames, export) | $0.02 | $0.10 | Audio-first; no 4K transcoding in the MVP |
| Storage and transfer | $0.01 | $0.03 | R2: $0.015 per GB-month, no egress fees. Audio + proxy is under 0.5 GB per hour |
| Thumbnail ideas | $0.00 | $0.15 | Frame scoring with a vision model; image generation is optional |
| **Total** | **$0.31** | **$0.88** | Middle case is about **$0.59** |

Doc 04's target was $1.60 per video. Most talking-head videos come from 0.5–1.5 hours of raw footage, so this design costs well under that target.

### 8.2 Margin per plan

The merchant-of-record fee is modelled as 7% + $0.50 per charge. That is a cautious, all-in figure: base fee, international card and subscription extras.

| Plan | Price | Fee | Cost if fully used (high case) | Margin, worst case | Cost at 50% use (middle case) | Margin, typical |
| --- | --- | --- | --- | --- | --- | --- |
| Creator | $19 | $1.83 | $4.40 | 67% | $1.49 | 83% |
| Pro | $39 | $3.23 | $13.20 | 58% | $4.46 | 80% |
| Studio | $99 | $7.43 | $35.20 | 57% | $11.90 | 80% |
| Extra hour | $3 | $0.21 | $0.88 | 64% | — | — |

### 8.3 Blended contribution per paying customer

Assumptions:

- Plan mix: 60% Creator, 30% Pro, 10% Studio.
- Half of the customers pay the South Asia price (50% off).
- Customers use about 50% of their hours.
- Every paying customer carries 10 free users. Each free user costs about $0.14 a month: the audit, plus 30% of them using their 30 minutes.
- Support costs about $1 per customer per month.

| Item | Per paying customer per month |
| --- | --- |
| Average revenue (blended ARPU) | $24.75 |
| AI and media cost | −$3.42 |
| Payment fees | −$2.23 |
| Free users carried (10 × $0.14) | −$1.39 |
| Support | −$1.00 |
| **Contribution** | **$16.70 (67%)** |

### 8.4 Break-even and targets

| Scenario | Fixed cost a month | Paying customers to break even | MRR at break-even |
| --- | --- | --- | --- |
| Founder alone (hosting, tools, domain, auth, monitoring) | ~$400 | **~24** | ~$600 |
| Small team (2 people in Sri Lanka + infrastructure) | ~$3,000 | **~180** | ~$4,400 |

| Goal | Paying customers | Monthly profit with a $3,000 cost base |
| --- | --- | --- |
| $5,000 MRR | ~200 | ~$370 |
| $10,000 MRR | ~400 | ~$3,750 |

**Customer value:** if monthly churn is 7% (a cautious guess for creator tools until we measure it), one customer is worth about $16.70 ÷ 0.07 ≈ **$240** in contribution. Keep the cost to win a customer **under about $80**, to stay at a 3:1 value-to-cost ratio. That means founder-led, community, editor referrals and the free Channel Audit, not paid ads.

### 8.5 Rules that protect the margin

1. Meter footage minutes **before** the expensive steps run. Block the job, or offer extra hours, when the plan limit is reached.
2. Never process the 4K original in the MVP. Use audio, and a proxy only when needed.
3. Use the cheapest model that passes the evaluation set, per capability (ADR-010). Re-check every quarter.
4. Delete proxies after 30 days and uploaded originals after 7 days. Keep EDLs and transcripts (small) for as long as the plan says.
5. Log the cost of every AI and media step (`ai_generations.cost_usd`, `usage_ledger`). Alert when the cost per footage hour goes above $1.00.

---

## 9. Can it actually make money? The honest answer

- **Unit economics: yes.** Even the worst case keeps more than half of each dollar. In the typical case, about 80 cents of every dollar is gross profit.
- **Break-even is small.** About 24 customers solo, or about 180 with a small team. That is reachable with founder-led sales in Sri Lanka and India plus a global English audience.
- **What decides profit is distribution and retention, not cost.** The product must save at least 2 hours per video, or 40% of editing time, and creators must come back for their second and third video.
- **The danger zone is South Asia-only revenue.** At 50% regional prices, 400 customers is only about $5,000 MRR. Plan for at least half of revenue to come from global English-speaking creators by month 9.

---

## 10. Competition and how we win

| Competitor | What they do well | Where we differ |
| --- | --- | --- |
| **Gling** | Focused YouTube rough-cut tool: removes silences, fillers and bad takes, exports XML to Premiere, Final Cut and Resolve, and adds titles, chapters and captions ([Gling](https://www.gling.ai/save-time), [review](https://aisotools.com/blog/gling-review-2026)) | Our main competitor; same core job. We must win on: (1) mixed South Asian languages, if the benchmark proves it; (2) the creator + editor review workspace; (3) a web app that works on slow connections (audio-first); (4) creator memory that learns your cut style; (5) local pricing and payment |
| **Descript** | Text-based editing, recording, podcasts, many features | Broader and heavier. We are YouTube-specific, faster to a rough cut, and we hand off to the creator's own editor |
| **YouTube Studio** (free) | A/B testing, Ask Studio, auto-captions, analytics | We don't compete. We feed it better variants and better captions |
| **Opus Clip and other clip tools** | Shorts from long videos | Not our MVP. Phase 2 only if users ask |
| **CapCut / Premiere / Resolve** | Full editing | We are the step before them, not a replacement |

**Kill or pivot signal:** if 15 interviews show creators are happy with Gling or Descript and our mixed-language edge does not hold up, pivot to **option D**: the editor/agency review workspace, which Gling does not focus on.

---

## 11. Validate before building the expensive parts (weeks 1–4)

This replaces the validation gate in Docs 01–05 and the CTO plan's Track A.

1. **15–20 interviews** with talking-head creators, and 5 with freelance editors. Ask about their last video: how long editing took, which tools they used, what they pay, and whether they have tried Gling or Descript.
2. **Speech-to-text benchmark:** 20 real clips (5 English, 5 Sinhala–English, 5 Tamil–English, 5 Hindi–English). Score word error rate, timestamp accuracy, and how well the filler and retake detection works. Candidates: Deepgram, AssemblyAI, Gladia, ElevenLabs Scribe and Google, all of which list Sinhala or multilingual support. Pick per language.
3. **Concierge test:** run 10 real videos from 5 creators through scripts (transcribe → EDL → FCPXML → captions → titles). Measure hands-on minutes saved and the cut acceptance rate.
4. **Pre-sales:** offer the founding plan (Creator $19 global or the South Asia price, locked for 12 months). Collect real payments or signed commitments.

**Gate at the end of week 4:**

| Check | Pass |
| --- | --- |
| Creators who ask to use it on their next video | 5 or more |
| Time saved per video | 2+ hours, or 40%+ |
| Suggested cuts accepted | 70% or more |
| Cost per footage hour, measured | $1.00 or less |
| Paid or committed founding customers | 5 or more |
| Mixed-language edge (South Asian clips) | Clear win against YouTube auto-captions on 3 of 4 language sets. If not, launch English-first and drop the language claim |

Pass 5 of 6, including time saved, to build the full copilot. Otherwise narrow the product or pivot (section 10).

---

## 12. Revised 12-week build order

| Weeks | Work | Exit test |
| --- | --- | --- |
| 0 | Decision log, contracts package, Google Cloud project, privacy policy and terms (start OAuth verification now; it can take a long time) | Decision log merged |
| 1–4 | **Validation in parallel** (section 11) | Gate passed |
| 1–3 | Foundation: monorepo, auth, organizations with RLS, schema v1, CI/CD, observability | Cross-tenant tests pass; staging deploys on merge |
| 3–8 | **Copilot core:** audio-first upload, transcript, EDL cut suggestions, browser preview, review workspace, captions, packaging, exports | On 5 real videos: ≥40% time saved, ≥70% cuts accepted, export opens in Premiere, Resolve and Final Cut |
| 6–9 | **Free Channel Audit** (read-only scopes; works within the 100-user cap until verified) | First insight in under 5 minutes; ≥70% rated useful |
| 8–10 | Editor seats, comments, approvals; creator memory v1 | A creator and an editor finish one video together |
| 10–12 | Metering by footage minutes, billing (merchant of record), storage lifecycle, security pass, runbooks | Doc 14 P0 release gate passes |
| 12+ | Paid private beta: 30–50 creators, onboarded personally | 10+ paying; 40%+ come back for a second video in 30 days |

Compared with the CTO plan, the copilot comes before the Channel Audit. The paid product doesn't depend on Google's review, so revenue can start while verification runs.

---

## 13. What changes in each existing document

| Document | What is superseded | Read instead |
| --- | --- | --- |
| 03 Product Differentiation | Nothing in the wedge. Footage → rough cut is confirmed and narrowed to talking-head and screen-recording, with NLE export | Doc 26 §3–4 |
| 04 Business Model | Pricing tiers ($19/$49/$99/$249), credits, and the $1.60-per-video cost target | Doc 26 §7–8 |
| 05 MVP, GTM & Roadmap | MVP order (metadata + analytics first; editing later) and the validation gate | Doc 26 §5, §11, §12 |
| 06 PRD | MVP scope and P0 list | Doc 26 §5 |
| 07 UX/UI Journey | Percentage confidence in mockups ("82%"); the onboarding order (YouTube connect is no longer step one) | Decision Log ADR-004, ADR-001 |
| 08 Feature Specification | Publishing and analytics-first stories are no longer P0. Edit, review and export stories are P0 | Doc 26 §5 |
| 09 Data Model | creator_id tenancy, "Project = one video", the reviews entity | Decision Log ADR-002, ADR-003; Doc 26 §14 |
| 11 API Specification | {success, data, meta} envelope, Bearer auth, /projects/:id routes for one video | Decision Log ADR-005, ADR-009, ADR-003 |
| 12 Security & Privacy | "workspace" tenancy, scope plan (YouTube is now optional and read-only at first) | Decision Log ADR-002, ADR-009 |
| 13 / 25 AI Architecture | "Intelligent routing" as an MVP differentiator; percentage confidence | Decision Log ADR-010, ADR-016 |
| 17 Backend Specification | Response envelope; job types (add the export and metering jobs) | Decision Log ADR-005; Doc 26 §6 |
| 19 Media Pipeline | The script → AI voice → assembled video path in the MVP; full-file upload as the default | Decision Log ADR-015, ADR-017; Doc 26 §5–6 |
| 22 Database ERD | Missing tables (approvals, transcripts, EDL, QA results, outbox, idempotency, usage) | Doc 26 §14 |

---

## 14. Data model additions for this foundation

These add to the tables in the CTO plan (ADR-002, organization_id plus RLS on every tenant table).

| Table | Purpose |
| --- | --- |
| media_assets | Each uploaded file (audio, proxy, original). Kind, duration, size, storage key, checksum, original file name and local path hint (for relinking), retention date |
| transcripts, transcript_words | Language, provider, model, word timings, speakers, confidence |
| edit_decision_lists, edit_decisions | A versioned EDL per content version. Each decision has type (silence, filler, retake, manual), start and end, reason, and status (SUGGESTED, ACCEPTED, REJECTED) |
| review_comments | Time-coded comments, author, resolved flag |
| approvals | Approve / request changes / reject, with a reason code (from the CTO plan) |
| export_jobs | Format (FCPXML, PREMIERE_XML, EDL, SRT, METADATA), status, file key, expiry |
| usage_ledger | Footage minutes used per organization and period, linked to the job that used them; drives entitlements and billing |
| entitlements | Plan limits: footage minutes, seats, channels, exports |
| creator_style_profiles | Creator memory v1: silence threshold, filler list, rejected cut types, preferred title patterns |
| channel_audits | Audit run, evidence and insights for the free tool (subject to the 30-day refresh rule) |

---

## 15. Sources

- [Google — Unverified apps (100-user cap)](https://support.google.com/cloud/answer/7454865)
- [eWeek — YouTube's July 2025 inauthentic content update](https://www.eweek.com/news/youtube-responds-to-ai-concerns/)
- [YouTube Data API — Videos resource](https://developers.google.com/youtube/v3/docs/videos)
- [YouTube Help — Videos locked as private](https://support.google.com/youtube/answer/7300965)
- [YouTube Developer Policies guide](https://developers.google.com/youtube/terms/developer-policies-guide)
- [YouTube derived metrics policy](https://developers.google.com/youtube/terms/derived-metrics-policy)
- [YouTube Help — A/B test titles & thumbnails](https://support.google.com/youtube/answer/16391400)
- [Search Engine Journal — YouTube introduces Ask Studio](https://www.searchenginejournal.com/youtube-introduces-ask-studio-ai-for-channel-analytics/559399/)
- [Social Media Today — Ask Studio on mobile, AI clip suggestions](https://socialmediatoday.com/news/youtube-expands-ai-powered-creative-chatbot-to-all-mobile-users/874802)
- [Activepieces — Deepgram pricing 2026](https://www.activepieces.com/blog/deepgram-pricing-2026-per-minute-rates-and-add-ons)
- [Cloudflare R2 pricing](https://developers.cloudflare.com/r2/pricing/)
- [Polar — pricing comparison (Starter 5% + 50¢)](https://polar.sh/resources/comparison/lemon-squeezy)
- [Polar — merchant-of-record fees](https://docs.polar.sh/documentation/polar-as-merchant-of-record/fees)
- [Gling — features](https://www.gling.ai/save-time)
- [Gling review 2026 (aisotools)](https://aisotools.com/blog/gling-review-2026)
- [AssemblyAI — Sinhala speech-to-text](https://www.assemblyai.com/languages/sinhala)
- [Gladia — Sinhala speech-to-text](https://www.gladia.io/product/languages/sinhala)

### Appendix — the arithmetic

```text
cost per footage hour: low 0.31 | mid 0.59 | high 0.88
LLM per footage hour: 75k in + 10k out tokens -> small model $0.013, standard $0.125
fee(p) = 0.07 * p + 0.50
Creator 19: fee 1.83, full-use high cost 5*0.88=4.40 -> 67%; 50% use mid 2.5*0.59=1.49 -> 83%
Pro 39:     fee 3.23, 15*0.88=13.20 -> 58%; 7.5*0.59=4.46 -> 80%
Studio 99:  fee 7.43, 40*0.88=35.20 -> 57%; 20*0.59=11.90 -> 80%
free user: 0.05 + 0.30*0.5*0.59 = 0.14/month; x10 = 1.39
global ARPU 33.00 (60/30/10 mix); blended with 50% at half price = 24.75
contribution = 24.75 - 3.42 - 2.23 - 1.39 - 1.00 = 16.70 (67%)
break-even: 400/16.70 = 24 customers; 3000/16.70 = 180 customers
LTV at 7% monthly churn = 16.70/0.07 = 239
```
