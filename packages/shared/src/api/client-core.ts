import type { ZodType } from "zod";
import { errorResponseSchema } from "./schemas.js";

/** Strips a single trailing slash from a base URL. */
const TRAILING_SLASH = /\/$/;

export interface ApiClientOptions {
  /** Origin of the NestJS API, e.g. `http://localhost:4000`. No trailing slash. */
  baseUrl: string;
  /**
   * Cookie behaviour for cross-origin calls. The web admin app passes
   * `"include"` so the Better Auth session cookie rides along; native has no
   * ambient cookie jar and leaves this unset.
   */
  credentials?: RequestCredentials;
  /** Override for tests or SSR setups that need request headers. */
  fetcher?: typeof globalThis.fetch;
}

/** Thrown for any non-2xx response or a response that fails schema validation. */
export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export async function request<T>(
  path: string,
  schema: ZodType<T>,
  init: RequestInit | undefined,
  fetcher: typeof globalThis.fetch
): Promise<T> {
  const response = await fetcher(`${path}`, init);

  const raw: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const parsed = errorResponseSchema.safeParse(raw);
    const message =
      parsed.success && typeof parsed.data.message === "string"
        ? parsed.data.message
        : `Request to ${path} failed with status ${response.status}`;
    throw new ApiError(response.status, message, raw);
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(
      response.status,
      `Response from ${path} did not match the expected schema`,
      parsed.error.issues
    );
  }

  return parsed.data;
}

/** DELETE with no response body; resolves `true` on 2xx. */
export async function requestVoid(
  path: string,
  init: RequestInit,
  fetcher: typeof globalThis.fetch
): Promise<true> {
  const response = await fetcher(path, init);
  if (!response.ok) {
    const raw: unknown = await response.json().catch(() => null);
    const parsed = errorResponseSchema.safeParse(raw);
    throw new ApiError(
      response.status,
      parsed.success ? parsed.data.message : `Request to ${path} failed`,
      raw
    );
  }
  return true;
}

export const json = (body: unknown, method = "POST"): RequestInit => ({
  body: JSON.stringify(body),
  headers: { "content-type": "application/json" },
  method,
});

export const joinUrl = (baseUrl: string, path: string) =>
  `${baseUrl.replace(TRAILING_SLASH, "")}${path}`;
