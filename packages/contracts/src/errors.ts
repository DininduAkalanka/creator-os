/**
 * The error-code catalog and the error envelope (ADR-005). Every failure is
 * `{ error: { code, message, requestId, details? } }`, and the HTTP status comes from the code.
 *
 * - One code per error category in Doc 17 §51, plus INVALID_STATE_TRANSITION (AGENTS.md §4.4);
 *   each status is one of Doc 11 §11's.
 * - `message` is a plain English default for logs and fallbacks. The web app shows its own
 *   translated text per code (AGENTS.md §5), so never put secrets or personal data in a message.
 * - Feature codes (usage limits, idempotency keys, provider timeouts) arrive with the milestone
 *   that needs them, in their own contracts commit (AGENTS.md §4.2).
 */
import { z } from "zod";

export const ERROR_CODES = [
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
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export const ERROR_CATALOG = {
  BAD_REQUEST: { status: 400, message: "The request could not be read." },
  UNAUTHENTICATED: { status: 401, message: "Sign in to continue." },
  FORBIDDEN: { status: 403, message: "You don't have permission to do this." },
  NOT_FOUND: { status: 404, message: "We couldn't find what you asked for." },
  CONFLICT: { status: 409, message: "The request conflicts with the current data." },
  INVALID_STATE_TRANSITION: {
    status: 409,
    message: "This action isn't allowed in the current state.",
  },
  VALIDATION_FAILED: { status: 422, message: "Some fields are missing or invalid." },
  RATE_LIMITED: { status: 429, message: "Too many requests. Try again shortly." },
  INTERNAL_ERROR: { status: 500, message: "Something went wrong on our side." },
  PROVIDER_FAILED: { status: 502, message: "An outside service failed. Try again shortly." },
  SERVICE_UNAVAILABLE: {
    status: 503,
    message: "The service is temporarily unavailable. Try again shortly.",
  },
} as const satisfies Record<ErrorCode, { status: number; message: string }>;

export type ErrorStatus = (typeof ERROR_CATALOG)[ErrorCode]["status"];

export const errorCodeSchema = z.enum(ERROR_CODES).meta({
  id: "ErrorCode",
  description: "Machine-readable error code. The HTTP status follows from it (ADR-005).",
});

export const errorBodySchema = z.strictObject({
  code: errorCodeSchema,
  message: z.string().min(1),
  requestId: z.string().min(1),
  details: z.record(z.string(), z.unknown()).optional(),
});

export const errorEnvelopeSchema = z.strictObject({ error: errorBodySchema }).meta({
  id: "ErrorEnvelope",
  description: "Every error response: { error: { code, message, requestId, details? } }.",
});

export type ErrorBody = z.infer<typeof errorBodySchema>;
export type ErrorEnvelope = z.infer<typeof errorEnvelopeSchema>;

/** `details` of INVALID_STATE_TRANSITION: which machine refused which move. */
export const invalidStateTransitionDetailsSchema = z.strictObject({
  machine: z.string(),
  from: z.string(),
  to: z.string(),
});

export interface AppErrorOptions {
  /** Replaces the catalog's default message. Shown to clients: no secrets or personal data. */
  readonly message?: string;
  readonly details?: Readonly<Record<string, unknown>>;
  readonly cause?: unknown;
}

/** An error with a catalog code. The API turns it into the error envelope (M5). */
export class AppError extends Error {
  override readonly name = "AppError";
  readonly code: ErrorCode;
  readonly status: ErrorStatus;
  readonly details: Readonly<Record<string, unknown>> | undefined;

  constructor(code: ErrorCode, options: AppErrorOptions = {}) {
    const message = options.message ?? ERROR_CATALOG[code].message;
    super(message, options.cause === undefined ? undefined : { cause: options.cause });
    this.code = code;
    this.status = ERROR_CATALOG[code].status;
    this.details = options.details;
  }

  /** The error envelope for this error (ADR-005). */
  toEnvelope(requestId: string): ErrorEnvelope {
    return {
      error: {
        code: this.code,
        message: this.message,
        requestId,
        ...(this.details === undefined ? {} : { details: { ...this.details } }),
      },
    };
  }
}
