/**
 * The canonical states (ADR-004) and their transition maps. Database CHECKs, the API and the UI
 * all use these lists (AGENTS.md §4.4).
 *
 * ADR-004 gives each lifecycle's order. Moves outside that order come from documented behaviour
 * (cancel, retry, request changes, partial re-run, retention), noted beside them. Anything else is
 * refused until a reviewed contracts change adds it (Doc 11 §89). The full tables, with sources,
 * are in docs/engineering/CONTRACTS.md.
 */
import { z } from "zod";
import { defineStateMachine } from "./state-machine.js";

/** Content: one video (ADR-003). */
export const CONTENT_STATUSES = [
  "DRAFT",
  "PLANNING",
  "PRODUCING",
  "IN_REVIEW",
  "APPROVED",
  "PUBLISHING",
  "PUBLISHED",
  "ARCHIVED",
] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];
export const contentStatusSchema = z.enum(CONTENT_STATUSES).meta({ id: "ContentStatus" });
export const contentMachine = defineStateMachine("content", CONTENT_STATUSES, {
  DRAFT: ["PLANNING"],
  PLANNING: ["PRODUCING"],
  PRODUCING: ["IN_REVIEW"],
  // Request changes or reject: the relevant steps run again (Implementation Plan Step 2.9).
  IN_REVIEW: ["APPROVED", "PRODUCING"],
  // PUBLISHING is Phase 2. In the MVP an approved, exported content is archived from here.
  APPROVED: ["PUBLISHING", "ARCHIVED"],
  PUBLISHING: ["PUBLISHED"],
  PUBLISHED: ["ARCHIVED"],
  ARCHIVED: [],
});

export const WORKFLOW_RUN_STATUSES = [
  "AWAITING_PLAN_APPROVAL",
  "QUEUED",
  "RUNNING",
  "WAITING_FOR_REVIEW",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
] as const;
export type WorkflowRunStatus = (typeof WORKFLOW_RUN_STATUSES)[number];
export const workflowRunStatusSchema = z
  .enum(WORKFLOW_RUN_STATUSES)
  .meta({ id: "WorkflowRunStatus" });
export const workflowRunMachine = defineStateMachine("workflow_run", WORKFLOW_RUN_STATUSES, {
  AWAITING_PLAN_APPROVAL: ["QUEUED", "CANCELLED"],
  QUEUED: ["RUNNING", "CANCELLED"],
  RUNNING: ["WAITING_FOR_REVIEW", "FAILED", "CANCELLED"],
  // QUEUED: a partial re-run during review (T2.1).
  WAITING_FOR_REVIEW: ["COMPLETED", "QUEUED", "CANCELLED"],
  COMPLETED: [],
  // Retry the failed step, then continue (Doc 17 §83).
  FAILED: ["QUEUED"],
  CANCELLED: [],
});

export const WORKFLOW_STEP_STATUSES = [
  "PENDING",
  "READY",
  "RUNNING",
  "WAITING_FOR_REVIEW",
  "SUCCEEDED",
  "FAILED",
  "SKIPPED",
  "CANCELLED",
  "STALE",
] as const;
export type WorkflowStepStatus = (typeof WORKFLOW_STEP_STATUSES)[number];
export const workflowStepStatusSchema = z
  .enum(WORKFLOW_STEP_STATUSES)
  .meta({ id: "WorkflowStepStatus" });
export const workflowStepMachine = defineStateMachine("workflow_step", WORKFLOW_STEP_STATUSES, {
  // SKIPPED: the template's conditions leave the step out (Doc 17 §27).
  PENDING: ["READY", "SKIPPED", "CANCELLED"],
  READY: ["RUNNING", "SKIPPED", "CANCELLED"],
  // FAILED only after the job's retries with backoff (AGENTS.md §4.5).
  RUNNING: ["WAITING_FOR_REVIEW", "SUCCEEDED", "FAILED", "CANCELLED"],
  // READY: this step runs again. STALE: an upstream step ran again (T2.1).
  WAITING_FOR_REVIEW: ["READY", "SUCCEEDED", "CANCELLED", "STALE"],
  SUCCEEDED: ["READY", "STALE"],
  FAILED: ["READY"],
  SKIPPED: [],
  CANCELLED: [],
  // Runs again once its upstream steps are done.
  STALE: ["READY", "CANCELLED"],
});

export const APPROVAL_STATUSES = ["PENDING", "APPROVED", "CHANGES_REQUESTED", "REJECTED"] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];
export const approvalStatusSchema = z.enum(APPROVAL_STATUSES).meta({ id: "ApprovalStatus" });
// A decision is a record. A new review round is a new approval for the new content version.
export const approvalMachine = defineStateMachine("approval", APPROVAL_STATUSES, {
  PENDING: ["APPROVED", "CHANGES_REQUESTED", "REJECTED"],
  APPROVED: [],
  CHANGES_REQUESTED: [],
  REJECTED: [],
});

