import { describe, expect, it } from "vitest";
import { AppError } from "./errors.js";
import { assertTransition, canTransition, type StateMachine } from "./state-machine.js";
import { STATE_MACHINES } from "./states.js";
import * as states from "./states.js";

/**
 * The expected lifecycles, written out independently of states.ts. A change to a transition map
 * must change this table in the same reviewed commit (Doc 11 §89). "ADR-004" edges follow the
 * order ADR-004 gives; the others come from the documented behaviour named next to them.
 */
const EXPECTED: Record<
  keyof typeof STATE_MACHINES,
  { name: string; states: string[]; edges: string[] }
> = {
  content: {
    name: "content",
    states: [
      "DRAFT",
      "PLANNING",
      "PRODUCING",
      "IN_REVIEW",
      "APPROVED",
      "PUBLISHING",
      "PUBLISHED",
      "ARCHIVED",
    ],
    edges: [
      "DRAFT>PLANNING", // ADR-004
      "PLANNING>PRODUCING", // ADR-004; the creator approves the plan (Implementation Plan Step 2.2)
      "PRODUCING>IN_REVIEW", // ADR-004
      "IN_REVIEW>APPROVED", // ADR-004; approve (Step 2.9)
      "IN_REVIEW>PRODUCING", // request changes or reject: the relevant steps run again (Step 2.9, Doc 19 §45-46)
      "APPROVED>PUBLISHING", // ADR-004 (Phase 2, behind youtube_publish)
      "APPROVED>ARCHIVED", // the MVP ends at APPROVED; exports live on export_jobs (ADR-004)
      "PUBLISHING>PUBLISHED", // ADR-004
      "PUBLISHED>ARCHIVED", // ADR-004
    ],
  },
  workflowRun: {
    name: "workflow_run",
    states: [
      "AWAITING_PLAN_APPROVAL",
      "QUEUED",
      "RUNNING",
      "WAITING_FOR_REVIEW",
      "COMPLETED",
      "FAILED",
      "CANCELLED",
    ],
    edges: [
      "AWAITING_PLAN_APPROVAL>QUEUED", // ADR-004; plan and cost estimate approved (Step 2.2)
      "AWAITING_PLAN_APPROVAL>CANCELLED", // cancel (Step 2.3, T2.1)
      "QUEUED>RUNNING", // ADR-004
      "QUEUED>CANCELLED",
      "RUNNING>WAITING_FOR_REVIEW", // ADR-004; a database state (ADR-008)
      "RUNNING>FAILED", // ADR-004; a step failed after its retries
      "RUNNING>CANCELLED",
      "WAITING_FOR_REVIEW>COMPLETED", // ADR-004
      "WAITING_FOR_REVIEW>QUEUED", // partial re-run during review (T2.1, Doc 19 §46)
      "WAITING_FOR_REVIEW>CANCELLED",
      "FAILED>QUEUED", // retry the failed step and continue (Doc 17 §83)
    ],
  },
  workflowStep: {
    name: "workflow_step",
    states: [
      "PENDING",
      "READY",
      "RUNNING",
      "WAITING_FOR_REVIEW",
      "SUCCEEDED",
      "FAILED",
      "SKIPPED",
      "CANCELLED",
      "STALE",
    ],
    edges: [
      "PENDING>READY", // its depends_on steps are done (Implementation Plan, data model v1)
      "PENDING>SKIPPED", // the template's conditions leave it out (Doc 17 §27)
      "PENDING>CANCELLED", // the run is cancelled (Step 2.3)
      "READY>RUNNING",
      "READY>SKIPPED",
      "READY>CANCELLED",
      "RUNNING>WAITING_FOR_REVIEW", // the output needs a person (ADR-008)
      "RUNNING>SUCCEEDED",
      "RUNNING>FAILED", // after retries with backoff (AGENTS.md §4.5)
      "RUNNING>CANCELLED",
      "WAITING_FOR_REVIEW>READY", // partial re-run of this step (T2.1)
      "WAITING_FOR_REVIEW>SUCCEEDED",
      "WAITING_FOR_REVIEW>CANCELLED",
      "WAITING_FOR_REVIEW>STALE", // an upstream step ran again (ADR-004)
      "SUCCEEDED>READY", // partial re-run of this step (T2.1)
      "SUCCEEDED>STALE", // an upstream step ran again (ADR-004, T2.1)
      "FAILED>READY", // retry (Doc 17 §83)
      "STALE>READY", // runs again once its upstream steps are done (T2.1)
      "STALE>CANCELLED",
    ],
  },
  approval: {
    name: "approval",
    states: ["PENDING", "APPROVED", "CHANGES_REQUESTED", "REJECTED"],
    // Approve, request changes or reject (Step 2.9). A decision is a record; a new round is a new
    // approval for the new content version (data model v1).
    edges: ["PENDING>APPROVED", "PENDING>CHANGES_REQUESTED", "PENDING>REJECTED"],
  },
  publication: {
    name: "publication",
    // Phase 2 (T4.3, behind youtube_publish). Review again before T4.3 uses it.
    states: [
      "DRAFT",
      "QUEUED",
      "UPLOADING",
      "PROCESSING",
      "SCHEDULED",
      "PUBLISHED",
      "FAILED",
      "CANCELLED",
    ],
    edges: [
      "DRAFT>QUEUED", // the creator confirms; never auto-publish (Doc 11 §55)
      "DRAFT>CANCELLED",
      "QUEUED>UPLOADING", // resumable upload (T4.3)
      "QUEUED>FAILED",
      "QUEUED>CANCELLED",
      "UPLOADING>PROCESSING",
      "UPLOADING>FAILED",
      "PROCESSING>SCHEDULED", // private or scheduled by default (Doc 26 §5.2)
      "PROCESSING>PUBLISHED",
      "PROCESSING>FAILED",
      "SCHEDULED>PUBLISHED",
      "FAILED>QUEUED", // retry with the same Idempotency-Key (Doc 11 §54, §56)
    ],
  },
  recommendation: {
    name: "recommendation",
    // Feedback and the measured outcome are separate records (ADR-004). Expiry: Doc 09 §30.
    states: ["NEW", "VIEWED", "ACCEPTED", "DISMISSED", "EXPIRED"],
    edges: [
      "NEW>VIEWED",
      "NEW>ACCEPTED",
      "NEW>DISMISSED",
      "NEW>EXPIRED",
      "VIEWED>ACCEPTED",
      "VIEWED>DISMISSED",
      "VIEWED>EXPIRED",
    ],
  },
  mediaAsset: {
    name: "media_asset",
    states: ["UPLOADING", "UPLOADED", "PROCESSING", "READY", "FAILED", "EXPIRED"],
    edges: [
      "UPLOADING>UPLOADED", // the upload completes (T2.3)
      "UPLOADING>FAILED", // the upload fails or is aborted
      "UPLOADED>PROCESSING", // ffprobe validation in the worker (Step 2.4)
      "PROCESSING>READY",
      "PROCESSING>FAILED", // invalid files are rejected (T2.3)
      "READY>EXPIRED", // retention: originals 7 days, proxies 30 days (ADR-015, Doc 26 §8.5)
    ],
  },
  editDecision: {
    name: "edit_decision",
    states: ["SUGGESTED", "ACCEPTED", "REJECTED"],
    edges: [
      "SUGGESTED>ACCEPTED", // accept per cut or all of a type (Doc 26 §5.1, T2.6)
      "SUGGESTED>REJECTED",
      "ACCEPTED>REJECTED", // the reviewer changes their mind; every decision persists (T2.6)
      "REJECTED>ACCEPTED",
    ],
  },
  exportJob: {
    name: "export_job",
    states: ["QUEUED", "RUNNING", "READY", "FAILED", "EXPIRED"],
    edges: [
      "QUEUED>RUNNING",
      "RUNNING>READY", // the file is built (T2.7)
      "RUNNING>FAILED", // after its retries; a new export is a new job
      "READY>EXPIRED", // past its expiry the file is deleted (data model v1)
    ],
  },
};

