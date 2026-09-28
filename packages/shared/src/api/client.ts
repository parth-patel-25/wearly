import type { ZodType } from "zod";

/** Strips a single trailing slash from a base URL. */
const TRAILING_SLASH = /\/$/;

import { API_ROUTES } from "./routes.js";
import {
  type CreateNoteInput,
  errorResponseSchema,
  healthResponseSchema,
  type ListNotesQuery,
  listNotesResponseSchema,
  noteSchema,
  type UpdateNoteInput,
} from "./schemas.js";

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

export interface ApiClientOptions {
  /** Origin of the NestJS API, e.g. `http://localhost:4000`. No trailing slash. */
  baseUrl: string;
  /** Override for tests or SSR setups that need request headers. */
  fetcher?: typeof globalThis.fetch;
}

async function request<T>(
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

const json = (body: unknown): RequestInit => ({
  body: JSON.stringify(body),
  headers: { "content-type": "application/json" },
  method: "POST",
});

/**
 * Fully typed client for the Wearly API. Used by both the web app and the
 * mobile app, so a breaking change to any endpoint fails type-checking first.
 */
export function createApiClient({ baseUrl, fetcher }: ApiClientOptions) {
  const doFetch = fetcher ?? globalThis.fetch;
  const url = (path: string) => `${baseUrl.replace(TRAILING_SLASH, "")}${path}`;

  const send = <T>(path: string, schema: ZodType<T>, init?: RequestInit) =>
    request(url(path), schema, init, doFetch);

  return {
    health: () => send(API_ROUTES.health, healthResponseSchema),

    notes: {
      create: (input: CreateNoteInput) =>
        send(API_ROUTES.notes.base, noteSchema, json(input)),

      get: (id: string) => send(API_ROUTES.notes.byId(id), noteSchema),
      list: (query: ListNotesQuery = { limit: 20, offset: 0 }) => {
        const params = new URLSearchParams({
          limit: String(query.limit),
          offset: String(query.offset),
        });
        return send(
          `${API_ROUTES.notes.base}?${params.toString()}`,
          listNotesResponseSchema
        );
      },

      remove: async (id: string) => {
        const response = await doFetch(url(API_ROUTES.notes.byId(id)), {
          method: "DELETE",
        });
        if (!response.ok) {
          const raw: unknown = await response.json().catch(() => null);
          const parsed = errorResponseSchema.safeParse(raw);
          throw new ApiError(
            response.status,
            parsed.success ? parsed.data.message : "Delete failed",
            raw
          );
        }
        return true;
      },

      update: (id: string, input: UpdateNoteInput) =>
        send(API_ROUTES.notes.byId(id), noteSchema, {
          body: JSON.stringify(input),
          headers: { "content-type": "application/json" },
          method: "PATCH",
        }),
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
