import { describe, expect, it } from "vitest";
import { loadConfig, parsePort } from "./config.js";

describe("parsePort", () => {
  it("defaults to 4000 when API_PORT is unset or blank", () => {
    expect(parsePort(undefined)).toBe(4000);
    expect(parsePort("")).toBe(4000);
    expect(parsePort("   ")).toBe(4000);
  });

  it("accepts a whole port number", () => {
    expect(parsePort("4100")).toBe(4100);
    expect(parsePort("1")).toBe(1);
    expect(parsePort("65535")).toBe(65535);
  });

  it.each(["0", "65536", "-1", "4000.5", "40a", "0x50", "1e3", "four"])(
    'refuses "%s" instead of guessing',
    (value) => {
      expect(() => parsePort(value)).toThrow(/API_PORT/);
    },
  );
});

describe("loadConfig", () => {
  it("reads the port from the environment it is given", () => {
    expect(loadConfig({ API_PORT: "4200" })).toEqual({ port: 4200 });
  });
});