/** Publishing to YouTube: Phase 2, behind the `youtube_publish` flag. Review again in T4.3. */
export const PUBLICATION_STATUSES = [
  "DRAFT",
  "QUEUED",
  "UPLOADING",
  "PROCESSING",
  "SCHEDULED",
  "PUBLISHED",
  "FAILED",
  "CANCELLED",
] as const;
export type PublicationStatus = (typeof PUBLICATION_STATUSES)[number];
export const publicationStatusSchema = z
  .enum(PUBLICATION_STATUSES)
  .meta({ id: "PublicationStatus" });
export const publicationMachine = defineStateMachine("publication", PUBLICATION_STATUSES, {
  // QUEUED only when the creator confirms: never publish automatically (Doc 11 §55).
  DRAFT: ["QUEUED", "CANCELLED"],
  QUEUED: ["UPLOADING", "FAILED", "CANCELLED"],
  UPLOADING: ["PROCESSING", "FAILED"],
  PROCESSING: ["SCHEDULED", "PUBLISHED", "FAILED"],
  SCHEDULED: ["PUBLISHED"],
  PUBLISHED: [],
  // Retry with the same Idempotency-Key (Doc 11 §54, §56).
  FAILED: ["QUEUED"],
  CANCELLED: [],
});

/** Feedback and the measured outcome are kept separately (ADR-004). */
export const RECOMMENDATION_STATUSES = [
  "NEW",
  "VIEWED",
  "ACCEPTED",
  "DISMISSED",
  "EXPIRED",
] as const;
export type RecommendationStatus = (typeof RECOMMENDATION_STATUSES)[number];
export const recommendationStatusSchema = z
  .enum(RECOMMENDATION_STATUSES)
  .meta({ id: "RecommendationStatus" });
export const recommendationMachine = defineStateMachine("recommendation", RECOMMENDATION_STATUSES, {
  // Acting on a recommendation implies the creator saw it, so NEW may skip VIEWED.
  NEW: ["VIEWED", "ACCEPTED", "DISMISSED", "EXPIRED"],
  VIEWED: ["ACCEPTED", "DISMISSED", "EXPIRED"],
  ACCEPTED: [],
  DISMISSED: [],
  EXPIRED: [],
});

/** An uploaded file: audio, proxy or original (ADR-015). */
export const MEDIA_ASSET_STATUSES = [
  "UPLOADING",
  "UPLOADED",
  "PROCESSING",
  "READY",
  "FAILED",
  "EXPIRED",
] as const;
export type MediaAssetStatus = (typeof MEDIA_ASSET_STATUSES)[number];
export const mediaAssetStatusSchema = z.enum(MEDIA_ASSET_STATUSES).meta({ id: "MediaAssetStatus" });
export const mediaAssetMachine = defineStateMachine("media_asset", MEDIA_ASSET_STATUSES, {
  UPLOADING: ["UPLOADED", "FAILED"],
  // PROCESSING: ffprobe validation in the worker (Implementation Plan Step 2.4).
  UPLOADED: ["PROCESSING"],
  PROCESSING: ["READY", "FAILED"],
  // Retention: originals 7 days, proxies 30 days (ADR-015, Doc 26 §8.5).
  READY: ["EXPIRED"],
  FAILED: [],
  EXPIRED: [],
});

/** One suggested cut in an edit decision list. */
export const EDIT_DECISION_STATUSES = ["SUGGESTED", "ACCEPTED", "REJECTED"] as const;
export type EditDecisionStatus = (typeof EDIT_DECISION_STATUSES)[number];
export const editDecisionStatusSchema = z
  .enum(EDIT_DECISION_STATUSES)
  .meta({ id: "EditDecisionStatus" });
export const editDecisionMachine = defineStateMachine("edit_decision", EDIT_DECISION_STATUSES, {
  SUGGESTED: ["ACCEPTED", "REJECTED"],
  // The reviewer may change their mind; every decision persists (T2.6).
  ACCEPTED: ["REJECTED"],
  REJECTED: ["ACCEPTED"],
});

export const EXPORT_JOB_STATUSES = ["QUEUED", "RUNNING", "READY", "FAILED", "EXPIRED"] as const;
export type ExportJobStatus = (typeof EXPORT_JOB_STATUSES)[number];
export const exportJobStatusSchema = z.enum(EXPORT_JOB_STATUSES).meta({ id: "ExportJobStatus" });
export const exportJobMachine = defineStateMachine("export_job", EXPORT_JOB_STATUSES, {
  QUEUED: ["RUNNING"],
  // FAILED after the job's retries. A new export is a new job.
  RUNNING: ["READY", "FAILED"],
  // Past its expiry, the file is deleted.
  READY: ["EXPIRED"],
  FAILED: [],
  EXPIRED: [],
});

/** Every ADR-004 machine, for tests and for the database's enum-parity checks (M3). */
export const STATE_MACHINES = {
  content: contentMachine,
  workflowRun: workflowRunMachine,
  workflowStep: workflowStepMachine,
  approval: approvalMachine,
  publication: publicationMachine,
  recommendation: recommendationMachine,
  mediaAsset: mediaAssetMachine,
  editDecision: editDecisionMachine,
  exportJob: exportJobMachine,
} as const;
