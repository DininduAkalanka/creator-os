/** Validation for the waitlist form. Pure, so it runs the same in tests and in the Server Action. */

export const EMAIL_MAX_LENGTH = 254;

// Deliberately simple: one "@", no spaces, a dot in the domain. Delivery is proven later by the
// confirmation email (double opt-in), not by a regex.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface WaitlistFieldErrors {
  email?: string;
  consent?: string;
}

export type WaitlistValidation =
  | { ok: true; value: { email: string } }
  | { ok: false; errors: WaitlistFieldErrors };

/**
 * @param email  raw value of the "email" field
 * @param consent raw value of the "consent" checkbox: "on" when ticked, null when not
 */
export function validateWaitlistInput(input: { email: unknown; consent: unknown }): WaitlistValidation {
  const errors: WaitlistFieldErrors = {};
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";

  if (email.length === 0) {
    errors.email = "Enter your email address.";
  } else if (email.length > EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address, like name@example.com.";
  }

  if (input.consent !== "on") {
    errors.consent = "Please confirm you agree to receive early-access emails.";
  }

  if (errors.email || errors.consent) return { ok: false, errors };
  return { ok: true, value: { email } };
}
