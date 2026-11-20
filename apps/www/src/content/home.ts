/**
 * Home page copy (English). Kept apart from layout so it can be translated later (ADR-020).
 * Every claim here must match an accepted ADR. Anything not built yet is described as planned.
 * Sources: ADR-001 (scope), ADR-009 (YouTube access), ADR-014 (price), ADR-015 (media), ADR-020.
 */
import { BRAND } from "@/config/site";
import { FOUNDING_OFFER } from "@/config/offer";

const name = BRAND.name;
const offer = FOUNDING_OFFER;

export const hero = {
  eyebrow: "For long-form YouTube creators",
  headline: "Your raw recording, rough-cut and captioned in minutes.",
  lead: `${name} removes silences, filler words and bad takes, then hands a clean timeline to Premiere Pro, DaVinci Resolve or Final Cut Pro. You review every cut. You finish the edit.`,
  primaryCta: "Join early access",
  secondaryCta: "See how it works",
  status: "In development. Free to join. No card needed.",
  exportLine: "Export to Premiere Pro, DaVinci Resolve or Final Cut Pro",
};

export const illustration = {
  label: "Illustration of the review screen, not the finished product",
  title: "Suggested cuts",
  legendRemoved: "Suggested cut",
  legendKept: "Kept",
  lines: [
    {
      time: "00:12",
      parts: [
        { text: "So, um, ", cut: true },
        { text: "today I'm going to show you how I plan a whole month of videos", cut: false },
      ],
    },
    { time: "00:19", parts: [{ text: "[pause, 4.2 seconds]", cut: true }] },
    {
      time: "00:23",
      parts: [{ text: "in one afternoon. Wait, let me start that again.", cut: true }],
    },
    {
      time: "00:31",
      parts: [{ text: "in one afternoon, using a simple spreadsheet.", cut: false }],
    },
  ],
  summary: "3 cuts suggested · 9.8 seconds removed",
};

export const problem = {
  heading: "The first pass eats your week",
  lead: "Before the real editing starts, someone has to scrub through the raw footage and cut out everything that shouldn't be there. For long videos, that takes hours, and it's the least creative part of the job.",
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
  heading: "How it works",
  items: [
    {
      title: "Add your recording",
      body: "Choose your raw file. Where possible, only the audio is uploaded and your original stays on your computer.",
    },
    {
      title: "Review the suggested cuts",
      body: "Read your video as a transcript. Silences, filler words and repeated takes are marked. Accept or reject each one, or all at once.",
    },
    {
      title: "Export to your editor",
      body: "Download a timeline for Premiere Pro, DaVinci Resolve or Final Cut Pro that links to your original files, plus captions. Finish the edit the way you always do.",
    },
  ],
};

export const features = {
  heading: "What you get",
  note: "Planned for the first release. We'll confirm the final list before early access opens.",
  items: [
    {
      title: "A rough cut you approve",
      body: "Silences, filler words and bad takes are suggested as cuts. Nothing is removed until you say so.",
    },
    {
      title: "Hand-off to your editor",
      body: "FCPXML, Premiere XML and EDL exports that point to your original footage, at full quality.",
    },
    {
      title: "Captions",
      body: "Caption files (SRT) that follow your final cut. English first.",
    },
    {
      title: "Chapters, title and description",
      body: "Drafts based on what you actually said, ready for you to edit.",
    },
    {
      title: "Thumbnail ideas",
      body: "Concepts and text options to brief your designer, or yourself.",
    },
    {
      title: "Review with your team",
      body: "Invite an editor or a reviewer. They can comment on and approve the cut in the browser.",
    },
  ],
  notList: {
    heading: `What ${name} is not`,
    items: [
      "Not a full video editor. You finish in the editor you already use.",
      "Not an AI that makes videos for you. Every creative decision stays yours.",
    ],
  },
};

export const audiences = {
  heading: "Who it's for",
  lead: "Built for long talking-head videos, tutorials, screen recordings and podcasts recorded on one camera.",
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
  heading: "Founding creator offer",
  badge: "Planned",
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
  heading: "Your footage and your channel",
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
  heading: "Questions",
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
  heading: "Get early access",
  lead: "Join the waitlist. We'll email you when early access and founding pre-orders open, and nothing else.",
};
