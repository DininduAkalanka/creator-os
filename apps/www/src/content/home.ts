/**
 * Home page copy (English). Kept apart from layout so it can be translated later (ADR-020).
 *
 * Voice: one creator talking to another. Plain, specific, a little tired of scrubbing timelines.
 * Every product claim must match an accepted ADR; anything not built yet is described as planned.
 * Sources: ADR-001 (scope), ADR-009 (YouTube access), ADR-014 (price), ADR-015 (media),
 * ADR-017 (we build no AI models of our own), ADR-020 (worldwide, English first).
 * Illustrations (the demo clip, the evening story, captions, chapters) are examples, labelled so.
 * Photos and videos are AI-generated and labelled on the page.
 */
import { BRAND } from "@/config/site";
import type { DemoSegment } from "@/lib/demo";

const name = BRAND.name;

export const hero = {
  eyebrow: "For creators still editing at midnight",
  /** Plain headline for metadata, social cards and screen readers. */
  headline: "Your raw recording, rough-cut and captioned in minutes.",
  /** The visual headline: the filler word is drawn struck out (hidden from screen readers). */
  headlineBefore: "Your raw recording,",
  headlineCut: "um,",
  headlineAfter: "rough-cut and captioned in minutes.",
  lead: `${name} marks every pause, filler word and retake. You decide what goes, then finish in the editor you already use.`,
  primaryCta: "Join early access",
  secondaryCta: "Try the demo",
  status: "In development. Free to join. No card needed.",
  exportLine: "Export to Premiere Pro, DaVinci Resolve or Final Cut Pro",
  exportsLabel: "Hands off to",
  apps: ["Premiere Pro", "DaVinci Resolve", "Final Cut Pro"],
};

