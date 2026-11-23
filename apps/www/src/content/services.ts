/**
 * Every service CreatorOS plans to offer, from the docs, with an honest status (English copy).
 *
 * Sources: ADR-001 (Production Copilot is the paid core; free read-only Channel Audit; publishing
 * after Google's audit), ADR-002/ADR-014 (editor seats in Pro and Studio), ADR-004 (confidence is
 * High/Medium/Low, never an AI-made percentage), ADR-009 (read-only YouTube), ADR-014 (plans),
 * ADR-017 (no title/thumbnail A/B testing, no analytics chat, no cross-creator benchmarks, no
 * generated video), ADR-019 (Copilot first, then the Audit in the beta), Implementation Plan
 * Step 3 (Audit details), "After the beta" list (publishing, Shorts, B-roll, outcome tracking,
 * creator memory, full-resolution render).
 *
 * All numbers inside product previews are example data and are labelled as such on the page.
 */
import { BRAND } from "@/config/site";
import { FOUNDING_OFFER } from "@/config/offer";

const name = BRAND.name;

export type ServiceStatus = "first" | "beta" | "later";

/** Our own pictograms (components/service-icon.tsx): one per service and planned item. */
export type ServiceIconName =
  | "rough-cut"
  | "captions"
  | "export"
  | "review"
  | "audit"
  | "next"
  | "publish"
  | "shorts"
  | "broll"
  | "outcomes"
  | "memory"
  | "render";

export const statusLabels: Record<ServiceStatus, string> = {
  first: "First release",
  beta: "Beta",
  later: "Later",
};

export const statusHelp =
  "First release: what early access starts with. Beta: added during the private beta. Later: planned after the beta. Nothing is available yet; join the waitlist to be invited.";

/**
 * Hero slides (Adobe-style swapper), shown on the stage under the page's headline (the headline
 * itself is in content/home.ts).
 */
export const heroSlides = [
  {
    id: "rough-cut",
    tab: "Rough cut",
    status: "first" as ServiceStatus,
    eyebrow: "AI first-pass editing",
    heading: "Every pause and retake, marked for you.",
    lead: "Suggested cuts on your transcript. You approve every one.",
    cta: { label: "Try the demo", href: "#try-it" },
  },
  {
    id: "captions",
    tab: "Captions & chapters",
    status: "first" as ServiceStatus,
    eyebrow: "Captions, chapters, titles",
    heading: "Captions that follow every cut.",
    lead: "Plus chapters, a title, a description and thumbnail ideas, drafted from what you said.",
    cta: { label: "See everything you get", href: "#features" },
  },
  {
    id: "review",
    tab: "Editor review",
    status: "beta" as ServiceStatus,
    eyebrow: "Review with your editor",
    heading: "Hand your editor a clean first pass.",
    lead: "Comments on exact moments and approval in the browser. Then it opens in their editor.",
    cta: { label: "How hand-off works", href: "#features" },
  },
  {
    id: "audit",
    tab: "Channel Audit",
    status: "beta" as ServiceStatus,
    eyebrow: "Free Channel Audit",
    heading: "See what your channel is already telling you.",
    lead: "Read-only. Each video compared with your own usual results, with the evidence.",
    cta: { label: "How the Audit works", href: "#channel-audit" },
  },
  {
    id: "next",
    tab: "What to film next",
    status: "beta" as ServiceStatus,
    eyebrow: "Recommendations",
    heading: "Know what to film next, and why.",
    lead: "Ideas built on what worked on your channel, with a confidence level. You decide.",
    cta: { label: "See a recommendation", href: "#next-video" },
  },
];

export const carouselCopy = {
  label: "What CreatorOS does",
  pause: "Pause slideshow and video",
  play: "Play slideshow and video",
  next: "Next slide",
  autoplayNote: "This slideshow moves on by itself. Use the pause button to stop it.",
  slideOf: (index: number, total: number) => `${index} of ${total}`,
};

