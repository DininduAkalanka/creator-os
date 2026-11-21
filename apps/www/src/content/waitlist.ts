/** Waitlist form copy (English). Option values come from src/lib/waitlist.ts. */
import type {
  EditingHours,
  Language,
  Role,
  VideosPerMonth,
  WaitlistErrorCode,
} from "@/lib/waitlist";

export const waitlistCopy = {
  emailLabel: "Email",
  emailPlaceholder: "you@example.com",
  optionalLegend: "Optional: helps us invite the right people first",
  notAnswered: "Choose one",
  roleLabel: "Which describes you best?",
  channelLabel: "Your channel",
  channelHint: "A link or your @handle",
  videosLabel: "Long videos you publish a month",
  hoursLabel: "Hours you spend editing one video",
  languageLabel: "Main language of your videos",
  consentBefore: "Email me about early access and founding pre-orders. I've read the ",
  consentLink: "privacy policy",
  consentAfter: ". I can unsubscribe at any time.",
  submit: "Join the waitlist",
  submitting: "Sending…",
  errorSummary: "Please fix the highlighted fields.",
  notOpen:
    "Thanks! Sign-ups aren't open yet, so we haven't saved your details. Please come back soon.",
};

export const roleLabels: Record<Role, string> = {
  "solo-creator": "I make and edit my own videos",
  "creator-with-editor": "I make videos and work with an editor",
  editor: "I edit videos for creators",
};

export const videosPerMonthLabels: Record<VideosPerMonth, string> = {
  "1": "1 or fewer",
  "2-4": "2 to 4",
  "5-8": "5 to 8",
  "9-plus": "9 or more",
};

export const editingHoursLabels: Record<EditingHours, string> = {
  "under-1": "Under 1 hour",
  "1-3": "1 to 3 hours",
  "4-6": "4 to 6 hours",
  "7-10": "7 to 10 hours",
  "over-10": "More than 10 hours",
};

export const languageLabels: Record<Language, string> = {
  en: "English",
  es: "Spanish",
  pt: "Portuguese",
  fr: "French",
  de: "German",
  ar: "Arabic",
  other: "Another language",
};

export const errorMessages: Record<WaitlistErrorCode, string> = {
  email_required: "Enter your email address.",
  email_invalid: "Enter a valid email address, like name@example.com.",
  consent_required: "Tick the box to confirm you want early-access emails.",
  channel_invalid: "Enter a link like youtube.com/@name, or just @name.",
  option_invalid: "Choose an option from the list.",
};
