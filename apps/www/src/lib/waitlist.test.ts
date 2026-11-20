import { describe, expect, it } from "vitest";
import {
  CHANNEL_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  echoWaitlistValues,
  readWaitlistForm,
  validateWaitlistInput,
} from "./waitlist";

const valid = { email: "creator@example.com", consent: "on" };

describe("validateWaitlistInput", () => {
  it("accepts email and consent alone, trimmed and lower-cased", () => {
    expect(validateWaitlistInput({ email: "  Creator@Example.COM ", consent: "on" })).toEqual({
      ok: true,
      value: {
        email: "creator@example.com",
        role: null,
        channel: null,
        videosPerMonth: null,
        editingHours: null,
        language: null,
      },
    });
  });

  it("accepts every optional answer", () => {
    const result = validateWaitlistInput({
      ...valid,
      role: "creator-with-editor",
      channel: "https://www.youtube.com/@example",
      videosPerMonth: "2-4",
      editingHours: "4-6",
      language: "es",
    });
    expect(result).toEqual({
      ok: true,
      value: {
        email: "creator@example.com",
        role: "creator-with-editor",
        channel: "https://www.youtube.com/@example",
        videosPerMonth: "2-4",
        editingHours: "4-6",
        language: "es",
      },
    });
  });

  it("requires consent", () => {
    const result = validateWaitlistInput({ email: "creator@example.com", consent: null });
    expect(result).toEqual({ ok: false, errors: { consent: "consent_required" } });
  });

  it("asks for an email when it is empty", () => {
    const result = validateWaitlistInput({ email: "   ", consent: "on" });
    expect(result).toEqual({ ok: false, errors: { email: "email_required" } });
  });

  it.each([
    ["missing @", "creator.example.com"],
    ["missing domain dot", "creator@example"],
    ["contains a space", "crea tor@example.com"],
    ["two @", "a@b@example.com"],
  ])("rejects an invalid email (%s)", (_label, email) => {
    expect(validateWaitlistInput({ email, consent: "on" })).toEqual({
      ok: false,
      errors: { email: "email_invalid" },
    });
  });

  it("rejects an email longer than the maximum", () => {
    const email = `${"a".repeat(EMAIL_MAX_LENGTH)}@example.com`;
    expect(validateWaitlistInput({ email, consent: "on" }).ok).toBe(false);
  });

  it("treats a non-string email (e.g. a file upload) as empty", () => {
    const result = validateWaitlistInput({ email: new Blob(["x"]), consent: "on" });
    expect(result).toEqual({ ok: false, errors: { email: "email_required" } });
  });

  it("accepts international characters in the local part", () => {
    expect(validateWaitlistInput({ email: "josé.müller@example.de", consent: "on" }).ok).toBe(true);
  });

  it("rejects an option that is not on the list", () => {
    const result = validateWaitlistInput({ ...valid, role: "admin", language: "xx" });
    expect(result).toEqual({
      ok: false,
      errors: { role: "option_invalid", language: "option_invalid" },
    });
  });

  it("reports every invalid field at once", () => {
    const result = validateWaitlistInput({ email: "", consent: null, editingHours: "lots" });
    expect(result).toEqual({
      ok: false,
      errors: {
        email: "email_required",
        consent: "consent_required",
        editingHours: "option_invalid",
      },
    });
  });
});

describe("channel link", () => {
  function channelOf(channel: unknown) {
    const result = validateWaitlistInput({ ...valid, channel });
    return result.ok ? result.value.channel : result.errors.channel;
  }

  it.each([
    ["a full URL", "https://www.youtube.com/@example", "https://www.youtube.com/@example"],
    ["a URL without a scheme", "youtube.com/@example", "https://youtube.com/@example"],
    ["a YouTube handle", "@example", "https://www.youtube.com/@example"],
    ["a handle with non-Latin letters", "@créateur", "https://www.youtube.com/@créateur"],
    ["surrounding spaces", "  @example  ", "https://www.youtube.com/@example"],
  ])("accepts %s", (_label, input, expected) => {
    expect(channelOf(input)).toBe(expected);
  });

  it.each([
    ["empty", ""],
    ["missing", null],
  ])("treats %s as not answered", (_label, input) => {
    expect(channelOf(input)).toBeNull();
  });

  it.each([
    ["no dot in the host", "localhost"],
    ["spaces inside", "my channel.com"],
    ["too long", `https://example.com/${"a".repeat(CHANNEL_MAX_LENGTH)}`],
    ["a file upload", new Blob(["x"])],
  ])("rejects %s", (_label, input) => {
    expect(channelOf(input)).toBe("channel_invalid");
  });
});

describe("readWaitlistForm and echoWaitlistValues", () => {
  it("reads every field and echoes only non-empty strings", () => {
    const form = new FormData();
    form.set("email", "creator@example.com");
    form.set("consent", "on");
    form.set("channel", "");
    form.set("role", new Blob(["x"]));

    const input = readWaitlistForm(form);
    expect(input.email).toBe("creator@example.com");
    expect(input.language).toBeNull();
    expect(echoWaitlistValues(input)).toEqual({ email: "creator@example.com", consent: "on" });
  });

  it("caps the length of echoed values", () => {
    const echoed = echoWaitlistValues({ email: "a".repeat(10_000) });
    expect(echoed.email?.length).toBe(300);
  });
});
