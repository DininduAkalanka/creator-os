/**
 * Home page copy (English). Kept apart from layout so it can be translated later (ADR-020).
 * Every claim here must match an accepted ADR. Anything not built yet is described as planned.
 * Sources: ADR-001 (scope), ADR-009 (YouTube access), ADR-014 (price), ADR-015 (media), ADR-020.
 * Illustrations (the demo clip, captions, chapters, comments) are examples, labelled as such.
 */
import { BRAND } from "@/config/site";
import { FOUNDING_OFFER } from "@/config/offer";
import type { DemoSegment } from "@/lib/demo";

const name = BRAND.name;
const offer = FOUNDING_OFFER;

export const hero = {
  eyebrow: "Early access · For long-form YouTube creators",
  /** Plain headline for metadata, social cards and screen readers. */
  headline: "Your raw recording, rough-cut and captioned in minutes.",
  /** The visual headline: the filler word is drawn struck out (hidden from screen readers). */
  headlineBefore: "Your raw recording,",
  headlineCut: "um,",
  headlineAfter: "rough-cut and captioned in minutes.",
  lead: `${name} finds the silences, filler words and bad takes, and suggests cutting them. You review every cut, then finish the edit in Premiere Pro, DaVinci Resolve or Final Cut Pro.`,
  primaryCta: "Join early access",
  secondaryCta: "See how it works",
  status: "In development. Free to join. No card needed.",
  exportLine: "Export to Premiere Pro, DaVinci Resolve or Final Cut Pro",
  exportsLabel: "Hands off to",
  apps: ["Premiere Pro", "DaVinci Resolve", "Final Cut Pro"],
};

const demoSegments: DemoSegment[] = [
  {
    id: "s1",
    kind: "speech",
    text: "Today I'm going to show you how I plan a whole month of videos",
    seconds: 5.6,
  },
  { id: "s2", kind: "pause", text: "4.2 s pause", seconds: 4.2 },
  {
    id: "s3",
    kind: "retake",
    text: "in one afternoon. Wait, let me start that again.",
    seconds: 3.8,
  },
  { id: "s4", kind: "speech", text: "in one afternoon, using a simple spreadsheet.", seconds: 3.1 },
  { id: "s5", kind: "filler", text: "Um, so, basically,", seconds: 1.9 },
  { id: "s6", kind: "speech", text: "the trick is to batch your ideas first.", seconds: 2.6 },
  { id: "s7", kind: "pause", text: "2.8 s pause", seconds: 2.8 },
  { id: "s8", kind: "speech", text: "Then you script, film and edit in blocks.", seconds: 3.0 },
];

export const demo = {
  label: "Interactive illustration, not the finished product",
  clipName: "month-planning-take-1.mov",
  heading: "Suggested cuts",
  transcriptHeading: "Transcript",
  timelineLabel: "Timeline. Select a suggested cut to keep or remove it.",
  acceptAll: "Accept all cuts",
  reset: "Start over",
  lengthLabel: "Clip length",
  kindLabels: { pause: "Pause", filler: "Filler", retake: "Retake" },
  /** Screen-reader name of each toggle, e.g. "Cut filler: Um, so, basically,". */
  cutPrefix: "Cut",
  status: (accepted: number, total: number, length: string) =>
    `${accepted} of ${total} suggested cuts accepted. Clip length ${length}.`,
  segments: demoSegments,
};

export const problem = {
  index: "01",
  eyebrow: "The problem",
  heading: "The first pass eats your week.",
  lead: "Before the real editing starts, someone has to scrub through the raw footage and cut out everything that shouldn't be there. For long videos, that takes hours, and it's the least creative part of the job.",
  timelineCaption: "Illustration: each mark is a pause, filler or retake to find and cut by hand.",
  points: [
    {
      title: "Hunting for silences",
      body: "Scrubbing the timeline for pauses and dead air, one by one.",
    },
    {
      title: "Cutting retakes by hand",
      body: "Finding the best take of every line you said three times.",
    },
    {
      title: "Extras after the edit",
      body: "Captions, chapters, a title and a description, all still to write.",
    },
  ],
};

export const steps = {
  index: "02",
  eyebrow: "How it works",
  heading: "Three steps. Every cut is your call.",
  items: [
    {
      tag: "In",
      title: "Add your recording",
      body: "Choose your raw file. Where possible, only the audio is uploaded and your original stays on your computer.",
    },
    {
      tag: "Review",
      title: "Review the suggested cuts",
      body: "Read your video as a transcript. Silences, filler words and repeated takes are marked. Accept or reject each one, or all at once.",
    },
    {
      tag: "Out",
      title: "Export to your editor",
      body: "Download a timeline for Premiere Pro, DaVinci Resolve or Final Cut Pro that links to your original files, plus captions. Finish the edit the way you always do.",
    },
  ],
};

