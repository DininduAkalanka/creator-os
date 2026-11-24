/**
 * @creatoros/contracts: the one source of the state enums and transition maps (ADR-004), the
 * error catalog and response envelopes (ADR-005), cursor pagination, IDs (ADR-022) and the OpenAPI
 * helpers. Imports nothing internal (AGENTS.md §3). Change it in its own commit, before the code
 * that uses it (AGENTS.md §4.2).
 */
export * from "./envelope.js";
export * from "./enums.js";
export * from "./errors.js";
export * from "./ids.js";
export * from "./openapi.js";
export * from "./pagination.js";
export * from "./state-machine.js";
export * from "./states.js";
