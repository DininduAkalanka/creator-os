import { describe, expect, it } from "vitest";
import {
  CONFIDENCE_LEVELS,
  confidenceSchema,
  RECOMMENDATION_FEEDBACK_TYPES,
  recommendationFeedbackSchema,
  ROLES,
  roleSchema,
} from "./enums.js";

describe("plain enums", () => {
  it.each([
    ["roles (ADR-002)", ROLES, roleSchema, ["OWNER", "EDITOR", "REVIEWER"], "Role"],
    [
      "confidence (ADR-004: High / Medium / Low, never a percentage)",
      CONFIDENCE_LEVELS,
      confidenceSchema,
      ["HIGH", "MEDIUM", "LOW"],
      "Confidence",
    ],
    [
      "recommendation feedback (ADR-004)",
      RECOMMENDATION_FEEDBACK_TYPES,
      recommendationFeedbackSchema,
      ["USEFUL", "NOT_USEFUL", "ALREADY_PLANNED", "NOT_RELEVANT"],
      "RecommendationFeedback",
    ],
  ] as const)("%s", (_label, values, schema, expected, id) => {
    expect(values).toEqual(expected);
    for (const value of values) expect(schema.safeParse(value).success).toBe(true);
    expect(schema.safeParse("ADMIN").success).toBe(false);
    expect(schema.safeParse(82).success).toBe(false);
    expect(schema.meta()?.id).toBe(id);
  });
});
