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
  LISTINGS: {
    BASE: "/api/listings",
    BY_ID: (id: string) => `/api/listings/${encodeURIComponent(id)}`,
    DISCOVER: "/api/listings/discover",
    PUBLIC: "/api/listings/public",
  },
  notes: {
    base: "/api/notes",
    byId: (id: string) => `/api/notes/${encodeURIComponent(id)}`,
  },
  RENTALS: {
    ACCEPT: (id: string) => `/api/rentals/${encodeURIComponent(id)}/accept`,
    BASE: "/api/rentals",
    BY_ID: (id: string) => `/api/rentals/${encodeURIComponent(id)}`,
    CANCEL: (id: string) => `/api/rentals/${encodeURIComponent(id)}/cancel`,
    CHECK_IN: (id: string) => `/api/rentals/${encodeURIComponent(id)}/check-in`,
    DECLINE: (id: string) => `/api/rentals/${encodeURIComponent(id)}/decline`,
    DISPUTES: (id: string) => `/api/rentals/${encodeURIComponent(id)}/disputes`,
    HANDOVER_ACKNOWLEDGE: (id: string) =>
      `/api/rentals/${encodeURIComponent(id)}/handover/acknowledge`,
    HANDOVER_CONFIRM: (id: string) =>
      `/api/rentals/${encodeURIComponent(id)}/handover/confirm`,
    HANDOVER_ISSUES: (id: string) =>
      `/api/rentals/${encodeURIComponent(id)}/handover/issues`,
    HANDOVER_START: (id: string) =>
      `/api/rentals/${encodeURIComponent(id)}/handover/start`,
    MEETUP_PROPOSAL_ACCEPT: (id: string, proposalId: string) =>
      `/api/rentals/${encodeURIComponent(id)}/meetup/proposals/${encodeURIComponent(proposalId)}/accept`,
    MEETUP_PROPOSALS: (id: string) =>
      `/api/rentals/${encodeURIComponent(id)}/meetup/proposals`,
    NO_SHOW: (id: string) => `/api/rentals/${encodeURIComponent(id)}/no-show`,
    PAYMENT_RETRY: (id: string) =>
      `/api/rentals/${encodeURIComponent(id)}/payment/retry`,
    RETURN: (id: string) => `/api/rentals/${encodeURIComponent(id)}/return`,
    RETURN_CONFIRM: (id: string) =>
      `/api/rentals/${encodeURIComponent(id)}/return/confirm`,
  },
  STORAGE: {
    UPLOAD_URL: "/api/storage/upload-url",
  },
} as const;