export const story = {
  index: "02",
  eyebrow: "How it works",
  heading: "You know this night.",
  note: "An illustration of a typical evening. The times are an example, not a measured result.",
  before: {
    label: "The usual way",
    title: "Recording's done. Now the real work starts.",
    imageAlt: "A creator editing alone at a dim desk late at night",
    beats: [
      {
        time: "9:12 pm",
        text: "You stop recording. Fifty-two minutes of footage for a fourteen-minute video.",
      },
      {
        time: "10:40 pm",
        text: 'Still scrubbing. Every pause, every "so, basically", three versions of the intro.',
      },
      {
        time: "12:05 am",
        text: "Captions, chapters and a description still to write. Upload day is Thursday.",
      },
    ],
  },
  after: {
    label: `With ${name}`,
    title: "Same footage. A different evening.",
    imageAlt: "A tidy, empty studio desk in warm evening light, work finished",
    beats: [
      {
        tag: "In",
        text: "Drop in the file. Where possible only the audio is uploaded, and the video stays on your drive.",
      },
      {
        tag: "Review",
        text: "Read your video like a document. Strike what goes. Keep the pause you meant.",
      },
      {
        tag: "Out",
        text: "Open a tight timeline in Premiere Pro, DaVinci Resolve or Final Cut Pro, captions included, and start actually editing.",
      },
    ],
  },
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

export const tryIt = {
  index: "03",
  eyebrow: "Try it",
  heading: "This is the part you'd normally do by hand.",
  lead: "Here's a short clip with the cuts already suggested. Accept them all, or click any one to keep it. Nothing is gone until you say so.",
  points: [
    "Pauses, filler words and restarted takes are marked, not deleted.",
    "Keep any pause you left on purpose.",
    "Change your mind as often as you like.",
  ],
};

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

export const features = {
  index: "04",
  eyebrow: "What you get",
  heading: "Everything the first pass needs.",
  note: "Planned for the first release. We'll confirm the final list before early access opens. On-screen examples are illustrations.",
  blocks: {
    roughCut: {
      title: "Get to the rough cut, fast.",
      body: "Silences, filler words and false starts come back as suggested cuts on a transcript you can skim, instead of a timeline you have to scrub.",
      imageAlt: "A hand on a mouse in a dark room, a video editing timeline glowing on the screen",
    },
    captions: {
      title: "Captions that follow the cut.",
      body: "Cut a sentence and its caption goes with it. You get a caption file that matches your final timeline. English first.",
      lines: [
        "So here's how I plan a whole month of videos.",
        "The trick is to batch your ideas first.",
        "Then you script, film and edit in blocks.",
      ],
      timecode: "00:00:09:12",
    },
    handoff: {
      title: "Hand it to your editor. Or finish it yourself.",
      body: "Timelines for Premiere Pro, DaVinci Resolve and Final Cut Pro that point to your original footage, at full quality. Your editor can review and approve the cut in the browser.",
      imageAlt: "A creator and their editor reviewing a cut together on a laptop",
      files: ["timeline.fcpxml", "timeline.xml", "timeline.edl", "captions.srt"],
    },
    local: {
      title: "Your footage stays on your desk.",
      body: "Where possible only the audio is uploaded, so your 4K originals never leave your drive. If a full upload is ever needed, we delete the uploaded copy after 7 days.",
      imageAlt: "An external drive connected to a laptop next to a camera and a memory card",
      stays: "Original video",
      staysNote: "stays on your drive",
      goes: "Audio only",
      goesNote: "uploaded for the transcript",
    },
  },
  extrasHeading: "And the jobs nobody likes after the edit",
  chapters: {
    title: "Chapters, title and description",
    body: "Drafts based on what you actually said, ready for you to rewrite in your own words.",
    sample: [
      { time: "00:00", label: "Why plan a whole month" },
      { time: "01:12", label: "Batch your ideas first" },
      { time: "04:30", label: "Script, film and edit in blocks" },
    ],
  },
  thumbnails: {
    title: "Thumbnail ideas",
    body: "A few concepts and text options to brief your designer, or yourself.",
    sample: ["A month of videos in one day", "My planning spreadsheet", "Stop filming daily"],
  },
  notList: {
    heading: `What ${name} is not`,
    items: [
      "Not a full video editor. You finish in the editor you already use.",
      "Not an AI that makes videos for you. Every creative decision stays yours.",
    ],
  },
};

export const faq = {
  index: "08",
  eyebrow: "Questions",
  heading: "The questions we'd ask too.",
  lead: "Straight answers, including the uncomfortable ones.",
  privacyLink: "Read the privacy policy",
  items: [
    {
      q: "Will it make me sound robotic, with jump cuts everywhere?",
      a: "It only suggests cuts, and you see each one in context before anything changes. Keep any pause you meant for effect. How you smooth the cuts, with B-roll or a punch-in, stays in your editor.",
    },
    {
      q: "Do I have to upload my huge video file?",
      a: "No. Where possible, only the audio is uploaded and the video stays on your computer. If a full upload is needed, the uploaded copy is deleted after 7 days. You can delete your projects at any time.",
    },
    {
      q: "Will you train AI on my face or my voice?",
      a: `${name} doesn't build its own AI models; that's on our list of things we won't build. Your audio is processed by third-party speech-to-text and AI providers. The privacy policy will name every one of them, and what they may do with your data, before launch.`,
    },
    {
      q: "Do I have to stop using Premiere Pro, Resolve or Final Cut?",
      a: "No, that's the point. You export a timeline that opens in the editor you already use, linked to your original files.",
    },
    {
      q: "What is the Channel Audit, and is it free?",
      a: "It's a read-only look at your own channel: your recent videos compared with your channel's usual results, grouped by topic, with a handful of insights and the evidence behind each one. It's planned for the beta and included in the Free plan.",
    },
    {
      q: "Do you compare me with other creators?",
      a: "No. Insights compare your videos with your own channel's usual results. We don't build benchmarks from other creators' private analytics.",
    },
    {
      q: "Will it publish to YouTube for me?",
      a: "Not at first. Publishing comes after Google's API audit passes, and even then videos go up private or scheduled by default, never public without your confirmation.",
    },
    {
      q: "Do I need to connect my YouTube channel?",
      a: "Only for the Channel Audit and recommendations. The editor works with files from your computer. The connection is read-only, and you can remove access at any time in your Google Account settings.",
    },
    {
      q: "Which languages does it support?",
      a: "English at launch. Tell us the language you record in when you join. We'll add languages based on demand.",
    },
    {
      q: "What kind of videos does it work best on?",
      a: "Long videos with one main speaker on one camera: talking-head videos, tutorials, screen recordings and podcasts. Multi-camera shoots aren't supported at first.",
    },
    {
      q: "When can I use it, and can I cancel?",
      a: "We're building it now. Waitlist members get invited in small groups, founding creators first. Paid plans will be month to month, and you'll be able to cancel at any time. The full terms come before pre-orders open.",
    },
  ],
};

export const finalCta = {
  heading: "Get your evenings back.",
  lead: "Join the waitlist. We'll email you when early access and founding pre-orders open, and nothing else.",
  imageAlt: "",
};
