import { describe, expect, it } from "vitest";
import {
  CURSOR_MAX_LENGTH,
  cursorSchema,
  PAGE_LIMIT_DEFAULT,
  PAGE_LIMIT_MAX,
  pageMetaSchema,
  pageQuerySchema,
} from "./pagination.js";

describe("pageQuerySchema (query strings arrive as text)", () => {
  it("defaults to 20 per page (Doc 11 §77) with no cursor", () => {
    expect(PAGE_LIMIT_DEFAULT).toBe(20);
    expect(pageQuerySchema.parse({})).toEqual({ limit: 20 });
  });

  it("reads a limit and a cursor", () => {
    expect(pageQuerySchema.parse({ limit: "50", cursor: "eyJpZCI6IjAxOWEifQ" })).toEqual({
      limit: 50,
      cursor: "eyJpZCI6IjAxOWEifQ",
    });
    expect(pageQuerySchema.parse({ limit: "1" }).limit).toBe(1);
    expect(pageQuerySchema.parse({ limit: String(PAGE_LIMIT_MAX) }).limit).toBe(100);
  });

  it.each(["0", "-1", "101", "1.5", "abc", "", "Infinity", "NaN"])(
    "rejects the limit %j",
    (limit) => {
      expect(pageQuerySchema.safeParse({ limit }).success).toBe(false);
    },
  );

  it("rejects a repeated limit (?limit=1&limit=2)", () => {
    expect(pageQuerySchema.safeParse({ limit: ["1", "2"] }).success).toBe(false);
  });
});

describe("cursorSchema", () => {
  it("accepts an opaque base64url string up to the maximum length", () => {
    expect(cursorSchema.safeParse("abc-DEF_123").success).toBe(true);
    expect(cursorSchema.safeParse("a".repeat(CURSOR_MAX_LENGTH)).success).toBe(true);
  });

  it.each([
    ["empty", ""],
    ["too long", "a".repeat(CURSOR_MAX_LENGTH + 1)],
    ["padded base64", "YWJj=="],
    ["standard base64", "a+b/c"],
    ["a space", "abc def"],
    ["a path", "../etc/passwd"],
    ["non-Latin text", "名前"],
  ])("rejects a cursor with %s", (_label, cursor) => {
    expect(cursorSchema.safeParse(cursor).success).toBe(false);
    expect(pageQuerySchema.safeParse({ cursor }).success).toBe(false);
  });
});

describe("pageMetaSchema", () => {
  it("has nextCursor: a cursor, or null on the last page", () => {
    expect(pageMetaSchema.parse({ nextCursor: "abc" })).toEqual({ nextCursor: "abc" });
    expect(pageMetaSchema.parse({ nextCursor: null })).toEqual({ nextCursor: null });
    expect(pageMetaSchema.safeParse({}).success).toBe(false);
    expect(pageMetaSchema.safeParse({ nextCursor: null, total: 3 }).success).toBe(false);
  });
});