const machines = Object.entries(STATE_MACHINES) as [
  keyof typeof STATE_MACHINES,
  StateMachine<string>,
][];

function edgesOf(machine: StateMachine<string>): string[] {
  return machine.states.flatMap((from) =>
    (machine.transitions[from] ?? []).map((to) => `${from}>${to}`),
  );
}

describe("ADR-004 state machines", () => {
  it("covers every lifecycle in ADR-004", () => {
    expect(Object.keys(STATE_MACHINES).sort()).toEqual(Object.keys(EXPECTED).sort());
  });

  describe.each(machines)("%s", (key, machine) => {
    const expected = EXPECTED[key];

    it("has ADR-004's states, in ADR-004's order, and the table's name", () => {
      expect(machine.name).toBe(expected.name);
      expect(machine.states).toEqual(expected.states);
    });

    it("allows exactly the expected transitions", () => {
      expect(edgesOf(machine).sort()).toEqual([...expected.edges].sort());
      for (const edge of expected.edges) {
        const [from = "", to = ""] = edge.split(">");
        expect(() => assertTransition(machine, from, to)).not.toThrow();
      }
    });

    it("refuses every other pair of states, including staying put", () => {
      const allowed = new Set(expected.edges);
      for (const from of machine.states) {
        for (const to of machine.states) {
          if (allowed.has(`${from}>${to}`)) continue;
          expect(canTransition(machine, from, to)).toBe(false);
          expect(() => assertTransition(machine, from, to)).toThrow(AppError);
        }
      }
    });

    it("reaches every state from the first one", () => {
      const reached = new Set([machine.states[0]]);
      for (const state of reached)
        for (const next of machine.transitions[state] ?? []) reached.add(next);
      expect([...reached].sort()).toEqual([...machine.states].sort());
    });
  });

  // Samples of refused moves, with the rule each one protects.
  it.each([
    ["content", "DRAFT", "APPROVED", "nothing is approved without review"],
    ["content", "APPROVED", "PUBLISHED", "publishing goes through PUBLISHING"],
    ["content", "ARCHIVED", "DRAFT", "archiving is final until a reviewed change says otherwise"],
    [
      "workflowRun",
      "AWAITING_PLAN_APPROVAL",
      "RUNNING",
      "no run starts before the plan is approved and queued",
    ],
    ["workflowRun", "COMPLETED", "QUEUED", "a finished run does not reopen"],
    ["workflowRun", "CANCELLED", "QUEUED", "a cancelled run stays cancelled"],
    ["workflowStep", "PENDING", "RUNNING", "a step runs only once it is READY"],
    ["workflowStep", "STALE", "SUCCEEDED", "a stale result must run again"],
    ["workflowStep", "SKIPPED", "READY", "a skipped step stays skipped"],
    ["approval", "APPROVED", "REJECTED", "a recorded decision never changes"],
    ["publication", "DRAFT", "UPLOADING", "an upload is queued first"],
    ["recommendation", "DISMISSED", "ACCEPTED", "a dismissed recommendation stays dismissed"],
    ["mediaAsset", "EXPIRED", "READY", "a deleted file cannot come back"],
    ["editDecision", "ACCEPTED", "SUGGESTED", "a decision is never undone to a suggestion"],
    ["exportJob", "READY", "RUNNING", "a finished export is not rebuilt in place"],
  ] as const)("%s refuses %s -> %s: %s", (key, from, to, rule) => {
    const machine: StateMachine<string> = STATE_MACHINES[key];
    expect(() => assertTransition(machine, from, to), rule).toThrow(AppError);
  });
});

