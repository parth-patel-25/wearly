import type { ZodType } from "zod";
import { createAdminApi } from "./client-admin.js";
import type { ApiClientOptions } from "./client-core.js";
import { joinUrl, json, request, requestVoid } from "./client-core.js";
import { API_ROUTES } from "./routes.js";
import {
  type CreateNoteInput,
  healthResponseSchema,
  type ListNotesQuery,
  listNotesResponseSchema,
  noteSchema,
  type UpdateNoteInput,
} from "./schemas.js";

/**
 * Fully typed client for the Wearly API. Used by both the web app and the
 * mobile app, so a breaking change to any endpoint fails type-checking first.
 */
export function createApiClient(options: ApiClientOptions) {
  const doFetch = options.fetcher ?? globalThis.fetch;
  const fetcher: typeof globalThis.fetch = (input, init) =>
    doFetch(
      input,
      options.credentials ? { ...init, credentials: options.credentials } : init
    );
  const url = (path: string) => joinUrl(options.baseUrl, path);

  const send = <T>(path: string, schema: ZodType<T>, init?: RequestInit) =>
    request(url(path), schema, init, fetcher);

  return {
    admin: createAdminApi(options, fetcher),
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

      remove: (id: string) =>
        requestVoid(
          url(API_ROUTES.notes.byId(id)),
          { method: "DELETE" },
          fetcher
        ),

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
