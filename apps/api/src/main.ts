import "reflect-metadata";
import { createApp } from "./app.js";
import { loadConfig } from "./config.js";

// Validate the settings before anything starts: a wrong API_PORT stops here, loudly.
const config = loadConfig();
const app = await createApp();
await app.listen(config.port);
