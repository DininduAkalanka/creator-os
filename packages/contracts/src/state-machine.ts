/**
 * State machines (ADR-004, AGENTS.md §4.4). Every state change goes through `assertTransition`,
 * which refuses any move its machine's transition map doesn't list.
 *
 * - A move to the same state is never a transition. Handle repeated deliveries with idempotency,
 *   not with a self-loop.
 * - The check is the rule, not the lock. The UPDATE that applies a move must also require the old
 *   state (`WHERE status = <from>`), so two workers can't both move one row (Doc 22 §101).
 */
import { AppError } from "./errors.js";

export interface StateMachine<S extends string> {
  /** The machine's name in errors and logs: the table's singular name, such as `workflow_run`. */
  readonly name: string;
  readonly states: readonly [S, ...S[]];
  /** For each state, the states it may move to. A state with no moves is final. */
  readonly transitions: { readonly [K in S]: readonly S[] };
}

/** Checks and freezes a transition map. A malformed map throws when the module loads. */
export function defineStateMachine<const S extends string>(
  name: string,
  states: readonly [S, ...S[]],
  transitions: { readonly [K in S]: readonly S[] },
): StateMachine<S> {
  const known = new Set<string>(states);
  if (known.size !== states.length) throw new Error(`${name}: states must be unique.`);
  for (const source of Object.keys(transitions)) {
    if (!known.has(source)) {
      throw new Error(`${name}: the transition map names unknown state "${source}".`);
    }
  }
  for (const state of states) {
    if (!Object.hasOwn(transitions, state)) {
      throw new Error(`${name}: state "${state}" has no transition map entry.`);
    }
    const targets = transitions[state];
    for (const [index, target] of targets.entries()) {
      if (!known.has(target))
        throw new Error(`${name}: "${state}" moves to unknown state "${target}".`);
      if (target === state) throw new Error(`${name}: "${state}" cannot move to itself.`);
      if (targets.indexOf(target) !== index)
        throw new Error(`${name}: "${state}" lists "${target}" twice.`);
    }
    Object.freeze(targets);
  }
  return Object.freeze({
    name,
    states: Object.freeze(states),
    transitions: Object.freeze(transitions),
  });
}

/** Whether `from` may move to `to`. False, not an exception, for values that aren't states. */
export function canTransition<S extends string>(machine: StateMachine<S>, from: S, to: S): boolean {
  return Object.hasOwn(machine.transitions, from) && machine.transitions[from].includes(to);
}

/** Throws INVALID_STATE_TRANSITION (HTTP 409) unless `from` may move to `to`. */
export function assertTransition<S extends string>(machine: StateMachine<S>, from: S, to: S): void {
  if (canTransition(machine, from, to)) return;
  throw new AppError("INVALID_STATE_TRANSITION", {
    message: `${machine.name} cannot move from ${from} to ${to}.`,
    details: { machine: machine.name, from, to },
  });
}