export const services = {
  index: "01",
  eyebrow: "Everything it does",
  heading: "From raw footage to your next video.",
  lead: `${name} is one loop: cut the video, finish it with your editor, learn from your channel, plan the next one. Each service shows its honest status.`,
  cards: [
    {
      id: "rough-cut",
      status: "first" as ServiceStatus,
      title: "AI rough cut",
      body: "Silences, filler words and retakes suggested as cuts on a transcript. You approve every one.",
      href: "#try-it",
    },
    {
      id: "captions",
      status: "first" as ServiceStatus,
      title: "Captions, chapters & titles",
      body: "Captions that follow your cut, plus chapters, a title, a description and thumbnail ideas.",
      href: "#features",
    },
    {
      id: "export",
      status: "first" as ServiceStatus,
      title: "Export to your editor",
      body: "Timelines for Premiere Pro, DaVinci Resolve and Final Cut Pro, linked to your originals.",
      href: "#features",
    },
    {
      id: "review",
      status: "beta" as ServiceStatus,
      title: "Editor review",
      body: "Editor and reviewer seats, comments on exact moments, and approvals in the browser.",
      href: "#features",
    },
    {
      id: "audit",
      status: "beta" as ServiceStatus,
      title: "Free Channel Audit",
      body: "Read-only insights from your own channel's results, each with its evidence.",
      href: "#channel-audit",
    },
    {
      id: "next",
      status: "beta" as ServiceStatus,
      title: "What to film next",
      body: "Ideas built on what worked for you, with a confidence level. You decide.",
      href: "#next-video",
    },
  ],
  /** The service switcher (a tour of the services, adobe.com-style tabs and stage). */
  switcher: {
    label: "Services",
    pause: "Pause the tour of the services",
    play: "Play the tour of the services",
    example: "Example",
    more: (title: string) => `More about ${title}`,
  },
  loopHeading: "The loop",
  loop: [
    { step: "Film", status: null },
    { step: "Cut", status: "first" as ServiceStatus },
    { step: "Review", status: "beta" as ServiceStatus },
    { step: "Export", status: "first" as ServiceStatus },
    { step: "Publish", status: "later" as ServiceStatus },
    { step: "Learn", status: "beta" as ServiceStatus },
    { step: "Next idea", status: "beta" as ServiceStatus },
  ],
};

export const audit = {
  index: "05",
  eyebrow: "Free Channel Audit · Beta",
  heading: "Your channel, explained with evidence.",
  lead: "Connect YouTube with read-only access. The Audit looks at your recent videos and compares each one with your own channel's usual results, never with other creators.",
  steps: [
    {
      title: "Connect read-only",
      body: "We can read your channel's videos and analytics, never upload or change anything. Remove access at any time in your Google Account.",
    },
    {
      title: "Compare you with you",
      body: "Your last 50 to 200 videos, measured against your channel's normal range at day 7 and day 28, so a new video isn't judged against an old one.",
    },
    {
      title: "Insights with evidence",
      body: "A handful of insights, each built from rules and numbers. The AI only explains the evidence; it doesn't invent it. Confidence is High, Medium or Low.",
    },
    {
      title: "You rate them",
      body: "Mark each insight Useful, Not useful, Already planned or Not relevant, so the next ones fit you better.",
    },
  ],
  free: "Included in the Free plan.",
  notItems: [
    "Not an analytics chatbot. YouTube Studio already has one, free.",
    "No comparisons with other creators' private data.",
    "No title or thumbnail A/B tests. YouTube does those for free.",
  ],
  preview: {
    label: "Preview with example data",
    shortLabel: "Example data",
    title: "Channel Audit",
    profileTitle: "Your channel, as we understand it",
    profile: [
      ["Niche", "Productivity tutorials"],
      ["Typical length", "14 min"],
      ["Cadence", "Weekly"],
      ["Language", "English"],
    ],
    profileActions: ["Looks good", "Edit"],
    chartTitle: "Views at day 28, against your usual range",
    chartNote: "Shaded band: your channel's usual range",
    insightsTitle: "Insights",
    insights: [
      {
        title: "Your longer tutorials keep viewers watching.",
        evidence:
          "Videos over 15 minutes: 46% average view percentage, against 38% across your channel (9 videos).",
        confidence: "High",
      },
      {
        title: "Planning videos beat gear videos on your channel.",
        evidence:
          "Topic “planning & systems”: 2.1× your usual day-28 views (6 videos). Topic “gear”: 0.7× (5 videos).",
        confidence: "Medium",
      },
      {
        title: "Long intros lose viewers early.",
        evidence:
          "On 5 of your last 8 videos with intros over 45 seconds, retention falls below 70% by 0:30.",
        confidence: "Low",
      },
    ],
    feedback: ["Useful", "Not useful", "Already planned", "Not relevant"],
    disclaimer:
      "Example data for illustration, not a real channel. The finished Audit may look different.",
  },
};

