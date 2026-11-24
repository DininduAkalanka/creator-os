import { describe, expect, it } from "vitest";
import {
  AppError,
  ERROR_CATALOG,
  ERROR_CODES,
  errorCodeSchema,
  errorEnvelopeSchema,
  invalidStateTransitionDetailsSchema,
} from "./errors.js";

// The HTTP error statuses in Doc 11 §11. Every code must use one of them.
const DOC_11_ERROR_STATUSES = [400, 401, 403, 404, 409, 422, 429, 500, 502, 503];

const validBody = { code: "NOT_FOUND", message: "Not here.", requestId: "req_1" };

describe("error catalog", () => {
  it("is exactly this list, one code per Doc 17 §51 category plus state transitions", () => {
    // Changing the catalog changes the public API: update this list in the same reviewed commit.
    expect(ERROR_CODES).toEqual([
      "BAD_REQUEST",
      "UNAUTHENTICATED",
      "FORBIDDEN",
      "NOT_FOUND",
      "CONFLICT",
      "INVALID_STATE_TRANSITION",
      "VALIDATION_FAILED",
      "RATE_LIMITED",
      "INTERNAL_ERROR",
      "PROVIDER_FAILED",
      "SERVICE_UNAVAILABLE",
    ]);
    expect(Object.keys(ERROR_CATALOG)).toEqual(ERROR_CODES);
  });

  it.each(ERROR_CODES)("%s is UPPER_SNAKE with a Doc 11 status and a plain message", (code) => {
    const { status, message } = ERROR_CATALOG[code];
    expect(code).toMatch(/^[A-Z]+(_[A-Z]+)*$/);
    expect(DOC_11_ERROR_STATUSES).toContain(status);
    expect(message).toMatch(/^[A-Z].{8,100}\.$/);
  });

  it("maps the documented statuses", () => {
    expect(ERROR_CATALOG.VALIDATION_FAILED.status).toBe(422);
    expect(ERROR_CATALOG.INVALID_STATE_TRANSITION.status).toBe(409);
    expect(ERROR_CATALOG.PROVIDER_FAILED.status).toBe(502);
  });

  it("validates codes", () => {
    for (const code of ERROR_CODES) expect(errorCodeSchema.parse(code)).toBe(code);
    expect(errorCodeSchema.safeParse("not_found").success).toBe(false);
    expect(errorCodeSchema.safeParse("NOPE").success).toBe(false);
  });
});

describe("AppError", () => {
  it("takes its status and default message from the catalog", () => {
    const error = new AppError("NOT_FOUND");
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.name).toBe("AppError");
    expect(error.code).toBe("NOT_FOUND");
    expect(error.status).toBe(404);
    expect(error.message).toBe(ERROR_CATALOG.NOT_FOUND.message);
    expect(error.details).toBeUndefined();
    expect("cause" in error).toBe(false);
  });

  it("keeps a custom message, details and cause", () => {
    const cause = new Error("socket hang up");
    const error = new AppError("PROVIDER_FAILED", {
      message: "Transcription failed.",
      details: { provider: "stt" },
      cause,
    });
    expect(error.message).toBe("Transcription failed.");
    expect(error.details).toEqual({ provider: "stt" });
    expect(error.cause).toBe(cause);
  });

  it("builds a valid error envelope", () => {
    const envelope = new AppError("RATE_LIMITED").toEnvelope("req_42");
    expect(errorEnvelopeSchema.parse(envelope)).toEqual(envelope);
    expect(envelope).toEqual({
      error: {
        code: "RATE_LIMITED",
        message: ERROR_CATALOG.RATE_LIMITED.message,
        requestId: "req_42",
      },
    });
    expect("details" in envelope.error).toBe(false);
  });

  it("copies details into the envelope", () => {
    const details = { machine: "content", from: "DRAFT", to: "APPROVED" };
    const envelope = new AppError("INVALID_STATE_TRANSITION", { details }).toEnvelope("req_7");
    expect(envelope.error.details).toEqual(details);
    expect(envelope.error.details).not.toBe(details);
    expect(invalidStateTransitionDetailsSchema.parse(envelope.error.details)).toEqual(details);
  });
});

describe("error envelope (ADR-005)", () => {
  it("accepts { error: { code, message, requestId, details? } }", () => {
    expect(errorEnvelopeSchema.safeParse({ error: validBody }).success).toBe(true);
    const withDetails = { error: { ...validBody, details: { resource: "content" } } };
    expect(errorEnvelopeSchema.safeParse(withDetails).success).toBe(true);
  });

  it("rejects Doc 11's superseded { success, error } shape", () => {
    expect(errorEnvelopeSchema.safeParse({ success: false, error: validBody }).success).toBe(false);
  });

  it.each([
    ["no requestId", { code: "NOT_FOUND", message: "Not here." }],
    ["an empty requestId", { ...validBody, requestId: "" }],
    ["an empty message", { ...validBody, message: "" }],
    ["an unknown code", { ...validBody, code: "TEAPOT" }],
    ["an extra field", { ...validBody, stack: "at foo()" }],
    ["array details", { ...validBody, details: ["x"] }],
  ])("rejects an error with %s", (_label, body) => {
    expect(errorEnvelopeSchema.safeParse({ error: body }).success).toBe(false);
  });
});
