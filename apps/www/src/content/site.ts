/** Site-wide copy (English): metadata, navigation, footer and notices. */
import { BRAND } from "@/config/site";

const name = BRAND.name;

export const siteCopy = {
  titleDefault: `${name}: rough cuts for YouTube creators`,
  description:
    "Turn long YouTube recordings into a clean rough cut in minutes. Silences, filler words and retakes are suggested as cuts, with captions, and exported to Premiere Pro, DaVinci Resolve or Final Cut Pro.",
  skipLink: "Skip to content",
  nav: {
    label: "Main",
    howItWorks: "How it works",
    tryIt: "Try it",
    features: "Features",
    offer: "Founding offer",
    faq: "Questions",
    cta: "Join early access",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
  footer: {
    statement: "Spend your time on the edit, not the first pass.",
    cta: "Join early access",
    tagline: "AI first-pass editing for long-form YouTube creators.",
    legalHeading: "Legal",
    companyHeading: "Company",
    privacy: "Privacy policy",
    terms: "Terms",
    about: "About and contact",
    workingName: `${name} is a working name and may change before launch.`,
    trademarks: `YouTube is a trademark of Google LLC. Premiere Pro is a trademark of Adobe. DaVinci Resolve is a trademark of Blackmagic Design. Final Cut Pro is a trademark of Apple Inc. ${name} is not affiliated with or endorsed by any of them.`,
  },
  preview: {
    label: "Preview notice",
    lead: "Preview site, not launched yet.",
    summary: (count: number) => `${count} ${count === 1 ? "item" : "items"} left before launch`,
  },
  draft: {
    heading: "Draft",
    body: "This text has not yet been reviewed by a lawyer. Details shown as [to be added] are still missing.",
  },
  missing: "[to be added]",
  video: {
    pause: "Pause background video",
    play: "Play background video",
  },
  /** Shown on every AI-generated photo or video (EU AI Act Art. 50 transparency; honesty). */
  aiGenerated: "AI-generated image",
  aiGeneratedVideo: "AI-generated video",
  notFound: {
    heading: "Page not found",
    body: "The page you're looking for doesn't exist or has moved.",
    back: "Go to the home page",
  },
};