export const nextVideo = {
  index: "06",
  eyebrow: "What to film next · Beta",
  heading: "Start the next video with a better idea.",
  lead: "Recommendations come from what the Audit found on your channel, so every idea has a reason you can check. Accept one and it becomes the brief for your next recording.",
  points: [
    "Built on your own results, with the evidence shown.",
    "A confidence level (High, Medium or Low), never a made-up score.",
    "Accept, dismiss or mark as already planned. You stay in charge.",
    "Later: after you publish, see how the video did against your usual range.",
  ],
  preview: {
    label: "Preview with example data",
    shortLabel: "Example data",
    kicker: "Recommended next video",
    title: "How I plan a whole month of videos in one afternoon",
    why: "Why this idea",
    reasons: [
      "Planning videos get 2.1× your usual day-28 views (6 videos).",
      "Your tutorials over 15 minutes keep viewers longest (46% average view percentage).",
      "You haven't covered monthly planning in the last 90 days.",
    ],
    details: [
      ["Suggested length", "15–18 min"],
      ["Confidence", "Medium"],
      ["Based on", "Channel Audit, last 60 videos"],
    ],
    actions: ["Accept", "Already planned", "Dismiss"],
    outcome: "Later: once it's published, we link the video to this idea and show how it did.",
    disclaimer: "Example data for illustration, not a real channel.",
  },
};

export const roadmap = {
  index: "09",
  eyebrow: "Later",
  heading: "Where it goes after the beta.",
  lead: "Planned, not promised. Each one ships only when it works properly, and the order follows what beta creators ask for.",
  items: [
    {
      title: "Publish to YouTube",
      body: "Upload, captions and thumbnail from the app, private or scheduled by default. Only after Google's API audit passes.",
    },
    {
      title: "Shorts from long videos",
      body: "Suggested vertical clips from the moments that already work in your long video.",
    },
    {
      title: "B-roll suggestions",
      body: "Ideas for where a cutaway or screen recording would help a long talking stretch.",
    },
    {
      title: "Outcome tracking",
      body: "Each recommendation linked to the video it became, and how that video did against your usual range.",
    },
    {
      title: "Creator memory",
      body: "Your style, pacing and preferences remembered, so suggestions get closer to how you edit.",
    },
    {
      title: "Full-quality cloud render",
      body: "A finished MP4 without opening your editor, for the videos that don't need one.",
    },
  ],
};

export type MenuItem = {
  id: string;
  icon: ServiceIconName;
  title: string;
  body: string;
  status: ServiceStatus;
  href: string;
};

/** The pictogram for each service, by its id. */
export const serviceIcons: Record<string, ServiceIconName> = {
  "rough-cut": "rough-cut",
  captions: "captions",
  export: "export",
  review: "review",
  audit: "audit",
  next: "next",
};

/** The pictograms for the roadmap items, in the same order as roadmap.items. */
export const laterIcons: ServiceIconName[] = [
  "publish",
  "shorts",
  "broll",
  "outcomes",
  "memory",
  "render",
];

function serviceItem(id: string): MenuItem {
  const card = services.cards.find((item) => item.id === id);
  if (!card) throw new Error(`Product menu: unknown service "${id}"`);
  return { ...card, icon: serviceIcons[id] ?? "rough-cut", href: `/${card.href}` };
}

