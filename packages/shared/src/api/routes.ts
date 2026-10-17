/**
 * Single source of truth for every HTTP path in the API.
 *
 * The API builds controllers from these constants and both clients call through
 * them, so a route rename is a compile error rather than a runtime 404.
 */
export const API_ROUTES = {
  admin: {
    invites: {
      accept: "/api/admin/invites/accept",
      base: "/api/admin/invites",
      byId: (id: string) => `/api/admin/invites/${encodeURIComponent(id)}`,
      byToken: (token: string) =>
        `/api/admin/invites/token/${encodeURIComponent(token)}`,
    },
    users: {
      base: "/api/admin/users",
      byId: (id: string) => `/api/admin/users/${encodeURIComponent(id)}`,
      restore: (id: string) =>
        `/api/admin/users/${encodeURIComponent(id)}/restore`,
      softDelete: (id: string) =>
        `/api/admin/users/${encodeURIComponent(id)}/soft-delete`,
    },
  },
  health: "/api/health",
  notes: {
    base: "/api/notes",
    byId: (id: string) => `/api/notes/${encodeURIComponent(id)}`,
  },
} as const;
