/** Enums without a lifecycle. The database CHECKs must equal these lists (PLAN.md §3, §6). */
import { z } from "zod";

/** Membership roles in the MVP (ADR-002). REVIEWER can only comment and approve. */
export const ROLES = ["OWNER", "EDITOR", "REVIEWER"] as const;
export type Role = (typeof ROLES)[number];
export const roleSchema = z.enum(ROLES).meta({ id: "Role" });

/** Shown as High / Medium / Low from sample and effect size, never as a percentage (ADR-004). */
export const CONFIDENCE_LEVELS = ["HIGH", "MEDIUM", "LOW"] as const;
export type Confidence = (typeof CONFIDENCE_LEVELS)[number];
export const confidenceSchema = z.enum(CONFIDENCE_LEVELS).meta({ id: "Confidence" });

/** The creator's feedback on a recommendation, kept apart from its status (ADR-004). */
export const RECOMMENDATION_FEEDBACK_TYPES = [
  "USEFUL",
  "NOT_USEFUL",
  "ALREADY_PLANNED",
  "NOT_RELEVANT",
] as const;
export type RecommendationFeedback = (typeof RECOMMENDATION_FEEDBACK_TYPES)[number];
export const recommendationFeedbackSchema = z
  .enum(RECOMMENDATION_FEEDBACK_TYPES)
  .meta({ id: "RecommendationFeedback" });
