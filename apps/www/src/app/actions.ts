"use server";

import {
  echoWaitlistValues,
  readWaitlistForm,
  validateWaitlistInput,
  type WaitlistFormState,
} from "@/lib/waitlist";

export async function joinWaitlist(
  _previous: WaitlistFormState,
  formData: FormData,
): Promise<WaitlistFormState> {
  const input = readWaitlistForm(formData);
  const values = echoWaitlistValues(input);
  const result = validateWaitlistInput(input);
  if (!result.ok) return { status: "invalid", errors: result.errors, values };

  // Saving a sign-up needs the waitlist table and a confirmation email (double opt-in). Both wait
  // for schema approval (docs/engineering/PROGRESS.md). Until they exist, nothing is stored and
  // the visitor is told so; never report a sign-up that didn't happen. When storage lands, set
  // FEATURES.waitlistStorage in src/config/site.ts in the same change.
  return { status: "not_open", values };
}
