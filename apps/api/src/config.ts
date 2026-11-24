/** Settings the API reads from the environment. Invalid values stop start-up with a clear error. */
export interface ApiConfig {
  readonly port: number;
}

const DEFAULT_PORT = 4000;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ApiConfig {
  return { port: parsePort(env.API_PORT) };
}

/** A port from API_PORT: whole digits only, 1 to 65535; unset or blank means the default. */
export function parsePort(value: string | undefined): number {
  const trimmed = value?.trim() ?? "";
  if (trimmed === "") return DEFAULT_PORT;
  const port = /^\d+$/.test(trimmed) ? Number(trimmed) : Number.NaN;
  if (!Number.isSafeInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`API_PORT must be a whole number from 1 to 65535; got "${value}".`);
  }
  return port;
}
