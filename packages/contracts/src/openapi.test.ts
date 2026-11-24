import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { dataEnvelope, pageEnvelope } from "./envelope.js";
import { ERROR_CODES } from "./errors.js";
import { idSchema } from "./ids.js";
import { API_BASE_PATH, errorResponses, generateOpenApiDocument, jsonContent } from "./openapi.js";
import { pageQuerySchema } from "./pagination.js";
import { CONTENT_STATUSES, contentStatusSchema } from "./states.js";

// A route registered the way the API will register its routes (M5).
const content = z.object({ id: idSchema, title: z.string(), status: contentStatusSchema });
const registry = new OpenAPIRegistry();
registry.registerPath({
  method: "get",
  path: "/contents",
  request: { query: pageQuerySchema },
  responses: {
    200: { description: "A page of contents.", content: jsonContent(pageEnvelope(content)) },
    ...errorResponses([401, 409, 422]),
  },
});
registry.registerPath({
  method: "get",
  path: "/contents/{id}",
  request: { params: z.object({ id: idSchema }) },
  responses: {
    200: { description: "One content.", content: jsonContent(dataEnvelope(content)) },
    ...errorResponses([404]),
  },
});

const doc = generateOpenApiDocument(registry, { title: "CreatorOS API", version: "0.0.0" });
const schemas = doc.components?.schemas ?? {};
const listOperation = doc.paths?.["/contents"]?.get;

describe("generateOpenApiDocument", () => {
  it("writes an OpenAPI 3.1 document served under /api/v1 (ADR-005)", () => {
    expect(doc.openapi).toBe("3.1.0");
    expect(doc.info).toEqual({ title: "CreatorOS API", version: "0.0.0" });
    expect(doc.servers).toEqual([{ url: API_BASE_PATH }]);
    expect(API_BASE_PATH).toBe("/api/v1");
  });

  it("names the shared contract schemas as components, sorted", () => {
    const names = Object.keys(schemas);
    expect(names).toEqual(
      expect.arrayContaining([
        "ContentStatus",
        "Cursor",
        "ErrorCode",
        "ErrorEnvelope",
        "Id",
        "PageMeta",
      ]),
    );
    expect(names).toEqual([...names].sort());
  });

  it("documents the error envelope exactly", () => {
    expect(schemas.ErrorCode).toMatchObject({ type: "string", enum: [...ERROR_CODES] });
    expect(schemas.ErrorEnvelope).toMatchObject({
      type: "object",
      required: ["error"],
      additionalProperties: false,
      properties: {
        error: {
          type: "object",
          required: ["code", "message", "requestId"],
          additionalProperties: false,
          properties: { code: { $ref: "#/components/schemas/ErrorCode" } },
        },
      },
    });
  });

  it("documents states, IDs and page meta", () => {
    expect(schemas.ContentStatus).toMatchObject({ type: "string", enum: [...CONTENT_STATUSES] });
    expect(schemas.Id).toMatchObject({ type: "string", format: "uuid" });
    expect(schemas.PageMeta).toMatchObject({ required: ["nextCursor"] });
  });

  it("documents the page query parameters", () => {
    expect(listOperation?.parameters).toEqual([
      expect.objectContaining({ name: "cursor", in: "query", required: false }),
      {
        name: "limit",
        in: "query",
        required: false,
        schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
      },
    ]);
  });

  it("is plain JSON, so it can be served and written to a file", () => {
    expect(JSON.parse(JSON.stringify(doc))).toEqual(doc);
  });
});

describe("errorResponses", () => {
  it("points each status at the error envelope and names its codes", () => {
    const envelope = {
      "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } },
    };
    expect(listOperation?.responses).toMatchObject({
      "401": { description: "Error: UNAUTHENTICATED", content: envelope },
      "409": { description: "Error: CONFLICT, INVALID_STATE_TRANSITION", content: envelope },
      "422": { description: "Error: VALIDATION_FAILED", content: envelope },
    });
  });
});
