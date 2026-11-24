import { describe, expect, it } from "vitest";
import { idSchema, newId } from "./ids.js";

describe("newId", () => {
  it("returns a lower-case UUID v7", () => {
    const id = newId();
    expect(idSchema.parse(id)).toBe(id);
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it("encodes the creation time in its first 48 bits", () => {
    const before = Date.now();
    const id = newId();
    const after = Date.now();
    const millis = Number.parseInt(id.replaceAll("-", "").slice(0, 12), 16);
    expect(millis).toBeGreaterThanOrEqual(before);
    expect(millis).toBeLessThanOrEqual(after);
  });

  it("is unique and strictly increasing within a process, even in the same millisecond", () => {
    const ids = Array.from({ length: 10_000 }, () => newId());
    // Unique and already in sorted order means strictly increasing.
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual(ids);
  });
});

describe("idSchema", () => {
  it("has a valid example and is the Id component", () => {
    const meta = idSchema.meta();
    expect(meta?.id).toBe("Id");
    expect(idSchema.safeParse(meta?.example).success).toBe(true);
  });

  it("accepts upper case, which RFC 9562 allows on input", () => {
    expect(idSchema.safeParse(newId().toUpperCase()).success).toBe(true);
  });

  it.each([
    ["a UUID v4", "3f1c2b9e-1a2b-4c3d-8e9f-0a1b2c3d4e5f"],
    ["the nil UUID", "00000000-0000-0000-0000-000000000000"],
    ["the max UUID", "ffffffff-ffff-ffff-ffff-ffffffffffff"],
    ["a wrong variant", "019ab8c2-5d4e-7f10-1a2b-3c4d5e6f7a8b"],
    ["braces", "{019ab8c2-5d4e-7f10-8a2b-3c4d5e6f7a8b}"],
    ["no dashes", "019ab8c25d4e7f108a2b3c4d5e6f7a8b"],
    ["a prefixed ID", "content_123"],
    ["an empty string", ""],
  ])("rejects %s", (_label, value) => {
    expect(idSchema.safeParse(value).success).toBe(false);
  });
});