describe("status schemas", () => {
  it.each([
    ["contentStatusSchema", "CONTENT_STATUSES", "ContentStatus"],
    ["workflowRunStatusSchema", "WORKFLOW_RUN_STATUSES", "WorkflowRunStatus"],
    ["workflowStepStatusSchema", "WORKFLOW_STEP_STATUSES", "WorkflowStepStatus"],
    ["approvalStatusSchema", "APPROVAL_STATUSES", "ApprovalStatus"],
    ["publicationStatusSchema", "PUBLICATION_STATUSES", "PublicationStatus"],
    ["recommendationStatusSchema", "RECOMMENDATION_STATUSES", "RecommendationStatus"],
    ["mediaAssetStatusSchema", "MEDIA_ASSET_STATUSES", "MediaAssetStatus"],
    ["editDecisionStatusSchema", "EDIT_DECISION_STATUSES", "EditDecisionStatus"],
    ["exportJobStatusSchema", "EXPORT_JOB_STATUSES", "ExportJobStatus"],
  ] as const)("%s accepts %s only and is the %s component", (schemaKey, valuesKey, id) => {
    const schema = states[schemaKey];
    const values: readonly string[] = states[valuesKey];
    for (const value of values) expect(schema.safeParse(value).success).toBe(true);
    expect(schema.safeParse(values[0]?.toLowerCase()).success).toBe(false);
    expect(schema.safeParse("UNKNOWN").success).toBe(false);
    expect(schema.meta()?.id).toBe(id);
  });
});
