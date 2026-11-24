import { describe, expect, it } from "vitest";
import { AppError } from "./errors.js";
import { assertTransition, canTransition, defineStateMachine } from "./state-machine.js";

const LIGHTS = ["GREEN", "AMBER", "RED", "OFF"] as const;
type Light = (typeof LIGHTS)[number];

const light = defineStateMachine("light", LIGHTS, {
  GREEN: ["AMBER", "OFF"],
  AMBER: ["RED"],
  RED: ["GREEN"],
  OFF: [],
});

/** Runtime values (for example read from a database) that aren't states of the machine. */
const notAState = (value: string) => value as Light;

describe("defineStateMachine", () => {
  it("returns a frozen machine", () => {
    expect(light.name).toBe("light");
    expect(light.states).toEqual(LIGHTS);
    expect(Object.isFrozen(light)).toBe(true);
    expect(Object.isFrozen(light.states)).toBe(true);
    expect(Object.isFrozen(light.transitions)).toBe(true);
    expect(Object.isFrozen(light.transitions.GREEN)).toBe(true);
  });

  it("refuses duplicate states", () => {
    expect(() => defineStateMachine("bad", ["A", "A"], { A: [] })).toThrow(
      "bad: states must be unique.",
    );
  });

  it("refuses a transition map entry for an unknown state", () => {
    const transitions = { A: [], B: [] } as { A: [] };
    expect(() => defineStateMachine("bad", ["A"], transitions)).toThrow(
      'bad: the transition map names unknown state "B".',
    );
  });

  it("refuses a state without a transition map entry", () => {
    const transitions = { A: [] } as unknown as { A: []; B: [] };
    expect(() => defineStateMachine("bad", ["A", "B"], transitions)).toThrow(
      'bad: state "B" has no transition map entry.',
    );
  });

  it("refuses a move to an unknown state", () => {
    const transitions = { A: ["C"] } as unknown as { A: [] };
    expect(() => defineStateMachine("bad", ["A"], transitions)).toThrow(
      'bad: "A" moves to unknown state "C".',
    );
  });

  it("refuses a move to the same state", () => {
    expect(() => defineStateMachine("bad", ["A"], { A: ["A"] })).toThrow(
      'bad: "A" cannot move to itself.',
    );
  });

  it("refuses a target listed twice", () => {
    expect(() => defineStateMachine("bad", ["A", "B"], { A: ["B", "B"], B: [] })).toThrow(
      'bad: "A" lists "B" twice.',
    );
  });
});

describe("canTransition", () => {
  it("allows only the listed moves", () => {
    expect(canTransition(light, "GREEN", "AMBER")).toBe(true);
    expect(canTransition(light, "RED", "GREEN")).toBe(true);
    expect(canTransition(light, "GREEN", "RED")).toBe(false);
    expect(canTransition(light, "AMBER", "AMBER")).toBe(false);
    expect(canTransition(light, "OFF", "GREEN")).toBe(false);
  });

  it.each(["__proto__", "constructor", "toString", "hasOwnProperty", "green", ""])(
    "returns false for the non-state %j instead of throwing",
    (value) => {
      expect(canTransition(light, notAState(value), "GREEN")).toBe(false);
      expect(canTransition(light, "GREEN", notAState(value))).toBe(false);
    },
  );
});

describe("assertTransition", () => {
  it("passes for a listed move", () => {
    expect(() => assertTransition(light, "GREEN", "OFF")).not.toThrow();
  });

  it("throws INVALID_STATE_TRANSITION (409) with the machine, from and to", () => {
    let thrown: unknown;
    try {
      assertTransition(light, "OFF", "GREEN");
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(AppError);
    const error = thrown as AppError;
    expect(error.code).toBe("INVALID_STATE_TRANSITION");
    expect(error.status).toBe(409);
    expect(error.message).toBe("light cannot move from OFF to GREEN.");
    expect(error.details).toEqual({ machine: "light", from: "OFF", to: "GREEN" });
  });

  it("throws an AppError, not a TypeError, for a non-state read at runtime", () => {
    expect(() => assertTransition(light, notAState("__proto__"), "GREEN")).toThrow(AppError);
  });
});
