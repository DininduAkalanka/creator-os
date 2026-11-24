import { type INestApplication, type NestApplicationOptions } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";

/** Every route lives under /api/v1 (ADR-005). */
export const API_PREFIX = "api/v1";

/**
 * Builds the API application. Shared by the entry point and the tests, so tests exercise the
 * same setup as production.
 */
export async function createApp(options?: NestApplicationOptions): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule, options);
  app.setGlobalPrefix(API_PREFIX);
  // Close cleanly on SIGTERM (container stop, deploys): finish requests, then exit.
  app.enableShutdownHooks();
  return app;
}
