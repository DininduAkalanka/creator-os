/**
 * Cursor pagination (ADR-005). A client sends `?cursor=&limit=` and gets `meta.nextCursor` back,
 * which is null on the last page.
 *
 * - The cursor is opaque: only the API reads it, and its encoding may change between releases.
 *   It is base64url text, so it is safe in URLs and logs.
 * - Pages hold 20 items by default (the examples in Doc 11 §77 and Doc 17 §74), and at most 100,
 *   so one request can't read a whole table.
 * - No total count: counting every row on each page is slow on large tables.
 */
import { z } from "zod";

export const PAGE_LIMIT_DEFAULT = 20;
export const PAGE_LIMIT_MAX = 100;
export const CURSOR_MAX_LENGTH = 512;

export const cursorSchema = z
  .string()
  .min(1)
  .max(CURSOR_MAX_LENGTH)
  .regex(/^[A-Za-z0-9_-]+$/, "Must be a cursor returned by the previous page.")
  .meta({ id: "Cursor", description: "Opaque. Send back the nextCursor of the previous page." });

export const pageQuerySchema = z.object({
  cursor: cursorSchema.optional(),
  limit: z.coerce.number().int().min(1).max(PAGE_LIMIT_MAX).default(PAGE_LIMIT_DEFAULT),
});

export type PageQuery = z.infer<typeof pageQuerySchema>;

export const pageMetaSchema = z.strictObject({ nextCursor: cursorSchema.nullable() }).meta({
  id: "PageMeta",
  description: "nextCursor is null on the last page.",
});

export type PageMeta = z.infer<typeof pageMetaSchema>;