export const features = {
  index: "03",
  eyebrow: "What you get",
  heading: "Everything the first pass needs.",
  note: "Planned for the first release. We'll confirm the final list before early access opens. Examples below are illustrations.",
  roughCut: {
    title: "A rough cut you approve",
    body: "Silences, filler words and bad takes are suggested as cuts. Nothing is removed until you say so.",
  },
  handoff: {
    title: "Hand-off to your editor",
    body: "Timelines that point to your original footage, at full quality.",
    files: ["timeline.fcpxml", "timeline.xml", "timeline.edl", "captions.srt"],
  },
  captions: {
    title: "Captions",
    body: "Caption files that follow your final cut. English first.",
    sample: "the trick is to batch your ideas first.",
    timecode: "00:00:09:12",
  },
  chapters: {
    title: "Chapters, title and description",
    body: "Drafts based on what you actually said, ready to edit.",
    sample: [
      { time: "00:00", label: "Why plan a whole month" },
      { time: "01:12", label: "Batch your ideas first" },
      { time: "04:30", label: "Script, film and edit in blocks" },
    ],
  },
  thumbnails: {
    title: "Thumbnail ideas",
    body: "Concepts and text options to brief your designer, or yourself.",
    sample: ["A month of videos in one day", "My planning spreadsheet", "Stop filming daily"],
  },
  review: {
    title: "Review with your team",
    body: "Invite an editor or a reviewer. They comment on and approve the cut in the browser.",
    comment: { role: "Editor", text: "Keeping the second take here, it's tighter." },
    reply: { role: "You", text: "Agreed. Approved." },
  },
  notList: {
    heading: `What ${name} is not`,
    items: [
      "Not a full video editor. You finish in the editor you already use.",
      "Not an AI that makes videos for you. Every creative decision stays yours.",
    ],
  },
};

export const audiences = {
  index: "04",
  eyebrow: "Who it's for",
  heading: "Built for long videos with one voice and one camera.",
  lead: "Talking-head videos, tutorials, screen recordings and podcasts.",
  items: [
    {
      title: "Creators who edit their own videos",
      body: "Skip the slowest part of the edit and spend the time on the parts viewers notice.",
    },
    {
      title: "Creators who work with an editor",
      body: "Send your editor a clean first pass instead of hours of raw footage.",
    },
    {
      title: "Freelance video editors",
      body: "Get through the first pass for each client faster, then do the work you're hired for.",
    },
  ],
};

export const foundingOffer = {
  index: "05",
  eyebrow: "Founding creator offer",
  heading: "Be one of the first fifty.",
  badge: "Planned",
  passLabel: "Founding pass",
  seats: `${offer.foundingSpots} seats`,
  planLabel: `${offer.planName} plan`,
  price: `$${offer.priceUsdPerMonth}`,
  pricePeriod: "per month",
  points: [
    `${offer.footageHoursPerMonth} hours of raw footage a month`,
    `Price locked for ${offer.priceLockMonths} months`,
    `For the first ${offer.foundingSpots} founding creators`,
    "Every feature in the first release",
  ],
  disclaimer:
    "Pre-orders aren't open yet. Join the waitlist and we'll email you when they open. The refund terms will be published before you can pay anything.",
  cta: "Join the waitlist",
};

export const dataHandling = {
  index: "06",
  eyebrow: "Your data",
  heading: "Your footage. Your channel. Your call.",
  lead: "What we plan to do with your files and accounts, in plain words. The privacy policy will give the full detail before launch.",
  privacyLink: "Read the privacy policy",
  items: [
    {
      title: "Your footage stays yours",
      body: "Where possible, only the audio is uploaded and your original files stay on your computer. If a full upload is needed, we delete the uploaded original after 7 days.",
    },
    {
      title: "YouTube access is optional",
      body: "The editor works with files from your computer and doesn't need your channel. Connecting YouTube will be optional and read-only. You can remove access at any time in your Google Account settings.",
    },
    {
      title: "Named providers",
      body: "Your audio is processed by third-party speech-to-text and AI providers. The privacy policy will name every one of them, and what they may do with your data, before launch.",
    },
  ],
};

export const faq = {
  index: "07",
  eyebrow: "Questions",
  heading: "Questions, answered.",
  items: [
    {
      q: "When can I use it?",
      a: "We're building it now. People on the waitlist will be invited in small groups, and founding creators come first.",
    },
    {
      q: "Which languages does it support?",
      a: "English at launch. Tell us the language you record in when you join. We'll add languages based on demand.",
    },
    {
      q: "Which editing apps can I export to?",
      a: "Adobe Premiere Pro, DaVinci Resolve and Final Cut Pro. You'll also be able to download a standard EDL and SRT caption files.",
    },
    {
      q: "What kind of videos does it work best on?",
      a: "Long videos with one main speaker on one camera: talking-head videos, tutorials, screen recordings and podcasts. Multi-camera shoots aren't supported at first.",
    },
    {
      q: "Do I need to connect my YouTube channel?",
      a: "No. The editor works with files from your computer. Connecting YouTube will be optional and read-only.",
    },
    {
      q: "What happens to my footage?",
      a: "Where possible, only the audio leaves your computer. If a full upload is needed, the uploaded original is deleted after 7 days. You can delete your projects at any time.",
    },
    {
      q: "Can I cancel?",
      a: "Yes. Paid plans will be month to month and you'll be able to cancel at any time. The full terms will be published before pre-orders open.",
    },
  ],
};

export const finalCta = {
  heading: "Get early access.",
  lead: "Join the waitlist. We'll email you when early access and founding pre-orders open, and nothing else.",
};
