/**
 * Single source of truth for every HTTP path in the API.
 *
 * The API builds controllers from these constants and both clients call through
 * them, so a route rename is a compile error rather than a runtime 404.
 */
export const API_ROUTES = {
  health: "/api/health",
  notes: {
    base: "/api/notes",
    byId: (id: string) => `/api/notes/${encodeURIComponent(id)}`,
  },
} as const;
