import "reflect-metadata";
import { fileURLToPath } from "node:url";
import { Controller, Get, Injectable } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import ts from "typescript";
import { describe, expect, it } from "vitest";

/*
 * Guards the toolchain, not a feature. NestJS injects constructor dependencies using the type
 * metadata TypeScript emits for decorators. Two places must keep emitting it:
 * - the production build (tsc with tsconfig.build.json). Vitest emits the metadata whatever the
 *   tsconfig says (checked when this test was written), so a test run alone can't catch the
 *   build losing it; the first test reads the build's own settings instead.
 * - the test transformer, or every module test from M3 onwards breaks in confusing ways.
 */

describe("decorator metadata", () => {
  it("is switched on for the production build", () => {
    const configPath = fileURLToPath(new URL("../tsconfig.build.json", import.meta.url));
    const parsed = ts.getParsedCommandLineOfConfigFile(
      configPath,
      {},
      {
        ...ts.sys,
        onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
          throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
        },
      },
    );
    expect(parsed?.errors ?? []).toEqual([]);
    expect(parsed?.options.experimentalDecorators).toBe(true);
    expect(parsed?.options.emitDecoratorMetadata).toBe(true);
  });

  @Injectable()
  class Clock {
    now(): string {
      return "2026-01-01T00:00:00.000Z";
    }
  }

  @Controller()
  class ClockController {
    constructor(private readonly clock: Clock) {}

    @Get()
    time(): string {
      return this.clock.now();
    }
  }

  it("lets NestJS inject constructor dependencies in tests", async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ClockController],
      providers: [Clock],
    }).compile();
    expect(moduleRef.get(ClockController).time()).toBe("2026-01-01T00:00:00.000Z");
  });
});
