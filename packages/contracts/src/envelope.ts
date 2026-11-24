/**
 * The success envelope (ADR-005): `{ data, meta }`, and the HTTP status says it succeeded. A single
 * resource has an empty `meta`; a list has the page meta. Both are strict, so a stray field (such
 * as Doc 11's superseded `success` flag) fails the contract tests. Errors: see errors.ts.
 */
import { z } from "zod";
import { pageMetaSchema } from "./pagination.js";

export const emptyMetaSchema = z.strictObject({});

/** `{ data: <schema>, meta: {} }` for one resource. */
export function dataEnvelope<T extends z.ZodType>(data: T) {
  return z.strictObject({ data, meta: emptyMetaSchema });
}

/** `{ data: <schema>[], meta: { nextCursor } }` for one page of a list. */
export function pageEnvelope<T extends z.ZodType>(item: T) {
  return z.strictObject({ data: z.array(item), meta: pageMetaSchema });
}
