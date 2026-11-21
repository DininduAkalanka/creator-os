/**
 * Waitlist form rules. Pure, so the same code runs in tests and in the Server Action.
 * Error results are codes, not sentences: the words live in src/content (i18n-ready).
 */

export const EMAIL_MAX_LENGTH = 254;
export const CHANNEL_MAX_LENGTH = 200;
/** Longest raw value echoed back into the form after a submit. */
const ECHO_MAX_LENGTH = 300;

// Deliberately simple: one "@", no spaces, a dot in the domain. Delivery is proven later by the
// confirmation email (double opt-in), not by a regex.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// YouTube handles: 3–30 letters, digits, underscores, hyphens or periods.
const YOUTUBE_HANDLE_PATTERN = /^@[\p{L}\p{N}_.-]{3,30}$/u;

export const ROLES = ["solo-creator", "creator-with-editor", "editor"] as const;
export const VIDEOS_PER_MONTH = ["1", "2-4", "5-8", "9-plus"] as const;
export const EDITING_HOURS = ["under-1", "1-3", "4-6", "7-10", "over-10"] as const;
export const LANGUAGES = ["en", "es", "pt", "fr", "de", "ar", "other"] as const;

export type Role = (typeof ROLES)[number];
export type VideosPerMonth = (typeof VIDEOS_PER_MONTH)[number];
export type EditingHours = (typeof EDITING_HOURS)[number];
export type Language = (typeof LANGUAGES)[number];

export const WAITLIST_FIELDS = [
  "email",
  "consent",
  "role",
  "channel",
  "videosPerMonth",
  "editingHours",
  "language",
] as const;
export type WaitlistField = (typeof WAITLIST_FIELDS)[number];

export type WaitlistErrorCode =
  "email_required" | "email_invalid" | "consent_required" | "channel_invalid" | "option_invalid";

/** Raw values as they arrive from the form. Any field may be missing or of the wrong type. */
export type WaitlistInput = Partial<Record<WaitlistField, unknown>>;
export type WaitlistFieldErrors = Partial<Record<WaitlistField, WaitlistErrorCode>>;

export interface WaitlistEntry {
  email: string;
  role: Role | null;
  channel: string | null;
  videosPerMonth: VideosPerMonth | null;
  editingHours: EditingHours | null;
  language: Language | null;
}

export type WaitlistValidation =
  { ok: true; value: WaitlistEntry } | { ok: false; errors: WaitlistFieldErrors };

/** What the form shows after a submit. Values are echoed back so nothing has to be retyped. */
export type WaitlistFormValues = Partial<Record<WaitlistField, string>>;
export type WaitlistFormState =
  | { status: "idle" }
  | { status: "invalid"; errors: WaitlistFieldErrors; values: WaitlistFormValues }
  | { status: "not_open"; values: WaitlistFormValues };

export function readWaitlistForm(formData: FormData): WaitlistInput {
  const input: WaitlistInput = {};
  for (const field of WAITLIST_FIELDS) input[field] = formData.get(field);
  return input;
}

export function echoWaitlistValues(input: WaitlistInput): WaitlistFormValues {
  const values: WaitlistFormValues = {};
  for (const field of WAITLIST_FIELDS) {
    const raw = input[field];
    if (typeof raw === "string" && raw.length > 0) values[field] = raw.slice(0, ECHO_MAX_LENGTH);
  }
  return values;
}

export function validateWaitlistInput(input: WaitlistInput): WaitlistValidation {
  const errors: WaitlistFieldErrors = {};

  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  if (email.length === 0) {
    errors.email = "email_required";
  } else if (email.length > EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(email)) {
    errors.email = "email_invalid";
  }

  if (input.consent !== "on") errors.consent = "consent_required";

  const channel = normaliseChannel(input.channel);
  if (channel === undefined) errors.channel = "channel_invalid";

  const role = pickOption(input.role, ROLES);
  if (role === undefined) errors.role = "option_invalid";
  const videosPerMonth = pickOption(input.videosPerMonth, VIDEOS_PER_MONTH);
  if (videosPerMonth === undefined) errors.videosPerMonth = "option_invalid";
  const editingHours = pickOption(input.editingHours, EDITING_HOURS);
  if (editingHours === undefined) errors.editingHours = "option_invalid";
  const language = pickOption(input.language, LANGUAGES);
  if (language === undefined) errors.language = "option_invalid";

  if (
    Object.keys(errors).length > 0 ||
    channel === undefined ||
    role === undefined ||
    videosPerMonth === undefined ||
    editingHours === undefined ||
    language === undefined
  ) {
    return { ok: false, errors };
  }
  return { ok: true, value: { email, role, channel, videosPerMonth, editingHours, language } };
}

/** Optional select: null when not answered, undefined when the value is not on the list. */
function pickOption<T extends string>(raw: unknown, options: readonly T[]): T | null | undefined {
  if (raw === null || raw === undefined || raw === "") return null;
  if (typeof raw !== "string") return undefined;
  return options.find((option) => option === raw);
}

/**
 * Optional channel link. Accepts a URL with or without "https://", or a YouTube handle
 * such as "@name". Returns null when empty and undefined when invalid.
 */
function normaliseChannel(raw: unknown): string | null | undefined {
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== "string") return undefined;
  const value = raw.trim();
  if (value.length === 0) return null;
  if (value.length > CHANNEL_MAX_LENGTH) return undefined;
  if (YOUTUBE_HANDLE_PATTERN.test(value)) return `https://www.youtube.com/${value}`;

  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  if (!URL.canParse(withScheme)) return undefined;
  const url = new URL(withScheme);
  if (!url.hostname.includes(".") || /\s/.test(value)) return undefined;
  return url.toString();
}
