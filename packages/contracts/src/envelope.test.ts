import { describe, expect, it } from "vitest";
import { z } from "zod";
import { dataEnvelope, pageEnvelope } from "./envelope.js";

const item = z.object({ title: z.string() });

describe("dataEnvelope (ADR-005)", () => {
  const schema = dataEnvelope(item);

  it("accepts { data, meta: {} }", () => {
    const body = { data: { title: "Cut the intro" }, meta: {} };
    expect(schema.parse(body)).toEqual(body);
  });

  it("accepts non-Latin and right-to-left text in data", () => {
    for (const title of ["مرحبا بالعالم", "שלום", "日本語のタイトル", "🎬 Episode 1"]) {
      expect(schema.safeParse({ data: { title }, meta: {} }).success).toBe(true);
    }
  });

  it.each([
    ["no meta", { data: { title: "x" } }],
    ["no data", { meta: {} }],
    ["Doc 11's superseded success flag", { success: true, data: { title: "x" }, meta: {} }],
    ["meta with unknown fields", { data: { title: "x" }, meta: { total: 3 } }],
    ["invalid data", { data: { title: 42 }, meta: {} }],
  ])("rejects a body with %s", (_label, body) => {
    expect(schema.safeParse(body).success).toBe(false);
  });
});

describe("pageEnvelope (ADR-005 with cursor pagination)", () => {
  const schema = pageEnvelope(item);

  it("accepts a page and the last page", () => {
    expect(schema.safeParse({ data: [{ title: "a" }], meta: { nextCursor: "abc" } }).success).toBe(
      true,
    );
    expect(schema.safeParse({ data: [], meta: { nextCursor: null } }).success).toBe(true);
  });

  it.each([
    ["an object as data", { data: { title: "a" }, meta: { nextCursor: null } }],
    ["an invalid item", { data: [{ title: 1 }], meta: { nextCursor: null } }],
    ["empty meta", { data: [], meta: {} }],
  ])("rejects a page with %s", (_label, body) => {
    expect(schema.safeParse(body).success).toBe(false);
  });
});
