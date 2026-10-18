/**
 * Lifecycle state of an admin invite, computed by the API from the invite row
 * (accepted / revoked timestamps and the expiry). Shared so the admin table
 * and the API use the same literals.
 */
export const INVITE_STATUS = {
  ACCEPTED: "accepted",
  EXPIRED: "expired",
  PENDING: "pending",
  REVOKED: "revoked",
} as const;

/** Every invite status, in schema order. Yields the `AdminInviteStatus` union. */
export const INVITE_STATUSES = [
  INVITE_STATUS.PENDING,
  INVITE_STATUS.ACCEPTED,
  INVITE_STATUS.REVOKED,
  INVITE_STATUS.EXPIRED,
] as const;

export type AdminInviteStatus = (typeof INVITE_STATUSES)[number];
