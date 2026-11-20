import { describe, expect, it } from "vitest";
import { EMAIL_MAX_LENGTH, validateWaitlistInput } from "./waitlist";

describe("validateWaitlistInput", () => {
  it("accepts a valid email with consent, trimmed and lower-cased", () => {
    expect(validateWaitlistInput({ email: "  Creator@Example.COM ", consent: "on" })).toEqual({
      ok: true,
      value: { email: "creator@example.com" },
    });
  });

  it("requires consent", () => {
    const result = validateWaitlistInput({ email: "creator@example.com", consent: null });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.consent).toBeDefined();
      expect(result.errors.email).toBeUndefined();
    }
  });

  it.each([
    ["empty", ""],
    ["missing @", "creator.example.com"],
    ["missing domain dot", "creator@example"],
    ["contains a space", "crea tor@example.com"],
    ["two @", "a@b@example.com"],
  ])("rejects an invalid email (%s)", (_label, email) => {
    const result = validateWaitlistInput({ email, consent: "on" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.email).toBeDefined();
  });

  it("rejects an email longer than the maximum", () => {
    const email = `${"a".repeat(EMAIL_MAX_LENGTH)}@example.com`;
    expect(validateWaitlistInput({ email, consent: "on" }).ok).toBe(false);
  });

  it("treats a non-string email (e.g. a file upload) as empty", () => {
    const result = validateWaitlistInput({ email: new Blob(["x"]), consent: "on" });
    expect(result.ok).toBe(false);
  });

  it("accepts international characters in the local part", () => {
    expect(validateWaitlistInput({ email: "josé.müller@example.de", consent: "on" }).ok).toBe(true);
  });
});
