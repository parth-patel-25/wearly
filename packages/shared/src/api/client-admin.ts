import type { ZodType } from "zod";
import {
  type ApiClientOptions,
  joinUrl,
  json,
  request,
  requestVoid,
} from "./client-core.js";
import { API_ROUTES } from "./routes.js";
import {
  type AcceptAdminInviteInput,
  adminInviteSchema,
  adminUserSchema,
  type CreateAdminInviteInput,
  type ListAdminUsersQuery,
  listAdminInvitesResponseSchema,
  listAdminUsersResponseSchema,
} from "./schemas.js";

function listUsersQuery(query: ListAdminUsersQuery): string {
  const params = new URLSearchParams({
    includeDeleted: String(query.includeDeleted),
    limit: String(query.limit),
    offset: String(query.offset),
  });
  if (query.search) {
    params.set("search", query.search);
  }
  return params.toString();
}

/**
 * Admin surface of the API client. Every call requires a session cookie from
 * an `admin` or `super_admin` user — the server enforces that, not this client.
 */
export function createAdminApi(
  options: ApiClientOptions,
  fetcher: typeof globalThis.fetch
) {
  const url = (path: string) => joinUrl(options.baseUrl, path);
  const send = <T>(path: string, schema: ZodType<T>, init?: RequestInit) =>
    request(url(path), schema, init, fetcher);

  return {
    acceptInvite: (input: AcceptAdminInviteInput) =>
      send(API_ROUTES.admin.invites.accept, adminUserSchema, json(input)),

    createInvite: (input: CreateAdminInviteInput) =>
      send(API_ROUTES.admin.invites.base, adminInviteSchema, json(input)),

    getInvite: (token: string) =>
      send(API_ROUTES.admin.invites.byToken(token), adminInviteSchema),

    listInvites: () =>
      send(API_ROUTES.admin.invites.base, listAdminInvitesResponseSchema),
    listUsers: (query: ListAdminUsersQuery) =>
      send(
        `${API_ROUTES.admin.users.base}?${listUsersQuery(query)}`,
        listAdminUsersResponseSchema
      ),

    removeUser: (id: string) =>
      requestVoid(
        url(API_ROUTES.admin.users.byId(id)),
        { method: "DELETE" },
        fetcher
      ),

    restoreUser: (id: string) =>
      send(API_ROUTES.admin.users.restore(id), adminUserSchema, {
        method: "POST",
      }),

    revokeInvite: (id: string) =>
      requestVoid(
        url(API_ROUTES.admin.invites.byId(id)),
        { method: "DELETE" },
        fetcher
      ),

    softDeleteUser: (id: string) =>
      send(API_ROUTES.admin.users.softDelete(id), adminUserSchema, {
        method: "POST",
      }),
  };
}

export type AdminApi = ReturnType<typeof createAdminApi>;
