/**
 * Turns the contracts into an OpenAPI 3.1 document (ADR-005: zod schemas generate the spec and the
 * typed client). Shared schemas carry their component names in zod's own `.meta({ id })`, so zod's
 * prototype is never patched (no `extendZodWithOpenApi`). A component appears once a route that
 * uses it is registered. The API registers its routes and serves the document (M5).
 */
import {
  OpenApiGeneratorV31,
  type OpenAPIRegistry,
  type ResponseConfig,
  type ZodContentObject,
} from "@asteasolutions/zod-to-openapi";
import type { z } from "zod";
import { ERROR_CATALOG, ERROR_CODES, errorEnvelopeSchema, type ErrorStatus } from "./errors.js";

/** Every route lives under this path (ADR-005). */
export const API_BASE_PATH = "/api/v1";

/** A JSON body: `content` for a request body or a response. */
export function jsonContent(schema: z.ZodType): ZodContentObject {
  return { "application/json": { schema } };
}

/** Error responses for a route: each status returns the error envelope and lists its codes. */
export function errorResponses(statuses: readonly ErrorStatus[]): Record<string, ResponseConfig> {
  return Object.fromEntries(
    statuses.map((status) => {
      const codes = ERROR_CODES.filter((code) => ERROR_CATALOG[code].status === status);
      return [
        String(status),
        { description: `Error: ${codes.join(", ")}`, content: jsonContent(errorEnvelopeSchema) },
      ];
    }),
  );
}

export interface ApiInfo {
  readonly title: string;
  readonly version: string;
  readonly description?: string;
}

/** The OpenAPI 3.1 document for every route in the registry, with components sorted for diffs. */
export function generateOpenApiDocument(
  registry: OpenAPIRegistry,
  info: ApiInfo,
): ReturnType<OpenApiGeneratorV31["generateDocument"]> {
  const generator = new OpenApiGeneratorV31(registry.definitions, {
    sortComponents: "alphabetically",
  });
  return generator.generateDocument({
    openapi: "3.1.0",
    info: { ...info },
    servers: [{ url: API_BASE_PATH }],
  });
}
