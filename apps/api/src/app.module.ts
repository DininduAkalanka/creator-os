import { Module } from "@nestjs/common";

/**
 * The root module. Empty in M1: sign-in arrives in M4, and the request IDs, validation, response
 * envelope, health checks and OpenAPI document in M5 (prompts/01_KICKOFF_foundation.md).
 */
@Module({})
export class AppModule {}