/**
 * Header "Product" menu, laid out like adobe.com's Products menu: areas on the left, cards on the
 * right. It lists only the services and roadmap items above, each with its honest status.
 */
export const productMenu = {
  label: "Product",
  areasLabel: "Product areas",
  all: { label: "See everything", href: "/#product" },
  areas: [
    {
      id: "featured",
      label: "Featured",
      items: ["rough-cut", "captions", "export", "review", "audit", "next"].map(serviceItem),
    },
    {
      id: "edit",
      label: "Edit faster",
      items: ["rough-cut", "captions", "export"].map(serviceItem),
    },
    { id: "team", label: "Work with your editor", items: ["review", "export"].map(serviceItem) },
    { id: "grow", label: "Grow your channel", items: ["audit", "next"].map(serviceItem) },
    {
      id: "later",
      label: "Coming later",
      items: roadmap.items.map((item, index): MenuItem => ({
        id: `later-${index}`,
        icon: laterIcons[index] ?? "publish",
        title: item.title,
        body: item.body,
        status: "later",
        href: "/#roadmap",
      })),
    },
  ],
};

export const stories = {
  label: "Who it's for",
  previous: "Previous story",
  next: "Next story",
  goTo: (index: number, total: number) => `Story ${index} of ${total}`,
  pause: "Pause stories",
  play: "Play stories",
  slides: [
    {
      key: "creator",
      eyebrow: "For creators who edit their own videos",
      heading: "You're the host, the crew and the editor. Hand off the slowest job.",
      body: "Talking-head videos, vlogs and explainers recorded on one camera.",
      imageAlt: "A creator recording a talking-head video in a home studio",
    },
    {
      key: "educator",
      eyebrow: "For educators and tutorial makers",
      heading: "Keep the explanation. Lose the restarts.",
      body: 'Courses, tutorials and screen recordings with a lot of "let me try that again".',
      imageAlt: "An educator recording a tutorial at a desk with a microphone",
    },
    {
      key: "editor",
      eyebrow: "For freelance video editors",
      heading: "Start every client project from a clean first pass.",
      body: "Spend your hours on the edit you're hired for, not on scrubbing raw footage.",
      imageAlt: "A freelance video editor working with headphones on",
    },
  ],
};

export const plans = {
  index: "07",
  eyebrow: "Plans",
  heading: "Priced by hours of raw footage.",
  lead: "Simple to understand: you pay for the footage you bring, not for credits. These are planned prices and may change before launch.",
  extra: "Extra footage: $3 an hour on any paid plan.",
  perMonth: "per month",
  footage: (amount: string) => `${amount} of raw footage a month`,
  items: [
    {
      name: "Free",
      price: "$0",
      footage: "30 minutes",
      points: ["1 seat", "Free Channel Audit included"],
    },
    {
      name: FOUNDING_OFFER.planName,
      price: `$${FOUNDING_OFFER.priceUsdPerMonth}`,
      footage: `${FOUNDING_OFFER.footageHoursPerMonth} hours`,
      points: ["1 seat", "Free Channel Audit included"],
      founding: true,
    },
    {
      name: "Pro",
      price: "$39",
      footage: "15 hours",
      points: ["2 seats: you and your editor", "Free Channel Audit included"],
    },
    {
      name: "Studio",
      price: "$99",
      footage: "40 hours",
      points: ["5 seats", "Up to 5 channels", "Free Channel Audit included"],
    },
  ],
  sameFeatures:
    "Every plan gets the same tools. Plans differ only in footage hours, seats and channels.",
  founding: {
    badge: "Founding pass",
    note: `Price locked for ${FOUNDING_OFFER.priceLockMonths} months for the first ${FOUNDING_OFFER.foundingSpots} founding creators.`,
  },
  disclaimer:
    "Nothing can be bought yet. Join the waitlist and we'll email you when founding pre-orders open. Refund terms come before you can pay anything.",
  cta: "Join the waitlist",
};
